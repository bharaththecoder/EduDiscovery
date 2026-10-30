// src/services/officialCutoffService.ts
// =============================================================================
// EduDiscovery Official APSCHE Cutoff Service (Phase 2.1: Robust Historical Querying)
//
// Provides typed querying of verified official APSCHE closing rank records.
//
// Key Features:
// - Zero bundle bloat: Lazy-loads year datasets on-demand via fetch('/data/official-cutoffs/{year}.json')
// - In-memory caching: Caches parsed year files so network requests happen at most once per session
// - Strict dimensional fidelity: College, Branch, Year, Reservation Category, Gender, Quota Region
// - Explicit status preservation: 'published', 'blank_in_source', 'unallotted_explicit'
// - Never converts blank/unallotted into 0 or numerical ranks
// - Complete provenance returned alongside every cutoff (source URL, document SHA-256, sheet cell or page)
// - Preserves historical source college code and historical name per cutoff record
// - Supports available region introspection per college so UI never gets stuck on an invalid default
// - Multi-year side-by-side comparison for trend discovery
// =============================================================================

export type OfficialCycleYear = '2024' | '2023' | '2022';

export type RankAvailabilityStatus =
  | 'published'
  | 'blank_in_source'
  | 'unallotted_explicit'
  | 'pending_semantic_verification'
  | 'not_published'
  | 'not_applicable'
  | 'parse_error';

export type ReservationCategory =
  | 'OC'
  | 'SC'
  | 'ST'
  | 'BCA'
  | 'BCB'
  | 'BCC'
  | 'BCD'
  | 'BCE'
  | 'OC_EWS';

export type GenderPool = 'Boys' | 'Girls';

export type QuotaRegion = 'AU' | 'SVU' | 'SW' | 'STATEWIDE';

export interface OfficialCutoffRecord {
  admissionCycle: OfficialCycleYear;
  academicYear: string;
  collegeId: string;
  collegeCode: string;
  collegeName: string;
  sourceCollegeCode: string;
  sourceCollegeName: string;
  branchCode: string;
  quotaRegion: QuotaRegion | string;
  category: ReservationCategory | string;
  genderPool: GenderPool;
  closingRank: number | null;
  rankStatus: RankAvailabilityStatus;
  rawSourceValue: string | null;
  sourceLocation: string | null;
  tuitionFee: number | null;
  provenance: {
    authority: string;
    documentTitle: string;
    documentUrl: string;
    sha256: string;
    format: string;
  };
}

export interface CutoffQueryFilter {
  collegeId: string;
  admissionCycle?: OfficialCycleYear;
  branchCode?: string;
  category?: ReservationCategory | string;
  genderPool?: GenderPool;
  quotaRegion?: QuotaRegion | string;
}

export interface HistoricalYearComparison {
  branchCode: string;
  quotaRegion: string;
  category: string;
  genderPool: GenderPool;
  sourceCollegeCode?: string;
  sourceCollegeName?: string;
  years: {
    [key in OfficialCycleYear]?: {
      academicYear: string;
      closingRank: number | null;
      rankStatus: RankAvailabilityStatus;
      rawSourceValue: string | null;
      sourceLocation: string | null;
      sourceCollegeCode: string;
      sourceCollegeName: string;
      documentUrl: string;
    };
  };
  trendNote?: string;
}

export interface CollegeCutoffAvailability {
  collegeId: string;
  hasRecords: boolean;
  availableCycles: OfficialCycleYear[];
  availableRegions: string[];
  availableBranches: string[];
  historicalCodes: string[];
  canonicalName: string;
}

interface RawYearPayload {
  academicYear: string;
  admissionCycle: OfficialCycleYear;
  sourceDocumentUrl: string;
  sourceSha256: string;
  sourceFormat: string;
  schema: string[];
  totalRecords: number;
  distinctColleges: number;
  distinctOfficialCodes: number;
  distinctBranches: number;
  colleges: {
    [collegeId: string]: {
      code: string;
      name: string;
      historicalCodes?: string[];
      cutoffs: Array<[
        string, // 0: branchCode
        string, // 1: quotaRegion
        string, // 2: category
        GenderPool, // 3: genderPool
        number | null, // 4: closingRank
        RankAvailabilityStatus, // 5: rankStatus
        string | null, // 6: rawSourceValue
        string | null, // 7: sourceLocation
        number | null, // 8: tuitionFee
        string?, // 9: sourceCollegeCode
        string? // 10: sourceCollegeName
      ]>;
    };
  };
}

