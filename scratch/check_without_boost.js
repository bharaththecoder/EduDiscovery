import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
  });
}
const db = admin.firestore();

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

async function run() {
  const query = "colleges near vijayawada";
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await embedModel.embedContent(query);
  const queryEmbedding = result.embedding.values;

  const snapshot = await db.collection("colleges").get();
  const colleges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Score WITHOUT city boost
  const scoredWithoutBoost = colleges.map(college => {
    const semanticScore = cosineSimilarity(queryEmbedding, college.embedding);
    const intellScore = computeIntelligenceScore(college) / 10;
    const combinedScore = semanticScore * 0.7 + intellScore * 0.3;
    return { name: college.name, city: college.city, semanticScore, intellScore, combinedScore };
  });

  scoredWithoutBoost.sort((a, b) => b.combinedScore - a.combinedScore);

  console.log("--- TOP 5 WITHOUT CITY BOOST ---");
  scoredWithoutBoost.slice(0, 5).forEach((c, idx) => {
    console.log(`${idx + 1}. ${c.name} (${c.city}) - Combined: ${c.combinedScore.toFixed(4)} | Semantic: ${c.semanticScore.toFixed(4)} | Intelligence: ${c.intellScore.toFixed(4)}`);
  });
}

run().catch(console.error);
