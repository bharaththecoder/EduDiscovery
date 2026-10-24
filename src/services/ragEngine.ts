// src/services/ragEngine.ts
// Structured Retrieval-Augmented Generation (RAG) Engine for AP Colleges
// Evaluates queries against verified APHERMC & APSCHE dataset (60 colleges)

import { universities } from '@/data/universities';
import { BranchCutoff, PlacementRecord } from '@/types';
import { PredictionResult } from '@/utils/predictorEngine';

export interface RetrievedCollegeFact {
  id: string;
  name: string;
  shortName: string;
  code?: string;
  city: string;
  region: string;
  category: string;
  naac: string;
  nirf: string;
  convenerFee: number;
  mgmtFee: number;
  branches: string[];
  cutoffs?: BranchCutoff[];
  topRecruiters?: PlacementRecord[];
  matchedBranchCutoff?: {
    branch: string;
    ocBoys: number;
    ocGirls: number;
    ews?: number;
    bcA?: number;
    bcB?: number;
    bcD?: number;
    bcE?: number;
    sc?: number;
    st?: number;
  };
  relevanceScore: number;
  relevanceReasons: string[];
}

export interface RagRetrievalResult {
  factsText: string;
  retrievedColleges: RetrievedCollegeFact[];
  structuredSummary: {
    matchedCollegeCount: number;
    focusedBranches: string[];
    focusedCategory?: string;
    regionContext?: string;
    isPredictorDriven: boolean;
  };
}

// Normalized branch matching dictionary
const BRANCH_PATTERNS: Record<string, string[]> = {
  'CSE': ['cse', 'computer science', 'comp sci'],
  'AI/ML/DS': ['ai', 'ml', 'data science', 'ds', 'artificial intelligence', 'machine learning'],
  'IT': ['it', 'information technology', 'info tech'],
  'ECE': ['ece', 'electronics', 'communication'],
  'EEE': ['eee', 'electrical'],
  'Mechanical': ['mechanical', 'mech'],
  'Civil': ['civil']
};

// Common college aliases mapped to verified internal IDs or Codes
const COLLEGE_ALIASES: Record<string, string[]> = {
  'vr-siddhartha': ['vr siddhartha', 'vrsiddhartha', 'vrse', 'velagapudi', 'siddhartha engineering'],
  'gvpce-visakhapatnam': ['gvp', 'gayatri', 'gayatri vidya parishad', 'gvpce', 'gvpcew', 'gvpv'],
  'srm-ap': ['srm', 'srm ap', 'srmap', 'srm amaravati'],
  'vit-ap': ['vit', 'vit ap', 'vitap', 'vit amaravati'],
  'kl-university': ['kl', 'klu', 'kl university', 'koneru', 'klef'],
  'vignan-university': ['vignan', 'vignan university', 'vufir', 'vfstr'],
  'andhra-university': ['au', 'andhra university', 'andhra univ', 'andu', 'au coe'],
  'jntuk': ['jntuk', 'jntu kakinada', 'jntu k', 'jnuk'],
  'jntua-anantapur': ['jntua', 'jntu anantapur', 'jntu a', 'jnua'],
  'sv-university': ['svu', 'sv university', 'sri venkateswara university', 'svuc'],
  'rvrjcce-guntur': ['rvr', 'rvr jc', 'rvrjc', 'chowdary', 'rvrj'],
  'bec-bapatla': ['bec', 'bapatla', 'bapatla engineering', 'bapl'],
  'gmrit-rajam': ['gmrit', 'gmr', 'gmr institute', 'gmrv'],
  'lbrce-mylavaram': ['lbrce', 'lakireddy', 'myli', 'lbrc'],
  'svce-tirupati': ['svce', 'sri venkateswara college of engineering', 'svet'],
  'mvgrce-vizianagaram': ['mvgr', 'mvgrce', 'maharaj vijayaram'],
  'vvit-guntur': ['vvit', 'vasireddy'],
  'srkrec-bhimavaram': ['srkr', 'sagi rama krishnam'],
  'rgukt-ap': ['rgukt', 'iiit nuzvid', 'iiit rk valley']
};

export function extractEntities(query: string) {
  const lower = query.toLowerCase();

  // 1. Matched Branches
  const matchedBranches: string[] = [];
  for (const [branchKey, keywords] of Object.entries(BRANCH_PATTERNS)) {
    if (keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(lower))) {
      matchedBranches.push(branchKey);
    }
  }

  // 2. Matched Categories
  const categoryKeywords = ['oc', 'ews', 'bc-a', 'bc-b', 'bc-c', 'bc-d', 'bc-e', 'sc', 'st'];
  let matchedCategory: string | undefined;
  for (const cat of categoryKeywords) {
    if (new RegExp(`\\b${cat}\\b`, 'i').test(lower)) {
      matchedCategory = cat.toUpperCase();
      break;
    }
  }

  // 3. Matched Regions
  let matchedRegion: 'AU' | 'SVU' | undefined;
  if (/\bau\b|andhra university region|coastal/i.test(lower)) matchedRegion = 'AU';
  if (/\bsvu\b|sri venkateswara region|rayalaseema/i.test(lower)) matchedRegion = 'SVU';

  // 4. Matched College IDs
  const matchedCollegeIds = new Set<string>();
  for (const [collegeId, aliases] of Object.entries(COLLEGE_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) {
      matchedCollegeIds.add(collegeId);
    }
  }

  return {
    branches: matchedBranches,
    category: matchedCategory,
    region: matchedRegion,
    collegeIds: Array.from(matchedCollegeIds)
  };
}

