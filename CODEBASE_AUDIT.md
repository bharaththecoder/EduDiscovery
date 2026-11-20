# EduDiscovery — Comprehensive Codebase Audit & Architectural Analysis

**Role:** Senior Software Architect, Principal Engineer & Code Quality Specialist  
**Project:** EduDiscovery (v1.0.1)  
**Date:** November 2026  
**Status:** Audit Completed & Checkpoint Established  

---

## 1. Executive Summary

EduDiscovery is an online-first, production-oriented Andhra Pradesh engineering college discovery and statutory admissions counseling platform. It provides high school graduates and parents with official APSCHE/EAPCET closing ranks, category cutoffs (OC, BC, SC, ST, EWS), tuition fee structures, NIRF/NAAC ratings, interactive vector mapping, smart ROI calculation, and Web Options preference generation.

This audit analyzed all **root directories, source files, data pipelines, test suites, API endpoints, build outputs, and dependencies**.

---

## 2. Project Architecture & Dependency Graph

### 2.1 Core Architectural Principles
1. **Online-First Application:** Centrally synchronized with Cloud Firestore, with statutory fallback to verified snapshots (`src/data/universities.ts`, `src/data/officialCutoffSnapshot.ts`). No offline-first bloat or stale cache desynchronization.
2. **Hybrid Web & Native App (Capacitor):** Single unified codebase rendering identically in modern web browsers and natively inside Android APKs via `@capacitor/android` and `@capacitor-firebase/authentication`.
3. **Statutory Data Integrity:** Official APSCHE EAPCET data records (7,267 verified cutoff rows across 60 institutions) are strictly preserved with raw blank/unallotted states and authentic integer bounds.

### 2.2 System Architecture Overview

```
EduDiscovery Client (React 19 + TypeScript + Vite + Tailwind CSS v4)
  │
  ├── App Navigation & State Management
  │     ├── AuthContext (Firebase Web Auth + Capacitor Native Android Auth)
  │     ├── UniversityContext (Firestore sync + verified statutory fallback)
  │     ├── WishlistContext (Firestore cloud sync + guest localStorage)
  │     ├── ThemeContext (System theme + Light/Dark AMOLED modes)
  │     └── ToastContext (Accessible micro-notifications)
  │
  ├── Feature Modules
  │     ├── /home (HomePage: stats, live news, spotlight cards)
  │     ├── /search (SearchPage: instant filter, query intent extraction, CampusMapExplorer)
  │     ├── /university/:id (UniversityDetailPage: FeeCutoffAnalytics, OfficialCutoffsSection)
  │     ├── /web-options (WebOptionsPage: multi-tier preference ordering, statutory cutoffs)
  │     ├── /compare (ComparePage: side-by-side fee, cutoff & applicability comparison)
  │     ├── /profile (ProfilePage: academic profile, career preferences, quiz recommendations)
  │     └── /admin/seed-colleges (AdminSeedPage: secured seeder with ID token verification)
  │
  └── Backend / API Layer
        ├── api-server.js (Local proxy / Express server)
        └── api/
             ├── firebaseAdmin.js (Server-side privileged admin initialization)
             ├── seed.js (Secured Firestore college ingestion)
             ├── news.js (Google News RSS proxy for AP EAPCET counselling updates)
             ├── rateLimiter.js (IP-based sliding rate limiter with Upstash Redis support)
             └── meta.js (Dynamic OpenGraph & meta tag tags)
```

---

## 3. Findings & Codebase Observations

### 3.1 Dead Code & Redundant Files Identified
1. **`src/get_colleges.ts` (REMOVED):** A 6-line temporary scratch file duplicating the `scripts/export-college-id-catalog.ts` script. Removed safely.
2. **`src/components/analytics/OfficialCutoffPreview.tsx` (REMOVED):** An obsolete single-line re-export alias for `OfficialCutoffsSection.tsx`. No components imported it. Removed safely.
3. **Ghost npm scripts in `package.json` (REMOVED):** `data:audit`, `images:download`, and `images:sync` referred to scripts (`fetch_ap_colleges_data.py`, `download_highres_images.py`, `sync-local-images.mjs`) that no longer existed in `scripts/`. Removed safely.
4. **Unused Imports & Variables (CLEANED):** Cleaned up unused imports across `App.tsx`, `AuthContext.tsx`, and `AppUpdateBanner.tsx`.

### 3.2 High-Value Components Retained
- **`src/pages/PredictorPage.tsx` & `src/utils/predictorEngine.ts`:** Retained for backward-compatibility and legacy direct query references, while `/predictor` safely routes to `/web-options`.
- **`gov-data-eapcet/`:** The entire data extraction, validation, and snapshot generation pipeline (`build_official_cutoff_snapshot.mjs`, `scrape_official_cutoffs.mjs`, `validate_dataset.mjs`, etc.) is retained as the authoritative source of truth.
- **`public/data/official-cutoffs/`:** Lazy-loaded compact yearly cutoff datasets (2022, 2023, 2024, manifest) serving zero-bundle-bloat queries on `UniversityDetailPage`.
- **`public/images/colleges/`:** 60 local high-resolution web-optimized college campus photographs.

---

## 4. Security & Compliance Review

1. **Firestore Security Rules (`firestore.rules`):**
   - Strictly enforces per-user read/write isolation (`request.auth.uid == userId`).
   - Limits reviews, wishlists, and profile updates to validated schemas and size constraints.
2. **Admin API Security (`api/seed.js`):**
   - Validates Firebase Admin ID tokens with `admin.auth().verifyIdToken()`.
   - Requires explicit `admin === true` custom claim or matching verified admin email (`ADMIN_EMAIL` / `SECURE_ADMIN_EMAILS`).
3. **Environment Security:**
   - Secrets (`serviceAccountKey.json`, `.env`) are properly ignored in `.gitignore`.
