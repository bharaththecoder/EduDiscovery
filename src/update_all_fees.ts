import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'universities.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const formatMoney = (num: number): string => {
  const str = num.toString();
  if (str.length <= 3) return '₹' + str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
};

// 1. Update all mgmtFees in the programs arrays.
// The regex finds a program object that has 'name', 'duration', and 'fees'.
// It replaces or adds mgmtFees to be 3x the 'fees'.
const programRegex = /(\{\s*name:\s*"[^"]+".*?fees:\s*"₹([\d,]+)")(?:,\s*mgmtFees:\s*"[^"]*")?(.*?\})/g;

content = content.replace(programRegex, (match, beforeFees, feesStr, afterFees) => {
  const feeNum = parseInt(feesStr.replace(/,/g, ''), 10);
  const mgmtNum = feeNum * 3;
  const mgmtStr = formatMoney(mgmtNum);
  return `${beforeFees}, mgmtFees: "${mgmtStr}"${afterFees}`;
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated mgmtFees in universities.ts');
