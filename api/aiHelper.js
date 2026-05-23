import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Primary OpenRouter model
const PRIMARY_MODEL = "minimax/minimax-01:free";
// Backup Gemini model
const FALLBACK_MODEL = "gemini-flash-latest";

/**
 * Helper to call OpenRouter API for standard completion (non-streaming)
 */
async function callOpenRouter(messages, systemInstruction) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("No OpenRouter API key found");

  const formattedMessages = [];
  if (systemInstruction) {
    formattedMessages.push({ role: "system", content: systemInstruction });
  }
  formattedMessages.push(...messages);

  console.log(`[AI] Attempting OpenRouter call with model: ${PRIMARY_MODEL}...`);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "EduDiscovery AP"
    },
    body: JSON.stringify({
      model: PRIMARY_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1200
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  
  console.log(`[AI] OpenRouter request succeeded!`);
  return text;
}

/**
 * Helper to call Google Gemini API for standard completion (non-streaming)
 */
async function callGemini(messages, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key found");

  console.log(`[AI] Attempting native Gemini fallback with model: ${FALLBACK_MODEL}...`);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: FALLBACK_MODEL,
    systemInstruction: systemInstruction 
  });

  // Convert chat messages to Gemini's history structure
  // Note: search/quiz reasoning are usually simple prompt completions
  const prompt = messages[messages.length - 1].content;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");

  console.log(`[AI] Gemini fallback request succeeded!`);
  return text;
}

/**
 * Main wrapper for text generation. Try OpenRouter first, then Gemini as a fallback.
 */
export async function generateText(messages, systemInstruction = "") {
  // If the messages are passed as a single string, format it
  let formattedMessages = Array.isArray(messages) 
    ? messages 
    : [{ role: "user", content: messages }];

  try {
    if (process.env.OPENROUTER_API_KEY) {
      return await callOpenRouter(formattedMessages, systemInstruction);
    } else {
      console.log("[AI] No OpenRouter key found, jumping directly to Gemini");
      return await callGemini(formattedMessages, systemInstruction);
    }
  } catch (orError) {
    console.warn(`[AI] OpenRouter failed: ${orError.message}. Falling back to native Gemini...`);
    try {
      return await callGemini(formattedMessages, systemInstruction);
    } catch (geminiError) {
      console.error(`[AI] Both OpenRouter and Gemini fallback failed!`);
      throw new Error(`AI generation failed. (OpenRouter error: ${orError.message} | Gemini error: ${geminiError.message})`);
    }
  }
}

/**
 * Streaming chat function using Server-Sent Events (SSE). 
 * Attempts OpenRouter stream first, falls back to Gemini stream.
 */
export async function streamChat(message, systemInstruction, history, res) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openRouterKey) {
    try {
      console.log(`[AI-Stream] Attempting OpenRouter stream with model: ${PRIMARY_MODEL}...`);
      
      const formattedMessages = [];
      if (systemInstruction) {
        formattedMessages.push({ role: "system", content: systemInstruction });
      }
      
      // Append history
      history.forEach(h => {
        formattedMessages.push({ 
          role: h.role === "user" ? "user" : "assistant", 
          content: h.content 
        });
      });
      
      // Append latest message
      formattedMessages.push({ role: "user", content: message });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3001",
          "X-Title": "EduDiscovery AP"
        },
        body: JSON.stringify({
          model: PRIMARY_MODEL,
          messages: formattedMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter Stream API failed (${response.status}): ${errText}`);
      }

      const reader = response.body;
      if (!reader) throw new Error("ReadableStream not available on OpenRouter response");

      console.log("[AI-Stream] OpenRouter stream connection established!");

      // Set up chunk buffer to handle partial lines in SSE
      let buffer = "";
      
      for await (const chunk of reader) {
        buffer += chunk.toString("utf8");
        const lines = buffer.split("\n");
        // Save the last incomplete line back to buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            if (dataStr === "[DONE]") {
              res.write("data: [DONE]\n\n");
              res.end();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
              }
            } catch (err) {
              // Ignore parse errors on empty or metadata chunks
            }
          }
        }
      }
      
      // Flush remaining buffer
      if (buffer.trim().startsWith("data: ")) {
        const dataStr = buffer.trim().slice(6);
        if (dataStr !== "[DONE]") {
          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
          } catch (e) {}
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;

    } catch (orStreamErr) {
      console.warn(`[AI-Stream] OpenRouter stream failed: ${orStreamErr.message}. Falling back to native Gemini...`);
    }
  }

  // FALLBACK TO NATIVE GEMINI STREAMING
  if (!geminiKey) {
    throw new Error("No API key available for either OpenRouter or Google Gemini fallback.");
  }

  console.log(`[AI-Stream] Attempting Google Gemini stream with model: ${FALLBACK_MODEL}...`);
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ 
    model: FALLBACK_MODEL,
    systemInstruction: systemInstruction
  });

  let formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Gemini requires history to start with a 'user' message
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

  res.write("data: [DONE]\n\n");
  res.end();
}
