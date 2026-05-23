import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
  });
}
const db = admin.firestore();

async function check() {
  const docRef = db.collection("colleges").doc("nri-institute");
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    console.log("NRI Institute Programs in Firestore:");
    console.log(JSON.stringify(docSnap.data().programs, null, 2));
  } else {
    console.log("Not found in Firestore");
  }
  process.exit(0);
}

check();
