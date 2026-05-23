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

async function run() {
  const snapshot = await db.collection("colleges").get();
  const colleges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log("Total colleges in Firestore:", colleges.length);
  
  const targetNames = ["Acharya Nagarjuna", "KL University", "NRI Institute"];
  
  colleges.forEach(c => {
    const matched = targetNames.some(t => c.name && c.name.includes(t));
    if (matched) {
      console.log(`\nCollege: "${c.name}"`);
      console.log(`ID: "${c.id}"`);
      console.log(`City: "${c.city}"`);
      console.log(`State: "${c.state}"`);
      console.log(`Has embedding field: ${!!c.embedding}`);
      if (c.embedding) {
        console.log(`Embedding length: ${c.embedding.length}`);
      }
    }
  });
}

run().catch(console.error);
