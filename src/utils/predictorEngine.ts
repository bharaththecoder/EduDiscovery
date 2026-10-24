// src/utils/predictorEngine.ts
// Real-world AP EAPCET / ICET Admissions Predictor Engine
// Driven by authentic APHERMC & APSCHE statutory cutoffs, regional quotas & fee classifications

import { University, BranchCutoff, PlacementRecord } from '@/types';
import { getCategoryCutoff } from '@/services/collegeQueries';

export interface PredictionResult {
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  code?: string;
  city: string;
  region: 'AU' | 'SVU' | 'Statewide';
  branch: string;
  quota: 'Convener Quota (Cat-A)' | 'Management Quota (Cat-B)';
  quotaPercent: number; // e.g. 35 for Deemed, 70 for Affiliated, 100 for Govt
  chance: 'High' | 'Medium' | 'Low';
  chanceLabel: 'Safe' | 'Target' | 'Reach';
  color: string;
  closingCutoff: number;
  probabilityPercent: number;
  convenerFee: number;
  mgmtFee: number;
  naac: string;
  nirf: string;
  topRecruiter?: PlacementRecord;
  reason: string;
}

export interface PredictorFilters {
  exam: 'EAPCET' | 'ICET';
  rank: number;
  category: string; // OC, EWS, BC-A, BC-B, BC-C, BC-D, BC-E, SC, ST
  gender: string;   // Male / Female
  preferredBranch: string; // All, CSE, AI/ML/DS, IT, ECE, EEE, Mechanical, Civil
  candidateRegion?: 'AU' | 'SVU' | 'All'; // Local candidate area
  quotaPreference?: 'All' | 'Convener' | 'Management';
  round?: 'Round 1' | 'Round 2' | 'Round 3';
}

function normalizeBranchName(name: string): string {
  const n = name.toUpperCase().replace(/[^A-Z0-9/]/g, ' ').trim();
  if (n.includes('CSE') || n.includes('COMPUTER SCIENCE')) return 'CSE';
  if (n.includes('AI') || n.includes('ML') || n.includes('DATA SCIENCE') || n.includes('ARTIFICIAL')) return 'AI/ML/DS';
  if (n.includes('IT') || n.includes('INFORMATION')) return 'IT';
  if (n.includes('ECE') || n.includes('ELECTRONICS AND COMMUNICATION')) return 'ECE';
  if (n.includes('EEE') || n.includes('ELECTRICAL')) return 'EEE';
  if (n.includes('MECH') || n.includes('MECHANICAL')) return 'Mechanical';
  if (n.includes('CIVIL')) return 'Civil';
  return name;
}

