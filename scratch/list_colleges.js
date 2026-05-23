import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  // Find all id and name pairs
  const idRegex = /id:\s*"([^"]+)"/g;
  const nameRegex = /name:\s*"([^"]+)"/g;
  
  let match;
  const ids = [];
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  
  const names = [];
  while ((match = nameRegex.exec(content)) !== null) {
    names.push(match[1]);
  }
  
  console.log(`Found ${ids.length} colleges:`);
  for (let i = 0; i < ids.length; i++) {
    console.log(`${i+1}. [${ids[i]}] ${names[i]}`);
  }
} catch (e) {
  console.error(e);
}
