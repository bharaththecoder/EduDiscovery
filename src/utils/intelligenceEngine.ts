// ============================================================
// EduDiscovery V3 — College Intelligence Engine
// Computes ROI, Value Score, and College Fit Score
// from existing university data fields.
// ============================================================

export interface IntelligenceScores {
  roiScore: number;        // 0–10: package-to-cost efficiency
  valueScore: number;      // 0–10: placement × package / cost
  roiLabel: string;        // e.g. "Excellent ROI"
  valueLabel: string;
}

export interface FitScore {
  probability: number;     // 0–100 estimated fit %
  label: 'Excellent' | 'Good' | 'Fair' | 'Reach';
  color: string;
  reasons: string[];
}

// ─── NAAC → placement rate lookup ────────────────────────────
const naacPlacementRate: Record<string, number> = {
  'A++': 92,
  'A+':  84,
  'A':   72,
  'B++': 60,
  'B+':  52,
  'B':   42,
};

// ─── Rank tier → EAPCET rank (approximate midpoint) ──────────
const rankTierValues: Record<string, number> = {
  'top 5,000 (high competitive)':          3000,
  'between 5,000 – 20,000':               12000,
  'between 20,000 – 60,000':              40000,
  '60,000+ (management / nri quota)':     80000,
};

// ─── Budget tier → max annual fee the user can afford ─────────
const budgetTierMaxFee: Record<string, number> = {
  'under ₹75k (very budget friendly)':    75000,
  '₹75k – ₹1.5l (budget)':              150000,
  '₹1.5l – ₹2.5l (mid range)':          250000,
  '₹2.5l – ₹4l (premium)':              400000,
  '₹4l+ (top tier / global)':           Infinity,
};

// ─── Helpers ──────────────────────────────────────────────────
function getMinFee(uni: any): number {
  if (uni.branchFees && Object.keys(uni.branchFees).length > 0) {
    return Math.min(...Object.values(uni.branchFees) as number[]);
  }
  // Parse from programs string as fallback
  const fees = (uni.programs || [])
    .map((p: any) => parseInt((p.fees || '').replace(/[^0-9]/g, '')) || 0)
    .filter((f: number) => f > 0);
  return fees.length > 0 ? Math.min(...fees) : 100000;
}

function getAvgPackage(uni: any): number {
  // Use explicitly set avgPackage field first
  if (uni.avgPackage && uni.avgPackage > 0) return uni.avgPackage;
  // Fallback: derive from NAAC grade (rough industry estimate in LPA × 100000)
  const naacPackage: Record<string, number> = {
    'A++': 1200000, // ₹12 LPA
    'A+':  900000,  // ₹9 LPA
    'A':   600000,  // ₹6 LPA
    'B++': 450000,  // ₹4.5 LPA
    'B+':  350000,  // ₹3.5 LPA
    'B':   280000,  // ₹2.8 LPA
  };
  return naacPackage[uni.naac || 'A'] ?? 500000;
}

function getPlacementRate(uni: any): number {
  if (uni.placementRate && uni.placementRate > 0) return uni.placementRate;
  return naacPlacementRate[uni.naac || 'A'] ?? 60;
}

// ─── ROI Score (0–10) ─────────────────────────────────────────
export function computeROI(uni: any): number {
  const minFee = getMinFee(uni);
  const totalCost = minFee * 4; // 4-year degree
  const avgPackage = getAvgPackage(uni);
  if (totalCost === 0) return 5;
  const roi = avgPackage / totalCost;
  // Normalize: ROI of 1.0 = score 5, >3.0 = score 10, <0.5 = score 1
  return Math.min(10, Math.max(1, Math.round(roi * 3.3)));
}

// ─── Value Score (0–10) ──────────────────────────────────────
export function computeValueScore(uni: any): number {
  const minFee = getMinFee(uni);
  if (minFee === 0) return 5;
  const avgPackage = getAvgPackage(uni);
  const placementRate = getPlacementRate(uni);
  const valueRatio = (placementRate / 100) * avgPackage / minFee;
  return Math.min(10, Math.max(1, Math.round(valueRatio * 2.5)));
}

