# 13. Master Source Code Map — EduDiscovery

> **Directory & File Level Responsibilities Matrix**  
> Use this reference guide to immediately identify which source file contains any requested component, function, or logic during a technical evaluation.

---

## 🗂️ Core Root Directories

```
EduDiscovery/
├── api/                    # Vercel Serverless Functions (Node.js runtime)
├── android/                # Native Android Studio / Gradle Project (Capacitor)
├── gov-data-eapcet/        # Statutory APSCHE data scrapers, raw datasets, normalization
├── public/                 # Static assets, logos, and pre-compiled cutoff JSON files
├── src/                    # Primary application source code (React 19 + TypeScript)
├── tests/                  # Automated Vitest test suites (Unit, Security, Integration)
└── docs/                   # Complete engineering audit & defense documentation suite
```

---

## 📄 File Inventory & Implementation Guide

### 1. Root Configuration Files

| File Path | Primary Responsibility | Critical Code / Details |
| :--- | :--- | :--- |
| `package.json` | Project manifest, dependencies, scripts | React 19, Vite 8, Tailwind v4, Capacitor v8, Firebase 12. |
| `vite.config.js` | Vite bundler configuration | Defines `@` alias to `/src`, `@tailwindcss/vite` plugin, and Rolldown manual chunks (`react-vendor`, `charts-vendor`, `motion-vendor`). |
| `capacitor.config.ts` | Mobile runtime configuration | App ID `com.edudiscovery.app`, native Firebase Auth provider setup, and splash screen theming (`#0F172A`). |
| `firestore.rules` | Cloud Firestore database security rules | Restricts `/colleges` writes to admin-only; locks `/users/{userId}` to authenticated document owners. |
| `vercel.json` | Vercel production hosting configuration | SPA URL rewrites to `/index.html`, API routing to `/api/*`, and immutable asset cache headers. |
| `api-server.js` | Local Node/Express API simulation server | Runs on port 3001 during `npm run dev` to mirror serverless endpoints locally. |

---

### 2. Frontend Application Layer (`src/app/`)

| File Path | Responsibility & Contents |
| :--- | :--- |
| `src/app/main.tsx` | React 19 entry point; mounts `<AppProviders>` and `<App>` into the root DOM element. |
| `src/app/AppProviders.tsx` | Provider hierarchy wrapping `ThemeProvider`, `AuthProvider`, `UniversityProvider`, `WishlistProvider`, and `ToastProvider`. |
| `src/app/App.tsx` | Top-level SPA router, `lazyWithRetry` resilient dynamic loader, `ErrorBoundary`, public routes, and `RequireAuth` protected route guards. |

---

### 3. State Management & Contexts (`src/contexts/`)

| File Path | State Managed | Key Functions & Implementation Details |
| :--- | :--- | :--- |
| `src/contexts/AuthContext.tsx` | User authentication state | `login`, `signup`, `logout`, `loginWithGoogle`. Uses `@capacitor-firebase/authentication` on Android and `signInWithPopup` on web. |
| `src/contexts/UniversityContext.tsx` | Master college catalog state | `universities`, `loading`, `error`, `getUniversityById`, `refreshColleges`. Backed by Firestore query with in-memory singleton. |
| `src/contexts/WishlistContext.tsx` | Wishlist persistence state | `wishlist`, `wishlistIds`, `toggleWishlist`, `isWishlisted`. Syncs guest items in `localStorage` to Firestore `users/{uid}` on login. |
| `src/contexts/ThemeContext.tsx` | Light/Dark theme state | Manages `.dark` CSS class on document element; persists preference in `localStorage`. |
| `src/contexts/ToastContext.tsx` | UI feedback notifications | Provides `showToast(message, type)` for success/error popups across the app. |

---

### 4. Page Screens (`src/pages/`)

| File Path | Route Path | Screen Functionality |
| :--- | :--- | :--- |
| `src/pages/LandingPage.tsx` | `/` | Public hero section, glassmorphism stat cards, quick features breakdown, and CTA buttons. |
| `src/pages/HomePage.tsx` | `/home` | Authenticated student dashboard: personalized recommendations, top-ranked institutions, and trending colleges. |
| `src/pages/SearchPage.tsx` | `/search` | Public guest discovery catalog: multi-faceted search by district, branch, accreditation, and fee range. |
| `src/pages/ComparePage.tsx` | `/compare` | Side-by-side comparative matrix of 2 to 4 colleges assessing fees, accreditations, and cutoff percentiles. |
| `src/pages/UniversityDetailPage.tsx`| `/university/:id` | Full institutional dossier: campus overview, facilities, statutory fees, contact data, map preview, and cutoff explorer. |
| `src/pages/WebOptionsPage.tsx` | `/web-options` | Strategic counseling decision tool: categorizes recommendations into Aggressive (Dream), Realistic, and Safe tiers. |
| `src/pages/WishlistPage.tsx` | `/wishlist` | Saved college inventory with quick comparison and removal triggers. |
| `src/pages/ProfilePage.tsx` | `/profile` | Student profile displaying EAPCET rank, reservation category, preferred branches, and profile completion strength. |
| `src/pages/AdminSeedPage.tsx` | `/admin/seed-colleges`| Protected admin utility for triggering catalog re-seeding against Cloud Firestore. |
| `src/pages/NotFoundPage.tsx` | `*` | Custom 404 error screen with route recovery buttons. |

