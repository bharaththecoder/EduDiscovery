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

// ─── In-memory college cache (reused from search.js pattern) ──
let cachedColleges = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getCollegesFromFirestore() {
  if (cachedColleges && Date.now() - cacheTime < CACHE_TTL) return cachedColleges;
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'colleges'));
  cachedColleges = snap.docs.map(d => {
    const data = d.data();
    // Strip embedding to save memory
    const { embedding, ...rest } = data;
    return { id: d.id, ...rest };
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
  
  // Score colleges by relevance to message
  const scored = colleges.map(c => {
    let score = 0;
    const cLower = `${c.name} ${c.shortName || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
    
    // Name match (highest priority)
    if (keywords.names.some(n => cLower.includes(n))) score += 40;
    // Branch match
    if (keywords.branches.some(b => cLower.includes(b))) score += 20;
    // City in message
    if (c.city && lower.includes(c.city.toLowerCase())) score += 30;
    // NAAC mention
    if (keywords.attrs.includes('naac') || keywords.attrs.includes('ranking')) score += 5;
    
    return { ...c, _score: score };
  }).filter(c => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 4); // top 4 colleges
  
  if (scored.length === 0) return '';

  // Format as structured fact block
  const facts = scored.map(c => {
    const minFee = c.branchFees ? Math.min(...Object.values(c.branchFees)) : null;
    const feeStr = minFee ? `₹${(minFee / 1000).toFixed(0)}K/yr` : 'Contact institution';
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_actual_key_here') {
      return res.status(500).json({ reply: "🔑 AI Error: Please add your Gemini API Key to the .env file." });
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemInstruction
    });

    let formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Gemini requires history to start with a 'user' message.
    // If the first message is from the 'model' (like the initial greeting), we skip it in the history.
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory = formattedHistory.slice(1);
    }

    const chat = model.startChat({ history: formattedHistory, generationConfig: { maxOutputTokens: 1200 } });
    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("Gemini API Error:", error);
    let errorMessage = "Sorry, I'm having trouble connecting to the AI service.";
    const isQuotaError = error.status === 429 || error.message?.toLowerCase().includes("quota");
    if (isQuotaError) errorMessage = "⏳ Daily Limit Reached: Please wait for the daily reset or try again later.";
    else if (error.status === 404) errorMessage = "🚫 Model Error: This API key does not have access to the Gemini models.";

    if (!res.headersSent) return res.status(500).json({ reply: errorMessage });
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
}
