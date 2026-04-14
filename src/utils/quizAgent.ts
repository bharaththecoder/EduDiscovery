// ============================================================
// EduDiscovery — Smart Quiz Decision Agent 
// Adaptive weights + Dream/Safe categorization + breakdowns
// ============================================================

export interface QuizAnswers {
  branch: string;
  budget: string;
  location: string;
  type: string;
  rank: string;
  priority?: string; // NEW: "What matters most to you?"
}

export interface ScoreBreakdown {
  branch: number;
  budget: number;
  location: number;
  type: number;
  rank: number;
  // Percentage out of each dimension's max
  branchPct: number;
  budgetPct: number;
  locationPct: number;
  typePct: number;
  rankPct: number;
}

export interface ScoredUniversity {
  id: string;
  score: number;
  matchPercent: number;
  reasons: string[];
  breakdown: ScoreBreakdown;
  category: 'dream' | 'match' | 'safe';
}

// ─── Base Weights (sum to 100) ────────────────────────────────
const BASE_WEIGHTS = {
  branch:   30,
  budget:   25,
  location: 20,
  type:     10,
  rank:     15,
};

// ─── Adaptive Weights by Priority ─────────────────────────────
const PRIORITY_WEIGHTS: Record<string, typeof BASE_WEIGHTS> = {
  'best placements & salary package': { branch: 25, budget: 15, location: 20, type: 20, rank: 20 },
  'affordable fees / low budget':     { branch: 25, budget: 40, location: 15, type: 10, rank: 10 },
  'top college ranking / naac grade': { branch: 25, budget: 10, location: 15, type: 20, rank: 30 },
  'my preferred city / location':     { branch: 25, budget: 15, location: 35, type: 10, rank: 15 },
  'course / branch specialization':   { branch: 45, budget: 20, location: 15, type: 10, rank: 10 },
  'research & higher studies':        { branch: 30, budget: 10, location: 15, type: 25, rank: 20 },
};

function getWeights(priority?: string) {
  if (!priority) return BASE_WEIGHTS;
  const key = priority.toLowerCase();
  return PRIORITY_WEIGHTS[key] || BASE_WEIGHTS;
}

// ─── Branch Scoring ──────────────────────────────────────────
export function scoreBranch(university: any, branch: string, maxW: number): { score: number; reason: string } {
  const tags = university.tags.map((t: string) => t.toLowerCase());
  const programs = university.programs.map((p: any) => p.name.toLowerCase());
  const branches = university.branches.map((br: string) => br.toLowerCase());

  const branchMap: Record<string, string[]> = {
    'cse / ai & data science':     ['cse', 'computer', 'ai', 'ml', 'data science', 'it', 'information technology'],
    'ece / vlsi / embedded':        ['ece', 'electronics', 'communication', 'vlsi', 'embedded'],
    'mechanical & robotics':        ['mechanical', 'robotics', 'automation', 'thermal'],
    'civil & architecture':         ['civil', 'architecture', 'b.arch'],
    'electrical & power systems':   ['eee', 'electrical', 'power'],
    'biotech / pharma / medical':   ['biotech', 'pharmacy', 'pharm', 'mbbs', 'medical', 'b.sc', 'nursing'],
    'business / management':        ['bba', 'mba', 'business', 'management', 'commerce', 'b.com'],
    'law & humanities':             ['law', 'll.b', 'ba', 'b.a', 'arts', 'history'],
  };

  const keywords = branchMap[branch.toLowerCase()] || [branch.toLowerCase()];

  const tagMatch  = keywords.some(k => tags.some((t: string) => t.includes(k)));
  const progMatch = keywords.some(k => programs.some((p: string) => p.includes(k)));
  const brMatch   = keywords.some(k => branches.some((br: string) => br.includes(k)));

  // Hard filter: if NO branch match at all → score 0 (strict exclusion)
  if (!tagMatch && !progMatch && !brMatch) return { score: 0, reason: '' };

  if (tagMatch && progMatch) return { score: maxW,                           reason: `Offers ${branch.split('/')[0].trim()} programs you prefer` };
  if (tagMatch || progMatch) return { score: Math.round(maxW * 0.72),        reason: `Has relevant ${branch.split('/')[0].trim()} courses` };
  return                             { score: Math.round(maxW * 0.40),        reason: `Partial match for your field of study` };
}

