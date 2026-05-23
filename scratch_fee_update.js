const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'universities.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const formatMoney = (num) => {
  const str = num.toString();
  // Format as Indian Rupee (e.g. 210000 -> 2,10,000)
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers != '') {
    return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
  } else {
    return '₹' + lastThree;
  }
};

const regex = /\{([^}]*)name:\s*"([^"]+)"([^}]*)fees:\s*"₹([\d,]+)"([^}]*)(?:mgmtFees:\s*"[^"]*")?([^}]*)\}/g;

let updatedContent = content.replace(regex, (match, beforeName, name, beforeFees, feesStr, afterFees, afterMgmt) => {
  // feesStr is like "70,000"
  const feeNum = parseInt(feesStr.replace(/,/g, ''), 10);
  const mgmtNum = feeNum * 3;
  const mgmtStr = formatMoney(mgmtNum);
  
  // Reconstruct the object
  // It might already have mgmtFees, but we'll remove it from the match and append it properly
  // Since the regex handles optional mgmtFees, we just append it
  
  // Wait, regex might match things improperly if we are not careful.
  return `{${beforeName}name: "${name}"${beforeFees}fees: "₹${feesStr}", mgmtFees: "${mgmtStr}"${afterFees}${afterMgmt}}`;
});

fs.writeFileSync('src/data/universities_temp.ts', updatedContent, 'utf-8');
console.log('Done');