// ─── ROI / Value Labels ───────────────────────────────────────
function scoreToLabel(score: number, type: 'roi' | 'value'): string {
  if (type === 'roi') {
    if (score >= 9) return 'Exceptional ROI';
    if (score >= 7) return 'Strong ROI';
    if (score >= 5) return 'Moderate ROI';
    return 'Low ROI';
  } else {
    if (score >= 9) return 'Outstanding Value';
    if (score >= 7) return 'Great Value';
    if (score >= 5) return 'Fair Value';
    return 'Below Average Value';
  }
}

// ─── Intelligence Scores (both combined) ─────────────────────
export function getIntelligenceScores(uni: any): IntelligenceScores {
  const roi = computeROI(uni);
  const value = computeValueScore(uni);
  return {
    roiScore: roi,
    valueScore: value,
    roiLabel: scoreToLabel(roi, 'roi'),
    valueLabel: scoreToLabel(value, 'value'),
  };
}

// ─── College Fit Score ────────────────────────────────────────
export function computeFitScore(
  uni: any,
  rankTier?: string,
  budgetTier?: string
): FitScore {
  const reasons: string[] = [];
  let probability = 50; // baseline

  // 1. NAAC grade bonus
  const naacBonus: Record<string, number> = {
    'A++': 12, 'A+': 10, 'A': 7, 'B++': 4, 'B+': 2, 'B': 0,
  };
  probability += naacBonus[uni.naac] ?? 0;
  if (uni.naac === 'A++' || uni.naac === 'A+') {
    reasons.push(`NAAC ${uni.naac} — top-tier institution`);
  }

  // 2. Rank tier vs institution selectivity
  if (rankTier) {
    const rankValue = rankTierValues[rankTier.toLowerCase()] ?? 40000;
    const nirf = uni.nirf || '';
    const hasTopNirf = nirf.includes('#') && parseInt(nirf.replace(/[^0-9]/g, '')) < 100;

    if (rankValue <= 5000 && hasTopNirf) {
      probability += 18;
      reasons.push('Your rank qualifies for top-NIRF institutions');
    } else if (rankValue <= 5000) {
      probability += 12;
      reasons.push('Competitive rank — strong admission chance');
    } else if (rankValue <= 20000) {
      probability += 8;
      if (!hasTopNirf) reasons.push('Good rank match for this institution tier');
    } else if (rankValue <= 60000) {
      probability += 3;
    } else {
      probability += 15; // management/NRI quota is more accessible
      reasons.push('Management quota option available');
    }
  }

  // 3. Budget vs fees
  if (budgetTier) {
    const maxAffordable = budgetTierMaxFee[budgetTier.toLowerCase()] ?? 250000;
    const minFee = getMinFee(uni);
    if (minFee <= maxAffordable * 0.8) {
      probability += 12;
      reasons.push(`Fees (₹${(minFee / 1000).toFixed(0)}K/yr) well within your budget`);
    } else if (minFee <= maxAffordable) {
      probability += 6;
      reasons.push(`Fees fit your budget range`);
    } else {
      probability -= 10;
      reasons.push('Fees exceed your stated budget');
    }
  }

  // 4. Placement quality bonus
  const placementRate = getPlacementRate(uni);
  if (placementRate >= 85) {
    probability += 6;
    reasons.push(`${placementRate}% placement rate — excellent outcomes`);
  }

  // Cap at 95
  probability = Math.min(95, Math.max(15, Math.round(probability)));

  let label: FitScore['label'] = 'Fair';
  let color = '#F59E0B';
  if (probability >= 80) { label = 'Excellent'; color = '#10B981'; }
  else if (probability >= 65) { label = 'Good'; color = '#3B82F6'; }
  else if (probability >= 45) { label = 'Fair'; color = '#F59E0B'; }
  else { label = 'Reach'; color = '#EF4444'; }

  if (reasons.length === 0) reasons.push('Based on your profile and quiz answers');

  return { probability, label, color, reasons };
}

// ─── Rank all colleges by intelligence ───────────────────────
export function rankByIntelligence(unis: any[]): any[] {
  return [...unis]
    .map(u => ({
      ...u,
      _roiScore: computeROI(u),
      _valueScore: computeValueScore(u),
      _intelligenceRank: computeROI(u) * 0.5 + computeValueScore(u) * 0.5,
    }))
    .sort((a, b) => b._intelligenceRank - a._intelligenceRank);
}
