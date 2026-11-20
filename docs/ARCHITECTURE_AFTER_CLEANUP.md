# EduDiscovery — Architecture After Cleanup & Optimization

**Project:** EduDiscovery (v1.0.1)  
**Date:** November 2026  
**Status:** Validated Production Architecture  

---

## 1. Directory Structure

```
EduDiscovery/
├── api/                                # Serverless & local proxy backend
│   ├── firebaseAdmin.js                # Privileged Firebase Admin SDK initialization
│   ├── news.js                         # Google News RSS proxy endpoint
│   ├── rateLimiter.js                  # Upstash Redis & in-memory sliding window rate limiter
│   └── seed.js                         # Secured catalog seeding endpoint (JWT verified)
│
├── android/                            # Capacitor native Android application shell
│   ├── app/                            # Android app modules and google-services.json
│   └── build.gradle                    # Gradle build setup for APK generation
│
├── gov-data-eapcet/                    # Statutory APSCHE admission data pipeline
│   ├── raw/                            # Raw official APSCHE PDF & XLSX cutoffs (2022–2024)
│   ├── staging/                        # Extracted and structured staging records
│   ├── build_admission_applicability_registry.mjs
│   ├── build_official_cutoff_snapshot.mjs
│   ├── generate_compact_app_dataset.mjs
│   ├── scrape_official_cutoffs.mjs
│   └── validate_dataset.mjs
│
├── public/                             # Public static assets & on-demand datasets
│   ├── data/official-cutoffs/          # Compact lazy-loaded cutoff JSON files (2022–2024)
│   ├── images/colleges/                # 60 verified campus photographs
│   ├── favicon.svg / favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
│
├── scripts/                            # Operational & developer utility scripts
│   └── export-college-id-catalog.ts    # College ID catalog extraction tool
│
├── src/                                # Core frontend application source code
│   ├── app/
│   │   ├── App.tsx                     # Top-level router with lazyWithRetry & error handling
│   │   ├── AppProviders.tsx            # Context provider composition hierarchy
│   │   └── main.tsx                    # React 19 application mount point
│   ├── components/
│   │   ├── analytics/                  # FeeCutoffAnalytics, OfficialCutoffsSection
│   │   ├── cards/                      # UniversityCard, UniversityCardSkeleton
│   │   ├── layout/                     # Navbar, BottomNav, AppUpdateBanner, Layout
│   │   ├── map/                        # CampusMapExplorer (interactive vector map)
│   │   ├── ui/                         # Button, Card, Badge, Skeleton primitives
│   │   ├── Animation3DComponents.tsx   # Curated tactile motion components
│   │   ├── AnalyticsTracker.tsx        # Route transition analytics logger
│   │   └── ErrorBoundary.tsx           # React crash boundary with recovery actions
│   ├── contexts/
│   │   ├── AuthContext.tsx             # Dual web/Capacitor authentication state
│   │   ├── ThemeContext.tsx            # Dark/Light AMOLED mode provider
│   │   ├── ToastContext.tsx            # Accessible UI notification dispatcher
│   │   ├── UniversityContext.tsx       # Live Firestore catalog sync with fallback
│   │   └── WishlistContext.tsx         # Guest localStorage to Firestore synced wishlist
│   ├── data/
│   │   ├── admissionApplicability.ts   # Statutory institutional channel registry
│   │   ├── coordinates.ts              # Geo-coordinates for AP institutions
│   │   ├── facilitiesData.ts           # Verified campus amenities & facilities
│   │   ├── news.ts                     # Bundled verified AP EAPCET news
│   │   ├── officialCutoffSnapshot.ts   # Core statutory cutoff snapshot
│   │   └── universities.ts             # Master institutional metadata (60 colleges)
│   ├── pages/
│   │   ├── AdminSeedPage.tsx           # Protected catalog seeding UI
│   │   ├── ComparePage.tsx             # Multi-college comparative analytics
│   │   ├── HomePage.tsx                # Authenticated student command center
│   │   ├── LandingPage.tsx             # Public landing page with features & stats
│   │   ├── NotFoundPage.tsx            # 404 route recovery screen
│   │   ├── PredictorPage.tsx           # Admissions predictor (redirects to /web-options)
│   │   ├── ProfilePage.tsx             # Student academic & career preferences
│   │   ├── SearchPage.tsx              # Public multi-faceted college discovery
│   │   ├── UniversityDetailPage.tsx    # Comprehensive institutional dossier
│   │   ├── WebOptionsPage.tsx          # Strategic counseling Web Options generator
│   │   └── WishlistPage.tsx            # Saved college shortlist
│   ├── services/
│   │   ├── activityTracker.ts          # Student interaction tracker
│   │   ├── appUpdateService.ts         # In-app APK release update checker
│   │   ├── collegeQueries.ts           # Deduplicated Firestore query service
│   │   ├── firebase.ts                 # Firebase client SDK initialization
│   │   ├── metadataService.ts          # Dynamic document title and meta tag updates
│   │   ├── newsService.ts              # Live Google News RSS fetcher with fallback
│   │   └── officialCutoffService.ts    # On-demand static cutoff JSON query service
│   ├── utils/
│   │   ├── cn.ts                       # ClassName merger (clsx + tailwind-merge)
│   │   ├── intelligenceEngine.ts       # Value Score and ROI calculation engine
│   │   ├── predictorEngine.ts          # Mathematical likelihood probability model
│   │   ├── quizAgent.ts                # Recommendation ranking agent
│   │   ├── webOptionsEngine.ts         # Dream/Realistic/Safe categorization engine
│   │   └── wishlistUtils.ts            # Storage key normalization helpers
│   ├── index.css                       # Design tokens, keyframes, mobile safe-areas
│   └── vite-env.d.ts                   # Vite client types
│
├── tests/                              # Automated test suites (Security, Routing, Data)
├── docs/                               # Architectural and execution documentation
├── firestore.rules                     # Cloud Firestore security rules
├── storage.rules                       # Firebase Storage rules
├── vercel.json                         # Edge routing and caching configuration
└── vite.config.js                      # Vite Rolldown manualChunks configuration
```

---

## 2. Core Architectural Pillars

1. **Online-First Data Flow:** Firestore provides live overrides with deduplicated in-memory singleton caching in `collegeQueries.ts`. If offline or unauthenticated, the application degrades gracefully to verified statutory datasets.
2. **Zero-Bundle-Bloat Cutoffs:** Multi-megabyte yearly cutoff records are delivered via static HTTP requests to `/data/official-cutoffs/{year}.json` only when the cutoff explorer is mounted.
3. **Resilient Module Loading:** All routes use `lazyWithRetry()` to automatically recover from network dropouts or stale chunk deployments without throwing uncaught dynamic import errors.
4. **Isolated Vendor Chunks:** Independent vendor chunks (`react-vendor`, `charts-vendor`, `motion-vendor`, `firebase`) prevent monolithic download penalties.
