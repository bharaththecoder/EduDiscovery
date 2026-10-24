// src/services/collegeQueries.ts
// Efficient Firestore Query Service for AP Colleges (EduDiscovery)
// Directly queries Firestore 'colleges' collection with tiered caching & fast offline fallback

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, isFirestoreReady } from './firebase';
import type { University, BranchCutoff } from '@/types';
import { universities as fallbackColleges } from '@/data/universities';

const CACHE_KEY = 'edudiscovery_firestore_colleges_v2';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache TTL

interface CacheEnvelope {
  timestamp: number;
  data: University[];
}

let inMemoryColleges: University[] | null = null;
let activeFetchPromise: Promise<University[]> | null = null;

/**
 * Fetch all colleges directly from Firestore with 2-tier caching:
 * 1. Fast in-memory singleton
 * 2. LocalStorage cache envelope
 * 3. Live Firestore collection('colleges') query
 * 4. Fallback dataset if unconfigured/offline
 */
export async function getAllColleges(forceRefresh = false): Promise<University[]> {
  if (!forceRefresh && inMemoryColleges && inMemoryColleges.length > 0) {
    return inMemoryColleges;
  }

  // Deduplicate concurrent requests
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    // Check localStorage cache first if not force refreshed
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const envelope: CacheEnvelope = JSON.parse(cachedRaw);
          if (Date.now() - envelope.timestamp < CACHE_TTL_MS && envelope.data?.length > 0) {
            inMemoryColleges = envelope.data;
            return envelope.data;
          }
        }
      } catch (e) {
        console.warn('[collegeQueries] Failed to read localStorage cache:', e);
      }
    }

    // Direct Firestore Query
    try {
      if (isFirestoreReady(db)) {
        const colRef = collection(db, 'colleges');
        const snap = await getDocs(colRef);
        
        if (!snap.empty) {
          const remoteColleges = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as University[];

          if (remoteColleges.length > 0) {
            inMemoryColleges = remoteColleges;
            if (typeof window !== 'undefined') {
              try {
                const envelope: CacheEnvelope = {
                  timestamp: Date.now(),
                  data: remoteColleges
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
              } catch (storageErr) {
                console.warn('[collegeQueries] LocalStorage quota exceeded:', storageErr);
              }
            }
            return remoteColleges;
          }
        }
      }
    } catch (err) {
      console.error('[collegeQueries] Firestore fetch failed, falling back to bundled dataset:', err);
    }

    // Bundled fallback
    inMemoryColleges = fallbackColleges;
    return fallbackColleges;
  })().finally(() => {
    activeFetchPromise = null;
  });

  return activeFetchPromise;
}

/**
 * Query a single college document by ID from Firestore with memory check
 */
export async function getCollegeById(id: string): Promise<University | undefined> {
  if (!id) return undefined;
  const normalizedId = id.trim().toLowerCase();

  // 1. Check in-memory list
  if (inMemoryColleges) {
    const found = inMemoryColleges.find(c => c.id.toLowerCase() === normalizedId);
    if (found) return found;
  }

  // 2. Query Firestore document directly
  try {
    if (isFirestoreReady(db)) {
      const docRef = doc(db, 'colleges', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const item = { id: snap.id, ...snap.data() } as University;
        return item;
      }
    }
  } catch (e) {
    console.warn(`[collegeQueries] Direct getDoc failed for ${id}:`, e);
  }

  // 3. Fallback
  return fallbackColleges.find(c => c.id.toLowerCase() === normalizedId);
}

/**
 * Query colleges by AP Region (AU Region, SVU Region, Statewide)
 */
export async function getCollegesByRegion(region: 'AU' | 'SVU' | 'Statewide'): Promise<University[]> {
  const colleges = await getAllColleges();
  return colleges.filter(c => c.region === region || (region !== 'Statewide' && c.region === 'Statewide'));
}

/**
 * Query colleges by city or district
 */
export async function getCollegesByCity(city: string): Promise<University[]> {
  const colleges = await getAllColleges();
  const searchCity = city.trim().toLowerCase();
  return colleges.filter(c => c.city.toLowerCase() === searchCity);
}

/**
 * Query colleges within maximum Category-A Convenor Fee
 */
export async function getCollegesByMaxConvenerFee(maxFee: number): Promise<University[]> {
  const colleges = await getAllColleges();
  return colleges.filter(c => (c.convenerFee || 65000) <= maxFee);
}

/**
 * Helper to get the specific closing cutoff rank for a given category and gender
 */
export function getCategoryCutoff(cutoff: BranchCutoff, category: string, gender: string): number {
  const isFemale = gender.toLowerCase() === 'female' || gender.toLowerCase() === 'girls';
  const cat = category.toUpperCase().trim();

  if (cat === 'OC' || cat === 'GENERAL') {
    return isFemale ? (cutoff.ocGirls || cutoff.ocBoys) : cutoff.ocBoys;
  }
  if (cat === 'EWS') {
    return cutoff.ews || Math.round(cutoff.ocBoys * 1.15);
  }
  if (cat === 'BC-A' || cat === 'BCA') {
    return cutoff.bcA || Math.round(cutoff.ocBoys * 1.7);
  }
  if (cat === 'BC-B' || cat === 'BCB') {
    return cutoff.bcB || Math.round(cutoff.ocBoys * 1.55);
  }
  if (cat === 'BC-C' || cat === 'BCC') {
    return cutoff.bcA || Math.round(cutoff.ocBoys * 1.6);
  }
  if (cat === 'BC-D' || cat === 'BCD') {
    return cutoff.bcD || Math.round(cutoff.ocBoys * 1.6);
  }
  if (cat === 'BC-E' || cat === 'BCE') {
    return cutoff.bcE || Math.round(cutoff.ocBoys * 1.85);
  }
  if (cat === 'SC') {
    return cutoff.sc || Math.round(cutoff.ocBoys * 3.8);
  }
  if (cat === 'ST') {
    return cutoff.st || Math.round(cutoff.ocBoys * 5.5);
  }

  return isFemale ? (cutoff.ocGirls || cutoff.ocBoys) : cutoff.ocBoys;
}
