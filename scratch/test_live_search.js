import dotenv from "dotenv";
import searchHandler from "../api/search.js";

dotenv.config();

async function run() {
  const req = {
    method: 'POST',
    body: {
      query: "colleges near vijayawada"
    }
  };

  let responseData = null;
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      responseData = data;
      return this;
    }
  };

  console.log("Executing searchHandler directly with query: 'colleges near vijayawada'...");
  await searchHandler(req, res);

  if (responseData && responseData.results) {
    console.log("\n--- Top 5 Colleges returned by API ---");
    responseData.results.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.name} (${c.city}) - Match Score: ${c.matchScore} | Intelligence: ${c.intelligenceScore}`);
    });
    console.log("\nAI Insights / Reasoning:");
    console.log(responseData.reasoning);
  } else {
    console.log("No response or error:", responseData);
  }
}

run().catch(console.error);
