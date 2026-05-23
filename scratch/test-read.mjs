import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRead() {
  try {
    console.log("Reading from 'colleges'...");
    const q = query(collection(db, "colleges"), limit(1));
    const querySnapshot = await getDocs(q);
    console.log(`Success! Found ${querySnapshot.size} documents.`);
  } catch (error) {
    console.error("Read failed:", error.message);
  }
}

testRead();
