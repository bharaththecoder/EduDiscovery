/**
 * gov-data-eapcet/types.ts
 * Authoritative, Source-Backed Type Definitions for AP Government B.Tech Institutions
 * and APSCHE EAPCET Statutory Category Cutoff Closing Ranks.
 * 
 * STRICT RULES:
 * 1. Zero synthetic or multiplier-based cutoff values allowed.
 * 2. Unallotted / vacant quota seats are explicitly `null`.
 * 3. Every cutoff record must declare source authority and document reference.
 */

export type APRegion = 'AU' | 'SVU' | 'Statewide';

export type BranchCode =
  | 'CSE'   // Computer Science & Engineering
  | 'CSM'   // CSE (Artificial Intelligence & Machine Learning)
  | 'CSD'   // CSE (Data Science)
  | 'CSC'   // CSE (Cyber Security)
  | 'INF'   // Information Technology
  | 'ECE'   // Electronics & Communication Engineering
  | 'EEE'   // Electrical & Electronics Engineering
  | 'MEC'   // Mechanical Engineering
  | 'CIV';  // Civil Engineering

export interface SourceAttribution {
  authority: 'APSCHE' | 'APHERMC';
  documentRef: string;          // e.g. "APSCHE_EAPCET_2024_FINAL_ROUND_LAST_RANKS"
  academicYear: '2024-2025';
  counselingPhase: 'Final Phase' | 'Round 1';
  sourceUrl?: string;
  verifiedAt: string;           // ISO date string
}

export interface StatutoryCategoryCutoffs {
  // Raw closing rank integers as officially reported by APSCHE. Null if no candidate was allotted.
  ocBoys: number;
  ocGirls: number;
  ewsBoys: number | null;
  ewsGirls: number | null;
  bcABoys: number | null;
  bcAGirls: number | null;
  bcBBoys: number | null;
  bcBGirls: number | null;
  bcCBoys: number | null;
  bcCGirls: number | null;
  bcDBoys: number | null;
  bcDGirls: number | null;
  bcEBoys: number | null;
  bcEGirls: number | null;
  scBoys: number | null;
  scGirls: number | null;
  stBoys: number | null;
  stGirls: number | null;
  source: SourceAttribution;
}

export interface BranchCutoffRecord {
  branchCode: BranchCode;
  branchName: string;
  intake?: number;
  auQuota?: StatutoryCategoryCutoffs;       // AU Local Candidate Pool (85%)
  svuQuota?: StatutoryCategoryCutoffs;      // SVU Local Candidate Pool (85%)
  nonLocalQuota?: StatutoryCategoryCutoffs; // 15% Unreserved Pool
}

export interface FeeAttribution {
  authority: 'APHERMC';
  orderNumber: string;         // e.g. "G.O.Ms.No.17 Higher Education (EC) Dept"
  blockPeriod: '2023-2026';
  statutoryMaxConvenorFee: number;
  eligibleForJvdReimbursement: boolean;
}

export interface GovCollegeRecord {
  code: string;                      // Official APSCHE Counseling Code (e.g. "VRSE", "GVPE", "JNUK")
  name: string;                      // Full registered name
  shortName: string;                 // Moniker
  district: string;                  // Official AP Reorganized District (e.g. NTR, Visakhapatnam)
  city: string;                      // City / Municipality
  region: APRegion;                  // AU / SVU / Statewide
  affiliation: string;               // e.g. "JNTU Kakinada", "JNTU Anantapur", "Andhra University"
  category: 'Govt University' | 'Private Autonomous' | 'Private Affiliated' | 'Deemed / Private';
  aphermcFee: number;                // Gazetted Convenor Tuition Fee (₹/year)
  mgmtQuotaFee?: number;             // Estimated Cat-B fee (₹/year)
  hostelFeeApprox?: number;          // Estimated Annual hostel & mess charge (₹/year)
  feeAttribution: FeeAttribution;
  naacGrade?: string;                // e.g. "A++", "A+", "A"
  nirfRank?: string;                 // e.g. "141 (Engg, 2024)", "#43 (Univ)"
  established: number;               // Year established
  website: string;                   // Official college URL
  coordinates: {
    lat: number;
    lng: number;
  };
  branches: BranchCutoffRecord[];
}
