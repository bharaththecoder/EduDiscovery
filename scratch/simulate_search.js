import fs from 'fs';

// Helper functions from search.js
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordMatchScore(query, college) {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return 0.5;

  let matches = 0;
  const targetText = `${college.name} ${college.shortName || ''} ${college.city} ${college.state} ${(college.tags || []).join(' ')} ${college.about || ''} ${(college.branches || []).join(' ')}`.toLowerCase();

  words.forEach(word => {
    if (targetText.includes(word)) {
      matches += 1;
    }
  });

  return Math.min(1.0, 0.2 + (matches / words.length) * 0.8);
}

function computeIntelligenceScore(college) {
  const feeValues = college.branchFees ? Object.values(college.branchFees).filter(v => typeof v === 'number' && !isNaN(v)) : [];
  const fees = feeValues.length > 0
    ? Math.min(...feeValues)
    : college.programs
      ? Math.min(...college.programs.map(p => parseInt((p.fees || '').replace(/[^0-9]/g, '')) || 100000).filter(f => f > 0))
      : 100000;
  const avgPackage = college.avgPackage || 500000;
  const placementRate = college.placementRate || 65;
  const roi = fees > 0 && isFinite(fees) ? avgPackage / (fees * 4) : 1;
  const value = fees > 0 && isFinite(fees) ? (placementRate / 100) * avgPackage / fees : 1;
  return Math.min(10, (roi * 3.3 + value * 2.5) / 2);
}

async function simulate() {
  const query = "colleges near vijayawada";
  
  // Load universities
  const content = fs.readFileSync('src/data/universities.ts', 'utf8');
  const startMarker = 'export const universities = ';
  const startIndex = content.indexOf(startMarker);
  const endMarkerIndex = content.indexOf('\nexport function', startIndex);
  let arrayText = content.substring(startIndex + startMarker.length, endMarkerIndex).trim();
  if (arrayText.endsWith(';')) arrayText = arrayText.slice(0, -1);
  
  const tmpFile = 'tmp-universities-sim.mjs';
  fs.writeFileSync(tmpFile, `export const universities = ${arrayText}`);
  const { universities } = await import('../' + tmpFile);
  fs.unlinkSync(tmpFile);

  const CITIES_LIST = ['amaravati', 'visakhapatnam', 'vijayawada', 'guntur', 'kakinada', 'tirupati'];
  const lowerQuery = query.toLowerCase();
  const matchedCity = CITIES_LIST.find(c => lowerQuery.includes(c));
  
  console.log("Matched City in Query:", matchedCity);

  const scored = universities.map(college => {
    // Simulated queryEmbedding check - we use keywordMatchScore since we don't have the Gemini API key here
    const semanticScore = keywordMatchScore(query, college);
    const intellScore = computeIntelligenceScore(college) / 10;
    
    let combinedScore = semanticScore * 0.7 + intellScore * 0.3;
    let boosted = false;
    
    if (matchedCity && college.city && college.city.toLowerCase() === matchedCity) {
      combinedScore += 0.8;
      boosted = true;
    }
    
    return {
      name: college.name,
      city: college.city,
      semanticScore,
      intellScore,
      combinedScore,
      boosted
    };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  console.log("\n--- Top 10 Scored Colleges (Simulated) ---");
  scored.slice(0, 10).forEach((c, idx) => {
    console.log(`${idx + 1}. ${c.name} (${c.city}) - Combined: ${c.combinedScore.toFixed(3)} | Semantic: ${c.semanticScore.toFixed(3)} | Intelligence: ${c.intellScore.toFixed(3)} | Boosted: ${c.boosted}`);
  });
}

simulate();
