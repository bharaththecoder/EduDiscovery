import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase/app";
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
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory cache for college embeddings so we don't hit Firestore on every search
let cachedColleges = null;
let cachedTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export default async function searchHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 1. Generate embedding for user query
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // 2. Fetch colleges from Firestore (with caching)
    if (!cachedColleges || (Date.now() - cachedTime > CACHE_DURATION)) {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "colleges"));
      
      cachedColleges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(c => c.embedding); // only colleges with embeddings
      
      cachedTime = Date.now();
    }

    if (cachedColleges.length === 0) {
       // Fallback if db is empty (for demo purposes if user hasn't seeded)
       return res.status(500).json({ error: "No embedded colleges found in the database. Please run the seeder." });
    }

    // 3. Compute cosine similarity
    const scoredColleges = cachedColleges.map(college => {
      const score = cosineSimilarity(queryEmbedding, college.embedding);
      // Strip embedding from response to save bandwidth
      const { embedding, ...collegeData } = college;
      return { ...collegeData, matchScore: score };
    });

    // 4. Sort and return top results
    scoredColleges.sort((a, b) => b.matchScore - a.matchScore);
    const topResults = scoredColleges.slice(0, 5);

    // 5. Optional feature: use LLM to explain why the top result was chosen
    const reasoningModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const reasoningPrompt = `
    User query: "${query}"
    Top recommended college: ${topResults[0].name} - ${topResults[0].about} (Fees: ${JSON.stringify(topResults[0].programs)})
    Briefly explain in 2-3 sentences why this college is the best match for the user's query. Be enthusiatic and concise.
    `;
    const reasoningResult = await reasoningModel.generateContent(reasoningPrompt);
    const reasoning = reasoningResult.response.text();

    return res.status(200).json({ 
      results: topResults,
      reasoning: reasoning
    });

  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
