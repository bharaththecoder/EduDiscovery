import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateText } from "./aiHelper.js";
import { db } from "./firebaseAdmin.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

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

// Local text matching search fallback when AI embedding fails
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

// In-memory cache for college embeddings
let cachedColleges = null;
let cachedTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Inline intelligence score compute
function computeIntelligenceScore(college) {
  const feeValues = college.branchFees ? Object.values(college.branchFees).filter(v => typeof v === 'number' && !isNaN(v)) : [];
  const fees = feeValues.length > 0
    ? Math.min(...feeValues)
    : college.programs
      ? Math.min(...college.programs.map(p => parseInt((p.fees || '').replace(/[^0-9]/g, '')) || 100000).filter(f => f > 0))
      : 100000;
  const avgPackage = college.avgPackage || 500000;
  const placementRate = college.placementRate || 65;
  const roi = fees > 0 && isFinite(fees) ? avgPackage / (fees * 4) : 1;
  const value = fees > 0 && isFinite(fees) ? (placementRate / 100) * avgPackage / fees : 1;
  return Math.min(10, (roi * 3.3 + value * 2.5) / 2);
}

// Rough fee filter from budget string
function parseBudgetMax(budgetStr) {
  if (!budgetStr) return null;
  const lower = budgetStr.toLowerCase();
  if (lower.includes('75k') || lower.includes('under ₹75') || lower.includes('<75')) return 75000;
  if (lower.includes('1.5l') || lower.includes('150')) return 150000;
  if (lower.includes('2.5l') || lower.includes('250')) return 250000;
  if (lower.includes('4l') || lower.includes('400')) return 400000;
  // Parse "under X lakh" from free text
  const lakhMatch = lower.match(/under\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*l/);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;
  return null;
}

export default async function searchHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query, budget, branch } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // 1. Generate embedding for user query with fallback handling
    let queryEmbedding = null;
    let embedError = null;

    try {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_actual_key_here') {
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await embedModel.embedContent(query);
        queryEmbedding = result.embedding.values;
      } else {
        embedError = "No Gemini API Key available for text embedding.";
      }
    } catch (embErr) {
      console.warn("[Search-AI] Semantic embedding failed, using high-fidelity keyword matching fallback:", embErr.message);
      embedError = embErr.message;
    }

    // 2. Fetch colleges from Firestore (with caching)
    if (!cachedColleges || (Date.now() - cachedTime > CACHE_DURATION)) {
      const snapshot = await db.collection("colleges").get();
      cachedColleges = snapshot.docs.map(doc => {
        const college = { id: doc.id, ...doc.data() };
        college._searchTargetText = `${college.name} ${college.shortName || ''} ${college.city} ${college.state} ${(college.tags || []).join(' ')} ${college.about || ''} ${(college.branches || []).join(' ')}`.toLowerCase();
        return college;
      });
      cachedTime = Date.now();
    }

    if (cachedColleges.length === 0) {
      return res.status(500).json({ error: "No colleges found in database. Please run the seeder." });
    }

    // 3. Apply intent-based pre-filters
    const budgetMax = parseBudgetMax(budget);
    const branchLower = branch ? branch.toLowerCase() : null;

    let collegePool = cachedColleges;

    if (budgetMax) {
      const budgetFiltered = collegePool.filter(c => {
        const feeValues = c.branchFees ? Object.values(c.branchFees).filter(v => typeof v === 'number' && !isNaN(v)) : [];
        const fees = feeValues.length > 0
          ? Math.min(...feeValues)
          : c.programs
            ? Math.min(...(c.programs || []).map(p => parseInt((p.fees || '').replace(/[^0-9]/g, '')) || Infinity).filter(f => f < Infinity))
            : Infinity;
        return fees <= budgetMax * 1.2; // 20% buffer
      });
      if (budgetFiltered.length >= 3) collegePool = budgetFiltered;
    }

    if (branchLower) {
      const branchFiltered = collegePool.filter(c => {
        const searchStr = [...(c.tags || []), ...(c.branches || []), c.name || ''].join(' ').toLowerCase();
        return searchStr.includes(branchLower);
      });
      if (branchFiltered.length >= 2) collegePool = branchFiltered;
    }

    // Dynamically resolve all unique cities from database rather than maintaining a hardcoded list
    const uniqueCities = [...new Set(cachedColleges.map(c => c.city ? c.city.toLowerCase() : '').filter(Boolean))];
    const lowerQuery = query.toLowerCase();
    const matchedCity = uniqueCities.find(c => lowerQuery.includes(c));
    if (matchedCity) {
      console.log(`[Search-AI] Identified target city intent: "${matchedCity}" in query: "${query}"`);
    }

    // 4. Compute cosine similarity + intelligence boost
    const scoredColleges = collegePool.map(college => {
      let semanticScore = 0.5;
      if (queryEmbedding && college.embedding) {
        semanticScore = cosineSimilarity(queryEmbedding, college.embedding);
      } else {
        semanticScore = keywordMatchScore(query, college);
      }

      const intellScore = computeIntelligenceScore(college) / 10; // normalize 0-1
      
      // Blended baseline: 70% semantic/keyword match + 30% ROI intelligence score
      let combinedScore = semanticScore * 0.7 + intellScore * 0.3;

      // Apply massive city intent boost if city matches search query
      if (matchedCity && college.city && college.city.toLowerCase() === matchedCity) {
        combinedScore += 0.8; // High priority boost to bubble up matched city colleges
      }

      const { embedding, ...collegeData } = college;
      return { ...collegeData, matchScore: semanticScore, intelligenceScore: Math.round(intellScore * 10), combinedScore };
    });

    // 5. Sort by combined score and take top 5
    scoredColleges.sort((a, b) => b.combinedScore - a.combinedScore);
    const topResults = scoredColleges.slice(0, 5).map(({ combinedScore, ...rest }) => rest);

    // 6. AI reasoning for top result using OpenRouter/Gemini unified generateText
    let reasoning = "";
    try {
      const reasoningPrompt = `User query: "${query}"
Top recommended college: ${topResults[0].name} in ${topResults[0].city}
NAAC: ${topResults[0].naac}, Avg Package: ₹${((topResults[0].avgPackage || 500000) / 100000).toFixed(1)} LPA
Briefly explain in 2-3 sentences why this college is the best match. Be enthusiastic and specific.`;

      reasoning = await generateText(reasoningPrompt);
    } catch (reasoningErr) {
      console.warn("[Search-AI] AI reasoning generation failed:", reasoningErr.message);
      reasoning = `Based on your query, ${topResults[0].name} in ${topResults[0].city} is our top matched recommendation, offering an impressive NAAC ${topResults[0].naac} rating and a strong placement package average of ₹${((topResults[0].avgPackage || 500000) / 100000).toFixed(1)} LPA.`;
    }

    return res.status(200).json({ results: topResults, reasoning });

  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
