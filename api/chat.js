import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context } = req.body;
    console.log("--- Chat Request Received ---");
    console.log("Message:", message);

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
    
    // We'll try these models in order if one is exhausted
    const modelOptions = ["gemini-2.0-flash", "gemini-2.5-flash-lite"];
    let text = "";
    let lastError = null;

    for (const modelName of modelOptions) {
      try {
        console.log(`Attempting response using ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
User Preferences:
${JSON.stringify(context?.userPreferences || "Not provided")}

Top Colleges:
${JSON.stringify(context?.topColleges?.slice(0, 3) || [])}

User Question:
${message}

You are an expert college admission counselor for EduDiscovery.
Give a clear, short, helpful answer.
If not enough data, say that clearly.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        
        if (text) break; // Success!
      } catch (error) {
        lastError = error;
        console.error(`Error with ${modelName}:`, error.status, error.message);
        
        // If it's a 429 (Quota), try the next model. 
        // If it's something else (like 404), maybe try next too.
        if (error.status === 429 || error.status === 404) {
          continue; 
        }
        break; // Stop for other errors
      }
    }

    if (!text && lastError) {
      throw lastError;
    }

    return res.status(200).json({
      reply: text || "I understood your question, but I couldn't formulate a response."
    });

  } catch (error) {
    console.error("Gemini API Final Error:", error);
    
    let errorMessage = "Sorry, I'm having trouble connecting to the AI service. Please check your API key.";
    
    // Improved detection of Daily Quota limits
    const isQuotaError = error.status === 429 || error.message?.toLowerCase().includes("quota") || error.errorDetails?.some(d => JSON.stringify(d).toLowerCase().includes("quota"));

    if (isQuotaError) {
      errorMessage = "⏳ Daily Limit Reached: You have used up your free AI requests for today. Please wait for the daily reset or try again later.";
    } else if (error.status === 404) {
      errorMessage = "🚫 Model Error: This API key does not have access to the selected Gemini models. Please check your setup in Google AI Studio.";
    }

    return res.status(500).json({
      reply: errorMessage
    });
  }
}