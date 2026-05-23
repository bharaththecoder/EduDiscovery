import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  let serviceAccount = null;

  // 1. Try parsing from FIREBASE_SERVICE_ACCOUNT env var (whole JSON string)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e.message);
    }
  }

  // 2. Try parsing individual env vars if FIREBASE_SERVICE_ACCOUNT is not defined
  if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal \n with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    } catch (e) {
      console.error("[FirebaseAdmin] Failed to build credentials from individual env vars:", e.message);
    }
  }

  // 3. Fallback to local file for development
  if (!serviceAccount) {
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      } catch (e) {
        console.error("[FirebaseAdmin] Failed to read local serviceAccountKey.json:", e.message);
      }
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("[FirebaseAdmin] Successfully initialized Firebase Admin using service account.");
  } else {
    // Attempt standard initialization if running in a Google Cloud environment that provides credentials
    admin.initializeApp();
    console.warn("[FirebaseAdmin] Initialized Firebase Admin with default credentials.");
  }
}

export const db = admin.firestore();
export default admin;
