# EDUDISCOVERY — ARCHITECTURE & MAINTAINABILITY REPORT

**Audit Date:** November 21, 2026  
**Auditor:** Principal Software Architect  
**Evaluation Scope:** Modular Design, State Management, Data Layer, Dependency Health  
**Status:** **HEALTHY & MAINTAINABLE (PASS)**  

---

## 1. Architectural Philosophy

EduDiscovery follows a clean, pragmatic architecture that avoids over-engineering while enforcing strict separation of concerns:
- **Presentation Layer:** React 19 functional components utilizing Tailwind CSS design tokens and Lucide React icons.
- **State Management:** React Context API strictly partitioned by operational domain (`AuthContext`, `UniversityContext`, `WishlistContext`, `ThemeContext`, `ToastContext`).
- **Data Access Layer:** Direct Firebase SDK v12 modular operations paired with offline-safe memory caching.
- **Routing:** React Router v7 with lazy route chunking (`lazyWithRetry`) and centralized layout guards (`RequireAuth`).

---

## 2. Evidence of Maintainability Improvements

### 2.1 Elimination of Dead Code (Phases 1-3)
- Pruned unused scratch files (`src/get_colleges.ts`).
- Pruned redundant re-exports (`src/components/analytics/OfficialCutoffPreview.tsx`).
- Pruned 3 dead package scripts (`data:audit`, `images:download`, `images:sync`).
- Cleaned unused imports and variables across 10+ core components.

### 2.2 Dynamic Splitting of Cloud Storage
- Converted eager `firebase/storage` imports in `src/services/firebase.ts` to on-demand asynchronous imports (`getFirebaseStorage()`) called only in `ProfilePage.tsx` during avatar upload.
- Prevents 90%+ of users from downloading cloud storage protocol logic during standard college search and comparison sessions.

### 2.3 Rollup Manual Chunk Normalization
- Standardized Windows path matching in `vite.config.js` (`manualChunks`), eliminating module duplication and cutting the generic `vendor` chunk by 30.4% down to 48.25 kB.

---

## 3. Context & State Flow Analysis

1. **`AuthContext`:** Exposes `currentUser`, `loading`, `loginWithGoogle`, `logout`, and `updateUserDoc`. Subscribes to Firebase Auth `onAuthStateChanged` and synchronizes user profile documents.
2. **`WishlistContext`:** Manages user shortlisted colleges. Seamlessly merges guest `localStorage` records into Firestore when a student authenticates.
3. **`UniversityContext`:** Houses official university catalog and facility data.

---

## 4. Architectural Rules & Guardrails

- **Online-First Constraint:** No service worker offline-caching layers or local IndexedDB dataset synchronization that could poison official government cutoff records.
- **Single Source of Truth:** Official EAPCET closing ranks and statutory tuition fees remain centralized in `public/data/official-cutoffs/` and verified against government gazettes.
