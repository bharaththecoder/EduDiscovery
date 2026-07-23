import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { University } from '@/types';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: University[];
  toggleWishlist: (university: University) => Promise<void>;
  isWishlisted: (id: string) => boolean;
}

const defaultWishlistContext: WishlistContextType = {
  wishlist: [],
  toggleWishlist: async () => {},
  isWishlisted: () => false,
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

  const toggleWishlist = async (university: University) => {
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
  };

  const isWishlisted = (id: string) => wishlist.some((u) => u.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}
