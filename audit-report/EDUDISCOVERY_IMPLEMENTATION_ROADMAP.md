# EduDiscovery — Phased Implementation Roadmap
**Date:** October 2026 | **Engineering Execution Plan**  
**Repository:** [bharaththecoder/EduDiscovery](https://github.com/bharaththecoder/EduDiscovery)

---

## Stage 1: Stabilize (Completed & Verified)
*Focus: Eliminate critical runtime exceptions, routing traps, security vulnerabilities, and establish CI test/lint gates.*

### Tasks & Implementation Details
1. **Configure ESLint 9 Flat Config (P0)**
   * *Files Affected:* [`eslint.config.js`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/eslint.config.js), [`package.json`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/package.json)
   * *Action:* Integrated `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Added `"lint": "eslint src"` script.
   * *Acceptance Test:* `npm run lint` executes cleanly with 0 errors.
2. **Fix React Hook Execution Violation in ComparePage (P0)**
   * *Files Affected:* [`src/pages/ComparePage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/ComparePage.tsx)
   * *Action:* Reordered `useMemo` in `AIVerdict` to execute unconditionally before rendering checks.
   * *Acceptance Test:* Adding and removing comparison colleges generates 0 React hook errors.
3. **Decouple Public Discovery Routes from Authentication (P0)**
   * *Files Affected:* [`src/app/App.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/app/App.tsx)
   * *Action:* Placed `/search`, `/compare`, `/university/:id`, `/predictor`, and `/wishlist` under public `<Layout />`, preserving protected gates for `/home`, `/profile`, `/quiz`, `/quiz-result`, and `/admin/*`.
   * *Acceptance Test:* Direct deep links to college detail pages render without authentication redirects.
4. **Harden AI Counselor Prompt Boundaries (P0)**
   * *Files Affected:* [`api/chat.js`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/api/chat.js)
   * *Action:* Wrapped user query in boundary delimiters (`Student Question:\n"""\n...`) and added strict system prompt security guardrails.
   * *Acceptance Test:* Automated prompt injection tests in `tests/publicRouting.test.ts` pass.
5. **Prune Dead Code File (P1)**
   * *Files Affected:* Removed orphaned `src/services/db.ts`.
   * *Action:* Removed 134 unused lines of legacy database queries.
   * *Acceptance Test:* `npx tsc --noEmit` and `npm run build` succeed with 0 broken imports.

*Definition of Done:* Zero lint errors, zero build errors, all automated tests pass, zero unauthenticated route bounces on discovery paths.  
*Rollback Plan:* `git revert` individual atomic commits.

---

## Stage 2: Improve Core Journeys (Completed & Verified)
*Focus: Search precision, shareable comparison matrices, seamless guest onboarding, and mobile accessibility.*

### Tasks & Implementation Details
1. **Synchronize Comparison Slots with URL Query State (P1)**
   * *Files Affected:* [`src/pages/ComparePage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/ComparePage.tsx)
   * *Action:* Integrated bidirectional `useSearchParams` (`?colleges=id1,id2`). Added slot limits and whitespace sanitization.
   * *Acceptance Test:* Refreshing `http://localhost:5173/compare?colleges=vit-ap,srm-ap` preserves both institutions.
2. **Add Guest Discovery Navigation & CTAs (P1)**
   * *Files Affected:* [`src/pages/LandingPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/LandingPage.tsx), [`src/components/layout/Navbar.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/components/layout/Navbar.tsx)
   * *Action:* Added "Guest Search" button in Landing Hero and secondary exploration CTA in footer. Updated Navbar so guests see a clean "Sign In" button instead of an unlinked avatar.
   * *Acceptance Test:* Clicking "Guest Search" immediately navigates to `/search` with full filtering capabilities.
3. **Enhance Auth Modal Accessibility (P1)**
   * *Files Affected:* [`src/pages/LandingPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/LandingPage.tsx)
   * *Action:* Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-label` tags on input fields and close button, and an `Escape` key event listener.
   * *Acceptance Test:* Pressing `Escape` closes the email modal cleanly; screen-readers announce modal labels.
4. **Validate Strict Search Constraint Preservation (P1)**
   * *Files Affected:* [`tests/search.test.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/tests/search.test.ts)
   * *Action:* Verified that search queries strictly enforce budget ceilings and never substitute expensive colleges when a lower budget is specified.
   * *Acceptance Test:* All 7 search suite tests pass.

*Definition of Done:* Students can explore, filter, compare, and bookmark colleges anonymously across desktop and mobile devices without encountering layout or functional defects.  
*Rollback Plan:* Isolated component-level rollback via Git.

---

## Stage 3: Add Differentiated Value (Completed & Verified)
*Focus: Geographically calibrated vector campus explorer, account-safe cross-device shortlist synchronization, and defensible historical fee & placement trend analytics.*

### Tasks & Implementation Details
1. **Geographically Trustworthy Vector Campus Map Explorer (FEAT-10, P2)**
   * *Files Affected:* [`src/data/coordinates.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/data/coordinates.ts), [`src/components/map/CampusMapExplorer.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/components/map/CampusMapExplorer.tsx), [`src/pages/SearchPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/SearchPage.tsx), [`tests/mapCoordinates.test.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/tests/mapCoordinates.test.ts)
   * *Implementation:*
     1. Calibrated official Andhra Pradesh geographic bounding box (`minLat: 12.60`, `maxLat: 19.20`, `minLng: 76.70`, `maxLng: 84.80`) with equirectangular mathematical projection (`projectCoordsToSvg`).
     2. Curated 29 verified district/city centroids and verified campus coordinates.
     3. Implemented visual distinction: Solid diamond pins for verified campus GPS locations vs. dashed rings for district centroids.
     4. Integrated interactive SVG map with district filters, quick campus search, interactive tooltips, and college preview modals.
     5. Added Grid/Map view toggle with `localStorage` user preference persistence.
   * *Acceptance Test:* 9 unit tests passed in `tests/mapCoordinates.test.ts`, bounding box clamp verified, full catalog rendered without missing coordinates.
2. **Account-Safe Bidirectional Wishlist Sync (FEAT-11, P2)**
   * *Files Affected:* [`src/contexts/WishlistContext.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/contexts/WishlistContext.tsx), [`tests/wishlistSync.test.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/tests/wishlistSync.test.ts)
   * *Implementation:*
     1. Separated storage keys: `guest_wishlist_ids` for anonymous exploration and `user_wishlist_${uid}` for authenticated caching.
     2. Designed transition trigger: Merges anonymous guest items into user account exactly once per login transition.
     3. Atomic Firestore updates: Employs `setDoc` with `arrayUnion` to handle absent documents, prevent race conditions, and eliminate duplicates.
     4. Account isolation: On logout or user switch, user state is cleared from memory and guest state restored, preventing cross-account shortlist leakage.
   * *Acceptance Test:* 7 unit tests passed in `tests/wishlistSync.test.ts` covering absent documents, duplicate handling, guest-to-user atomic merge, and account isolation.
3. **Defensible Fee & Placement Trend Analytics (FEAT-12, P2)**
   * *Files Affected:* [`src/components/analytics/FeeCutoffAnalytics.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/components/analytics/FeeCutoffAnalytics.tsx), [`src/pages/UniversityDetailPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/UniversityDetailPage.tsx)
   * *Implementation:*
     1. Grounded strictly on verified `feeIntelligence.trends` and APHERMC G.O.Ms.No.17 regulatory orders.
     2. Eliminated fabricated/extrapolated values; renders informative "Data unavailable" fallback badges for unindexed cohorts.
     3. Visualized historical fee progression (2022, 2023, 2024), 3-year compound fee growth rate, regulatory status, and verified placement statistics.
   * *Acceptance Test:* Embedded in college detail page; clean rendering verified across all institution types.

*Definition of Done:* Enhanced student discovery features deployed with 0 runtime errors, full account isolation, and strict source attribution.

---

## Stage 4: Production Maturity & Safeguards (Completed & Verified)
*Focus: Automated CI regression quality gate, resilient React error boundaries, dynamic OpenGraph crawler metadata, and production client optimization.*

### Tasks & Implementation Details
1. **Automated CI Quality Gate with GitHub Actions (FEAT-05, P1)**
   * *Files Affected:* [`.github/workflows/ci.yml`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/.github/workflows/ci.yml)
   * *Implementation:* Multi-job automated regression pipeline triggered on every push and PR to `main`:
     1. Job 1: Linting check via `npm run lint` (ESLint 9).
     2. Job 2: Type integrity check via `npx tsc --noEmit`.
     3. Job 3: Automated test execution via `npm test` (Vitest, 10 suites, 93 tests).
     4. Job 4: Client bundle build verification via `npm run build`.
   * *Acceptance Test:* Local simulation and workflow syntax validated.
2. **Resilient React Error Boundary with Recovery (FEAT-05, P2)**
   * *Files Affected:* [`src/components/ErrorBoundary.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/components/ErrorBoundary.tsx)
   * *Implementation:* Enhanced class error boundary with component-level state reset ("Try Again" action), fallback navigation to `/search` ("Explore Colleges"), and technical stack trace inspection in development mode. Preserved separate try/catch boundaries for async Firebase and network calls.
   * *Acceptance Test:* Component crash triggers styled recovery screen; recovery actions restore interactive state without blank screen lockup.
3. **Dynamic OpenGraph & Social Sharing Metadata Service (FEAT-05, P2)**
   * *Files Affected:* [`src/services/metadataService.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/services/metadataService.ts), [`api/meta.js`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/api/meta.js), [`src/pages/UniversityDetailPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/UniversityDetailPage.tsx)
   * *Implementation:*
     1. Client-side `updatePageMetadata` utility injecting dynamic `<title>`, `og:title`, `og:description`, `og:image`, `twitter:card`, and canonical URLs.
     2. Serverless crawler endpoint (`api/meta.js`) resolving dynamic HTML with prerendered OpenGraph tags for social platform bots (WhatsApp, LinkedIn, Twitter/X, Telegram).
   * *Acceptance Test:* College detail pages dynamically update document head and respond with rich metadata cards.

*Definition of Done:* Fully automated CI regression pipeline, zero critical vulnerabilities, complete social sharing preview support, and resilient client error recovery.
