import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  const startMarker = 'export const universities = ';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex === -1) {
    throw new Error("Could not find 'universities' export in src/data/universities.ts");
  }
  
  const endMarkerIndex = content.indexOf('\nexport function', startIndex);
  let arrayText = "";
  if (endMarkerIndex !== -1) {
    arrayText = content.substring(startIndex + startMarker.length, endMarkerIndex).trim();
  } else {
    arrayText = content.substring(startIndex + startMarker.length).trim();
  }

  if (arrayText.endsWith(';')) arrayText = arrayText.slice(0, -1);

  const tmpFile = 'tmp-universities-check.mjs';
  fs.writeFileSync(tmpFile, `export const universities = ${arrayText}`);
  
  const { universities } = await import('../' + tmpFile);
  fs.unlinkSync(tmpFile);
  
  console.log("Total universities in universities.ts:", universities.length);
  
  const anu = universities.find(u => u.name && u.name.includes("Acharya Nagarjuna"));
  console.log("\nAcharya Nagarjuna University:");
  console.log(JSON.stringify(anu, null, 2));

  const klu = universities.find(u => u.name && u.name.includes("KL University"));
  console.log("\nKL University:");
  console.log(JSON.stringify(klu, null, 2));

  const nri = universities.find(u => u.name && u.name.includes("NRI Institute"));
  console.log("\nNRI Institute of Technology:");
  console.log(JSON.stringify(nri, null, 2));
} catch (e) {
  console.error("Error:", e);
}
