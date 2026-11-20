# EduDiscovery — Unused Files & Dead Code Report

**Project:** EduDiscovery (v1.0.1)  
**Date:** November 2026  

---

## 1. Classification Methodology

Every file across the repository was classified into one of three standard categories:
1. **SAFE TO REMOVE:** Verified completely unreferenced by routes, components, build scripts, tests, assets, and dynamic imports.
2. **NEEDS INVESTIGATION / CONDITIONAL:** Features or datasets preserved for backward-compatibility, legacy endpoints, or offline development tooling.
3. **KEEP — REQUIRED FOR APPLICATION:** Actively in the dependency graph, required by runtime, data pipeline, tests, or native Capacitor bridge.

---

## 2. Assessment Matrix

| File / Folder | Classification | Evidence & Analysis | Action Taken |
| :--- | :--- | :--- | :--- |
| `src/get_colleges.ts` | **SAFE TO REMOVE** | One-off 6-line file. Not imported anywhere. Duplicated `scripts/export-college-id-catalog.ts`. | **Removed** |
| `src/components/analytics/OfficialCutoffPreview.tsx` | **SAFE TO REMOVE** | 2-line re-export wrapper. No application file imported it. | **Removed** |
| `package.json` (dead scripts) | **SAFE TO REMOVE** | Referred to deleted Python and MJS scripts in `scripts/`. | **Removed entries** |
| `src/pages/PredictorPage.tsx` | **KEEP — ARCHITECTURAL** | Standalone predictor interface. App.tsx redirects `/predictor` to `/web-options`, but the page is maintained for standalone or testing use. | **Retained** |
| `src/utils/predictorEngine.ts` | **KEEP — REQUIRED** | Contains admission likelihood probability engine. | **Retained** |
| `scripts/export-college-id-catalog.ts` | **KEEP — TOOLING** | Developer utility for catalog exports. | **Retained** |
| `gov-data-eapcet/` | **KEEP — STATUTORY DATA** | Source data files, scraper, and verification pipelines for APSCHE/EAPCET data. Essential per data integrity rules. | **Retained** |
| `public/staging_colleges_60.json` | **KEEP — DATA ARCHIVE** | Backup JSON seed file for initial database hydration. | **Retained** |
| `api/` (`firebaseAdmin.js`, `news.js`, `rateLimiter.js`, `seed.js`) | **KEEP — BACKEND** | Active backend endpoints for news proxying, Firestore seeding, and API rate limiting. | **Retained** |
| `android/` | **KEEP — CAPACITOR** | Native Android project files, Gradle build configuration, and Android manifest. | **Retained** |
