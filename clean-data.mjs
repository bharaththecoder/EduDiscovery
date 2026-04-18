import fs from 'fs';

const filePath = 'src/data/universities.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find branchFees block and remove the nested avgPackage/placementRate fields
// We look for: branchFees: { ... avgPackage: X, placementRate: Y }
// and replace it with just the contents WITHOUT those two lines.
const fixedContent = content.replace(
  /(branchFees:\s*\{)([\s\S]*?)(avgPackage:\s*\d+,\s*placementRate:\s*\d+)(\s*\})/g,
  (match, p1, p2, p3, p4) => {
    // p2 contains the entries before the injected fields. 
    // We remove any trailing comma from p2 if it exists to keep it clean, 
    // though the injection script already added commas.
    return p1 + p2.trimEnd().replace(/,$/, '') + p4;
  }
);

fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log("✅ Data Cleaned: Moved avgPackage/placementRate out of branchFees.");