---

### 5. Reusable Components (`src/components/`)

| File Path | Component Category | Component Role |
| :--- | :--- | :--- |
| `src/components/layout/Navbar.tsx` | Layout | Responsive header containing logo, navigation links, theme toggle, and user avatar. Uses Framer Motion layout indicator. |
| `src/components/layout/BottomNav.tsx` | Layout | Mobile bottom navigation bar with active icon highlights and safe-area inset spacing. |
| `src/components/cards/UniversityCard.tsx` | Cards | Core college card rendering accreditation badges, fees, established year, and wishlist toggle button. |
| `src/components/analytics/OfficialCutoffsSection.tsx`| Analytics | Interactive cutoff explorer with year, category, gender, and branch selectors displaying official closing ranks. |
| `src/components/map/CampusMapExplorer.tsx` | Map | Interactive geospatial visualizer rendering college campus locations across Andhra Pradesh districts. |
| `src/components/ui/button.tsx` | UI Primitive | Polymorphic button with Radix Slot `asChild` support, 44px touch targets, and tactile scaling. |
| `src/components/ui/card.tsx` | UI Primitive | Compound card primitive (`CardHeader`, `CardTitle`, `CardContent`, `CardFooter`). |
| `src/components/ErrorBoundary.tsx` | Error Handling | React Error Boundary that catches unhandled runtime exceptions and renders a safe recovery UI. |

---

### 6. Services & Utilities (`src/services/` & `src/utils/`)

| File Path | Primary Functionality |
| :--- | :--- |
| `src/services/collegeQueries.ts` | Online-first query service fetching colleges from Firestore with in-memory singleton deduplication and statutory fallback. |
| `src/services/officialCutoffService.ts`| Queries pre-compiled static JSON cutoff snapshots (`/data/official-cutoffs/{year}.json`) on-demand with memory caching. |
| `src/services/firebase.ts` | Client Firebase SDK initialization (`auth`, `db`, `googleProvider`). |
| `src/utils/webOptionsEngine.ts` | Mathematical categorization algorithm computing Dream, Realistic, and Safe cutoff boundaries based on student input. |
| `src/utils/wishlistUtils.ts` | Storage key resolvers and ID normalization logic for guest-to-user wishlist migration. |
| `src/utils/cn.ts` | Utility combining `clsx` and `tailwind-merge` for conflict-free conditional Tailwind classes. |

---

### 7. Backend Serverless API (`api/`)

| File Path | Endpoint Route | Security & Purpose |
| :--- | :--- | :--- |
| `api/seed.js` | `POST /api/seed` | High-privilege college catalog seeder. Guarded by Upstash Redis rate limiting and Firebase Admin SDK token verification. |
| `api/firebaseAdmin.js` | N/A (Internal) | Firebase Admin SDK initialization using server-side service account credentials. |
| `api/rateLimiter.js` | N/A (Internal) | Token bucket rate limiter supporting Upstash Redis REST API and trusted edge IP resolution (`x-vercel-forwarded-for`). |
| `api/news.js` | `GET /api/news` | Serves official AP EAPCET counseling circulars and deadlines with 15-minute Edge CDN caching headers. |
| `api/meta.js` | `GET /api/meta` | System health check and deployment status endpoint. |

---

### 8. Testing Suites (`tests/`)

| Test File | Verified Functionality |
| :--- | :--- |
| `tests/security.test.ts` | Asserts `/api/seed` rejects unauthenticated, invalid, and non-admin requests with HTTP 403. |
| `tests/securityRules.test.ts` | Asserts Cloud Firestore security rules block unauthorized writes and cross-user data access. |
| `tests/rateLimiter.test.ts` | Validates rate limiter throttling (HTTP 429) and anti-spoofing client IP resolution. |
| `tests/publicRouting.test.ts` | Validates that public guests can view `/search`, while private routes redirect to `/`. |
| `tests/tier1_hub_profile_integrity.test.ts`| Asserts all 7,267 cutoff ranks are authentic positive integers bounded within `[1000, 250000]`. |
