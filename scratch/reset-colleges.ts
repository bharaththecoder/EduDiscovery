import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { universities } from '../src/data/universities';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deleteCollection(collectionPath: string, batchSize: number) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query: any, resolve: any) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc: any) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function resetColleges() {
  console.log("🚀 Starting Colleges Collection Reset...");

  // 1. Fetch all document IDs
  console.log("🔍 Fetching all document IDs in 'colleges'...");
  const snapshot = await db.collection('colleges').select().get();
  const docIds = snapshot.docs.map(doc => doc.id);
  console.log(`📊 Found ${docIds.length} documents to delete.`);

  // 2. Delete in smaller batches
  const DELETE_BATCH_SIZE = 10;
  for (let i = 0; i < docIds.length; i += DELETE_BATCH_SIZE) {
    const batch = db.batch();
    const currentBatch = docIds.slice(i, i + DELETE_BATCH_SIZE);
    
    currentBatch.forEach((id) => {
      batch.delete(db.collection('colleges').doc(id));
    });
    
    try {
      await batch.commit();
      console.log(`   ✅ Deleted documents ${i + 1} to ${Math.min(i + DELETE_BATCH_SIZE, docIds.length)}`);
    } catch (e) {
      console.error(`   ❌ Failed to delete batch starting at ${i}:`, e.message);
      // Try one by one if batch fails
      for (const id of currentBatch) {
        await db.collection('colleges').doc(id).delete();
      }
      console.log(`   ✅ Deleted batch ${Math.floor(i / DELETE_BATCH_SIZE) + 1} one by one.`);
    }
  }

  // 3. Upload fresh data from universities.ts
  console.log(`📤 Uploading ${universities.length} universities from local dataset...`);
  
  const UPLOAD_BATCH_SIZE = 50;
  for (let i = 0; i < universities.length; i += UPLOAD_BATCH_SIZE) {
    const batch = db.batch();
    const currentBatch = universities.slice(i, i + UPLOAD_BATCH_SIZE);
    
    currentBatch.forEach((uni) => {
      const docRef = db.collection('colleges').doc(uni.id);
      batch.set(docRef, {
        ...uni,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`   ✅ Uploaded batch ${Math.floor(i / UPLOAD_BATCH_SIZE) + 1}`);
  }

  console.log("\n✨ Reset Complete! Database is now in sync with universities.ts");
  process.exit(0);
}

resetColleges().catch(err => {
  console.error("❌ Error during reset:", err);
  process.exit(1);
});
