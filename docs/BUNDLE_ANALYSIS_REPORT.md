# EDUDISCOVERY — BUNDLE ANALYSIS REPORT

**Audit Date:** November 21, 2026  
**Tooling:** Vite 8.1.5, Rollup, TypeScript 6.0.2  
**Target Environment:** Web (Vercel) & Native Android (Capacitor 8.5.3)  

---

## 1. Production Bundle Inventory

| Chunk / Asset Name | Raw Size | Gzip Size | Nature / Content | Loading Priority |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` | 2.62 kB | 1.04 kB | Entrypoint HTML + Theme & SW cleanup script | Critical (Render-blocking) |
| `index-*.css` | 77.57 kB | 15.36 kB | Compiled Tailwind CSS styles & animations | Critical (Render-blocking) |
| `rolldown-runtime-*.js` | 0.87 kB | 0.50 kB | Rollup runtime module helpers | Critical |
| `Skeleton-*.js` | 0.46 kB | 0.30 kB | Reusable skeleton primitive | Lazy |
| `activityTracker-*.js` | 0.82 kB | 0.44 kB | User activity logger | Lazy |
| `metadataService-*.js` | 1.20 kB | 0.44 kB | OpenGraph & title metadata updater | Lazy |
| `firebase-*.js` (wrapper) | 1.80 kB | 0.97 kB | Firebase auth/db service accessors | Async |
| `intelligenceEngine-*.js` | 3.44 kB | 1.68 kB | College ROI & Value Score calculator | Async |
| `NotFoundPage-*.js` | 3.93 kB | 1.48 kB | 404 Error page | Lazy route |
| `WishlistPage-*.js` | 5.67 kB | 1.89 kB | User wishlist page | Lazy route |
| `AdminSeedPage-*.js` | 7.84 kB | 2.96 kB | Admin college seeder page | Lazy route |
| `Animation3DComponents-*.js` | 8.15 kB | 3.21 kB | SpotlightCard, RippleButton, badges | Async |
| `UniversityCard-*.js` | 10.37 kB | 3.57 kB | University list card item | Async |
| `icons-vendor-*.js` | 19.36 kB | 6.86 kB | Lucide React tree-shaken SVG icons | Async |
| `LandingPage-*.js` | 20.02 kB | 5.66 kB | Public landing page | Lazy route |
| `ComparePage-*.js` | 22.76 kB | 6.75 kB | Multi-university comparison view | Lazy route |
| `HomePage-*.js` | 28.77 kB | 8.52 kB | User dashboard / feed | Lazy route |
| `ProfilePage-*.js` | 32.06 kB | 9.28 kB | User profile, tags & picture upload | Lazy route |
| `SearchPage-*.js` | 35.14 kB | 9.62 kB | Main university discovery & filter view | Lazy route |
| `index-*.js` | 36.26 kB | 10.96 kB | Application root, router, & top-level layout | Critical |
| `vendor-*.js` | 48.25 kB | 14.85 kB | Capacitor core & miscellaneous utilities | Async |
| `admissionApplicability-*.js` | 77.47 kB | 8.46 kB | College seat matrix & quota lookup tables | Async |
| `UniversityDetailPage-*.js` | 96.66 kB | 25.62 kB | In-depth university details & reviews | Lazy route |
| `motion-vendor-*.js` | 128.26 kB | 41.90 kB | Framer Motion animation engine | Async |
| `WebOptionsPage-*.js` | 192.38 kB | 47.29 kB | AP EAPCET cutoff analysis & option generator | Lazy route |
| `react-vendor-*.js` | 221.22 kB | 71.09 kB | React 19, ReactDOM, React Router 7 | Critical |
| `universities-*.js` | 249.83 kB | 27.26 kB | Verified university directory dataset | Async |
| `charts-vendor-*.js` | 421.97 kB | 118.38 kB | Recharts charting engine | Lazy / Preload |
| `firebase-*.js` (SDK) | 621.71 kB | 185.09 kB | Firebase Auth & Firestore SDK | Async |

---

## 2. Chunk Optimization Details

### 2.1 Separation of `react-vendor` vs. `vendor`
- **Previous State:** On Windows operating systems, file paths with backslashes failed regex matching in `vite.config.js`, causing React and vendor packages to merge unpredictably.
- **Optimized State:** Added path normalization (`const normalized = id.replace(/\\/g, '/');`). React 19, React DOM, and React Router 7 are cleanly grouped in `react-vendor`, reducing the generic `vendor` chunk by **30.4%** down to 48.25 kB.

### 2.2 Storage Dynamic Splitting
- Eager Firebase Storage imports were removed from the central Firebase service layer.
- `firebase/storage` is now dynamically loaded only on user interaction when a user updates their profile avatar in `ProfilePage.tsx`.

---

## 3. Compression & Network Transport Efficiency

1. **Gzip Savings Ratio:**
   - Text/JavaScript assets compress with a **~70% average reduction** across all production chunks.
   - For instance, `firebase.js` is reduced from 621.71 kB raw to **185.09 kB** over the wire.
   - `charts-vendor.js` is reduced from 421.97 kB to **118.38 kB**.
2. **HTTP/2 Multiplexing:**
   - Modern CDN hosting (Vercel) automatically serves chunks concurrently via HTTP/2 and HTTP/3 without head-of-line blocking.