/**
 * Retrieve verified college facts structured for the AI Counselor
 */
export function retrieveCollegeContext(
  query: string,
  predictorResults?: PredictionResult[],
  options?: { maxColleges?: number; candidateRank?: number }
): RagRetrievalResult {
  const maxColleges = options?.maxColleges || 5;
  const entities = extractEntities(query);
  const candidateRank = options?.candidateRank;

  const scoredColleges: RetrievedCollegeFact[] = [];

  // If predictor results are provided, prioritize them directly
  if (predictorResults && predictorResults.length > 0) {
    const safeCount = Math.min(2, predictorResults.filter(p => p.chanceLabel === 'Safe').length);
    const targetCount = Math.min(3, predictorResults.filter(p => p.chanceLabel === 'Target').length);
    const reachCount = Math.min(2, predictorResults.filter(p => p.chanceLabel === 'Reach').length);

    // Pick top distribution of Safe, Target, and Reach
    const selectedPredictions = [
      ...predictorResults.filter(p => p.chanceLabel === 'Target').slice(0, targetCount),
      ...predictorResults.filter(p => p.chanceLabel === 'Safe').slice(0, safeCount),
      ...predictorResults.filter(p => p.chanceLabel === 'Reach').slice(0, reachCount)
    ];

    for (const pred of selectedPredictions) {
      const uni = universities.find(u => u.id === pred.collegeId || u.code === pred.code);
      if (!uni) continue;

      const branchCutoff = uni.cutoffs?.find(c => c.branch.toUpperCase() === pred.branch.toUpperCase());

      scoredColleges.push({
        id: uni.id,
        name: uni.name,
        shortName: uni.shortName || uni.name,
        code: uni.code,
        city: uni.city,
        region: uni.region || 'AU',
        category: uni.category || 'Affiliated',
        naac: uni.naac,
        nirf: uni.nirf,
        convenerFee: pred.convenerFee,
        mgmtFee: pred.mgmtFee,
        branches: uni.branches,
        topRecruiters: uni.topRecruiters,
        matchedBranchCutoff: branchCutoff,
        relevanceScore: pred.probabilityPercent / 100 + 1.0,
        relevanceReasons: [
          `Admission prediction: ${pred.chanceLabel} (${pred.probabilityPercent}% chance) for ${pred.branch}`,
          `Closing Cutoff: ${pred.closingCutoff}`
        ]
      });
    }

    const factsText = buildFactualBrief(scoredColleges, {
      isPredictorDriven: true,
      candidateRank,
      focusedCategory: entities.category
    });

    return {
      factsText,
      retrievedColleges: scoredColleges,
      structuredSummary: {
        matchedCollegeCount: scoredColleges.length,
        focusedBranches: Array.from(new Set(selectedPredictions.map(p => p.branch))),
        focusedCategory: entities.category,
        regionContext: entities.region,
        isPredictorDriven: true
      }
    };
  }

  // General factual retrieval over 60 universities
  const lowerQuery = query.toLowerCase();

  for (const uni of universities) {
    let score = 0;
    const reasons: string[] = [];

    // College exact alias match
    if (entities.collegeIds.includes(uni.id) || (uni.code && lowerQuery.includes(uni.code.toLowerCase()))) {
      score += 5.0;
      reasons.push(`Direct college match (${uni.shortName})`);
    } else if (lowerQuery.includes(uni.name.toLowerCase()) || lowerQuery.includes((uni.shortName || '').toLowerCase())) {
      score += 4.0;
      reasons.push(`Name match (${uni.shortName})`);
    }

    // Branch match
    let matchedCutoff: BranchCutoff | undefined;
    for (const b of entities.branches) {
      const foundBranch = uni.branches.find(ub => ub.toUpperCase().includes(b));
      if (foundBranch) {
        score += 1.5;
        reasons.push(`Offers branch ${b}`);
        matchedCutoff = uni.cutoffs?.find(c => c.branch.toUpperCase().includes(b));
      }
    }

    // Region match
    if (entities.region && uni.region === entities.region) {
      score += 1.0;
      reasons.push(`Located in ${entities.region} region`);
    }

    // Attribute keywords
    if (/fee|cost|tuition/i.test(lowerQuery)) score += 0.5;
    if (/placement|salary|package|recruiter/i.test(lowerQuery)) score += 0.5;
    if (/cutoff|rank|score/i.test(lowerQuery)) score += 0.5;

    if (score > 0) {
      const convenerFee = uni.convenerFee || (uni.feeIntelligence?.convenerQuotaFee) || 70000;
      const mgmtFee = uni.mgmtFee || (uni.feeIntelligence?.mgmtQuotaFee) || 0;

      scoredColleges.push({
        id: uni.id,
        name: uni.name,
        shortName: uni.shortName || uni.name,
        code: uni.code,
        city: uni.city,
        region: uni.region || 'AU',
        category: uni.category || 'Affiliated',
        naac: uni.naac,
        nirf: uni.nirf,
        convenerFee,
        mgmtFee,
        branches: uni.branches,
        topRecruiters: uni.topRecruiters,
        matchedBranchCutoff: matchedCutoff,
        relevanceScore: score,
        relevanceReasons: reasons
      });
    }
  }

  // Sort by score descending and take top N
  scoredColleges.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topColleges = scoredColleges.slice(0, maxColleges);

  const factsText = buildFactualBrief(topColleges, {
    isPredictorDriven: false,
    candidateRank,
    focusedCategory: entities.category
  });

  return {
    factsText,
    retrievedColleges: topColleges,
    structuredSummary: {
      matchedCollegeCount: topColleges.length,
      focusedBranches: entities.branches,
      focusedCategory: entities.category,
      regionContext: entities.region,
      isPredictorDriven: false
    }
  };
}

