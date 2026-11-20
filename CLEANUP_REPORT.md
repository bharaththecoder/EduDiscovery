# EduDiscovery — Codebase Cleanup Report

**Branch:** `chore/codebase-audit-and-cleanup`  
**Execution Date:** November 2026  
**Status:** Completed  

---

## 1. Summary of Actions Taken

| Action Category | Count | Description |
| :--- | :---: | :--- |
| **Deleted Dead Files** | 2 | Removed unused scratch script and legacy redundant wrapper |
| **Cleaned Configuration** | 1 | Purged 3 orphaned script commands from `package.json` |
| **Cleaned Unused Imports** | 3 files | Cleaned unused imports and variables in `App.tsx`, `AuthContext.tsx`, and `AppUpdateBanner.tsx` |
| **Resolved Dependency Inconsistency** | 1 package | Repaired missing internal ESM chunk in `@firebase/firestore` |

---

## 2. Deleted Files

### 1. `src/get_colleges.ts`
- **Reason for Removal:** Temporary scratch script consisting of 6 lines that logged college IDs. It was never imported by the application or tests. The official script is maintained under `scripts/export-college-id-catalog.ts`.
- **Impact:** Zero impact on production build, testing, or runtime behavior.

### 2. `src/components/analytics/OfficialCutoffPreview.tsx`
- **Reason for Removal:** Obsolete 2-line re-export alias (`export { OfficialCutoffsSection as default ... }`). All application consumers directly import `@/components/analytics/OfficialCutoffsSection`.
- **Impact:** Verified with `git grep` that no files imported `OfficialCutoffPreview`.

---

## 3. Modified Files

### 1. `package.json`
- **Change:** Removed `data:audit`, `images:download`, and `images:sync` script entries that pointed to non-existent files.
- **Result:** Cleaner npm script list without dead command pathways.

### 2. `src/app/App.tsx`
- **Change:** Removed unused `useLocation` import from `react-router-dom`.
- **Result:** Decreased ESLint warnings.

### 3. `src/contexts/AuthContext.tsx`
- **Change:** Removed unused `getDoc` import from `firebase/firestore`.
- **Result:** Decreased ESLint warnings.

### 4. `src/components/layout/AppUpdateBanner.tsx`
- **Change:** Removed unused `ExternalLink` import from `lucide-react`.
- **Result:** Decreased bundle overhead and ESLint warnings.

---

## 4. Retained Architectural Components

| Component / File | Status | Architectural Justification |
| :--- | :--- | :--- |
| `src/pages/PredictorPage.tsx` | KEEP | Retained for backward-compatibility while `/predictor` routes to `/web-options`. |
| `src/utils/predictorEngine.ts` | KEEP | Core mathematical ranking algorithm used for predictor calculations. |
| `gov-data-eapcet/` | KEEP | Complete APSCHE ingestion and verification pipeline for statutory admission data. |
| `scripts/export-college-id-catalog.ts` | KEEP | Maintained utility for generating official catalog ID mappings. |
| `api/` | KEEP | Express & Firebase Admin backend endpoints for local development and Vercel serverless. |
