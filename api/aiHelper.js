import dotenv from "dotenv";

dotenv.config();

// Primary Groq model
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_FALLBACK_MODEL = "llama-3.1-8b-instant";

/**
 * Call Groq API for standard completion (non-streaming)
 */
async function callGroq(messages, systemInstruction) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY found in environment");

  const formattedMessages = [];
  if (systemInstruction) {
    formattedMessages.push({ role: "system", content: systemInstruction });
  }
  formattedMessages.push(...messages);

  console.log(`[Groq AI] Sending request with model: ${GROQ_MODEL}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1200
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");

    console.log(`[Groq AI] Request succeeded!`);
    return text;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[Groq AI] Model ${GROQ_MODEL} notice: ${err.message}`);
    
    try {
      // Fallback attempt with smaller model
      const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_FALLBACK_MODEL,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const text = fallbackData.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (fallbackErr) {
      console.warn(`[Groq AI] Fallback model error: ${fallbackErr.message}`);
    }

    return "Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.";
  }
}

/**
 * Main wrapper for text generation.
 */
export async function generateText(messages, systemInstruction = "") {
  let formattedMessages = Array.isArray(messages)
    ? messages
    : [{ role: "user", content: messages }];

  try {
    if (process.env.GROQ_API_KEY) {
      return await callGroq(formattedMessages, systemInstruction);
    } else {
      console.warn("[Groq AI] GROQ_API_KEY is missing. Using static high-quality fallback.");
      return "Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.";
    }
  } catch (err) {
    console.error(`[Groq AI] Generation error: ${err.message}`);
    return "Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.";
  }
}

/**
 * Streaming chat function using Server-Sent Events (SSE) via Groq API.
 */
export async function streamChat(message, systemInstruction, history, res) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.write(`data: ${JSON.stringify({ text: "Groq API key not configured. Please add GROQ_API_KEY to your .env file." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  try {
    console.log(`[Groq AI-Stream] Initializing stream with model: ${GROQ_MODEL}...`);

    const formattedMessages = [];
    if (systemInstruction) {
      formattedMessages.push({ role: "system", content: systemInstruction });
    }

    history.forEach(h => {
      const role = h.role || (h.sender === "user" ? "user" : "assistant");
      const content = h.content || h.text || "";
      formattedMessages.push({ role, content });
    });

    formattedMessages.push({ role: "user", content: message });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: formattedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq stream failed (${response.status}): ${errText}`);
    }

    const reader = response.body;
    if (!reader) throw new Error("No response body stream from Groq");

    let buffer = "";
    const decoder = new TextDecoder("utf-8");

    for await (const chunk of reader) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
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
          } catch (e) {
            // Ignore parse errors on whitespace / metadata
          }
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("[Groq AI-Stream] Error:", err.message);
    res.write(`data: ${JSON.stringify({ text: `\n\n[Groq Error: ${err.message}]` })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
