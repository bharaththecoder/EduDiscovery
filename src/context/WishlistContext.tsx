import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: any[];
  toggleWishlist: (university: any) => Promise<void>;
  isWishlisted: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);
export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    // Listen for wishlist updates from user doc
    const userRef = doc(db, 'users', currentUser.id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setWishlist(doc.data().wishlist || []);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleWishlist = async (university: any) => {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.id);
    const isSaved = wishlist.some(u => u.id === university.id);

    try {
      if (isSaved) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(university)
        });
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(university)
        });
      }
    } catch (error) {
      console.error("Wishlist sync error:", error);
    }
  };

  const isWishlisted = (id: string) => wishlist.some((u: any) => u.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}
