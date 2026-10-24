import { db } from "./firebaseAdmin.js";

// In-memory cache for fast metadata resolution
const metaCache = new Map();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing university id parameter' });
  }

  const normalizedId = decodeURIComponent(id).trim().toLowerCase();

  // Check cache first
  if (metaCache.has(normalizedId)) {
    const cached = metaCache.get(normalizedId);
    return res.status(200).json(cached);
  }

  try {
    const docSnap = await db.collection('colleges').doc(normalizedId).get();
    let data = docSnap.exists ? docSnap.data() : null;

    if (!data) {
      // Try by matching shortName or ID without hyphens
      const querySnap = await db.collection('colleges')
        .where('shortName', '==', id.toUpperCase())
        .limit(1)
        .get();
      if (!querySnap.empty) {
        data = querySnap.docs[0].data();
      }
    }

    if (!data) {
      return res.status(404).json({ error: 'University not found' });
    }

    const metadata = {
      title: `${data.name} (${data.shortName || data.city}) - Fees, Placements & Admission 2026 | EduDiscovery`,
      description: `${data.name} in ${data.city}, AP. NAAC ${data.naac || 'A'}, verified placements (${(data.placements || []).slice(0, 2).map(p => `${p.company} ${p.package}`).join(', ') || 'N/A'}), and admission guidance.`,
      image: data.image || 'https://edu-discovery.vercel.app/pwa-512x512.png',
      url: `https://edu-discovery.vercel.app/university/${encodeURIComponent(normalizedId)}`,
      siteName: 'EduDiscovery AP',
      city: data.city,
      naac: data.naac
    };

    metaCache.set(normalizedId, metadata);
    return res.status(200).json(metadata);
  } catch (error) {
    console.error('[MetaAPI] Failed to fetch university metadata:', error);
    return res.status(500).json({ error: 'Internal server error resolving metadata' });
  }
}
