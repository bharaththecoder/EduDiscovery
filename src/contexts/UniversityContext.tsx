import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { University } from '@/types';

interface UniversityContextType {
  universities: University[];
  loading: boolean;
  getUniversityById: (id: string) => Promise<University | undefined>;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadColleges() {
      try {
        const snap = await getDocs(collection(db, 'colleges'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as University[];
        setUniversities(list);
      } catch (e) {
        console.error("Error loading universities from Firestore:", e);
      } finally {
        setLoading(false);
      }
    }
    loadColleges();
  }, []);

  const getUniversityById = async (id: string): Promise<University | undefined> => {
    // Check memory cache first
    const cached = universities.find(u => u.id === id);
    if (cached) return cached;

    // Fallback: fetch from firestore directly
    try {
      const docRef = doc(db, 'colleges', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as University;
      }
    } catch (e) {
      console.error("Error getting university by ID:", e);
    }
    return undefined;
  };

  return (
    <UniversityContext.Provider value={{ universities, loading, getUniversityById }}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversities() {
  const context = useContext(UniversityContext);
  if (!context) {
    throw new Error('useUniversities must be used within a UniversityProvider');
  }
  return context;
}
