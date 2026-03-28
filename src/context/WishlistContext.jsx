import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    // Set up real-time listener for the user document
    const userDocRef = doc(db, 'users', currentUser.id);
    
    // Listen for changes to the entire user document which contains the wishlist array
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().wishlist) {
        setWishlist(docSnap.data().wishlist);
      } else {
        setWishlist([]);
      }
    }, (error) => {
      console.error("Error listening to wishlist:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleWishlist = async (college) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      
      // Calculate the new wishlist array immediately
      const isBookmarked = wishlist.some(item => item.name === college.name);
      let newWishlist;
      
      if (isBookmarked) {
        newWishlist = wishlist.filter(item => item.name !== college.name);
      } else {
        newWishlist = [...wishlist, college];
      }
      
      // We overwrite/set the user document's wishlist array.
      // We use merge: true so we don't accidentally wipe other fields if they exist later.
      await setDoc(userDocRef, { wishlist: newWishlist }, { merge: true });
      
    } catch (error) {
      console.error("Error toggling wishlist item:", error);
    }
  };

  const isBookmarked = (collegeName) => {
    return wishlist.some(item => item.name === collegeName);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isBookmarked }}>
      {children}
    </WishlistContext.Provider>
  );
};
