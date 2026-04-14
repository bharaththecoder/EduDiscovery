import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { University } from '../types';

interface CollegeContextType {
  colleges: University[];
  loading: boolean;
  error: string | null;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export function useColleges() {
  const context = useContext(CollegeContext);
  if (context === undefined) {
    throw new Error('useColleges must be used within a CollegeProvider');
  }
  return context;
}

interface CollegeProviderProps {
  children: ReactNode;
}

export function CollegeProvider({ children }: CollegeProviderProps) {
  const [colleges, setColleges] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We use onSnapshot for realtime updates from Firestore
    const unsubscribe = onSnapshot(collection(db, 'colleges'), (querySnapshot) => {
      try {
        const collegesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as University[];
        
        collegesList.sort((a, b) => (b.match || 0) - (a.match || 0));

        setColleges(collegesList);
        setLoading(false);
      } catch (err: any) {
        console.error("Error parsing colleges from Firestore:", err);
        setError(err.message);
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching colleges from Firestore:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <CollegeContext.Provider value={{ colleges, loading, error }}>
      {children}
    </CollegeContext.Provider>
  );
}
