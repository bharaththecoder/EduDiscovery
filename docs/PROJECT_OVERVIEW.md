# 1. Project Overview & Context — EduDiscovery

## 1.1 Project Executive Summary

**EduDiscovery** is a specialized, production-ready engineering college discovery and admissions intelligence platform tailored for students in Andhra Pradesh, India. Built specifically to guide candidates navigating the complex **AP EAPCET** (Andhra Pradesh Engineering, Agriculture and Pharmacy Common Entrance Test) counseling workflow, EduDiscovery transforms raw, fragmented statutory government cutoff PDF documents and institutional fee lists into an interactive, high-performance web and mobile decision support system.

- **Live Production URL:** [https://edu-discovery.vercel.app/](https://edu-discovery.vercel.app/)
- **GitHub Repository:** [https://github.com/bharaththecoder/EduDiscovery](https://github.com/bharaththecoder/EduDiscovery)
- **Current Stable Version:** `v1.0.1`
- **Application Class:** Hybrid Cross-Platform (React Single Page Application + Capacitor Android Native APK)

---

## 1.2 The Problem Domain

Each academic year, over 200,000 students in Andhra Pradesh complete their intermediate (+2 / Board of Intermediate Education) education with Mathematics, Physics, and Chemistry (MPC) and appear for the AP EAPCET. 

During the statutory counseling conducted by the **Andhra Pradesh State Council of Higher Education (APSCHE)**, students encounter several severe technical and logistical bottlenecks:

1. **Information Asymmetry & Data Obfuscation:**
   Official opening and closing ranks are published across hundreds of pages of static PDF matrices or opaque tables. Finding cutoffs for a specific category (e.g., `BC-B Girls`, `OC-EWS Boys`, `SC Statewide`) across multiple university branches requires hours of tedious manual searching.
2. **The "Web Options" Risk:**
   In EAPCET counseling, students submit a prioritized list of college-branch combinations called "Web Options". If a student misjudges cutoff trends, they risk either missing out on premier institutions or being allotted a college far below their merit rank.
3. **Multi-Dimensional Reservation Matrix:**
   AP counseling utilizes a complex intersectional reservation system:
   - **University Regions:** AU (Andhra University area), SVU (Sri Venkateswara University area), and SW (Statewide).
   - **Categories:** OC, OC-EWS, SC, ST, BC-A, BC-B, BC-C, BC-D, BC-E.
   - **Gender Pools:** Boys (Open/General) vs. Girls (Quotas reserved for female candidates).
4. **Mobile Usability Crisis:**
   Over 75% of students and rural parents in Andhra Pradesh access counseling portals via low-spec Android smartphones over variable cellular networks (3G/4G). Government portals are notoriously desktop-bound, unoptimized, and non-responsive.

---

## 1.3 Verified Feature Implementation Matrix

To ensure total academic and engineering integrity during technical audit and defense, the following status matrix delineates features that are **Fully Implemented**, **Partially Implemented**, **Planned**, and **Deprecated/Removed**:

| Feature Name | Verified Implementation Status | Source Evidence & Files | Technical Implementation Details |
| :--- | :--- | :--- | :--- |
| **College Discovery & Catalog** | **Fully Implemented** | `src/pages/HomePage.tsx`<br>`src/services/collegeQueries.ts`<br>`src/data/universities.ts` | Displays 24+ vetted AP engineering colleges with district filters, fees, ratings, and accreditation. Backed by live Firestore query with local statutory fallback. |
| **Full-Text & Faceted Search** | **Fully Implemented** | `src/pages/SearchPage.tsx`<br>`src/components/cards/UniversityCard.tsx` | Real-time multi-facet filter by District, Branch, Tier, Accreditation (NAAC/NBA), and Fee range with debounced search query. |
| **Detailed College Profiles** | **Fully Implemented** | `src/pages/UniversityDetailPage.tsx`<br>`src/components/analytics/OfficialCutoffsSection.tsx` | Comprehensive view of campus overview, fee structure, placement stats, verified contact data, facilities, and dynamic map preview. |
| **Interactive College Comparison**| **Fully Implemented** | `src/pages/ComparePage.tsx` | Side-by-side comparative matrix of 2 to 4 colleges assessing tuition fees, NIRF tiering, accreditations, and seat intake. |
| **Official Historical Cutoff Explorer**| **Fully Implemented** | `src/services/officialCutoffService.ts`<br>`public/data/official-cutoffs/` | Dimensional query engine across 3 years (2022, 2023, 2024) of official APSCHE closing rank records. Zero bundle bloat via static JSON CDN fetching. |
| **Web Options Strategic Decision Engine** | **Fully Implemented** | `src/pages/WebOptionsPage.tsx`<br>`src/utils/webOptionsEngine.ts` | Algorithmic college recommendation generator categorizing options into "Aggressive / Dream", "Realistic / Competitive", and "Safe / Solid" based on rank, category, and gender pool. |
| **User Wishlist & Synchronization** | **Fully Implemented** | `src/contexts/WishlistContext.tsx`<br>`src/pages/WishlistPage.tsx` | Dual-mode state persistence: In-memory/localStorage for guests, automatic cloud syncing to user's Firestore document upon login. |
| **Firebase Multi-Platform Authentication** | **Fully Implemented** | `src/contexts/AuthContext.tsx`<br>`capacitor.config.ts` | Email/Password and Google OAuth authentication. Supports Web Popups on browsers and native Google Sign-In on Android via `@capacitor-firebase/authentication`. |
| **User Profile Management** | **Fully Implemented** | `src/pages/ProfilePage.tsx` | Personalized student profile showing EAPCET rank, category, preferred branch, saved wishlist colleges, and profile completion strength. |
| **Interactive Campus Map Explorer** | **Fully Implemented** | `src/components/map/CampusMapExplorer.tsx`<br>`src/data/coordinates.ts` | Geographic distribution visualizer showing institutional geolocations across Andhra Pradesh districts. |
| **Native Android APK Deployment** | **Fully Implemented** | `android/`<br>`capacitor.config.ts`<br>`EduDiscovery-v1.0.1.apk` | Packaged as native Android application via Capacitor v8 with adaptive splash screen and edge-to-edge UI. |
| **Serverless Admin Seeding API** | **Fully Implemented** | `api/seed.js`<br>`api/firebaseAdmin.js` | Protected serverless endpoints guarded by Firebase Admin SDK claims and custom token verification for database hydration. |
| **DDoS & Upstash Redis Rate Limiting** | **Fully Implemented** | `api/rateLimiter.js` | Serverless token bucket rate limiter integrating Upstash Redis REST API with client IP spoofing protection (`x-vercel-forwarded-for`). |
| **AI Quiz & Career Predictor** | **Partially Implemented / Repurposed** | `src/utils/quizAgent.ts`<br>`src/pages/PredictorPage.tsx` | Replaced by the more deterministic, mathematically accurate `WebOptionsPage.tsx`. Legacy `/predictor` route safely redirects to `/web-options`. |
| **Service Worker & PWA Caching** | **Deprecated / Removed** | Commit `8355446` | Removed intentionally to resolve aggressive cache invalidation bugs and chunk mismatch errors during rapid deployments. |
| **Multi-Language / Localization (Telugu)**| **Planned (Not Implemented)** | N/A | UI strings are currently English-only. Telugu statutory term glossaries planned for v1.1. |

---

## 1.4 Academic Target and Problem-Solution Alignment

For an engineering evaluation panel, EduDiscovery demonstrates how modern full-stack web engineering solves genuine regional public administration hurdles:

```
[Statutory APSCHE Data (PDFs/Gov Portals)]
                  │
                  ▼
[Python/Node Data Extraction & Normalization Pipelines]
                  │
                  ▼
[Clean Historical Cutoff Snapshots (2022-2024 JSON)] + [Live Cloud Firestore DB]
                  │
                  ▼
[EduDiscovery Web Options Engine (Decision Matrix)]
                  │
                  ▼
[Empowered Student Making Informed Engineering Choice]
```