// In-memory query cache for loaded years
const yearDataCache: Map<OfficialCycleYear, RawYearPayload> = new Map();
const pendingLoads: Map<OfficialCycleYear, Promise<RawYearPayload>> = new Map();

/**
 * Lazy loads a specific year's compact dataset from /data/official-cutoffs/{year}.json.
 */
export async function loadOfficialYearData(year: OfficialCycleYear): Promise<RawYearPayload> {
  if (yearDataCache.has(year)) {
    return yearDataCache.get(year)!;
  }

  if (pendingLoads.has(year)) {
    return pendingLoads.get(year)!;
  }

  const loadPromise = (async () => {
    try {
      const response = await fetch(`/data/official-cutoffs/${year}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load official cutoff dataset for ${year}: HTTP ${response.status}`);
      }
      const data: RawYearPayload = await response.json();
      yearDataCache.set(year, data);
      return data;
    } finally {
      pendingLoads.delete(year);
    }
  })();

  pendingLoads.set(year, loadPromise);
  return loadPromise;
}

/**
 * Retrieves the available quota regions and cycles for a given college across all 3 years.
 * Prevents UI from defaulting to an unrecorded region (e.g. 'Statewide').
 */
export async function getCollegeCutoffAvailability(collegeId: string): Promise<CollegeCutoffAvailability> {
  const years: OfficialCycleYear[] = ['2024', '2023', '2022'];
  const availableCycles: OfficialCycleYear[] = [];
  const regionsSet = new Set<string>();
  const branchesSet = new Set<string>();
  const codesSet = new Set<string>();
  let canonicalName = '';

  for (const year of years) {
    try {
      const yearPayload = await loadOfficialYearData(year);
      const collegeData = yearPayload.colleges[collegeId];
      if (collegeData && collegeData.cutoffs.length > 0) {
        availableCycles.push(year);
        if (!canonicalName) canonicalName = collegeData.name;
        if (collegeData.code) codesSet.add(collegeData.code);
        if (collegeData.historicalCodes) {
          collegeData.historicalCodes.forEach(c => codesSet.add(c));
        }

        for (const tuple of collegeData.cutoffs) {
          branchesSet.add(tuple[0]);
          regionsSet.add(tuple[1]);
          if (tuple[9]) codesSet.add(tuple[9]);
        }
      }
    } catch {
      // Continue inspecting other years
    }
  }

  return {
    collegeId,
    hasRecords: availableCycles.length > 0,
    availableCycles,
    availableRegions: Array.from(regionsSet).sort(),
    availableBranches: Array.from(branchesSet).sort(),
    historicalCodes: Array.from(codesSet),
    canonicalName
  };
}

/**
 * Queries official cutoffs for a college with optional filters.
 */
export async function getOfficialCutoffs(filter: CutoffQueryFilter): Promise<OfficialCutoffRecord[]> {
  const yearsToQuery: OfficialCycleYear[] = filter.admissionCycle
    ? [filter.admissionCycle]
    : ['2024', '2023', '2022'];

  const results: OfficialCutoffRecord[] = [];

  for (const year of yearsToQuery) {
    try {
      const yearPayload = await loadOfficialYearData(year);
      const collegeData = yearPayload.colleges[filter.collegeId];
      if (!collegeData) continue;

      for (const tuple of collegeData.cutoffs) {
        const [
          branchCode,
          quotaRegion,
          category,
          genderPool,
          closingRank,
          rankStatus,
          rawSourceValue,
          sourceLocation,
          tuitionFee,
          sourceCollegeCode,
          sourceCollegeName
        ] = tuple;

        // Apply filters
        if (filter.branchCode && branchCode.toLowerCase() !== filter.branchCode.toLowerCase()) {
          continue;
        }
        if (filter.category && category.toUpperCase() !== filter.category.toUpperCase()) {
          continue;
        }
        if (filter.genderPool && genderPool !== filter.genderPool) {
          continue;
        }
        if (filter.quotaRegion && quotaRegion.toUpperCase() !== filter.quotaRegion.toUpperCase()) {
          continue;
        }

        results.push({
          admissionCycle: year,
          academicYear: yearPayload.academicYear,
          collegeId: filter.collegeId,
          collegeCode: collegeData.code,
          collegeName: collegeData.name,
          sourceCollegeCode: sourceCollegeCode || collegeData.code,
          sourceCollegeName: sourceCollegeName || collegeData.name,
          branchCode,
          quotaRegion,
          category,
          genderPool,
          closingRank,
          rankStatus,
          rawSourceValue,
          sourceLocation,
          tuitionFee,
          provenance: {
            authority: 'Andhra Pradesh State Council of Higher Education (APSCHE)',
            documentTitle: `AP EAPCET ${yearPayload.academicYear} Final Last Rank Details`,
            documentUrl: yearPayload.sourceDocumentUrl,
            sha256: yearPayload.sourceSha256,
            format: yearPayload.sourceFormat
          }
        });
      }
    } catch (err) {
      console.warn(`[officialCutoffService] Could not retrieve cutoffs for year ${year}:`, err);
    }
  }

  return results;
}

