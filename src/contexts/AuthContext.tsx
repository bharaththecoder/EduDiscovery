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
import { auth, googleProvider, db } from '@/services/firebase';

// ─── Types ────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  bio?: string;
  city?: string;
  tags?: string[];
  quizResults?: {
    answers: Record<string, string>;
    topMatches: { id: string; name: string; match: number }[];
    completedAt: string;
  };
  [key: string]: unknown;
}

interface AuthContextType {
  currentUser: AppUser | null;
  signup: (email: string, password: string, name: string) => Promise<unknown>;
  login: (email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<unknown>;
  updateUserDoc: (data: Record<string, unknown>) => Promise<void>;
  profileStrength: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const baseUser: AppUser = {
          id: user.uid,
          email: user.email,
          name: user.displayName || (user.email?.split('@')[0] ?? 'Scholar'),
          photoURL: user.photoURL || null,
        };

        // Immediately set base user so UI can start rendering if needed
        // but keep loading true if we want to wait for Firestore
        setCurrentUser(baseUser);

        const userDocRef = doc(db, 'users', user.uid);
        
        try {
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
        } catch (error) {
          console.error("Error checking/seeding user doc:", error);
          // Don't block app initialization on Firestore errors
          setLoading(false);
          return;
        }

        unsubscribeFirestore = onSnapshot(userDocRef, {
          next: (docSnap) => {
            if (docSnap.exists()) {
              setCurrentUser({
                ...baseUser,
                ...docSnap.data(),
              } as AppUser);
            } else {
              setCurrentUser(baseUser);
            }
            setLoading(false);
          },
          error: (err) => {
            console.error("Firestore onSnapshot error:", err);
            setLoading(false);
          }
        });

        // Fail-safe: if Firestore hasn't responded in 1.5 seconds, stop loading
        const timeout = setTimeout(() => {
          setLoading(false);
        }, 1500);
        
        return () => {
          clearTimeout(timeout);
          unsubscribeFirestore();
        };

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

  const signup = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
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

  const updateUserDoc = async (data: Record<string, unknown>) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error updating user doc:", error);
      throw error;
    }
  };

  const calculateProfileStrength = (user: AppUser | null) => {
    if (!user) return 0;
    let score = 30;
    if (user.photoURL) score += 20;
    if (user.bio && user.bio !== 'Aspiring Engineer • AP Student') score += 15;
    if (user.city) score += 10;
    if (user.tags && user.tags.length > 2) score += 10;
    if (user.quizResults) score += 15;
    return Math.min(score, 100);
  };

  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    updateUserDoc,
    profileStrength: calculateProfileStrength(currentUser),
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: '16px'
        }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--primary-light)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Initializing EduDiscovery...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
