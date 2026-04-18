import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Safety check: Don't initialize if API Key is placeholder or missing
const isConfigValid = firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== 'placeholder_key' && 
                     !firebaseConfig.apiKey.includes('your_api_key');

if (!isConfigValid) {
  console.warn("Firebase configuration is missing or invalid. Please check your .env file.");
}

const app = isConfigValid ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : ({} as any);
export const storage = app ? getStorage(app) : ({} as any);
export const analytics = (app && typeof window !== 'undefined') ? getAnalytics(app) : null;
