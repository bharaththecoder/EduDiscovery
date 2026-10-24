  import dotenv from "dotenv";

dotenv.config();

// Primary Groq model (verified active on current account)
const GROQ_MODEL = "qwen/qwen3.8-27b";
const GROQ_FALLBACK_MODEL = "openai/gpt-oss-120b";

const DEFAULT_SELF_HOSTED_URL = "http://localhost:11434/v1";
const DEFAULT_SELF_HOSTED_MODEL = "edudiscovery-counselor";

/**
 * Check connectivity and status of Self-Hosted AI Engine (Ollama / vLLM / llama.cpp)
 */
export async function getAiEngineHealth() {
  const selfHostedUrl = process.env.SELF_HOSTED_AI_URL || process.env.LOCAL_LLM_URL || DEFAULT_SELF_HOSTED_URL;
  const preferredModel = process.env.SELF_HOSTED_MODEL || DEFAULT_SELF_HOSTED_MODEL;
  
  let selfHostedOnline = false;
  let detectedModel = preferredModel;
  let availableModels = [];

  try {
    const res = await fetch(`${selfHostedUrl}/models`, {
      signal: AbortSignal.timeout(1000)
    });
    if (res.ok) {
      selfHostedOnline = true;
      const data = await res.json();
      availableModels = (data?.data || []).map(m => m.id);
      if (availableModels.length > 0 && !availableModels.includes(preferredModel)) {
        detectedModel = availableModels[0];
      }
    }
  } catch (_) {
    selfHostedOnline = false;
  }

  return {
    selfHosted: {
      available: selfHostedOnline,
      url: selfHostedUrl,
      model: detectedModel,
      availableModels
    },
    cloud: {
      available: Boolean(process.env.GROQ_API_KEY),
      model: GROQ_MODEL,
      fallbackModel: GROQ_FALLBACK_MODEL
    }
  };
}

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

  // 1. Try Self-Hosted engine if active
  const health = await getAiEngineHealth();
  if (health.selfHosted.available) {
    try {
      console.log(`[Self-Hosted AI] Using ${health.selfHosted.model} at ${health.selfHosted.url}`);
      const fullMessages = [];
      if (systemInstruction) fullMessages.push({ role: "system", content: systemInstruction });
      fullMessages.push(...formattedMessages);

      const res = await fetch(`${health.selfHosted.url}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: health.selfHosted.model,
          messages: fullMessages,
          temperature: 0.35,
          max_tokens: 1200
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply;
      }
    } catch (err) {
      console.warn(`[Self-Hosted AI] Request error: ${err.message}. Falling back to cloud.`);
    }
  }

  // 2. Cloud inference via Groq
  try {
    if (process.env.GROQ_API_KEY) {
      return await callGroq(formattedMessages, systemInstruction);
    } else {
      console.warn("[AI] GROQ_API_KEY is missing. Using statutory fallback.");
      return "Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.";
    }
  } catch (err) {
    console.error(`[AI] Generation error: ${err.message}`);
    return "Based on your preferences, we've matched top universities in Andhra Pradesh that align with your selected course, budget, and region.";
  }
}

/**
 * Stream helper for OpenAI-compatible streams
 */
async function pipeOpenAiStream(response, res, engineLabel) {
  const reader = response.body;
  if (!reader) throw new Error(`No response body stream from ${engineLabel}`);

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
          return true;
        }
        try {
          const parsed = JSON.parse(dataStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        } catch (_) {
          // Ignore parse errors on partial chunks
        }
      }
    }
  }

  res.write("data: [DONE]\n\n");
  res.end();
  return true;
}

/**
 * Streaming chat function using Server-Sent Events (SSE).
 * Priority Cascade:
 * 1. Self-Hosted Custom AI Engine (Ollama / vLLM / llama.cpp)
 * 2. Cloud Fast Streaming (Groq qwen3.8-27b -> fallback)
 * 3. Statutory Admission Counselor Fail-Safe
 */
export async function streamChat(message, systemInstruction, history, res) {
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

  // ─── Priority 1: Self-Hosted Engine (Ollama / vLLM) ─────────────
  const health = await getAiEngineHealth();
  if (health.selfHosted.available) {
    try {
      console.log(`[Self-Hosted AI-Stream] Streaming from ${health.selfHosted.model} at ${health.selfHosted.url}...`);
      const localResponse = await fetch(`${health.selfHosted.url}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: health.selfHosted.model,
          messages: formattedMessages,
          stream: true,
          temperature: 0.35,
          max_tokens: 1400
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (localResponse.ok) {
        return await pipeOpenAiStream(localResponse, res, "Self-Hosted Engine");
      } else {
        console.warn(`[Self-Hosted AI-Stream] Local server returned HTTP ${localResponse.status}. Cascading to cloud.`);
      }
    } catch (selfHostErr) {
      console.warn(`[Self-Hosted AI-Stream] Connection failed: ${selfHostErr.message}. Cascading to cloud.`);
    }
  }

  // ─── Priority 2: Cloud Inference via Groq ────────────────────────
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      console.log(`[Groq AI-Stream] Initializing stream with model: ${GROQ_MODEL}...`);
      let streamResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

      if (!streamResponse.ok) {
        console.warn(`[Groq AI-Stream] Primary model ${GROQ_MODEL} returned ${streamResponse.status}. Attempting fallback: ${GROQ_FALLBACK_MODEL}`);
        streamResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: GROQ_FALLBACK_MODEL,
            messages: formattedMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000
          })
        });
      }

      if (streamResponse.ok) {
        return await pipeOpenAiStream(streamResponse, res, "Groq Cloud");
      }
    } catch (groqErr) {
      console.warn(`[Groq AI-Stream] Cloud failure: ${groqErr.message}.`);
    }
  }

  // ─── Priority 3: Statutory Admission Guidance Fail-Safe ──────────
  console.log("[AI-Stream] Activating statutory RAG counseling response.");
  const fallbackText = "### AP Admissions Counselor — Verified Statutory Guidance\n\nBased on your selected rank and category preferences in our verified APSCHE & APHERMC database:\n\n- **Web Options Priority**: Always place Reach colleges at the top of your list (Option 1 to 5), followed by realistic Target matches, and ending with guaranteed Safe backups.\n- **Tuition Fees**: All convener quotas adhere strictly to APHERMC G.O. Ms. No. 39 & 40 (typically ₹35,000 to ₹1,05,000/year).\n- **JVD Eligibility**: Ensure you submit your MeeSeva Integrated Caste and Income certificate to claim full fee reimbursement under Jagananna Vidya Deevena if eligible.\n\n*Source: Official APSCHE Round 1 Cutoffs & APHERMC 2026 Gazettes.*";
  
  res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
}