export function predictAdmission(
  universities: University[],
  filters: PredictorFilters
): PredictionResult[] {
  const {
    exam,
    rank,
    category,
    gender,
    preferredBranch,
    candidateRegion = 'All',
    quotaPreference = 'All',
    round = 'Round 1'
  } = filters;

  if (!rank || rank <= 0 || !universities || universities.length === 0) {
    return [];
  }

  // Round multiplier: sliding rounds allow slightly higher ranks to get allotted
  const roundFactor = round === 'Round 3' ? 1.25 : (round === 'Round 2' ? 1.12 : 1.0);

  const results: PredictionResult[] = [];

  for (const uni of universities) {
    const isPvtUniv = (uni.category || '').includes('Deemed') || (uni.category || '').includes('Private');
    const isGovt = (uni.category || '').includes('Govt') || (uni.category || '').includes('State');
    const uniRegion = uni.region || (isPvtUniv ? 'Statewide' : 'AU');

    // 1. Regional Quota evaluation:
    // In AP, 85% seats are reserved for local candidates.
    // If student selects AU Region and college is SVU (or vice versa), candidate competes in 15% non-local unreserved pool.
    let regionMultiplier = 1.0;
    if (candidateRegion !== 'All' && uniRegion !== 'Statewide' && candidateRegion !== uniRegion) {
      // Non-local quota is more competitive
      regionMultiplier = 0.85;
    }

    const catAPct = uni.categoryAQuotaPercent || (isPvtUniv ? 35 : (isGovt ? 100 : 70));
    const catBPct = uni.categoryBQuotaPercent || (isPvtUniv ? 65 : (isGovt ? 0 : 30));
    const convenerFee = uni.convenerFee || uni.feeIntelligence?.convenerQuotaFee || (isGovt ? 35000 : 70000);
    const mgmtFee = uni.mgmtFee || uni.feeIntelligence?.mgmtQuotaFee || 0;
    const topRecruiter = (uni.topRecruiters && uni.topRecruiters[0]) || (uni.placements && uni.placements[0]);

    // 2. Iterate through cutoffs of the college
    const collegeCutoffs = uni.cutoffs || [];

    // Fallback if cutoffs array is empty: construct standard branch list
    const branchEntries: { branch: string; cutoffData?: BranchCutoff }[] = [];
    if (collegeCutoffs.length > 0) {
      collegeCutoffs.forEach(c => branchEntries.push({ branch: c.branch, cutoffData: c }));
    } else {
      const branches = uni.branches || Object.keys(uni.branchFees || {}) || ['CSE', 'ECE'];
      branches.forEach(b => branchEntries.push({ branch: b }));
    }

    for (const entry of branchEntries) {
      const branchKey = normalizeBranchName(entry.branch);

      // Filter by preferred branch
      if (preferredBranch && preferredBranch !== 'All') {
        const prefNorm = normalizeBranchName(preferredBranch);
        if (prefNorm !== branchKey && !entry.branch.toLowerCase().includes(preferredBranch.toLowerCase())) {
          continue;
        }
      }

      // Compute base closing rank for Category-A
      let baseCutoff = 35000;
      if (entry.cutoffData) {
        baseCutoff = getCategoryCutoff(entry.cutoffData, category, gender);
      } else {
        // Fallback calculation based on ranking
        const nirfNum = parseInt((uni.nirf || '150').replace(/[^0-9]/g, ''), 10) || 100;
        baseCutoff = Math.round((nirfNum * 350 + (entry.branch.includes('CSE') ? 3000 : 15000)) * roundFactor);
      }

      // Apply regional priority factor and round factor
      const effectiveCutoff = Math.round(baseCutoff * regionMultiplier * roundFactor);

      // ── Category-A Evaluation (Convenor Quota via EAPCET) ────
      if (quotaPreference === 'All' || quotaPreference === 'Convener') {
        let chance: 'High' | 'Medium' | 'Low' = 'Low';
        let chanceLabel: 'Safe' | 'Target' | 'Reach' = 'Reach';
        let color = '#EF4444';
        let prob = 15;
        let reason = '';

        if (rank <= effectiveCutoff * 0.88) {
          chance = 'High';
          chanceLabel = 'Safe';
          color = '#10B981';
          prob = Math.min(99, Math.round(88 + ((effectiveCutoff * 0.88 - rank) / effectiveCutoff) * 20));
          reason = `Comfortable admission: Your rank (${rank.toLocaleString()}) is safely within the closing rank (${effectiveCutoff.toLocaleString()}).`;
        } else if (rank <= effectiveCutoff * 1.10) {
          chance = 'Medium';
          chanceLabel = 'Target';
          color = '#F59E0B';
          const span = effectiveCutoff * 0.22;
          prob = Math.max(50, Math.round(78 - ((rank - effectiveCutoff * 0.88) / span) * 28));
          reason = `Competitive match: Very realistic chance during Round 1 or Round 2 sliding.`;
        } else if (rank <= effectiveCutoff * 1.35) {
          chance = 'Low';
          chanceLabel = 'Reach';
          color = '#8B5CF6'; // Purple for ambitious reach
          const span = effectiveCutoff * 0.25;
          prob = Math.max(20, Math.round(45 - ((rank - effectiveCutoff * 1.10) / span) * 25));
          reason = `Ambitious option: Possible in Round 3 sliding or mop-up counseling phase.`;
        }

        // Only include if chance is at least reach (< 1.35x cutoff)
        if (rank <= effectiveCutoff * 1.35) {
          results.push({
            collegeId: uni.id,
            collegeName: uni.name,
            collegeShortName: uni.shortName || uni.name,
            code: uni.code,
            city: uni.city,
            region: uniRegion,
            branch: entry.branch,
            quota: 'Convener Quota (Cat-A)',
            quotaPercent: catAPct,
            chance,
            chanceLabel,
            color,
            closingCutoff: effectiveCutoff,
            probabilityPercent: prob,
            convenerFee,
            mgmtFee,
            naac: uni.naac || 'B++',
            nirf: uni.nirf || '—',
            topRecruiter,
            reason
          });
        }
      }

      // ── Category-B Option (Management Quota) ────────────────
      // If student asked for management quota or if their rank is not eligible for Category-A in top colleges
      if ((quotaPreference === 'Management' || (quotaPreference === 'All' && rank > effectiveCutoff * 1.35)) && catBPct > 0 && mgmtFee > 0) {
        results.push({
          collegeId: uni.id,
          collegeName: uni.name,
          collegeShortName: uni.shortName || uni.name,
          code: uni.code,
          city: uni.city,
          region: uniRegion,
          branch: entry.branch,
          quota: 'Management Quota (Cat-B)',
          quotaPercent: catBPct,
          chance: 'High',
          chanceLabel: 'Safe',
          color: '#3B82F6', // Blue for Management Quota
          closingCutoff: 0, // Direct merit
          probabilityPercent: 92,
          convenerFee,
          mgmtFee,
          naac: uni.naac || 'B++',
          nirf: uni.nirf || '—',
          topRecruiter,
          reason: `Direct merit admission under Category-B (${catBPct}% quota). Regulated institutional fee.`
        });
      }
    }
  }

  // Sort by probability descending, then by college NIRF/NAAC selectivity
  return results.sort((a, b) => {
    // Put Category-A above Category-B unless user specifically selected Management
    if (a.quota !== b.quota) {
      return a.quota.includes('Cat-A') ? -1 : 1;
    }
    if (b.probabilityPercent !== a.probabilityPercent) {
      return b.probabilityPercent - a.probabilityPercent;
    }
    return a.closingCutoff - b.closingCutoff;
  });
}