// ─── Budget Scoring ──────────────────────────────────────────
export function scoreBudget(university: any, budget: string, maxW: number): { score: number; reason: string } {
  const fees = university.programs
    .map((p: any) => parseInt(p.fees.replace(/[^0-9]/g, '')) || 0)
    .filter((f: number) => f > 0);

  if (fees.length === 0) return { score: Math.round(maxW * 0.5), reason: 'Fee info not available' };

  const minFee = Math.min(...fees);

  const budgetRanges: Record<string, { min: number; max: number; label: string }> = {
    'under ₹75k (very budget friendly)': { min: 0,      max: 75000,  label: 'Under ₹75K' },
    '₹75k – ₹1.5l (budget)':            { min: 75000,  max: 150000, label: '₹75K – ₹1.5L' },
    '₹1.5l – ₹2.5l (mid range)':        { min: 150000, max: 250000, label: '₹1.5L – ₹2.5L' },
    '₹2.5l – ₹4l (premium)':            { min: 250000, max: 400000, label: '₹2.5L – ₹4L' },
    '₹4l+ (top tier / global)':          { min: 400000, max: Infinity, label: '₹4L+' },
  };

  const range = budgetRanges[budget.toLowerCase()];
  if (!range) return { score: Math.round(maxW * 0.5), reason: 'Budget not matched' };

  // Perfect — min fee within range
  if (minFee >= range.min && minFee <= range.max)
    return { score: maxW, reason: `Fees start at ₹${(minFee / 1000).toFixed(0)}K — fits your ${range.label} budget` };
  // Just below budget (great value)
  if (minFee < range.min && minFee >= range.min * 0.7)
    return { score: Math.round(maxW * 0.85), reason: `Great value at ₹${(minFee / 1000).toFixed(0)}K — below your budget` };
  // Slightly over budget (≤30% over)
  if (minFee > range.max && minFee <= range.max * 1.3)
    return { score: Math.round(maxW * 0.40), reason: `Slightly above your ${range.label} budget` };
  // Way over budget → strict penalty (excluded if branch also fails)
  if (minFee > range.max * 1.3)
    return { score: Math.round(maxW * 0.05), reason: '' };
  // Well below budget
  return { score: Math.round(maxW * 0.75), reason: `Well within your ${range.label} budget at ₹${(minFee / 1000).toFixed(0)}K` };
}

