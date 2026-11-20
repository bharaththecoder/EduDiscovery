# EduDiscovery — Performance & Build Metrics Report

**Project:** EduDiscovery (v1.0.1)  
**Date:** November 2026  
**Environment:** Vite 8.1.5 + React 19 + Rollup Chunking  

---

## 1. Production Build Baseline vs. Post-Cleanup

### 1.1 Build Execution Time
- **Baseline Build Time:** 2.81 seconds (2,825 modules transformed)
- **Post-Cleanup Build Time:** 1.78 seconds (2,825 modules transformed)
- **Result:** ~36% faster production compilation.

### 1.2 Chunk Size Breakdown

| Asset File | Size | Gzip Size | Chunk Type |
| :--- | :---: | :---: | :--- |
| `dist/index.html` | 2.62 kB | 1.04 kB | HTML Document |
| `dist/assets/index-*.css` | 77.57 kB | 15.36 kB | Global CSS Stylesheet |
| `dist/assets/Skeleton-*.js` | 0.46 kB | 0.30 kB | UI Primitive |
| `dist/assets/activityTracker-*.js` | 0.82 kB | 0.44 kB | Analytics Service |
| `dist/assets/rolldown-runtime-*.js` | 0.87 kB | 0.50 kB | Runtime Helper |
| `dist/assets/metadataService-*.js` | 1.20 kB | 0.44 kB | SEO / Meta Service |
| `dist/assets/firebase-CoP1SAeH.js` | 1.41 kB | 0.79 kB | Firebase Web Client Wrapper |
| `dist/assets/intelligenceEngine-*.js` | 3.44 kB | 1.68 kB | ROI & Scoring Engine |
| `dist/assets/NotFoundPage-*.js` | 3.93 kB | 1.48 kB | Lazy Route |
| `dist/assets/WishlistPage-*.js` | 5.67 kB | 1.89 kB | Lazy Route |
| `dist/assets/AdminSeedPage-*.js` | 7.84 kB | 2.96 kB | Lazy Admin Route |
| `dist/assets/Animation3DComponents-*.js` | 8.15 kB | 3.21 kB | Framer Motion Animations |
| `dist/assets/UniversityCard-*.js` | 10.37 kB | 3.57 kB | Core Card Component |
| `dist/assets/icons-vendor-*.js` | 19.36 kB | 6.86 kB | Lucide Icons Vendor Chunk |
| `dist/assets/LandingPage-*.js` | 20.03 kB | 5.66 kB | Public Landing Page |
| `dist/assets/ComparePage-*.js` | 22.72 kB | 6.74 kB | Lazy Route |
| `dist/assets/HomePage-*.js` | 28.77 kB | 8.52 kB | Lazy Route |
| `dist/assets/ProfilePage-*.js` | 31.68 kB | 9.14 kB | Lazy Route |
| `dist/assets/SearchPage-*.js` | 35.13 kB | 9.62 kB | Guest & User Search Route |
| `dist/assets/index-*.js` | 36.23 kB | 10.98 kB | Application Entrypoint |
| `dist/assets/vendor-*.js` | 69.30 kB | 23.54 kB | Shared Utilities & Vendors |
| `dist/assets/admissionApplicability-*.js` | 77.47 kB | 8.46 kB | Statutory Channel Registry |
| `dist/assets/UniversityDetailPage-*.js` | 96.65 kB | 25.63 kB | Lazy Route |
| `dist/assets/motion-vendor-*.js` | 128.26 kB | 41.90 kB | Framer Motion Vendor Chunk |
| `dist/assets/react-vendor-*.js` | 178.32 kB | 56.34 kB | React / React-DOM / Router Chunk |
| `dist/assets/WebOptionsPage-*.js` | 192.37 kB | 47.28 kB | Web Options Engine & Assistant |
| `dist/assets/universities-*.js` | 249.83 kB | 27.26 kB | Official 60-College Dataset Chunk |
| `dist/assets/charts-vendor-*.js` | 421.97 kB | 118.38 kB | Recharts Vendor Chunk |
| `dist/assets/firebase-fuJaKWfk.js` | 642.64 kB | 190.98 kB | Firebase SDK Chunk |

---

## 2. Performance Architecture Strengths

1. **Strict Code Splitting:** Heavy vendor packages (`recharts`, `framer-motion`, `firebase`, `lucide-react`) are isolated into dedicated vendor chunks via `vite.config.js` manualChunks.
2. **Resilient Dynamic Imports:** Routes use `lazyWithRetry()` with chunk reload recovery in case of stale cache or network hiccups.
3. **On-Demand Cutoff Datasets:** Yearly official cutoff records (`public/data/official-cutoffs/{year}.json`) are loaded on-demand via fetch, preventing 1.5MB+ of JSON data from blocking the initial page load.
