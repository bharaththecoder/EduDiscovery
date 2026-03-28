import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpqfLnB-zoQnZdBHv9CLYcq5Dn0MxE0rY4",
  authDomain: "edudiscovery-9cff0.firebaseapp.com",
  projectId: "edudiscovery-9cff0",
  storageBucket: "edudiscovery-9cff0.appspot.com",
  messagingSenderId: "532876157550",
  appId: "1:532876157550:web:e5755fb155cdf95f84fc7f",
  measurementId: "G-5CDTPRN1GR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);