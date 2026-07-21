import { generateText } from "./aiHelper.js";
import dotenv from "dotenv";

dotenv.config();

export default async function quizReasoningHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, topColleges } = req.body;
    if (!answers || !topColleges) {
      return res.status(400).json({ error: "Answers and topColleges are required" });
    }

    // Construct prompt
    const prompt = `
      You are an expert college admissions counselor for Indian universities (specifically Andhra Pradesh).
      A student just completed a preference quiz with these answers:
      ${JSON.stringify(answers, null, 2)}
      
      Based on our internal algorithm, these are their top matched colleges:
      ${topColleges.map((c, i) => `${i+1}. ${c.name} (${c.matchPercent}% match) - ${c.city}`).join('\n')}
      
      Write a very short, precise, and encouraging 1-paragraph summary addressing the student directly ("You").
      Explain briefly *why* these top colleges are a great fit based on their answers. Be concise and avoid repeating the same points or over-explaining. Maximum 3-4 sentences. Do not use robotic language.
    `;

    const reasoningText = await generateText(prompt);

    return res.status(200).json({ reasoning: reasoningText });

  } catch (error) {
    console.error("Quiz Reasoning API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
