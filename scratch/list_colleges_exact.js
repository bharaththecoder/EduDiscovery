import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  // We can search for the university blocks by looking for objects in the top-level array.
  // A simple way is to match `{` that start a university object.
  // Each university has an `id: "..."` and a `name: "..."` at the top level.
  // Let's parse it using a state machine or a more robust regex that looks for `id` and then the next `name` within a few lines.
  
  const uniRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
  let match;
  const list = [];
  while ((match = uniRegex.exec(content)) !== null) {
    list.push({ id: match[1], name: match[2] });
  }
  
  console.log(`Found ${list.length} exact universities:`);
  list.forEach((u, i) => {
    console.log(`${i+1}. [${u.id}] ${u.name}`);
  });
} catch (e) {
  console.error(e);
}
