// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQfLnB-zoQnZdBHv9CLYcq5Dn0MxEOrY4",
  authDomain: "edudiscovery-9cff0.firebaseapp.com",
  projectId: "edudiscovery-9cff0",
  storageBucket: "edudiscovery-9cff0.firebasestorage.app",
  messagingSenderId: "532876157550",
  appId: "1:532876157550:web:e5755fb155cdf95f84fc7f",
  measurementId: "G-5CDTPRN1GR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);