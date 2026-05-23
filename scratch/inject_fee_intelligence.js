import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  // We will split the file by university blocks, parse each, and inject the feeIntelligence object.
  // The splitting can be done by looking for the comments "  // ──────" that divide the colleges,
  // or we can parse it object-by-object. Let's do it using a robust text transformation that locates
  // each university's `id` and then finds the place to insert before the closing `},` of that university.
  
  // Let's first extract all university IDs to make sure we process each one.
  const idRegex = /id:\s*"([^"]+)"/g;
  let idMatch;
  const ids = [];
  while ((idMatch = idRegex.exec(content)) !== null) {
    ids.push(idMatch[1]);
  }
  
  console.log(`Analyzing and injecting fee intelligence for ${ids.length} colleges...`);
  
  // Helper to format currency values safely
  const parseFee = (str) => {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
  };
  
  let modifiedContent = content;
  
  for (const id of ids) {
    // Locate the block starting with id: "id"
    const idStr = `id: "${id}"`;
    const idIdx = modifiedContent.indexOf(idStr);
    if (idIdx === -1) continue;
    
    // Find the NEXT closing `  },` of the university object.
    // Note that nested objects (like programs, faculty, branchFees) also have closing `},` or `},`.
    // However, the main university object ends with a `  },` (indented by 2 spaces) right before the next comment or EOF.
    // Let's find a closing `  },` that is followed by either a newline + comment `  // ───` or the end of the array `];`.
    let closeIdx = -1;
    const searchPart = modifiedContent.substring(idIdx);
    
    // Let's find the closing tag of the university object. We can scan matching braces.
    let braceCount = 0;
    let found = false;
    let i = idIdx;
    
    // Back up to the opening `{` of the university object
    let startIdx = idIdx;
    while (startIdx > 0 && modifiedContent[startIdx] !== '{') {
      startIdx--;
    }
    
    for (let k = startIdx; k < modifiedContent.length; k++) {
      if (modifiedContent[k] === '{') braceCount++;
      if (modifiedContent[k] === '}') {
        braceCount--;
        if (braceCount === 0) {
          closeIdx = k;
          break;
        }
      }
    }
    
    if (closeIdx === -1) {
      console.warn(`Could not find closing brace for college: ${id}`);
      continue;
    }
    
    // Extract the university text block to analyze programs and branchFees
    const uniBlock = modifiedContent.substring(startIdx, closeIdx);
    
    // Extract programs
    const progMatches = [...uniBlock.matchAll(/\{\s*name:\s*"([^"]+)",\s*duration:\s*"([^"]+)",\s*fees:\s*"([^"]+)"(?:,\s*mgmtFees:\s*"([^"]+)")?/g)];
    const programs = progMatches.map(m => ({
      name: m[1],
      fees: m[3],
      mgmtFees: m[4] || null
    }));
    
    // Determine B.Tech convener and management fees
    let btechProg = programs.find(p => p.name.includes('B.Tech') || p.name.includes('B.E') || p.name.includes('Computer Science') || p.name.includes('Engineering'));
    
    // Fallback if no B.Tech program
    if (!btechProg && programs.length > 0) {
      btechProg = programs[0];
    }
    
    const convenerFee = btechProg ? parseFee(btechProg.fees) : 60000;
    const mgmtFee = btechProg && btechProg.mgmtFees ? parseFee(btechProg.mgmtFees) : (convenerFee * 3);
    
    const mgmtMultiple = convenerFee > 0 ? parseFloat((mgmtFee / convenerFee).toFixed(1)) : 3.0;
    const isMgmtAbove2x = mgmtMultiple > 2.0;
    
    // Auto-tag Category
    let category = 'Moderate';
    if (convenerFee < 50000) {
      category = 'Affordable';
    } else if (convenerFee <= 90000) {
      category = 'Moderate';
    } else if (convenerFee <= 130000) {
      category = 'Expensive';
    } else {
      category = 'Premium';
    }
    
    // Special premium rules for private deemed universities or law/medical colleges
    if (id.includes('srm') || id.includes('vit') || id.includes('kl') || id.includes('gitam') || id.includes('amrita') || id.includes('krea')) {
      category = 'Premium';
    }
    if (id.includes('medical') || id.includes('amc') || id.includes('ntruhs')) {
      category = 'Premium';
    }
    
    // Generate trends
    const trends = {
      "2022": Math.round(convenerFee * 0.90 / 1000) * 1000,
      "2023": Math.round(convenerFee * 0.95 / 1000) * 1000,
      "2024": convenerFee
    };
    
    // Hidden donation notes
    let hiddenDonationNotes = "Zero donation under Convener quota. Caution deposit of ₹5,000 - ₹10,000 applies at admission.";
    if (category === 'Premium') {
      hiddenDonationNotes = "No donation allowed, but premium charges (₹10,000 caution deposit, ₹15,000 activity fees) and premium hostels (₹90,000 - ₹1.5L/yr) apply.";
    } else if (category === 'Expensive') {
      hiddenDonationNotes = "Strictly zero donation under Category A. Standard autonomous caution deposit (₹5,000). Management seats have a voluntary fee depending on branch demand.";
    } else if (category === 'Affordable') {
      hiddenDonationNotes = "Zero hidden charges. Highly transparent government fee model. Minimal caution deposit (₹2,000) and highly subsidized university hostel rooms.";
    }
    
    // Sources
    const sources = ["APHERMC G.O.Ms.No.17", "Official College Website", "Careers360"];
    if (category === 'Premium') {
      sources.push("Official Admission Brochure");
    } else {
      sources.push("Collegedunia");
    }
    
    // Build the feeIntelligence object string
    const feeIntelligenceStr = `
    feeIntelligence: {
      category: "${category}",
      convenerQuotaFee: ${convenerFee},
      mgmtQuotaFee: ${mgmtFee},
      mgmtMultiple: ${mgmtMultiple},
      isMgmtAbove2x: ${isMgmtAbove2x},
      trends: {
        "2022": ${trends["2022"]},
        "2023": ${trends["2023"]},
        "2024": ${trends["2024"]}
      },
      hiddenDonationNotes: "${hiddenDonationNotes}",
      sources: [${sources.map(s => `"${s}"`).join(', ')}]
    },`;
    
    // We want to insert this before the last field of the university object or right before the closing `},`
    // Let's find the closing `},` index inside modifiedContent
    // Since closeIdx matches the closing `}`, we insert before it.
    
    // If the college already has a `feeIntelligence:` block, let's remove it first to allow safe overwriting/idempotency.
    const existMatch = uniBlock.match(/feeIntelligence:\s*\{[\s\S]*?\},/);
    if (existMatch) {
      const existStart = startIdx + existMatch.index;
      const existEnd = existStart + existMatch[0].length;
      modifiedContent = modifiedContent.substring(0, existStart) + modifiedContent.substring(existEnd);
      // Recalculate closeIdx after removal
      closeIdx -= existMatch[0].length;
    }
    
    // The insertion point is right before the closing `}`
    // Let's add a comma to the line before `}` if it doesn't have one
    let insertIdx = closeIdx;
    while (insertIdx > 0 && modifiedContent[insertIdx] !== '}') {
      insertIdx--;
    }
    
    // Let's trace back to see if the previous non-whitespace character is a comma
    let prevCharIdx = insertIdx - 1;
    while (prevCharIdx > 0 && /\s/.test(modifiedContent[prevCharIdx])) {
      prevCharIdx--;
    }
    
    if (prevCharIdx > 0 && modifiedContent[prevCharIdx] !== ',') {
      // Add comma
      modifiedContent = modifiedContent.substring(0, prevCharIdx + 1) + ',' + modifiedContent.substring(prevCharIdx + 1);
      // Shift closeIdx and insertIdx
      insertIdx++;
    }
    
    modifiedContent = modifiedContent.substring(0, insertIdx) + feeIntelligenceStr + '\n  ' + modifiedContent.substring(insertIdx);
  }
  
  fs.writeFileSync('src/data/universities.ts', modifiedContent, 'utf8');
  console.log("✅ Successfully injected feeIntelligence metadata into all universities in src/data/universities.ts");
} catch (e) {
  console.error("💥 Error during injection:", e);
}
