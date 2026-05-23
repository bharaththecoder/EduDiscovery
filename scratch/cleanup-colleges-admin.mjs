import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import readline from "readline";

// Initialize Firebase Admin with Service Account
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const normalizeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Remove punctuation
    .replace(/\b(university|college|institute|engineering|technology|of|and|the)\b/g, "") // Remove common suffixes/words
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
};

const getScore = (docData) => {
  let score = Object.keys(docData).length;
  if (docData.embedding) score += 1000; // Prioritize those with embeddings
  return score;
};

async function cleanupColleges() {
  console.log("🚀 Starting colleges collection cleanup (Admin Mode)...");
  
  const querySnapshot = await db.collection("colleges").get();
  const allDocs = [];
  querySnapshot.forEach((doc) => {
    allDocs.push({ id: doc.id, ...doc.data() });
  });

  console.log(`📊 Total documents fetched: ${allDocs.length}`);

  const groups = {};
  
  allDocs.forEach((college) => {
    const normalizedName = normalizeName(college.name || college.universityName);
    const city = (college.city || "").toLowerCase().trim();
    const key = `${normalizedName}|${city}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(college);
  });

  const toKeep = [];
  const toDelete = [];

  Object.entries(groups).forEach(([key, group]) => {
    if (group.length > 1) {
      // Sort by score descending
      group.sort((a, b) => getScore(b) - getScore(a));
      
      const winner = group[0];
      const losers = group.slice(1);
      
      toKeep.push(winner);
      losers.forEach(l => toDelete.push(l));
      
      console.log(`\n🔍 Duplicate Group found for: ${key}`);
      console.log(`   ✅ KEEP:   ${winner.id} (${winner.name}) - Score: ${getScore(winner)}`);
      losers.forEach(l => {
        console.log(`   ❌ DELETE: ${l.id} (${l.name}) - Score: ${getScore(l)}`);
      });
    } else {
      toKeep.push(group[0]);
    }
  });

  console.log("\n-------------------------------------------");
  console.log(`📈 Summary:`);
  console.log(`   Total Unique Colleges to Keep: ${toKeep.length}`);
  console.log(`   Total Duplicates to Delete:   ${toDelete.length}`);
  console.log("-------------------------------------------\n");

  if (toDelete.length === 0) {
    console.log("✨ No duplicates found. Nothing to delete.");
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const dryRun = process.env.DRY_RUN !== "false";

  if (dryRun) {
    console.log("⚠️  DRY RUN ENABLED. No deletions will be performed.");
    console.log("💡 To perform actual deletions, run with: DRY_RUN=false node scratch/cleanup-colleges-admin.mjs");
    rl.close();
    process.exit(0);
  }

  rl.question(`⚠️  ARE YOU SURE you want to delete ${toDelete.length} documents? (type 'yes' to confirm): `, async (answer) => {
    if (answer.toLowerCase() === "yes") {
      console.log("🗑️  Deleting documents in batches...");
      
      const BATCH_SIZE = 500;
      for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const currentBatch = toDelete.slice(i, i + BATCH_SIZE);
        
        currentBatch.forEach((item) => {
          batch.delete(db.collection("colleges").doc(item.id));
        });
        
        await batch.commit();
        console.log(`   ✅ Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
      }
      
      console.log("\n✨ Cleanup complete!");
    } else {
      console.log("❌ Cleanup cancelled.");
    }
    rl.close();
    process.exit(0);
  });
}

cleanupColleges().catch(console.error);
