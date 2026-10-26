import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { University } from '@/types';
import { db, isFirestoreReady } from '@/services/firebase';
import { useAuth } from './AuthContext';
import { useUniversities } from './UniversityContext';
import { universities as fallbackUniversities } from '@/data/universities';
import { GUEST_STORAGE_KEY, getUserStorageKey, normalizeWishlistIds } from '@/utils/wishlistUtils';
export { normalizeWishlistIds };

interface WishlistContextType {
  wishlist: University[];
  wishlistIds: string[];
  toggleWishlist: (universityOrId: University | string) => Promise<void>;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => Promise<void>;
}

const defaultWishlistContext: WishlistContextType = {
  wishlist: [],
  wishlistIds: [],
  toggleWishlist: async () => {},
  isWishlisted: () => false,
  clearWishlist: async () => {},
};

const WishlistContext = createContext<WishlistContextType>(defaultWishlistContext);
export const useWishlist = (): WishlistContextType => {
  try {
    const ctx = useContext(WishlistContext);
    return ctx || defaultWishlistContext;
  } catch (err) {
    console.warn('[useWishlist] Context resolution fallback:', err);
    return defaultWishlistContext;
  }
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { universities } = useUniversities();
  const lastUserIdRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Combine dynamic catalog with fallback catalog for exhaustive hydration
  const catalogMap = useMemo(() => {
    const map = new Map<string, University>();
    fallbackUniversities.forEach(u => map.set(u.id, u));
    universities.forEach(u => map.set(u.id, u));
    return map;
  }, [universities]);

  // Initial state derived safely from isolated storage keys
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      if (currentUser?.id) {
        const userSaved = localStorage.getItem(getUserStorageKey(currentUser.id));
        if (userSaved) return normalizeWishlistIds(JSON.parse(userSaved));
      }
      const guestSaved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestSaved) return normalizeWishlistIds(JSON.parse(guestSaved));
      // Fallback check for legacy migration
      const legacy = localStorage.getItem('wishlist_ids');
      if (legacy) return normalizeWishlistIds(JSON.parse(legacy));
      return [];
    } catch {
      return [];
    }
  });

  // Account-safe lifecycle & Firestore sync
  useEffect(() => {
    const currentUid = currentUser?.id || null;
    const previousUid = lastUserIdRef.current;
    lastUserIdRef.current = currentUid;

    // Handle user logout (User -> Guest)
    if (previousUid && !currentUid) {
      try {
        const guestSaved = localStorage.getItem(GUEST_STORAGE_KEY);
        setWishlistIds(guestSaved ? normalizeWishlistIds(JSON.parse(guestSaved)) : []);
      } catch {
        setWishlistIds([]);
      }
      return;
    }

    // Handle account switch (User A -> User B)
    if (previousUid && currentUid && previousUid !== currentUid) {
      try {
        const newUserSaved = localStorage.getItem(getUserStorageKey(currentUid));
        setWishlistIds(newUserSaved ? normalizeWishlistIds(JSON.parse(newUserSaved)) : []);
      } catch {
        setWishlistIds([]);
      }
    }

    // Unauthenticated Guest or Firestore Offline: Persist changes strictly to guest cache
    if (!currentUser || !isFirestoreReady(db)) {
      return;
    }

    // Authenticated User: Set up isolated Firestore sync & atomic single-transition merge
    let unsubscribe: (() => void) | null = null;
    try {
      const userRef = doc(db, 'users', currentUser.id);

      // One-time guest-to-account merge on sign-in transition
      const performGuestMerge = async () => {
        try {
          const guestData = localStorage.getItem(GUEST_STORAGE_KEY);
          const guestIds = guestData ? normalizeWishlistIds(JSON.parse(guestData)) : [];

          if (guestIds.length > 0) {
            // Atomically union guest favorites into user's document
            await setDoc(userRef, { wishlist: arrayUnion(...guestIds) }, { merge: true });
            // Clear guest storage once successfully merged to prevent duplicate replays
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
        } catch (err) {
          console.warn('[WishlistSync] Guest merge notice:', err);
        }
      };

      performGuestMerge();

      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const rawRemote = docSnap.data().wishlist;
          const normalized = normalizeWishlistIds(rawRemote);
          setWishlistIds(normalized);
          try {
            localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(normalized));
          } catch {}
        } else {
          // Handle absent document: create default structure with empty or existing wishlist
          setDoc(userRef, { wishlist: [] }, { merge: true }).catch(() => {});
        }
      }, (err) => {
        console.warn('[WishlistSync] Firestore snapshot error, using cached local state:', err);
      });
    } catch (err) {
      console.warn('[WishlistSync] Firestore listener setup error, keeping local cache:', err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Hydrate full University objects from stored IDs in memory
  const wishlist = useMemo<University[]>(() => {
    return wishlistIds
      .map(id => catalogMap.get(id))
      .filter((u): u is University => u !== undefined);
  }, [wishlistIds, catalogMap]);

  // Persist current state to appropriate storage cache
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      if (currentUser?.id) {
        localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(wishlistIds));
      } else {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(wishlistIds));
      }
      // Also update legacy key for backward compatibility
      localStorage.setItem('wishlist_ids', JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('[WishlistSync] Failed to persist wishlist to localStorage', e);
    }
  }, [wishlistIds, currentUser?.id]);

  const toggleWishlist = useCallback(async (universityOrId: University | string) => {
    const uniId = typeof universityOrId === 'string' ? universityOrId : universityOrId.id;
    const isSaved = wishlistIds.includes(uniId);
    const nextIds = isSaved
      ? wishlistIds.filter(id => id !== uniId)
      : [...wishlistIds, uniId];

    // Optimistic local state update
    setWishlistIds(nextIds);

    if (!currentUser || !isFirestoreReady(db)) return;

    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        wishlist: isSaved ? arrayRemove(uniId) : arrayUnion(uniId)
      });
    } catch (error) {
      console.warn('[WishlistSync] Atomic update notice:', error);
    }
  }, [wishlistIds, currentUser]);

  const clearWishlist = useCallback(async () => {
    setWishlistIds([]);

    if (!currentUser || !isFirestoreReady(db)) return;

    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        wishlist: []
      });
    } catch (error) {
      console.warn('[WishlistSync] Clear notice:', error);
    }
  }, [currentUser]);

  const isWishlisted = useCallback((id: string) => wishlistIds.includes(id), [wishlistIds]);

  const value = useMemo(() => ({
    wishlist,
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    clearWishlist
  }), [wishlist, wishlistIds, toggleWishlist, isWishlisted, clearWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
