import * as fs from 'fs';
import * as path from 'path';
import { universities } from './data/universities';

const filePath = path.join(process.cwd(), 'src', 'data', 'universities.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const extractShortBranch = (name: string): string => {
  if (name.includes('Computer Science') || name.includes('CSE')) return 'CSE';
  if (name.includes('AI') || name.includes('Machine Learning') || name.includes('Data Science')) return 'AI/ML/DS';
  if (name.includes('Electronics') || name.includes('ECE')) return 'ECE';
  if (name.includes('Electrical') || name.includes('EEE')) return 'EEE';
  if (name.includes('Civil')) return 'Civil';
  if (name.includes('Mechanical') || name.includes('Mech')) return 'Mechanical';
  if (name.includes('Chemical')) return 'Chemical';
  if (name.includes('Information Technology') || name.includes('IT')) return 'IT';
  if (name.includes('MBA') || name.includes('Business')) return 'MBA';
  if (name.includes('MCA')) return 'MCA';
  if (name.includes('MBBS')) return 'MBBS';
  if (name.includes('Pharm')) return 'Pharmacy';
  if (name.includes('B.Sc')) return 'B.Sc';
  if (name.includes('B.A')) return 'B.A';
  return name.split(' ')[0];
};

universities.forEach(u => {
  const feesMap = {};
  
  u.programs.forEach(p => {
    const shortName = extractShortBranch(p.name);
    if (!feesMap[shortName]) {
      // Prioritize mgmtFees over fees
      const feeStr = p.mgmtFees || p.fees;
      if (feeStr) {
        const feeNum = parseInt(feeStr.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(feeNum) && feeNum > 0) {
          feesMap[shortName] = feeNum;
        }
      }
    }
  });

  if (Object.keys(feesMap).length > 0) {
    let feesStr = `    branchFees: {\n`;
    const entries = Object.entries(feesMap);
    entries.forEach(([key, val], index) => {
      feesStr += `      "${key}": ${val}${index < entries.length - 1 ? ',' : ''}\n`;
    });
    feesStr += `    },`;
    
    // Find existing branchFees for this college ID and replace it
    // We can search for the block `branchFees: { ... }` that comes after `id: "college-id"`
    const idRegex = new RegExp(`id:\\s*"${u.id}"[\\s\\S]*?branchFees:\\s*\\{[\\s\\S]*?\\},`);
    const match = content.match(idRegex);
    
    if (match) {
      // Find the branchFees substring within the match
      const branchFeesRegex = /branchFees:\s*\{[\s\S]*?\},/;
      const newMatch = match[0].replace(branchFeesRegex, feesStr);
      content = content.replace(match[0], newMatch);
    }
  }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated branchFees to use mgmtFees logic globally.');
