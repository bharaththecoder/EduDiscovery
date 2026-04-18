import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Review } from "../types";

export interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
  timestamp: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  updatedAt: any;
  createdAt: any;
}

// ------------------------------------
// Users Collection
// ------------------------------------
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const saveUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
};

// ------------------------------------
// Chat History Collection
// ------------------------------------
export const getChatHistory = async (userId: string, limitCount = 50): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, `users/${userId}/chat_history`),
      orderBy("timestamp", "asc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ChatMessage);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const addChatMessage = async (userId: string, message: Omit<ChatMessage, "timestamp">) => {
  try {
    const collRef = collection(db, `users/${userId}/chat_history`);
    await addDoc(collRef, {
      ...message,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error adding chat message:", error);
    return false;
  }
};

// ------------------------------------
// Search History
// ------------------------------------
export const addSearchQuery = async (userId: string, queryText: string) => {
  try {
    const collRef = collection(db, `users/${userId}/searches`);
    await addDoc(collRef, {
      query: queryText,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding search query:", error);
  }
};

// ------------------------------------
// Reviews Collection
// ------------------------------------
export const getUniversityReviews = async (universityId: string): Promise<Review[]> => {
  try {
    const q = query(collection(db, "reviews"), where("universityId", "==", universityId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const saveReview = async (review: Omit<Review, "id">) => {
  try {
    const collRef = collection(db, "reviews");
    await addDoc(collRef, {
      ...review,
      createdAt: serverTimestamp() // Overriding standard createdAt just in case
    });
    return true;
  } catch (error) {
    console.error("Error saving review:", error);
    return false;
  }
};
