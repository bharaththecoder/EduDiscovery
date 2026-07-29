import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { University } from '@/types';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: University[];
  toggleWishlist: (university: University) => Promise<void>;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => Promise<void>;
}

const defaultWishlistContext: WishlistContextType = {
  wishlist: [],
  toggleWishlist: async () => {},
  isWishlisted: () => false,
  clearWishlist: async () => {},
};

const WishlistContext = createContext<WishlistContextType>(defaultWishlistContext);
export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  return ctx || defaultWishlistContext;
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState<University[]>(() => {
    try {
      const local = localStorage.getItem('wishlist');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!db || !currentUser || !db.app) {
      return;
    }

    // Listen for wishlist updates from user doc
    const userRef = doc(db, 'users', currentUser.id);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteList = docSnap.data().wishlist || [];
        setWishlist(remoteList);
        localStorage.setItem('wishlist', JSON.stringify(remoteList));
      }
    }, (err) => {
      console.warn("Firestore wishlist sync error, using local state:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleWishlist = React.useCallback(async (university: University) => {
    const isSaved = wishlist.some(u => u.id === university.id);
    const newWishlist = isSaved
      ? wishlist.filter(u => u.id !== university.id)
      : [...wishlist, university];

    // Optimistically update local state & local storage
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));

    if (!currentUser || !db || !db.app) return;
    
    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, {
        wishlist: newWishlist
      });
    } catch (error) {
      console.error("Wishlist sync error:", error);
    }
  }, [wishlist, currentUser]);

  const clearWishlist = React.useCallback(async () => {
    setWishlist([]);
    localStorage.setItem('wishlist', JSON.stringify([]));

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

  const isWishlisted = React.useCallback((id: string) => wishlist.some((u) => u.id === id), [wishlist]);

  const value = React.useMemo(() => ({ wishlist, toggleWishlist, isWishlisted, clearWishlist }), [wishlist, toggleWishlist, isWishlisted, clearWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
