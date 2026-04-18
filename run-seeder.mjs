import fs from 'fs';

async function runSeed() {
  console.log("🚀 Starting robust seeder...");
  
  try {
    // 1. Read the TS file as text
    let content = fs.readFileSync('src/data/universities.ts', 'utf8');
    
    // 2. Extract the array content
    // We look for everything from the FIRST '[' to the LAST '];' (or the last ']')
    const startMarker = 'export const universities = ';
    const startIndex = content.indexOf(startMarker);
    
    if (startIndex === -1) {
      throw new Error("Could not find 'universities' export in src/data/universities.ts");
    }
    
    // Find the end of the array by searching for the last closing bracket that belongs to the variable
    // A simple way is to find the first index of 'export function' or similar which follows the array
    const endMarkerIndex = content.indexOf('\nexport function', startIndex);
    let arrayText = "";
    if (endMarkerIndex !== -1) {
      arrayText = content.substring(startIndex + startMarker.length, endMarkerIndex).trim();
    } else {
      arrayText = content.substring(startIndex + startMarker.length).trim();
    }

    if (arrayText.endsWith(';')) arrayText = arrayText.slice(0, -1);

    // 3. Temporary conversion to MJS to allow dynamic import
    const tmpFile = 'tmp-universities-seed.mjs';
    fs.writeFileSync(tmpFile, `export const universities = ${arrayText}`);
    
    const { universities } = await import('./' + tmpFile);
    
    // Clean up immediately
    try { fs.unlinkSync(tmpFile); } catch (e) {}
    
    console.log(`📦 Loaded ${universities.length} universities. Sending to API...`);

    // 4. Call the API
    const response = await fetch('http://localhost:3001/api/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colleges: universities })
    });

    const result = await response.json();
    if (response.ok) {
      console.log("✅ Seeding Complete!", result);
    } else {
      console.error("❌ Seeding Failed:", result);
    }

  } catch (error) {
    console.error("💥 Error during seeding:", error.message);
  }
}

runSeed();
