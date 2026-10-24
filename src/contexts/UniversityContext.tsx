import React, { createContext, useContext, useState, useEffect } from 'react';
import { University } from '@/types';
import { getAllColleges, getCollegeById as fetchCollegeById } from '@/services/collegeQueries';
import { universities as localUniversities } from '@/data/universities';

interface UniversityContextType {
  universities: University[];
  loading: boolean;
  getUniversityById: (id: string) => Promise<University | undefined>;
  refreshColleges: () => Promise<void>;
}

const defaultUniversityContext: UniversityContextType = {
  universities: localUniversities,
  loading: false,
  getUniversityById: async (id: string) => localUniversities.find(u => u.id === id),
  refreshColleges: async () => {},
};

const UniversityContext = createContext<UniversityContextType>(defaultUniversityContext);

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const [universities, setUniversities] = useState<University[]>(localUniversities);
  const [loading, setLoading] = useState(true);

  const loadColleges = React.useCallback(async (forceRefresh = false) => {
    try {
      const list = await getAllColleges(forceRefresh);
      if (list && list.length > 0) {
        setUniversities(list);
      }
    } catch (e) {
      console.error("Error loading universities from Firestore service:", e);
      setUniversities(localUniversities);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColleges(false);
  }, [loadColleges]);

  const getUniversityById = React.useCallback(async (id: string): Promise<University | undefined> => {
    // Check in-state memory first
    const found = universities.find(u => u.id === id || u.id.toLowerCase() === id.toLowerCase());
    if (found) return found;

    // Delegate to Firestore query service
    return fetchCollegeById(id);
  }, [universities]);

  const refreshColleges = React.useCallback(async () => {
    setLoading(true);
    await loadColleges(true);
  }, [loadColleges]);

  const value = React.useMemo(() => ({
    universities,
    loading,
    getUniversityById,
    refreshColleges
  }), [universities, loading, getUniversityById, refreshColleges]);

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