// ─── Location Scoring (distance-aware tiers) ──────────────────
export function scoreLocation(university: any, location: string, maxW: number): { score: number; reason: string } {
  // Group universities into geographic zones
  const zones: Record<string, string[]> = {
    north:   ['Visakhapatnam', 'Rajam', 'Rajamahendravaram'],
    godavari:['Kakinada', 'Surampalem'],
    central: ['Amaravati', 'Vijayawada', 'Guntur', 'Mylavaram', 'Bapatla'],
    south:   ['Tirupati', 'Chittoor'],
    west:    ['Anantapur', 'Kurnool'],
  };

  function getZone(city: string) {
    for (const [zone, cities] of Object.entries(zones)) {
      if (cities.includes(city)) return zone;
    }
    return 'other';
  }

  const locationCityMap: Record<string, { preferred: string[]; nearbyZones: string[] }> = {
    'visakhapatnam / vizag (north coastal)': {
      preferred: ['Visakhapatnam', 'Rajam', 'Rajamahendravaram'],
      nearbyZones: ['north', 'godavari'],
    },
    'amaravati / vijayawada (capital region)': {
      preferred: ['Amaravati', 'Vijayawada', 'Guntur', 'Mylavaram', 'Bapatla'],
      nearbyZones: ['central', 'godavari'],
    },
    'tirupati / chittoor (temple city)': {
      preferred: ['Tirupati', 'Chittoor'],
      nearbyZones: ['south', 'west'],
    },
    'anantapur / kurnool (rayalaseema)': {
      preferred: ['Anantapur', 'Kurnool'],
      nearbyZones: ['west', 'south'],
    },
    'kakinada / rajahmundry (godavari)': {
      preferred: ['Kakinada', 'Rajamahendravaram', 'Surampalem'],
      nearbyZones: ['godavari', 'north'],
    },
    'anywhere in andhra pradesh (no preference)': {
      preferred: [],
      nearbyZones: ['north', 'godavari', 'central', 'south', 'west', 'other'],
    },
  };

  const pref = locationCityMap[location.toLowerCase()];
  if (!pref) return { score: Math.round(maxW * 0.5), reason: '' };

  // No preference = full score
  if (pref.preferred.length === 0) return { score: maxW, reason: 'Flexible location — all campuses match' };

  const uniCity = university.city;
  const uniZone = getZone(uniCity);

  // Exact city match → 100%
  if (pref.preferred.includes(uniCity))
    return { score: maxW, reason: `Located in ${uniCity} — your preferred region` };

  // Same zone nearby → 80%
  if (pref.nearbyZones.includes(uniZone))
    return { score: Math.round(maxW * 0.80), reason: `In a nearby region (${uniCity})` };

  // Different zone in same state → 50%
  if (getZone(uniCity) !== 'other')
    return { score: Math.round(maxW * 0.50), reason: `Different region from preference, but still within AP` };

  return { score: Math.round(maxW * 0.20), reason: '' };
}

// ─── College Type Scoring ─────────────────────────────────────
export function scoreType(university: any, type: string, maxW: number): { score: number; reason: string } {
  const gov    = ['andhra-university', 'jntuk', 'acharya-nagarjuna-university', 'sv-university', 'aknu-rajamahendravaram', 'sku-anantapur'];
  const pvt    = ['srm-ap', 'vit-ap', 'kl-university', 'vignan-university', 'amrita-ap', 'gitam'];
  const auto   = ['vr-siddhartha', 'gmrit-rajam', 'lbrce-mylavaram', 'bec-bapatla', 'gvpce-visakhapatnam', 'aec-surampalem', 'nri-institute'];

  const tid = university.id;
  const t = type.toLowerCase();

  if (t.includes('private')) {
    if (pvt.includes(tid)) return { score: maxW,                    reason: 'Private university with strong placement record' };
    if (auto.includes(tid)) return { score: Math.round(maxW * 0.5), reason: '' };
    return { score: Math.round(maxW * 0.2), reason: '' };
  }
  if (t.includes('government')) {
    if (gov.includes(tid))  return { score: maxW,                    reason: 'Government/state university with affordable fees' };
    return { score: Math.round(maxW * 0.2), reason: '' };
  }
  if (t.includes('autonomous')) {
    if (auto.includes(tid)) return { score: maxW,                    reason: 'Autonomous college — specialized engineering focus' };
    if (pvt.includes(tid))  return { score: Math.round(maxW * 0.5), reason: '' };
    return { score: Math.round(maxW * 0.3), reason: '' };
  }
  if (t.includes('deemed')) {
    if (pvt.includes(tid))  return { score: maxW,                    reason: 'Deemed university with strong research culture' };
    return { score: Math.round(maxW * 0.3), reason: '' };
  }
  return { score: Math.round(maxW * 0.5), reason: '' };
}

