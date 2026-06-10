import dotenv from 'dotenv';

dotenv.config();

const openRouterKey = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

async function testStream() {
  console.log("Starting OpenRouter test stream...");
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "Say hello in 3 words" }],
        stream: true,
      })
    });

    console.log("Response status:", response.status);
    if (!response.ok) {
      console.error("Failed:", await response.text());
      return;
    }

    const reader = response.body;
    console.log("Readable stream present:", !!reader);

    let count = 0;
    // Test if response.body is async iterable
    for await (const chunk of reader) {
      console.log(`Chunk #${++count}:`, chunk.toString('utf8'));
    }
    console.log("Stream finished!");
  } catch (err) {
    console.error("Test stream error:", err);
  }
}

testStream();
