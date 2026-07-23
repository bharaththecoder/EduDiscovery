export interface PredictionResult {
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  city: string;
  branch: string;
  quota: 'Convener Quota' | 'Management Quota';
  chance: 'High' | 'Medium' | 'Low';
  color: string;
  estimatedCutoff: number;
}

function isEligibleEAPCET(branchName: string): boolean {
  const b = branchName.toLowerCase();
  
  // Exclude PG / general degrees / management degrees
  if (b.includes('mba') || b.includes('mca') || b.includes('m.tech') || b.includes('mtech')) return false;
  if (b === 'b.sc' || b === 'bsc' || b === 'b.a' || b === 'ba' || b === 'b.com' || b === 'bcom' || b === 'bba' || b === 'bca' || b === 'l.l.b' || b === 'llb' || b === 'l.l.m' || b === 'llm') return false;
  
  // Include standard EAPCET courses
  const eapcetKeywords = [
    'cse', 'computer science', 'information technology', 'it', 'ece', 'electronics', 'eee', 'electrical',
    'mechanical', 'civil', 'biotech', 'biotechnology', 'chemical', 'agriculture', 'agricultural', 'pharmacy',
    'pharm.d', 'food tech', 'metallurgy', 'mining', 'aeronautical', 'automobile', 'instrumentation',
    'ai', 'ml', 'data science', 'cybersecurity', 'iot'
  ];
  
  return eapcetKeywords.some(keyword => b.includes(keyword));
}

function isEligibleICET(branchName: string): boolean {
  const b = branchName.toLowerCase();
  return b.includes('mba') || b.includes('mca');
}

export function predictAdmission(
  universities: any[],
  exam: 'EAPCET' | 'ICET',
  rank: number,
  category: string,
  gender: string,
  preferredBranch: string,
  round: 'Round 1' | 'Round 2' | 'Round 3' = 'Round 1'
): PredictionResult[] {
  const predictions: PredictionResult[] = [];

  universities.forEach(uni => {
    // 1. Determine base college tier selectivity (1 to 10 scale, 10 being most selective)
    let selectivity = 3; // default
    const naac = uni.naac || 'B';
    const nirf = uni.nirf || '';
    const hasTopNirf = String(nirf).includes('#') && parseInt(String(nirf).replace(/[^0-9]/g, '')) < 150;

    if (naac === 'A++' && hasTopNirf) selectivity = 9;
    else if (naac === 'A++' || hasTopNirf) selectivity = 8;
    else if (naac === 'A+') selectivity = 7;
    else if (naac === 'A') selectivity = 6;
    else if (naac === 'B++') selectivity = 5;
    else if (naac === 'B+') selectivity = 4;

    // Adjust selectivity based on city (major hubs are more competitive)
    const city = (uni.city || '').toLowerCase();
    if (city === 'visakhapatnam' || city === 'amaravati' || city === 'vijayawada') {
      selectivity += 1;
    }

    // 2. Identify eligible branches/programs
    const collegeBranches = uni.branchFees ? Object.keys(uni.branchFees) : (uni.tags || []);
    
    collegeBranches.forEach((branch: string) => {
      // Filter out non-matching branches if preferred branch is specified
      if (preferredBranch && preferredBranch !== 'All' && !branch.toLowerCase().includes(preferredBranch.toLowerCase()) && !preferredBranch.toLowerCase().includes(branch.toLowerCase())) {
        return;
      }

      // Check exam eligibility
      if (exam === 'EAPCET' && !isEligibleEAPCET(branch)) return;
      if (exam === 'ICET' && !isEligibleICET(branch)) return;

      // 3. Compute base cutoff rank for OC General Male
      // Selective branches like CSE/AI-ML have lower cutoff ranks (harder to get)
      let branchDifficulty = 1.0;
      const bLower = branch.toLowerCase();
      if (bLower.includes('cse') || bLower.includes('ai') || bLower.includes('ds') || bLower.includes('ml')) {
        branchDifficulty = 0.5; // CSE cutoffs are half the rank (e.g. 5000 instead of 10000)
      } else if (bLower.includes('ece') || bLower.includes('it')) {
        branchDifficulty = 0.8;
      } else if (bLower.includes('eee') || bLower.includes('mechanical') || bLower.includes('civil')) {
        branchDifficulty = 1.5; // wider cutoff
      }

      // base rank cutoff calculation
      // Tier 9: CSE ~2k rank, ECE ~3.2k, EEE ~6k
      // Tier 6: CSE ~15k rank, ECE ~24k, EEE ~45k
      // Tier 3: CSE ~50k rank, ECE ~80k, EEE ~120k
      let baseCutoff = Math.round(500000 / Math.pow(selectivity, 2.5) * branchDifficulty);
      if (baseCutoff < 500) baseCutoff = 500;

      // 4. Adjust base cutoff for reservation Category & Gender
      let categoryMultiplier = 1.0;
      switch (category) {
        case 'BC-A': categoryMultiplier = 1.3; break;
        case 'BC-B': categoryMultiplier = 1.25; break;
        case 'BC-C': categoryMultiplier = 1.4; break;
        case 'BC-D': categoryMultiplier = 1.2; break;
        case 'BC-E': categoryMultiplier = 1.5; break;
        case 'SC': categoryMultiplier = 2.2; break;
        case 'ST': categoryMultiplier = 2.8; break;
        default: categoryMultiplier = 1.0; // OC
      }

      const genderMultiplier = gender === 'Female' ? 1.15 : 1.0;
      let roundMultiplier = 1.0;
      if (round === 'Round 2') roundMultiplier = 1.15;
      else if (round === 'Round 3') roundMultiplier = 1.25;

      const finalEstimatedCutoff = Math.round(baseCutoff * categoryMultiplier * genderMultiplier * roundMultiplier);

      // 5. Predict Chance
      let chance: 'High' | 'Medium' | 'Low' = 'Low';
      let quota: 'Convener Quota' | 'Management Quota' = 'Convener Quota';
      let color = '#EF4444';

      if (rank <= finalEstimatedCutoff * 0.85) {
        chance = 'High';
        color = '#10B981';
      } else if (rank <= finalEstimatedCutoff * 1.15) {
        chance = 'Medium';
        color = '#F59E0B';
      } else {
        // If rank is too high, check if management quota is possible
        const minFee = uni.branchFees?.[branch] || 150000;
        if (minFee > 0) {
          quota = 'Management Quota';
          chance = 'High'; // Management quota seats are usually guaranteed if fees can be paid
          color = '#3B82F6';
        } else {
          chance = 'Low';
          color = '#EF4444';
        }
      }

      predictions.push({
        collegeId: uni.id,
        collegeName: uni.name,
        collegeShortName: uni.shortName || uni.name,
        city: uni.city,
        branch,
        quota,
        chance,
        color,
        estimatedCutoff: finalEstimatedCutoff
      });
    });
  });

  // Sort by chance (High -> Medium -> Low), then estimated cutoff
  return predictions.sort((a, b) => {
    const chanceScore = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const aScore = chanceScore[a.chance] + (a.quota === 'Convener Quota' ? 0.5 : 0);
    const bScore = chanceScore[b.chance] + (b.quota === 'Convener Quota' ? 0.5 : 0);
    if (bScore !== aScore) return bScore - aScore;
    return a.estimatedCutoff - b.estimatedCutoff;
  });
}
