// ============================================================
// EduDiscovery V3 — Personalized Recommendation Engine
// Reads user activity from Firestore and returns ranked colleges
// ============================================================
import dotenv from 'dotenv';
import admin, { db } from './firebaseAdmin.js';

dotenv.config();

export default async function recommendHandler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, universities } = req.body;

    if (!universities || !Array.isArray(universities)) {
      return res.status(400).json({ error: 'universities array required' });
    }

    // 1. Fetch user activity
    let recentViews = [];
    let recentSearches = [];

    if (userId) {
      try {
        const snap = await db.collection('user_activity').doc(userId).get();
        if (snap.exists) {
          const data = snap.data();
          recentViews = data.recentViews || [];
          recentSearches = data.recentSearches || [];
        }
      } catch (err) {
        console.warn('[recommend] Firestore fetch failed, using defaults:', err.message);
      }
    }

    const viewedIds = new Set(recentViews.map(v => v.collegeId));

    // 2. Build a tag/city affinity profile from viewed colleges
    const viewedColleges = universities.filter(u => viewedIds.has(u.id));
    const affinityTags = new Set(viewedColleges.flatMap(u => u.tags || []));
    const affinityCities = new Set(viewedColleges.map(u => u.city));

    // 3. Extract any explicit branch/city from searches
    const searchKeywords = recentSearches
      .map(s => s.query.toLowerCase())
      .join(' ');
    const BRANCH_KEYWORDS = ['cse', 'ece', 'eee', 'mechanical', 'civil', 'ai', 'biotech', 'it'];
    const foundBranchKeyword = BRANCH_KEYWORDS.find(k => searchKeywords.includes(k));

    // 4. Score each university by affinity
    const scored = universities.map(uni => {
      let score = 0;

      // Tag overlap with viewed colleges
      const tagOverlap = (uni.tags || []).filter(t => affinityTags.has(t)).length;
      score += tagOverlap * 15;

      // City affinity
      if (affinityCities.has(uni.city)) score += 20;

      // Search keyword match
      if (foundBranchKeyword) {
        const uniText = [...(uni.tags || []), ...(uni.branches || [])].join(' ').toLowerCase();
        if (uniText.includes(foundBranchKeyword)) score += 25;
      }

      // NAAC bonus
      const naacBonus = { 'A++': 20, 'A+': 15, 'A': 10, 'B++': 5, 'B+': 3 };
      score += naacBonus[uni.naac] || 0;

      // ROI bonus (inline compute)
      const feeValues = uni.branchFees ? Object.values(uni.branchFees).filter(v => typeof v === 'number' && !isNaN(v)) : [];
      const minFee = feeValues.length > 0
        ? Math.min(...feeValues)
        : 100000;
      const avgPackage = uni.avgPackage || 500000;
      const roi = minFee > 0 && isFinite(minFee) ? avgPackage / (minFee * 4) : 1;
      score += Math.min(15, Math.round(roi * 5));

      // Exclude already viewed unless affinity is very high
      if (viewedIds.has(uni.id)) score -= 30;

      return { ...uni, _recommendScore: score };
    });

    // 5. Sort and return top 6
    const recommendations = scored
      .sort((a, b) => b._recommendScore - a._recommendScore)
      .slice(0, 6)
      .map(({ _recommendScore, ...uni }) => uni);

    return res.status(200).json({
      recommendations,
      hasActivity: recentViews.length > 0,
      recentViews: recentViews.slice(0, 6),
    });

  } catch (error) {
    console.error('[recommend] Error:', error);
    res.status(500).json({ error: error.message });
  }
}
