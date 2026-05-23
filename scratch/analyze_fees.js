import fs from 'fs';

// A simple script to read and analyze B.Tech fee distribution
try {
  const content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  // We will find all university blocks and extract their name, programs, branchFees
  // A quick way is to use a simplified parser by matching university blocks.
  // Let's do a simple regex search to split the file by university objects.
  const blocks = content.split(/\n\s*\/\/ ─+/);
  console.log(`Split into ${blocks.length} blocks.`);
  
  const parsedColleges = [];
  
  // Let's parse each block
  blocks.forEach((block, idx) => {
    const idMatch = block.match(/id:\s*"([^"]+)"/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    if (idMatch && nameMatch) {
      const id = idMatch[1];
      const name = nameMatch[1];
      
      // Parse programs
      const progMatches = [...block.matchAll(/\{\s*name:\s*"([^"]+)",\s*duration:\s*"([^"]+)",\s*fees:\s*"([^"]+)"(?:,\s*mgmtFees:\s*"([^"]+)")?/g)];
      const programs = progMatches.map(m => ({
        name: m[1],
        fees: m[3],
        mgmtFees: m[4] || null
      }));
      
      // Parse branchFees
      const branchFeesBlock = block.match(/branchFees:\s*\{([\s\S]*?)\}/);
      const branchFees = {};
      if (branchFeesBlock) {
        const entries = [...branchFeesBlock[1].matchAll(/"([^"]+)":\s*(\d+)/g)];
        entries.forEach(e => {
          branchFees[e[1]] = parseInt(e[2]);
        });
      }
      
      parsedColleges.push({ id, name, programs, branchFees });
    }
  });
  
  console.log(`Parsed ${parsedColleges.length} colleges.`);
  
  // Print a few colleges to see
  parsedColleges.slice(0, 10).forEach(c => {
    console.log(`\nCollege: ${c.name} (${c.id})`);
    console.log(`Programs B.Tech/Engineering:`);
    c.programs.forEach(p => {
      if (p.name.includes('B.Tech') || p.name.includes('B.E') || p.name.includes('Engineering') || p.name.includes('Computer Science')) {
        console.log(` - ${p.name}: Convener = ${p.fees}, Mgmt = ${p.mgmtFees}`);
      }
    });
    console.log(`BranchFees entries:`, c.branchFees);
  });
} catch (e) {
  console.error(e);
}
