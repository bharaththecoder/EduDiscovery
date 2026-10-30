// src/services/collegeQueries.ts
// Efficient Online-First Firestore Query Service for AP Colleges (EduDiscovery)
// Queries live Firestore 'colleges' collection with deduplicated in-memory singleton session cache.
// Zero stale localStorage collisions, zero synthetic multipliers.

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, isFirestoreReady } from './firebase';
import type { University, BranchCutoff, CategoryCutoffs } from '@/types';
import { universities as fallbackColleges } from '@/data/universities';

let inMemoryColleges: University[] | null = null;
let activeFetchPromise: Promise<University[]> | null = null;

/**
 * Fetch all colleges online from Firestore.
 * Uses an in-memory session singleton with concurrent request deduplication.
 * Does NOT write college list arrays to localStorage to prevent mid-scroll state swaps and scroll resets.
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
    // 1. Direct Live Firestore Query
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
            return remoteColleges;
          }
        }
      }
    } catch (err) {
      console.warn('[collegeQueries] Live Firestore fetch failed, falling back to verified statutory dataset:', err);
    }

    // 2. Verified Statutory Fallback
    inMemoryColleges = fallbackColleges;
    return fallbackColleges;
  })().finally(() => {
    activeFetchPromise = null;
  });

  return activeFetchPromise;
}

/**
 * Clear in-memory session cache for colleges
 */
export function clearCollegesCache(): void {
  inMemoryColleges = null;
}

/**
 * Query a single college document by ID from Firestore with memory check
 */
export async function getCollegeById(id: string): Promise<University | undefined> {
  if (!id) return undefined;
  const normalizedId = id.trim().toLowerCase();

  // 1. Check in-memory session cache
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
  return colleges.filter(c => (c.convenerFee || 70000) <= maxFee);
}

/**
 * Helper to get the specific closing cutoff rank for a given category and gender.
 * Strictly uses authentic recorded numbers. Zero synthetic multipliers.
 */
export function getCategoryCutoff(
  cutoff: BranchCutoff,
  category: string,
  gender: string,
  year?: '2024' | '2023' | '2022'
): number | null {
  const isFemale = gender.toLowerCase() === 'female' || gender.toLowerCase() === 'girls';
  const cat = category.toUpperCase().trim();

  // If a specific year is requested and historicalStatements exist, use that statement
  const targetRecord: CategoryCutoffs = (year && cutoff.historicalStatements && cutoff.historicalStatements[year])
    ? cutoff.historicalStatements[year]
    : cutoff;

  let val: number | null | undefined = null;

  if (cat === 'OC' || cat === 'GENERAL') {
    val = isFemale ? (targetRecord.ocGirls ?? targetRecord.ocBoys) : targetRecord.ocBoys;
  } else if (cat === 'EWS') {
    val = isFemale ? (targetRecord.ewsGirls ?? targetRecord.ewsBoys ?? targetRecord.ews) : (targetRecord.ewsBoys ?? targetRecord.ews);
  } else if (cat === 'BC-A' || cat === 'BCA') {
    val = isFemale ? (targetRecord.bcAGirls ?? targetRecord.bcABoys ?? targetRecord.bcA) : (targetRecord.bcABoys ?? targetRecord.bcA);
  } else if (cat === 'BC-B' || cat === 'BCB') {
    val = isFemale ? (targetRecord.bcBGirls ?? targetRecord.bcBBoys ?? targetRecord.bcB) : (targetRecord.bcBBoys ?? targetRecord.bcB);
  } else if (cat === 'BC-C' || cat === 'BCC') {
    val = isFemale ? (targetRecord.bcCGirls ?? targetRecord.bcCBoys ?? targetRecord.bcC) : (targetRecord.bcCBoys ?? targetRecord.bcC);
  } else if (cat === 'BC-D' || cat === 'BCD') {
    val = isFemale ? (targetRecord.bcDGirls ?? targetRecord.bcDBoys ?? targetRecord.bcD) : (targetRecord.bcDBoys ?? targetRecord.bcD);
  } else if (cat === 'BC-E' || cat === 'BCE') {
    val = isFemale ? (targetRecord.bcEGirls ?? targetRecord.bcEBoys ?? targetRecord.bcE) : (targetRecord.bcEBoys ?? targetRecord.bcE);
  } else if (cat === 'SC') {
    val = isFemale ? (targetRecord.scGirls ?? targetRecord.scBoys ?? targetRecord.sc) : (targetRecord.scBoys ?? targetRecord.sc);
  } else if (cat === 'ST') {
    val = isFemale ? (targetRecord.stGirls ?? targetRecord.stBoys ?? targetRecord.st) : (targetRecord.stBoys ?? targetRecord.st);
  }

  // If specific category is unallotted, fall back strictly to General OC closing rank without fake multipliers
  if (val === null || val === undefined) {
    val = isFemale ? (targetRecord.ocGirls ?? targetRecord.ocBoys) : targetRecord.ocBoys;
  }

  return val ?? null;
}
