import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  // Parse university objects and print their tution fees
  const uniRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[\s\S]*?programs:\s*\[([\s\S]*?)\]/g;
  let match;
  const list = [];
  while ((match = uniRegex.exec(content)) !== null) {
    const id = match[1];
    const name = match[2];
    const progText = match[3];
    
    // Find B.Tech fees
    const feeMatch = progText.match(/fees:\s*"([^"]+)"(?:,\s*mgmtFees:\s*"([^"]+)")?/);
    const fees = feeMatch ? feeMatch[1] : 'N/A';
    const mgmtFees = feeMatch && feeMatch[2] ? feeMatch[2] : 'N/A';
    
    list.push({ id, name, fees, mgmtFees });
  }
  
  console.log(`Current fees in database:`);
  list.forEach((u, i) => {
    console.log(`${i+1}. [${u.id}] ${u.name} => Convener: ${u.fees}, Mgmt: ${u.mgmtFees}`);
  });
} catch (e) {
  console.error(e);
}
