import admin, { db } from "./firebaseAdmin.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

export default async function seedHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { colleges } = req.body || {};
    if (!colleges || !Array.isArray(colleges)) {
      return res.status(400).json({ error: "Please provide 'colleges' array in request body." });
    }

    console.log(`Starting to seed ${colleges.length} colleges...`);
    let embeddedCount = 0;

    for (const college of colleges) {
      // Create a rich string representation of the college for embeddings
      const contentToEmbed = `
        Name: ${college.name} (${college.shortName})
        Location: ${college.city}, ${college.state}
        Description: ${college.about}
        Programs & Fees: ${college.programs.map(p => p.name + " (" + p.fees + ")").join(", ")}
        Facilities: ${college.facilities.map(f => f.name).join(", ")}
        Tags: ${college.tags.join(", ")}
      `.replace(/\s+/g, " ").trim();

      let embedding = null;
      try {
        const result = await model.embedContent(contentToEmbed);
        embedding = result.embedding.values;
        embeddedCount++;
        console.log(`Successfully embedded: ${college.name}`);
      } catch (embErr) {
        console.warn(`[Seeder] Warning: Failed to generate embedding for ${college.name} (${embErr.message}). Saving text data only.`);
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

    res.status(200).json({ success: true, seeded: embeddedCount });

  } catch (error) {
    console.error("Seeding Error:", error);
    res.status(500).json({ error: error.message });
  }
}
