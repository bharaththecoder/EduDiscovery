// ============================================================
// EduDiscovery — Core Type Definitions
// ============================================================

export interface Program {
  name: string;
  duration: string;
  fees: string;
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

export interface University {
  id: string;
  name: string;
  shortName: string;
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
  programs: Program[];
  faculty: Faculty[];
  facilities: Facility[];
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
  wishlist?: University[];
  updatedAt?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
