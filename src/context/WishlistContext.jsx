import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);

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

  const toggleWishlist = async (university) => {
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

  const isWishlisted = (id) => wishlist.some(u => u.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}
