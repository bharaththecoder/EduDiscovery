import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, getFirestore, memoryLocalCache, type Firestore } from "firebase/firestore";
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
const isConfigValid = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'placeholder_key' && 
  !firebaseConfig.apiKey.includes('your_api_key') &&
  firebaseConfig.projectId
);

if (!isConfigValid) {
  console.warn("[Firebase] Configuration missing or invalid. Offline/fallback mode active.");
}

let app: any = null;
if (isConfigValid) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("[Firebase] Initialization error:", e);
  }
}

export const isFirebaseConfigured = Boolean(app);

export const auth = app ? getAuth(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore safely with memory cache, handling HMR rebuilds gracefully
let firestoreDb: any = null;
if (app) {
  try {
    firestoreDb = initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  } catch {
    try {
      firestoreDb = getFirestore(app);
    } catch (e) {
      console.warn("[Firebase] Firestore initialization error:", e);
    }
  }
}

export const db: Firestore = firestoreDb || ({} as any);

/**
 * Checks whether the Firestore database is valid and ready for read/write queries
 */
export function isFirestoreReady(database: any = db): boolean {
  if (!database || typeof database !== 'object' || Object.keys(database).length === 0) return false;
  try {
    return Boolean(
      (database.type === 'firestore' || database.type === 'firestore-instance') &&
      database.app &&
      (database._databaseId || typeof database.toJSON === 'function')
    );
  } catch {
    return false;
  }
}

export const storage = app ? getStorage(app) : ({} as any);
export const analytics = (app && typeof window !== 'undefined') ? getAnalytics(app) : null;
