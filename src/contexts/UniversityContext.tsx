import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { University } from '@/types';
import { getAllColleges, getCollegeById as fetchCollegeById, clearCollegesCache } from '@/services/collegeQueries';
import { universities as localUniversities } from '@/data/universities';

interface UniversityContextType {
  universities: University[];
  loading: boolean;
  error: string | null;
  getUniversityById: (id: string) => Promise<University | undefined>;
  refreshColleges: () => Promise<void>;
}

const defaultUniversityContext: UniversityContextType = {
  universities: localUniversities,
  loading: false,
  error: null,
  getUniversityById: async (id: string) => localUniversities.find(u => u.id === id),
  refreshColleges: async () => {},
};

const UniversityContext = createContext<UniversityContextType>(defaultUniversityContext);

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const [universities, setUniversities] = useState<University[]>(localUniversities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const loadColleges = React.useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setLoading(true);
      setError(null);
    }

    try {
      const list = await getAllColleges(forceRefresh);
      if (list && list.length > 0) {
        setUniversities(prev => {
          // If lists are identical in length and ids, avoid replacing array reference to prevent scroll jumps
          if (prev.length === list.length && prev[0]?.id === list[0]?.id && prev[prev.length - 1]?.id === list[list.length - 1]?.id) {
            // Check if any fees or cutoffs meaningfully differed
            const hasChanged = list.some((item, idx) => item.convenerFee !== prev[idx]?.convenerFee);
            if (!hasChanged) return prev;
          }
          return list;
        });
      }
    } catch (e: any) {
      console.error("[UniversityContext] Error loading universities from online service:", e);
      setError(e?.message || "Failed to load live college data. Check network connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadColleges(false);
    }
  }, [loadColleges]);

  const getUniversityById = React.useCallback(async (id: string): Promise<University | undefined> => {
    if (!id) return undefined;
    const normalized = id.trim().toLowerCase();

    // Check in-state memory first
    const found = universities.find(u => u.id.toLowerCase() === normalized);
    if (found) return found;

    // Delegate to Firestore query service
    return fetchCollegeById(id);
  }, [universities]);

  const refreshColleges = React.useCallback(async () => {
    clearCollegesCache();
    await loadColleges(true);
  }, [loadColleges]);

  const value = React.useMemo(() => ({
    universities,
    loading,
    error,
    getUniversityById,
    refreshColleges
  }), [universities, loading, error, getUniversityById, refreshColleges]);

  return (
    <UniversityContext.Provider value={value}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversities() {
  try {
    const context = useContext(UniversityContext);
    return context || defaultUniversityContext;
  } catch (err) {
    console.warn('[useUniversities] Context resolution fallback:', err);
    return defaultUniversityContext;
  }
}
