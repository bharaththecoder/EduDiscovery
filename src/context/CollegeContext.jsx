import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const CollegeContext = createContext();

export function useColleges() {
  return useContext(CollegeContext);
}

export function CollegeProvider({ children }) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchColleges() {
      try {
        const querySnapshot = await getDocs(collection(db, 'colleges'));
        const collegesList = querySnapshot.docs.map(doc => ({
          id: doc.id,   // Ensure we keep the document ID just in case
          ...doc.data()
        }));
        
        // Sort by 'match' score or just name since 'match' is our custom ranking for curated 
        collegesList.sort((a, b) => (b.match || 0) - (a.match || 0));

        setColleges(collegesList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching colleges from Firestore:", err);
        setError(err.message);
        setLoading(false); // Make sure to stop loading even on error
      }
    }

    fetchColleges();
  }, []); // Run once on mount to establish the data layer

  return (
    <CollegeContext.Provider value={{ colleges, loading, error }}>
      {children}
    </CollegeContext.Provider>
  );
}