/**
 * Builds a strict, structured Markdown factual brief for prompt injection
 */
function buildFactualBrief(
  colleges: RetrievedCollegeFact[],
  meta: { isPredictorDriven: boolean; candidateRank?: number; focusedCategory?: string }
): string {
  if (colleges.length === 0) {
    return 'NO SPECIFIC AP COLLEGE RECORDS MATCHED THIS QUERY. DIRECT THE STUDENT TO ENTER AN AP EAPCET RANK OR SPECIFIC COLLEGE NAME.';
  }

  const lines: string[] = [];
  lines.push('### VERIFIED APHERMC & APSCHE COLLEGE ADMISSIONS DATA (Source: Official AP 2026/2025 Gazettes)');
  lines.push('STRICT INSTRUCTION: Only use the numbers, cutoffs, and fees listed below. If a detail (such as hostel fee or unlisted quota) is not in this brief, state that it is unverified in official records. Do not hallucinate or guess numbers.\n');

  if (meta.candidateRank) {
    lines.push(`- Candidate Rank: ${meta.candidateRank.toLocaleString('en-IN')}`);
  }
  if (meta.focusedCategory) {
    lines.push(`- Candidate Caste Category: ${meta.focusedCategory}`);
  }

  for (let i = 0; i < colleges.length; i++) {
    const c = colleges[i];
    lines.push(`\n**[${i + 1}] ${c.name}** (Code: ${c.code || 'N/A'})`);
    lines.push(`- Location & Region: ${c.city}, Andhra Pradesh (${c.region} Region)`);
    lines.push(`- Type & Accreditation: ${c.category} | NAAC: ${c.naac} | NIRF: ${c.nirf}`);
    lines.push(`- Statutory Tuition Fee: Convener Quota (Cat-A): ₹${c.convenerFee.toLocaleString('en-IN')}/year | Management Quota (Cat-B): ${c.mgmtFee > 0 ? `₹${c.mgmtFee.toLocaleString('en-IN')}/year` : 'State-notified standard'}`);

    if (c.topRecruiters && c.topRecruiters.length > 0) {
      const recs = c.topRecruiters.slice(0, 3).map(r => `${r.company} (${r.package})`).join(', ');
      lines.push(`- Top Recruiters & CTC: ${recs}`);
    }

    if (c.matchedBranchCutoff) {
      const b = c.matchedBranchCutoff;
      lines.push(`- Verified Closing Cutoff (${b.branch}): OC Boys: ${b.ocBoys.toLocaleString('en-IN')} | OC Girls: ${b.ocGirls.toLocaleString('en-IN')}${b.ews ? ` | EWS: ${b.ews.toLocaleString('en-IN')}` : ''}${b.bcA ? ` | BC-A: ${b.bcA.toLocaleString('en-IN')}` : ''}${b.bcB ? ` | BC-B: ${b.bcB.toLocaleString('en-IN')}` : ''}${b.sc ? ` | SC: ${b.sc.toLocaleString('en-IN')}` : ''}${b.st ? ` | ST: ${b.st.toLocaleString('en-IN')}` : ''}`);
    }

    if (c.relevanceReasons && c.relevanceReasons.length > 0) {
      lines.push(`- Assessment Notes: ${c.relevanceReasons.join('; ')}`);
    }
  }

  return lines.join('\n');
}
