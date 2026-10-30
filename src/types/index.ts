// ============================================================
// EduDiscovery — Core Type Definitions
// ============================================================

export interface Program {
  name: string;
  duration: string;
  fees: string;
  mgmtFees?: string;
}

export interface Faculty {
  name: string;
  designation: string;
  avatar: string;
}

export interface Facility {
  icon: string;
  name: string;
  desc: string;
}

export interface PlacementRecord {
  company: string;
  package: string;
  year: number;
}

export interface CategoryCutoffs {
  ocBoys: number | null;
  ocGirls: number | null;
  ews?: number | null;
  ewsBoys?: number | null;
  ewsGirls?: number | null;
  bcA?: number | null;
  bcABoys?: number | null;
  bcAGirls?: number | null;
  bcB?: number | null;
  bcBBoys?: number | null;
  bcBGirls?: number | null;
  bcC?: number | null;
  bcCBoys?: number | null;
  bcCGirls?: number | null;
  bcD?: number | null;
  bcDBoys?: number | null;
  bcDGirls?: number | null;
  bcE?: number | null;
  bcEBoys?: number | null;
  bcEGirls?: number | null;
  sc?: number | null;
  scBoys?: number | null;
  scGirls?: number | null;
  st?: number | null;
  stBoys?: number | null;
  stGirls?: number | null;
}

export interface CutoffYearStatement {
  academicYear: '2024-2025' | '2023-2024' | '2022-2023';
  authority: 'APSCHE';
  documentRef: string;
  counselingPhase: string;
  cutoffs: CategoryCutoffs;
}

export interface BranchCutoff extends CategoryCutoffs {
  branch: string;      // e.g. "CSE", "AI/ML", "IT", "ECE", "EEE", "Mechanical", "Civil"
  historicalStatements?: Record<'2024' | '2023' | '2022', CategoryCutoffs>;
  source?: {
    authority: string;
    documentRef: string;
    academicYear: string;
    counselingPhase: string;
    sourceUrl?: string;
    verifiedAt?: string;
  };
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  code?: string;       // Official AP EAPCET / APHERMC Counseling Code (e.g. VRSE, GVPV, SRMAP)
  city: string;
  state: string;
  established: number;
  acres: number;
  ratio: string;
  naac: string;
  nirf: string;
  match: number;
  branches: string[];
  tags: string[];
  image: string;
  website: string;
  about: string;
  category?: string;    // e.g. "Deemed / Private", "Autonomous Affiliated", "State Govt University"
  convenerFee?: number; // Statutory Category-A Convenor Quota Fee in ₹/yr
  mgmtFee?: number;     // Category-B Management Quota Fee in ₹/yr
  topRecruiters?: PlacementRecord[]; // Top 3 verified recruiters
  district?: string;
  region?: 'AU' | 'SVU' | 'Statewide'; // AP Local Quota Region
  lastVerified?: string;
  tuitionFee?: number;  // Fallback tuition fee reference
  fees?: string;        // Fallback fee display string
  mgmtFees?: string;    // Fallback mgmt fee display string
  programs: Program[];
  placements?: PlacementRecord[];
  faculty: Faculty[];
  facilities: Facility[];
  branchFees?: Record<string, number | undefined>;
  cutoffs?: BranchCutoff[];
  categoryAQuotaPercent?: number; // e.g. 35 for Private Universities, 70 for Affiliated, 100 for Govt
  categoryBQuotaPercent?: number; // e.g. 65 for Private Universities, 30 for Affiliated, 0 for Govt
  avgPackage?: number;      // Average placement package in ₹ (e.g. 1200000 = ₹12 LPA)
  placementRate?: number;   // 0-100 percentage
  feeIntelligence?: FeeIntelligence;
  feeAttribution?: {
    authority: string;
    orderNumber: string;
    orderDate?: string;
    blockPeriod: string;
    statutoryMaxConvenorFee: number;
    eligibleForJvdReimbursement: boolean;
    gazetteRef?: string;
    quotaNotes?: string;
  };
}

export interface FeeIntelligence {
  category: string;
  convenerQuotaFee: number;
  mgmtQuotaFee: number;
  mgmtMultiple: number;
  isMgmtAbove2x: boolean;
  trends: Record<string, number>;
  hiddenDonationNotes: string;
  sources: string[];
}

export interface NewsArticle {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  content: string;
  url?: string;
  source?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  universityId: string;
  rating: number;
  text: string;
  isVerified: boolean;
  createdAt: string;
  helpful: number;
  helpfulBy?: string[];
}

export interface QuizAnswers {
  [step: number]: string;
}

export interface QuizResults {
  answers: QuizAnswers;
  topMatches: { id: string; name: string; match: number }[];
  completedAt: string;
}

export interface UserPreferences {
  branch?: string;
  goal?: string;
  environment?: string;
  budget?: string;
  rank?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoURL?: string | null;
  bio?: string;
  city?: string;
  tags?: string[];
  appliedCount?: number;
  quizResults?: QuizResults;
  preferences?: UserPreferences;
  wishlist?: string[] | University[];
  updatedAt?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// V3: User activity tracking
export interface ActivityEvent {
  collegeId: string;
  name: string;
  image?: string;
  city?: string;
  timestamp: number;
}

export interface UserActivity {
  recentViews: ActivityEvent[];
  recentSearches: { query: string; timestamp: number }[];
}
