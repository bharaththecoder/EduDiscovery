import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, history = [] } = req.body;
    console.log("--- Chat Request Received ---");
    console.log("Message:", message);
    console.log("History length:", history.length);

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_actual_key_here') {
      return res.status(500).json({ 
        reply: "🔑 AI Error: Please add your Gemini API Key to the .env file." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enable basic streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemInstruction = `
User Preferences:
${JSON.stringify(context?.userPreferences || "Not provided")}

Top Colleges context:
${JSON.stringify(context?.topColleges?.slice(0, 3) || [])}

You are an expert college admission counselor for EduDiscovery.
Provide clear, helpful, startup-quality advice. Keep your tone professional but encouraging.
Use formatting (bolding, lists) to make it readable.
Format response in easy to digest markdown.
`;

    // Map history to Gemini format
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Insert system instructions as a preamble in history if supported or as first message
    formattedHistory.unshift({
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTION: ${systemInstruction}\n\nAcknowledge these instructions and wait for the first real user message.` }]
    });
    formattedHistory.unshift({
      role: 'model',
      parts: [{ text: 'Acknowledged. I am ready to act as the EduDiscovery counselor.' }]
    });

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    console.log(`Attempting streaming response using gemini-1.5-flash...`);
    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        // SSE format
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("Gemini API Final Error:", error);
    
    let errorMessage = "Sorry, I'm having trouble connecting to the AI service. Please check your API key.";
    
    const isQuotaError = error.status === 429 || error.message?.toLowerCase().includes("quota") || error.errorDetails?.some(d => JSON.stringify(d).toLowerCase().includes("quota"));

    if (isQuotaError) {
      errorMessage = "⏳ Daily Limit Reached: You have used up your free AI requests for today. Please wait for the daily reset or try again later.";
    } else if (error.status === 404) {
      errorMessage = "🚫 Model Error: This API key does not have access to the selected Gemini models.";
    }

    if (!res.headersSent) {
      return res.status(500).json({ reply: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
}