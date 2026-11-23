import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { parseRankToNumber } from '@/utils/intelligenceEngine';

export interface CounselingPreferences {
  rank: string;
  category: string;
  gender: 'General' | 'Female';
  region: 'AU' | 'SVU' | 'All';
  budget?: string;
  branches: string[];
}

const STORAGE_KEYS = {
  RANK: 'edudiscovery_user_rank',
  CATEGORY: 'edudiscovery_user_category',
  GENDER: 'edudiscovery_user_gender',
  REGION: 'edudiscovery_user_region',
  BUDGET: 'edudiscovery_user_budget',
  BRANCHES: 'edudiscovery_user_branches',
} as const;

export const DEFAULT_COUNSELING_PREFS: CounselingPreferences = {
  rank: '25000',
  category: 'OC_BOYS',
  gender: 'General',
  region: 'AU',
  budget: undefined,
  branches: ['CSE', 'CSM', 'CSD', 'INF', 'ECE'],
};

/**
 * useCounselingPreferences
 * 
 * Unified hook managing candidate counseling state across:
 * - Home (quick rank input & fit recommendations)
 * - Quiz (intake answers & scoring weights)
 * - Web-Options (priority matrix & quota simulation)
 * - University Detail (branch admission probability gauge)
 * - Compare (side-by-side cutoff evaluation)
 * 
 * Synchronizes with localStorage and user profile in Firestore.
 */
export function useCounselingPreferences() {
  const { currentUser, updateUserDoc } = useAuth();

  // Initialize state with priority: localStorage (user's explicit current input) -> User Document -> Default
  const [preferences, setPreferences] = useState<CounselingPreferences>(() => {
    const cachedRank = localStorage.getItem(STORAGE_KEYS.RANK);
    const cachedCategory = localStorage.getItem(STORAGE_KEYS.CATEGORY);
    const cachedGender = localStorage.getItem(STORAGE_KEYS.GENDER) as 'General' | 'Female' | null;
    const cachedRegion = localStorage.getItem(STORAGE_KEYS.REGION) as 'AU' | 'SVU' | 'All' | null;
    const cachedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
    const cachedBranchesRaw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    
    let branches = DEFAULT_COUNSELING_PREFS.branches;
    if (cachedBranchesRaw) {
      try {
        const parsed = JSON.parse(cachedBranchesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) branches = parsed;
      } catch {
        // fallback
      }
    }

    const quizAnswers = currentUser?.quizResults?.answers;

    return {
      rank: cachedRank || (quizAnswers?.rank ? String(parseRankToNumber(quizAnswers.rank)) : DEFAULT_COUNSELING_PREFS.rank),
      category: cachedCategory || quizAnswers?.category || DEFAULT_COUNSELING_PREFS.category,
      gender: cachedGender || (quizAnswers?.gender as 'General' | 'Female') || DEFAULT_COUNSELING_PREFS.gender,
      region: cachedRegion || (quizAnswers?.region as 'AU' | 'SVU' | 'All') || DEFAULT_COUNSELING_PREFS.region,
      budget: cachedBudget || quizAnswers?.budget || undefined,
      branches,
    };
  });

  // Re-sync with localStorage whenever window gains focus or storage event occurs
  useEffect(() => {
    const syncFromStorage = () => {
      const cachedRank = localStorage.getItem(STORAGE_KEYS.RANK);
      if (cachedRank && cachedRank !== preferences.rank) {
        setPreferences(prev => ({ ...prev, rank: cachedRank }));
      }
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('focus', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, [preferences.rank]);

  // Keep in sync with currentUser profile changes ONLY if not overridden locally
  useEffect(() => {
    const quizAnswers = currentUser?.quizResults?.answers;
    if (!quizAnswers) return;

    setPreferences(prev => {
      const cachedRank = localStorage.getItem(STORAGE_KEYS.RANK);
      const nextRank = cachedRank || (quizAnswers.rank ? String(parseRankToNumber(quizAnswers.rank)) : prev.rank);
      const nextCategory = localStorage.getItem(STORAGE_KEYS.CATEGORY) || quizAnswers.category || prev.category;
      const nextGender = (localStorage.getItem(STORAGE_KEYS.GENDER) as 'General' | 'Female') || (quizAnswers.gender as 'General' | 'Female') || prev.gender;
      const nextRegion = (localStorage.getItem(STORAGE_KEYS.REGION) as 'AU' | 'SVU' | 'All') || (quizAnswers.region as 'AU' | 'SVU' | 'All') || prev.region;
      const nextBudget = localStorage.getItem(STORAGE_KEYS.BUDGET) || quizAnswers.budget || prev.budget;

      if (
        nextRank === prev.rank &&
        nextCategory === prev.category &&
        nextGender === prev.gender &&
        nextRegion === prev.region &&
        nextBudget === prev.budget
      ) {
        return prev;
      }

      return {
        ...prev,
        rank: nextRank,
        category: nextCategory,
        gender: nextGender,
        region: nextRegion,
        budget: nextBudget,
      };
    });
  }, [currentUser?.quizResults?.answers]);

  // Update preference and persist
  const setPreference = useCallback(<K extends keyof CounselingPreferences>(
    key: K,
    value: CounselingPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      
      // Persist to local storage
      switch (key) {
        case 'rank':
          if (typeof value === 'string') localStorage.setItem(STORAGE_KEYS.RANK, value);
          break;
        case 'category':
          if (typeof value === 'string') localStorage.setItem(STORAGE_KEYS.CATEGORY, value);
          break;
        case 'gender':
          if (typeof value === 'string') localStorage.setItem(STORAGE_KEYS.GENDER, value);
          break;
        case 'region':
          if (typeof value === 'string') localStorage.setItem(STORAGE_KEYS.REGION, value);
          break;
        case 'budget':
          if (typeof value === 'string') localStorage.setItem(STORAGE_KEYS.BUDGET, value);
          else if (value === undefined) localStorage.removeItem(STORAGE_KEYS.BUDGET);
          break;
        case 'branches':
          if (Array.isArray(value)) localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(value));
          break;
      }

      return updated;
    });

    // Optionally sync into user profile if authenticated
    if (currentUser?.id) {
      updateUserDoc({
        [`counselingPreferences.${key}`]: value
      }).catch(err => {
        console.warn('[useCounselingPreferences] Profile doc sync failed:', err);
      });
    }
  }, [currentUser?.id, updateUserDoc]);

  const setRank = useCallback((rank: string) => setPreference('rank', rank), [setPreference]);
  const setCategory = useCallback((category: string) => setPreference('category', category), [setPreference]);
  const setGender = useCallback((gender: 'General' | 'Female') => setPreference('gender', gender), [setPreference]);
  const setRegion = useCallback((region: 'AU' | 'SVU' | 'All') => setPreference('region', region), [setPreference]);
  const setBudget = useCallback((budget: string | undefined) => setPreference('budget', budget), [setPreference]);
  const setBranches = useCallback((branches: string[]) => setPreference('branches', branches), [setPreference]);

  return {
    preferences,
    parsedRank: parseRankToNumber(preferences.rank),
    setPreference,
    setRank,
    setCategory,
    setGender,
    setRegion,
    setBudget,
    setBranches,
  };
}
