import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");
console.log("GEMINI_API_KEY value:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

try {
  const result = await model.embedContent("Hello World");
  console.log("Embedding success:", result.embedding.values.slice(0, 5));
} catch (e) {
  console.error("Embedding fail:", e.message);
}
