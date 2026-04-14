import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Map Firebase user object to our expected shape
        const baseUser = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
        };

        // Listen for Firestore profile data
        const userDocRef = doc(db, 'users', user.uid);
        
        // Initial set if doesn't exist
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          await setDoc(userDocRef, {
            name: baseUser.name,
            email: baseUser.email,
            bio: 'Aspiring Engineer • AP Student',
            tags: ["Early Action", "Stem Scholar"],
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }

        unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({
              ...baseUser,
              ...doc.data(),
            });
          } else {
            setCurrentUser(baseUser);
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Firestore update is handled by the useEffect listener when it detects no doc
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updateUserDoc = async (data) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error updating user doc:", error);
      throw error;
    }
  };

  const calculateProfileStrength = (user) => {
    if (!user) return 0;
    let score = 30; // Start with 30% base
    if (user.photoURL) score += 20;
    if (user.bio && user.bio !== 'Aspiring Engineer • AP Student') score += 15;
    if (user.city) score += 10;
    if (user.tags && user.tags.length > 2) score += 10;
    if (user.quizResults) score += 15; // Bonus for taking the quiz
    return Math.min(score, 100);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    updateUserDoc,
    profileStrength: calculateProfileStrength(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
