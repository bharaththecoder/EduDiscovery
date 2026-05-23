import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  // Find all matches for names and cities
  const regex = /name:\s*['"`](.*?)['"`],\s*[\s\S]*?city:\s*['"`](.*?)['"`]/g;
  let match;
  console.log("--- Universities in src/data/universities.ts ---");
  while ((match = regex.exec(content)) !== null) {
    console.log(`Name: "${match[1]}" | City: "${match[2]}"`);
  }
} catch (e) {
  console.error(e);
}
