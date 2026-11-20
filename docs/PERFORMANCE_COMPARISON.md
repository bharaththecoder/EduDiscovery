# EduDiscovery — Performance Comparison & Build Metrics

**Project:** EduDiscovery (v1.0.1)  
**Date:** November 2026  
**Tooling:** Vite 8.1.5 + React 19 + Rollup / Rolldown Chunking  

---

## 1. Build Duration Metrics

| Metric | Original Baseline | Post-Optimization | Improvement |
| :--- | :---: | :---: | :---: |
| **Transform & Render Duration** | 2.81 s | **2.48 s** | **~12% faster** |
| **Modules Transformed** | 2,825 | 2,825 | Clean modular tree |
| **Lint Duration** | 4.80 s (48 warnings) | **1.20 s (0 warnings)** | **75% faster / Clean** |

---

## 2. Production Chunk Size Breakdown

| Asset File | Size (Raw) | Gzip Size | Cache Policy / Loading Behavior |
| :--- | :---: | :---: | :--- |
| `dist/index.html` | 2.62 kB | 1.04 kB | Entrypoint Document |
| `dist/assets/index-*.css` | 77.57 kB | 15.36 kB | Global Design Tokens & Styles |
| `dist/assets/Skeleton-*.js` | 0.46 kB | 0.30 kB | UI Primitive Chunk |
| `dist/assets/activityTracker-*.js` | 0.82 kB | 0.44 kB | Interaction Service |
| `dist/assets/rolldown-runtime-*.js` | 0.87 kB | 0.50 kB | Runtime Helper |
| `dist/assets/metadataService-*.js` | 1.20 kB | 0.44 kB | SEO / OpenGraph Helper |
| `dist/assets/firebase-CoP1SAeH.js` | 1.41 kB | 0.79 kB | Firebase Web Client Wrapper |
| `dist/assets/intelligenceEngine-*.js` | 3.44 kB | 1.68 kB | ROI Scoring Utility |
| `dist/assets/NotFoundPage-*.js` | 3.93 kB | 1.48 kB | Lazy Route Chunk |
| `dist/assets/WishlistPage-*.js` | 5.67 kB | 1.89 kB | Lazy Route Chunk |
| `dist/assets/AdminSeedPage-*.js` | 7.84 kB | 2.96 kB | Lazy Route Chunk |
| `dist/assets/Animation3DComponents-*.js`| 8.15 kB | 3.21 kB | Motion Components Chunk |
| `dist/assets/UniversityCard-*.js` | 10.37 kB | 3.57 kB | Core Card Component Chunk |
| `dist/assets/icons-vendor-*.js` | 19.36 kB | 6.86 kB | Lucide React Vendor Chunk |
| `dist/assets/LandingPage-*.js` | 20.02 kB | 5.66 kB | Public Route Chunk |
| `dist/assets/ComparePage-*.js` | 22.72 kB | 6.74 kB | Lazy Route Chunk |
| `dist/assets/HomePage-*.js` | 28.77 kB | 8.52 kB | Lazy Route Chunk |
| `dist/assets/ProfilePage-*.js` | 31.68 kB | 9.13 kB | Lazy Route Chunk |
| `dist/assets/SearchPage-*.js` | 35.13 kB | 9.62 kB | Public Discovery Route Chunk |
| `dist/assets/index-*.js` | 36.23 kB | 10.97 kB | Main Application Entrypoint |
| `dist/assets/vendor-*.js` | 69.30 kB | 23.54 kB | Shared Vendor Chunk |
| `dist/assets/admissionApplicability-*.js`| 77.47 kB | 8.46 kB | Institutional Channel Registry |
| `dist/assets/UniversityDetailPage-*.js` | 96.65 kB | 25.63 kB | Lazy Route Chunk |
| `dist/assets/motion-vendor-*.js` | 128.26 kB | 41.90 kB | Framer Motion Vendor Chunk |
| `dist/assets/react-vendor-*.js` | 178.32 kB | 56.34 kB | React / React-DOM / Router Chunk |
| `dist/assets/WebOptionsPage-*.js` | 192.37 kB | 47.28 kB | Counseling Assistant Route Chunk |
| `dist/assets/universities-*.js` | 249.83 kB | 27.26 kB | Master 60-College Dataset Chunk |
| `dist/assets/charts-vendor-*.js` | 421.97 kB | 118.38 kB | Recharts Vendor Chunk (On-demand) |
| `dist/assets/firebase-fuJaKWfk.js` | 642.64 kB | 190.98 kB | Firebase SDK Chunk |

---

## 3. Key Performance Achievements

1. **Zero Critical Warnings:** ESLint now runs with **0 errors and 0 warnings** across all files.
2. **Clean Dynamic Splitting:** Heavy visualization libraries (`recharts`) and motion modules are completely decoupled from initial page load.
3. **On-Demand Cutoff Data Architecture:** Yearly cutoff datasets (`2022.json`, `2023.json`, `2024.json`) load via `fetch()` only when the cutoff explorer is opened.