/**
 * Fetches distinct branches available for a college across all historical cycles.
 */
export async function getCollegeBranches(collegeId: string): Promise<string[]> {
  const branches = new Set<string>();
  const years: OfficialCycleYear[] = ['2024', '2023', '2022'];

  for (const year of years) {
    try {
      const yearPayload = await loadOfficialYearData(year);
      const collegeData = yearPayload.colleges[collegeId];
      if (collegeData) {
        for (const tuple of collegeData.cutoffs) {
          branches.add(tuple[0]);
        }
      }
    } catch {
      // Continue silently if a year file is unavailable
    }
  }

  return Array.from(branches).sort();
}

/**
 * Builds a multi-year side-by-side comparison for a specific college, branch, category, and gender.
 */
export async function getMultiYearBranchComparison(
  collegeId: string,
  category: ReservationCategory | string,
  genderPool: GenderPool,
  quotaRegion?: string
): Promise<HistoricalYearComparison[]> {
  const records = await getOfficialCutoffs({
    collegeId,
    category,
    genderPool,
    quotaRegion
  });

  const comparisonMap = new Map<string, HistoricalYearComparison>();

  for (const r of records) {
    const key = `${r.branchCode}|${r.quotaRegion}|${r.category}|${r.genderPool}|${r.sourceCollegeCode}`;
    if (!comparisonMap.has(key)) {
      comparisonMap.set(key, {
        branchCode: r.branchCode,
        quotaRegion: r.quotaRegion,
        category: r.category,
        genderPool: r.genderPool,
        sourceCollegeCode: r.sourceCollegeCode,
        sourceCollegeName: r.sourceCollegeName,
        years: {}
      });
    }

    const item = comparisonMap.get(key)!;
    item.years[r.admissionCycle] = {
      academicYear: r.academicYear,
      closingRank: r.closingRank,
      rankStatus: r.rankStatus,
      rawSourceValue: r.rawSourceValue,
      sourceLocation: r.sourceLocation,
      sourceCollegeCode: r.sourceCollegeCode,
      sourceCollegeName: r.sourceCollegeName,
      documentUrl: r.provenance.documentUrl
    };
  }

  // Calculate trends for items with multi-year data
  const resultList = Array.from(comparisonMap.values());
  for (const item of resultList) {
    const r24 = item.years['2024']?.closingRank;
    const r22 = item.years['2022']?.closingRank;
    if (typeof r24 === 'number' && typeof r22 === 'number') {
      const diff = Math.abs(r24 - r22);
      if (r24 < r22) {
        item.trendNote = `More selective by ${diff.toLocaleString('en-IN')} ranks`;
      } else if (r24 > r22) {
        item.trendNote = `Easing by ${diff.toLocaleString('en-IN')} ranks`;
      } else {
        item.trendNote = 'Stable closing rank';
      }
    }
  }

  return resultList.sort((a, b) => a.branchCode.localeCompare(b.branchCode));
}

/**
 * Clear in-memory query cache (useful in tests).
 */
export function clearCutoffCache(): void {
  yearDataCache.clear();
  pendingLoads.clear();
}
