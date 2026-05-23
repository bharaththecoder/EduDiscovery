import fs from 'fs';

try {
  let content = fs.readFileSync('src/data/universities.ts', 'utf8');
  
  const id = "nri-institute";
  const startIdx = content.indexOf(`id: "${id}"`);
  console.log("startIdx:", startIdx);
  
  let braceCount = 0;
  let closeIdx = -1;
  // We should start counting braces from the `{` of the university object.
  // Let's find the `{` that comes before `id: "nri-institute"`.
  let objStart = startIdx;
  while (objStart > 0 && content[objStart] !== '{') {
    objStart--;
  }
  console.log("objStart:", objStart);
  
  for (let k = objStart; k < content.length; k++) {
    if (content[k] === '{') braceCount++;
    if (content[k] === '}') {
      braceCount--;
      if (braceCount === 0) {
        closeIdx = k;
        break;
      }
    }
  }
  console.log("closeIdx:", closeIdx);
  
  let uniBlock = content.substring(objStart, closeIdx);
  console.log("uniBlock length:", uniBlock.length);
  
  const programsBlockMatch = uniBlock.match(/programs:\s*\[([\s\S]*?)\]/);
  console.log("programsBlockMatch exists:", !!programsBlockMatch);
  if (programsBlockMatch) {
    let progsText = programsBlockMatch[1];
    console.log("progsText:\n", progsText);
    
    const progItems = progsText.split(/\s*\}\s*,\s*\{\s*/);
    console.log("progItems count:", progItems.length);
    
    const formatMoney = (num) => {
      if (num === 0) return 'Free';
      const str = num.toString();
      if (str.length <= 3) return '₹' + str;
      const lastThree = str.substring(str.length - 3);
      const otherNumbers = str.substring(0, str.length - 3);
      return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
    };
    
    const fees = { convener: 60000, mgmt: 180000 };
    
    const updatedProgItems = progItems.map((item, idx) => {
      const isBTech = item.includes('B.Tech') || item.includes('B.E') || item.includes('Computer Science') || item.includes('Engineering');
      console.log(`Item ${idx} (isBTech=${isBTech}):`, item.trim());
      if (isBTech) {
        let itemUpdated = item;
        itemUpdated = itemUpdated.replace(/fees:\s*"[^"]+"/, `fees: "${formatMoney(fees.convener)}"`);
        itemUpdated = itemUpdated.replace(/mgmtFees:\s*"[^"]+"/, `mgmtFees: "${formatMoney(fees.mgmt)}"`);
        return itemUpdated;
      }
      return item;
    });
    
    const newProgsText = updatedProgItems.join(' },\n      { ');
    console.log("newProgsText:\n", newProgsText);
    
    // Replace progs in uniBlock
    uniBlock = uniBlock.replace(programsBlockMatch[1], newProgsText);
    console.log("uniBlock updated progs length:", uniBlock.length);
  }
} catch (e) {
  console.error(e);
}
