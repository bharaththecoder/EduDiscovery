// node add-intelligence-fields.mjs
// Correctly injects avgPackage + placementRate inside each university object
// by finding each `id: "..."` and inserting before the matching closing `  },`
import { readFileSync, writeFileSync } from 'fs';

const intelligence = {
  "nri-institute":                    { avgPackage: 600000,  placementRate: 72 },
  "srm-ap":                           { avgPackage: 1200000, placementRate: 91 },
  "andhra-university":                { avgPackage: 600000,  placementRate: 68 },
  "vit-ap":                           { avgPackage: 900000,  placementRate: 86 },
  "gitam":                            { avgPackage: 900000,  placementRate: 84 },
  "kl-university":                    { avgPackage: 850000,  placementRate: 87 },
  "vignan-university":                { avgPackage: 650000,  placementRate: 75 },
  "amrita-ap":                        { avgPackage: 1100000, placementRate: 89 },
  "jntuk":                            { avgPackage: 500000,  placementRate: 65 },
  "acharya-nagarjuna-university":     { avgPackage: 450000,  placementRate: 60 },
  "vr-siddhartha":                    { avgPackage: 550000,  placementRate: 70 },
  "sv-university":                    { avgPackage: 500000,  placementRate: 64 },
  "gmrit-rajam":                      { avgPackage: 480000,  placementRate: 68 },
  "lbrce-mylavaram":                  { avgPackage: 420000,  placementRate: 63 },
  "bec-bapatla":                      { avgPackage: 430000,  placementRate: 64 },
  "aknu-rajamahendravaram":           { avgPackage: 380000,  placementRate: 58 },
  "sku-anantapur":                    { avgPackage: 370000,  placementRate: 56 },
  "gvpce-visakhapatnam":              { avgPackage: 550000,  placementRate: 70 },
  "aec-surampalem":                   { avgPackage: 400000,  placementRate: 62 },
  "rvrjcce-guntur":                   { avgPackage: 500000,  placementRate: 69 },
  "vitb-bhimavaram":                  { avgPackage: 430000,  placementRate: 63 },
  "vvit-guntur":                      { avgPackage: 410000,  placementRate: 61 },
  "gec-gudlavalleru":                 { avgPackage: 450000,  placementRate: 65 },
  "yvu-kadapa":                       { avgPackage: 350000,  placementRate: 52 },
  "vsu-nellore":                      { avgPackage: 360000,  placementRate: 54 },
  "jntua-anantapur":                  { avgPackage: 450000,  placementRate: 62 },
  "ru-kurnool":                       { avgPackage: 340000,  placementRate: 50 },
  "srkrec-bhimavaram":                { avgPackage: 420000,  placementRate: 63 },
  "aitam-tekkali":                    { avgPackage: 410000,  placementRate: 61 },
  "svecw-bhimavaram":                 { avgPackage: 400000,  placementRate: 60 },
  "nec-narasaraopeta":                { avgPackage: 380000,  placementRate: 58 },
  "pec-surampalem":                   { avgPackage: 360000,  placementRate: 55 },
  "aliet-vijayawada":                 { avgPackage: 450000,  placementRate: 64 },
  "spmvv-tirupati":                   { avgPackage: 400000,  placementRate: 60 },
  "dsnlu-visakhapatnam":              { avgPackage: 600000,  placementRate: 68 },
  "sssihl-prasanthi-nilayam":         { avgPackage: 700000,  placementRate: 75 },
  "rgukt-ap":                         { avgPackage: 600000,  placementRate: 72 },
  "mvgrce-vizianagaram":              { avgPackage: 380000,  placementRate: 58 },
  "liet-rajam":                       { avgPackage: 370000,  placementRate: 56 },
  "angrau-guntur":                    { avgPackage: 450000,  placementRate: 62 },
  "ntruhs-vijayawada":                { avgPackage: 800000,  placementRate: 80 },
  "annamacharya-university-rajampet": { avgPackage: 400000,  placementRate: 60 },
  "krea-university-sri-city":         { avgPackage: 1000000, placementRate: 88 },
  "qiscet-ongole":                    { avgPackage: 380000,  placementRate: 57 },
  "amc-visakhapatnam":                { avgPackage: 700000,  placementRate: 74 },
  "kiet-kakinada":                    { avgPackage: 420000,  placementRate: 62 },
  "svvu-tirupati":                    { avgPackage: 480000,  placementRate: 65 },
};

// Split file into university blocks by line
let content = readFileSync('src/data/universities.ts', 'utf8');
const lines = content.split('\n');

let count = 0;

for (const [id, data] of Object.entries(intelligence)) {
  // Find line with this id
  const idLineIdx = lines.findIndex(l => l.includes(`id: "${id}"`));
  if (idLineIdx === -1) { console.warn(`⚠️  Not found: ${id}`); continue; }

  // Search forward for the FIRST line that matches exactly "  }," (2 spaces + },)
  // which is the university object close
  let closeIdx = -1;
  for (let i = idLineIdx + 1; i < lines.length; i++) {
    if (lines[i].trim() === '},') {
      closeIdx = i;
      break;
    }
  }

  if (closeIdx === -1) { console.warn(`⚠️  No close for: ${id}`); continue; }

  // The line BEFORE closeIdx is the last field of the university object.
  // Add a comma to the previous last line if it doesn't already have one,
  // then insert our two new lines before closeIdx.
  const prevLine = lines[closeIdx - 1];
  if (!prevLine.trimEnd().endsWith(',')) {
    lines[closeIdx - 1] = prevLine.trimEnd() + ',';
  }

  lines.splice(closeIdx, 0,
    `    avgPackage: ${data.avgPackage},`,
    `    placementRate: ${data.placementRate}`
  );

  count++;
}

writeFileSync('src/data/universities.ts', lines.join('\n'), 'utf8');
console.log(`✅ Injected avgPackage+placementRate into ${count} universities.`);
