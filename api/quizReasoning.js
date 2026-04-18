import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function quizReasoningHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, topColleges } = req.body;
    if (!answers || !topColleges) {
      return res.status(400).json({ error: "Answers and topColleges are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Construct prompt
    const prompt = `
      You are an expert college admissions counselor for Indian universities (specifically Andhra Pradesh).
      A student just completed a preference quiz with these answers:
      ${JSON.stringify(answers, null, 2)}
      
      Based on our internal algorithm, these are their top matched colleges:
      ${topColleges.map((c, i) => `${i+1}. ${c.name} (${c.matchPercent}% match) - ${c.city}`).join('\n')}
      
      Write a brief, personalized, and encouraging 2-3 paragraph summary addressing the student directly ("You").
      Explain *why* these top colleges are a great fit for their specific priorities (e.g., budget, location, or branch).
      Highlight one standout feature from their #1 match. Do not use robotic language. Be enthusiastic.
    `;

    const result = await model.generateContent(prompt);
    const reasoningText = result.response.text();

    return res.status(200).json({ reasoning: reasoningText });

  } catch (error) {
    console.error("Quiz Reasoning API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
