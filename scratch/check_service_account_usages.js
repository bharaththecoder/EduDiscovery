import fs from 'fs';
import path from 'path';

const apiDir = 'api';
const files = fs.readdirSync(apiDir);

console.log("Searching for serviceAccountKey.json in api/ directory...");
files.forEach(file => {
  const filePath = path.join(apiDir, file);
  if (fs.statSync(filePath).isFile()) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('serviceAccountKey.json')) {
      console.log(`Found usage in: ${filePath}`);
    }
  }
});
