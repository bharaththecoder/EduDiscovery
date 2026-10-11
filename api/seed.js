import admin, { db } from "./firebaseAdmin.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Gemini Setup — fix: properly initialize the embedding model instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export default async function seedHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Strict Server-Side Security Guard: Admin Authorization Required ─────────
  // Rejects unauthorized requests BEFORE any database write, embedding, or paid API call.
  let isAuthorizedAdmin = false;

  // 1. Verify Firebase ID Token if provided in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      // Explicit role check: trusted custom claim OR server-controlled admin email list
      if (decoded.admin === true || (decoded.email && adminEmails.includes(decoded.email.toLowerCase()))) {
        isAuthorizedAdmin = true;
      } else {
        console.warn(`[Seeder] User ${decoded.email || decoded.uid} attempted seed without admin privileges.`);
      }
    } catch (tokenErr) {
      console.warn('[Seeder] Token verification failed:', tokenErr.message);
    }
  }

  // 2. Safe local CLI fallback: allow server-side pre-shared secret ONLY IF explicitly configured
  const serverSecret = process.env.SEED_SECRET;
  const providedSecret = req.headers['x-seed-secret'];
  if (!isAuthorizedAdmin && serverSecret && providedSecret && providedSecret === serverSecret) {
    isAuthorizedAdmin = true;
  }

  // 3. Fail-Closed: reject all unauthorized requests immediately
  if (!isAuthorizedAdmin) {
    return res.status(403).json({
      error: 'Forbidden: administrative privileges required. Sign in with an authorized admin account or provide valid server credentials.'
    });
  }

  try {
    const { colleges } = req.body || {};
    if (!colleges || !Array.isArray(colleges)) {
      return res.status(400).json({ error: "Please provide 'colleges' array in request body." });
    }

    // Cap payload size to prevent abuse
    if (colleges.length > 200) {
      return res.status(400).json({ error: "Cannot seed more than 200 colleges at once." });
    }

    console.log(`Starting to seed ${colleges.length} colleges...`);
    let embeddedCount = 0;

    // Fix: properly obtain the embedding model instance (was `model` — undefined)
    const embedModel = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key')
      ? genAI.getGenerativeModel({ model: "gemini-embedding-001" })
      : null;

    for (const college of colleges) {
      // Create a rich string representation of the college for embeddings
      const contentToEmbed = `
        Name: ${college.name} (${college.shortName})
        Location: ${college.city}, ${college.state}
        Description: ${college.about}
        Programs & Fees: ${(college.programs || []).map(p => p.name + " (" + p.fees + ")").join(", ")}
        Facilities: ${(college.facilities || []).map(f => f.name).join(", ")}
        Tags: ${(college.tags || []).join(", ")}
      `.replace(/\s+/g, " ").trim();

      let embedding = null;
      if (embedModel) {
        try {
          const result = await embedModel.embedContent(contentToEmbed);
          embedding = result.embedding.values;
          embeddedCount++;
          console.log(`Successfully embedded: ${college.name}`);
        } catch (embErr) {
          console.warn(`[Seeder] Warning: Failed to generate embedding for ${college.name} (${embErr.message}). Saving text data only.`);
        }
      }

      try {
        const docData = { ...college };
        if (embedding) {
          docData.embedding = embedding;
        }
        await db.collection("colleges").doc(college.id).set(docData);
      } catch (dbErr) {
        console.error(`[Seeder] Error saving ${college.name} to Firestore:`, dbErr);
        throw dbErr;
      }
    }

    res.status(200).json({ success: true, seeded: embeddedCount, total: colleges.length });

  } catch (error) {
    console.error("Seeding Error:", error);
    // Never expose raw error messages — use a generic message
    res.status(500).json({ error: "Internal seeding error. Check server logs." });
  }
}