// ─── Rank Scoring ─────────────────────────────────────────────
export function scoreRank(university: any, rank: string, maxW: number): { score: number; reason: string } {
  const naac    = university.naac;
  const hasNirf = university.nirf !== '—' && university.nirf !== '';

  const r = rank.toLowerCase();

  if (r.includes('top 5,000')) {
    if (naac === 'A++' && hasNirf) return { score: maxW,                    reason: `NAAC ${naac} + NIRF ranked — ideal for top rankers` };
    if (['A++', 'A+'].includes(naac)) return { score: Math.round(maxW * 0.82), reason: `NAAC ${naac} — competitive institution` };
    return { score: Math.round(maxW * 0.25), reason: '' };
  }
  if (r.includes('5,000')) {
    if (['A++', 'A+', 'A'].includes(naac)) return { score: maxW,                    reason: `NAAC ${naac} — great fit for your rank` };
    return { score: Math.round(maxW * 0.55), reason: '' };
  }
  if (r.includes('20,000')) {
    if (['A', 'A+', 'B+'].includes(naac)) return { score: maxW,                    reason: `NAAC ${naac} — accessible at your rank` };
    return { score: Math.round(maxW * 0.60), reason: '' };
  }
  // 60k+
  return { score: maxW, reason: `Accessible via management/NRI quota` };
}

// ─── Main Scoring Engine ──────────────────────────────────────
export function scoreUniversity(university: any, answers: QuizAnswers): ScoredUniversity {
  const W = getWeights(answers.priority);

  const branchResult   = scoreBranch(university, answers.branch, W.branch);
  const budgetResult   = scoreBudget(university, answers.budget, W.budget);
  const locationResult = scoreLocation(university, answers.location, W.location);
  const typeResult     = scoreType(university, answers.type, W.type);
  const rankResult     = scoreRank(university, answers.rank, W.rank);

  const totalScore = branchResult.score + budgetResult.score + locationResult.score + typeResult.score + rankResult.score;
  const maxScore   = W.branch + W.budget + W.location + W.type + W.rank;
  const matchPercent = Math.min(Math.round((totalScore / maxScore) * 100), 99);

  // Strict: if branch is a total mismatch AND budget is way over, exclude
  const branchFail  = branchResult.score === 0;
  const budgetFail  = budgetResult.score <= Math.round(W.budget * 0.05);
  if (branchFail && budgetFail) {
    return {
      id: university.id, score: 0, matchPercent: 0,
      reasons: [],
      category: 'safe',
      breakdown: { branch: 0, budget: 0, location: 0, type: 0, rank: 0, branchPct: 0, budgetPct: 0, locationPct: 0, typePct: 0, rankPct: 0 },
    };
  }

  const reasons = [branchResult.reason, budgetResult.reason, locationResult.reason, typeResult.reason, rankResult.reason].filter(Boolean);

  // Category: dream (≥80%), match (60–79%), safe (40–59%)
  const category: 'dream' | 'match' | 'safe' =
    matchPercent >= 78 ? 'dream' :
    matchPercent >= 55 ? 'match' : 'safe';

  return {
    id: university.id,
    score: totalScore,
    matchPercent,
    reasons,
    category,
    breakdown: {
      branch:   branchResult.score,
      budget:   budgetResult.score,
      location: locationResult.score,
      type:     typeResult.score,
      rank:     rankResult.score,
      branchPct:   Math.round((branchResult.score   / W.branch)   * 100),
      budgetPct:   Math.round((budgetResult.score   / W.budget)   * 100),
      locationPct: Math.round((locationResult.score / W.location) * 100),
      typePct:     Math.round((typeResult.score     / W.type)     * 100),
      rankPct:     Math.round((rankResult.score     / W.rank)     * 100),
    },
  };
}

// ─── Categorized Recommendations ─────────────────────────────
export function getRecommendations(universities: any[], answers: QuizAnswers, count = 10) {
  const scored = universities
    .map(uni => {
      const s = scoreUniversity(uni, answers);
      return { ...uni, ...s, match: s.matchPercent };
    })
    .filter(u => u.matchPercent >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  const dream = scored.filter(u => u.category === 'dream');
  const match = scored.filter(u => u.category === 'match');
  const safe  = scored.filter(u => u.category === 'safe');

  return { all: scored, dream, match, safe };
}
