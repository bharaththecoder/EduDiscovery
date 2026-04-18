// ============================================================
// EduDiscovery V3 — Activity Tracker Service
// Writes user behavior events to Firestore user_activity docs
// ============================================================
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

interface ActivityEvent {
  collegeId: string;
  name: string;
  image?: string;
  city?: string;
  timestamp: number;
}

interface SearchEvent {
  query: string;
  timestamp: number;
}

interface UserActivity {
  recentViews: ActivityEvent[];
  recentSearches: SearchEvent[];
}

const MAX_RECENT = 15;

// Helper: merge new event into front of array, deduplicate, cap at MAX_RECENT
function mergeEvent<T extends { timestamp: number }>(
  arr: T[],
  newEvent: T,
  key: keyof T
): T[] {
  const filtered = arr.filter(e => e[key] !== newEvent[key]);
  return [newEvent, ...filtered].slice(0, MAX_RECENT);
}

// ─── Track a college view ─────────────────────────────────────
export async function trackView(
  userId: string,
  college: { id: string; name: string; image?: string; city?: string }
): Promise<void> {
  if (!userId || !college?.id) return;
  try {
    const ref = doc(db, 'user_activity', userId);
    const snap = await getDoc(ref);
    const existing: UserActivity = snap.exists()
      ? (snap.data() as UserActivity)
      : { recentViews: [], recentSearches: [] };

    const newEvent: ActivityEvent = {
      collegeId: college.id,
      name: college.name,
      image: college.image,
      city: college.city,
      timestamp: Date.now(),
    };

    const updated: UserActivity = {
      ...existing,
      recentViews: mergeEvent(existing.recentViews || [], newEvent, 'collegeId'),
    };

    await setDoc(ref, updated, { merge: true });
  } catch (err) {
    // Non-critical — fail silently
    console.warn('[activityTracker] trackView failed:', err);
  }
}

// ─── Track a search query ─────────────────────────────────────
export async function trackSearch(
  userId: string,
  query: string
): Promise<void> {
  if (!userId || !query?.trim()) return;
  try {
    const ref = doc(db, 'user_activity', userId);
    const snap = await getDoc(ref);
    const existing: UserActivity = snap.exists()
      ? (snap.data() as UserActivity)
      : { recentViews: [], recentSearches: [] };

    const newSearch: SearchEvent = {
      query: query.trim(),
      timestamp: Date.now(),
    };

    const updated: UserActivity = {
      ...existing,
      recentSearches: mergeEvent(
        existing.recentSearches || [],
        newSearch,
        'query'
      ),
    };

    await setDoc(ref, updated, { merge: true });
  } catch (err) {
    console.warn('[activityTracker] trackSearch failed:', err);
  }
}

// ─── Get user activity ────────────────────────────────────────
export async function getActivity(userId: string): Promise<UserActivity> {
  if (!userId) return { recentViews: [], recentSearches: [] };
  try {
    const ref = doc(db, 'user_activity', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as UserActivity;
  } catch (err) {
    console.warn('[activityTracker] getActivity failed:', err);
  }
  return { recentViews: [], recentSearches: [] };
}
