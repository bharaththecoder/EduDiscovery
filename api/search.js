import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory cache for college embeddings
let cachedColleges = null;
let cachedTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// ─── Inline intelligence score compute ───────────────────────
function computeIntelligenceScore(college) {
  const fees = college.branchFees
    ? Math.min(...Object.values(college.branchFees))
    : college.programs
      ? Math.min(...college.programs.map(p => parseInt((p.fees || '').replace(/[^0-9]/g, '')) || 100000).filter(f => f > 0))
      : 100000;
  const avgPackage = college.avgPackage || 500000;
  const placementRate = college.placementRate || 65;
  const roi = fees > 0 ? avgPackage / (fees * 4) : 1;
  const value = fees > 0 ? (placementRate / 100) * avgPackage / fees : 1;
  return Math.min(10, (roi * 3.3 + value * 2.5) / 2);
}

// ─── Rough fee filter from budget string ─────────────────────
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

    // 1. Generate embedding for user query
    let queryEmbedding;
    try {
      const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await embedModel.embedContent(query);
      queryEmbedding = result.embedding.values;
    } catch (embErr) {
      console.error("Embedding Error:", embErr.message);
      let errorMsg = "AI Search is currently unavailable.";
      if (embErr.message.includes("404")) {
        errorMsg = "AI Model not found. Your Gemini API key might be invalid or restricted. Please ensure you are using a key from Google AI Studio.";
      } else if (embErr.message.includes("403")) {
        errorMsg = "API access blocked. Please ensure the Generative Language API is enabled for your project.";
      }
      return res.status(500).json({ error: errorMsg, details: embErr.message });
    }

    // 2. Fetch colleges from Firestore (with caching)
    if (!cachedColleges || (Date.now() - cachedTime > CACHE_DURATION)) {
      const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "colleges"));
      cachedColleges = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => c.embedding);
      cachedTime = Date.now();
    }

    if (cachedColleges.length === 0) {
      return res.status(500).json({ error: "No embedded colleges found. Please run the seeder." });
    }

    // 3. Apply intent-based pre-filters
    const budgetMax = parseBudgetMax(budget);
    const branchLower = branch ? branch.toLowerCase() : null;

    let collegePool = cachedColleges;

    if (budgetMax) {
      const budgetFiltered = collegePool.filter(c => {
        const fees = c.branchFees
          ? Math.min(...Object.values(c.branchFees))
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

    // 4. Compute cosine similarity + intelligence boost
    const scoredColleges = collegePool.map(college => {
      const semanticScore = cosineSimilarity(queryEmbedding, college.embedding);
      const intellScore = computeIntelligenceScore(college) / 10; // normalize 0-1
      // Weighted blend: 70% semantic + 30% intelligence
      const combinedScore = semanticScore * 0.7 + intellScore * 0.3;
      const { embedding, ...collegeData } = college;
      return { ...collegeData, matchScore: semanticScore, intelligenceScore: Math.round(intellScore * 10), combinedScore };
    });

    // 5. Sort by combined score and take top 5
    scoredColleges.sort((a, b) => b.combinedScore - a.combinedScore);
    const topResults = scoredColleges.slice(0, 5).map(({ combinedScore, ...rest }) => rest);

    // 6. AI reasoning for top result
    const reasoningModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const reasoningPrompt = `User query: "${query}"
Top recommended college: ${topResults[0].name} in ${topResults[0].city}
NAAC: ${topResults[0].naac}, Avg Package: ₹${((topResults[0].avgPackage || 500000) / 100000).toFixed(1)} LPA
Briefly explain in 2-3 sentences why this college is the best match. Be enthusiastic and specific.`;

    const reasoningResult = await reasoningModel.generateContent(reasoningPrompt);
    const reasoning = reasoningResult.response.text();

    return res.status(200).json({ results: topResults, reasoning });

  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: error.message });
  }
}

