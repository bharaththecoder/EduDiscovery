import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { University } from '@/types';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';
import { useUniversities } from './UniversityContext';
import { universities as fallbackUniversities } from '@/data/universities';

interface WishlistContextType {
  wishlist: University[];
  wishlistIds: string[];
  toggleWishlist: (university: University) => Promise<void>;
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
  const ctx = useContext(WishlistContext);
  return ctx || defaultWishlistContext;
};

// Normalize raw wishlist data (extract IDs whether raw items are string IDs or legacy University objects)
export function normalizeWishlistIds(rawList: unknown): string[] {
  if (!Array.isArray(rawList)) return [];
  const ids: string[] = [];
  for (const item of rawList) {
    if (typeof item === 'string' && item.trim()) {
      ids.push(item.trim());
    } else if (item && typeof item === 'object' && 'id' in item && typeof (item as any).id === 'string') {
      ids.push((item as any).id.trim());
    }
  }
  return Array.from(new Set(ids));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { universities } = useUniversities();

  // Combine dynamic catalog with fallback catalog for exhaustive hydration
  const catalogMap = useMemo(() => {
    const map = new Map<string, University>();
    fallbackUniversities.forEach(u => map.set(u.id, u));
    universities.forEach(u => map.set(u.id, u));
    return map;
  }, [universities]);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem('wishlist_ids');
      if (local) {
        return normalizeWishlistIds(JSON.parse(local));
      }
      // Check legacy localStorage format if new format is absent
      const legacy = localStorage.getItem('wishlist');
      if (legacy) {
        return normalizeWishlistIds(JSON.parse(legacy));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Sync with Firestore user document
  useEffect(() => {
    if (!db || !currentUser || !db.app) {
      return;
    }

    const userRef = doc(db, 'users', currentUser.id);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const rawRemote = docSnap.data().wishlist;
        const normalized = normalizeWishlistIds(rawRemote);
        setWishlistIds(normalized);
        localStorage.setItem('wishlist_ids', JSON.stringify(normalized));
      }
    }, (err) => {
      console.warn("Firestore wishlist sync error, using local state:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Hydrate full University objects from stored IDs in memory
  const wishlist = useMemo<University[]>(() => {
    return wishlistIds
      .map(id => catalogMap.get(id))
      .filter((u): u is University => u !== undefined);
  }, [wishlistIds, catalogMap]);

  // Keep legacy localStorage in sync for components that might read it directly
  useEffect(() => {
    try {
      localStorage.setItem('wishlist_ids', JSON.stringify(wishlistIds));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Failed to persist wishlist to localStorage", e);
    }
  }, [wishlistIds, wishlist]);

  const toggleWishlist = useCallback(async (university: University) => {
    const isSaved = wishlistIds.includes(university.id);
    const nextIds = isSaved
      ? wishlistIds.filter(id => id !== university.id)
      : [...wishlistIds, university.id];

    // Optimistic local state update
    setWishlistIds(nextIds);

    if (!currentUser || !db || !db.app) return;

    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, {
        wishlist: isSaved ? arrayRemove(university.id) : arrayUnion(university.id)
      });
    } catch (error) {
      console.error("Wishlist atomic sync error:", error);
    }
  }, [wishlistIds, currentUser]);

  const clearWishlist = useCallback(async () => {
    setWishlistIds([]);

    if (!currentUser || !db || !db.app) return;

    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, {
        wishlist: []
      });
    } catch (error) {
      console.error("Wishlist clear sync error:", error);
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
