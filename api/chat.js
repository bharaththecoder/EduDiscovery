import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamChat } from "./aiHelper.js";
import admin, { db } from "./firebaseAdmin.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// ─── In-memory college cache ──
let cachedColleges = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getCollegesFromFirestore() {
  if (cachedColleges && Date.now() - cacheTime < CACHE_TTL) return cachedColleges;
  const snap = await db.collection('colleges').get();
  cachedColleges = snap.docs.map(d => {
    const data = d.data();
    const college = { id: d.id, ...data };
    college._searchTargetText = `${college.name} ${college.shortName || ''} ${college.city} ${college.state} ${(college.tags || []).join(' ')} ${college.about || ''} ${(college.branches || []).join(' ')}`.toLowerCase();
    return college;
  });
  cacheTime = Date.now();
  return cachedColleges;
}

// ─── Extract college-relevant keywords from message ───────────
function extractCollegeKeywords(message) {
  const lower = message.toLowerCase();
  // Specific college name patterns
  const namePatterns = ['srm', 'vit', 'gitam', 'kl', 'vignan', 'amrita', 'nri', 'andhra', 
    'jntuk', 'jntua', 'rgukt', 'sv university', 'au ', 'nagarjuna', 'siddhartha', 'gmrit',
    'lbrce', 'bapatla', 'gvp', 'krea', 'sssihl', 'angrau', 'ntruhs'];
  const foundNames = namePatterns.filter(n => lower.includes(n));
  
  // Branch keywords
  const branches = ['cse', 'ece', 'eee', 'mechanical', 'civil', 'ai', 'ml', 'biotech', 
    'pharmacy', 'mbbs', 'law', 'bba', 'mba'];
  const foundBranches = branches.filter(b => lower.includes(b));
  
  // Attribute keywords
  const attrs = ['fee', 'fees', 'placement', 'package', 'salary', 'naac', 'nirf', 
    'hostel', 'campus', 'scholarship', 'ranking', 'cutoff', 'admission'];
  const foundAttrs = attrs.filter(a => lower.includes(a));
  
  return { names: foundNames, branches: foundBranches, attrs: foundAttrs };
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordMatchScore(query, college) {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return 0.5;

  let matches = 0;
  const targetText = college._searchTargetText || `${college.name} ${college.shortName || ''} ${college.city} ${college.state} ${(college.tags || []).join(' ')} ${college.about || ''} ${(college.branches || []).join(' ')}`.toLowerCase();

  words.forEach(word => {
    if (targetText.includes(word)) {
      matches += 1;
    }
  });

  return Math.min(1.0, 0.2 + (matches / words.length) * 0.8);
}

// ─── Retrieve and format relevant college facts for RAG ───────
async function fetchRelevantCollegeFacts(message) {
  let colleges;
  try {
    colleges = await getCollegesFromFirestore();
  } catch (err) {
    console.warn('[RAG] Firestore unavailable, using empty context:', err.message);
    return '';
  }
  
  if (!colleges || colleges.length === 0) return '';

  const keywords = extractCollegeKeywords(message);
  const lower = message.toLowerCase();

  // 1. Generate embedding for user message with fallback handling
  let queryEmbedding = null;
  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_actual_key_here') {
      const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await embedModel.embedContent(message);
      queryEmbedding = result.embedding.values;
    }
  } catch (embErr) {
    console.warn("[RAG-AI] Semantic embedding failed for chat context, using high-fidelity keyword matching fallback:", embErr.message);
  }
  
  // 2. Score colleges by relevance to message
  const scored = colleges.map(c => {
    let semanticScore = 0.5;
    if (queryEmbedding && c.embedding) {
      semanticScore = cosineSimilarity(queryEmbedding, c.embedding);
    } else {
      semanticScore = keywordMatchScore(message, c);
    }

    const keywordScore = keywordMatchScore(message, c);
    let combinedScore = semanticScore * 0.7 + keywordScore * 0.3;

    // Apply massive boost if the college name matches user query keywords
    const cLower = `${c.name} ${c.shortName || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
    if (keywords.names.some(n => cLower.includes(n))) {
      combinedScore += 10.0;
    }

    return { ...c, _score: combinedScore };
  }).filter(c => c._score > 0.4) // Filter out irrelevant colleges
    .sort((a, b) => b._score - a._score)
    .slice(0, 4); // top 4 colleges
  
  if (scored.length === 0) return '';

  // Format as structured fact block
  const facts = scored.map(c => {
    const feeValues = c.branchFees ? Object.values(c.branchFees).filter(v => typeof v === 'number' && !isNaN(v)) : [];
    const minFee = feeValues.length > 0 ? Math.min(...feeValues) : null;
    const feeStr = minFee && isFinite(minFee) ? `₹${(minFee / 1000).toFixed(0)}K/yr` : 'Contact institution';
    const avgPkg = c.avgPackage ? `₹${(c.avgPackage / 100000).toFixed(1)} LPA` : 'N/A';
    const placement = c.placementRate ? `${c.placementRate}%` : 'N/A';
    return `
College: ${c.name} (${c.shortName || c.id})
City: ${c.city}, ${c.state}
NAAC: ${c.naac} | NIRF: ${c.nirf || 'N/A'}
Minimum Annual Fee: ${feeStr}
Average Package: ${avgPkg} | Placement Rate: ${placement}
Top Programs: ${(c.programs || []).slice(0, 3).map(p => `${p.name} (${p.fees})`).join('; ')}
Tags: ${(c.tags || []).join(', ')}
Website: ${c.website || 'N/A'}`.trim();
  }).join('\n\n---\n\n');

  return facts;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    // ── RAG: Fetch relevant college facts ─────────────────────
    const collegeFacts = await fetchRelevantCollegeFacts(message);

    // Enable SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemInstruction = `You are an expert college admission counselor for EduDiscovery — an intelligent platform for Andhra Pradesh colleges.

User Preferences (from their profile):
${JSON.stringify(context?.userPreferences || "Not provided")}

${collegeFacts ? `REAL COLLEGE DATA (use this to answer accurately — do NOT make up fee or placement numbers):
${collegeFacts}` : ''}

Instructions:
- Answer using ONLY the college data provided above when relevant. Never invent statistics.
- If specific data is not available, say so honestly.
- Use markdown formatting (bold, bullet lists) for readability.
- Keep a professional but friendly tone.
- If asked about fees, placements, or admission — cite the numbers from the data above.`;

    await streamChat(message, systemInstruction, history, res);

  } catch (error) {
    console.error("Chat API Error:", error);
    let errorMessage = "Sorry, I'm having trouble connecting to the AI service.";
    const isQuotaError = error.status === 429 || error.message?.toLowerCase().includes("quota");
    if (isQuotaError) errorMessage = "⏳ Daily Limit Reached: Please wait for the daily reset or try again later.";
    else if (error.status === 404) errorMessage = "🚫 Model Error: This API key does not have access to the models.";

    if (!res.headersSent) return res.status(500).json({ reply: errorMessage });
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
}
