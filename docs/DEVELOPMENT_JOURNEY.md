# 9. Personal Engineering Story — EduDiscovery

## 9.1 The Engineering Genesis: Identifying the Problem

During my engineering entrance and counseling experience in Andhra Pradesh, I observed firsthand how intimidating and opaque the **AP EAPCET counseling process** was for students and their parents. 

Every year after results are declared, the state government releases official closing ranks across hundreds of pages of static, poorly scanned PDF files. Students are expected to formulate their **"Web Options"**—a prioritized sequence of college and branch preferences submitted to the online allotment system. 

The consequences of misjudging this process are severe:
- If a student ranks their preferences too conservatively, they miss out on top-tier state universities or premier private autonomous institutions.
- If they rank unrealistically high without backup options, they end up without an allotment in Round 1.
- Existing commercial college portals are cluttered with advertisements, bias toward paid private college promotions, and lack accurate dimensional filtering for specific reservations like `BC-B Girls (AU Region)` or `OC-EWS Boys (SVU Region)`.

I decided to build **EduDiscovery** to solve this exact problem: a fast, mobile-friendly, objective platform that transforms raw government counseling data into clear, actionable admissions intelligence.

---

## 9.2 The Technical Evolution: Milestones & Critical Pivots

As an engineering student building a real-world system, my implementation evolved through distinct phases:

### Phase 1: Prototype & Raw Scraper Implementation
- **Goal:** Gather AP EAPCET college codes, tuition fees, and cutoff matrices.
- **Challenge:** Government portals provided no public REST API. Cutoff reports were stored in table-formatted PDFs and dynamic ASPX forms.
- **Solution:** I wrote custom Node.js and Python extraction scripts (`gov-data-eapcet/scrape_official_cutoffs.mjs`) to parse raw tabular data, extract college codes (`AUCE`, `JNTK`, `GVPV`), validate rank boundaries, and structure the data into standardized JSON formats.

### Phase 2: Architecture & Storage Realities (The Firestore Dilemma)
- **Initial Idea:** Store all 25,000+ historical cutoff rows in Cloud Firestore documents.
- **The Problem:** During testing, I realized that querying Firestore every time a user adjusted filters would quickly exhaust the Firebase free tier limit of 50,000 daily document reads and cause network lag on slow mobile connections.
- **The Pivot:** I separated dynamic user data from static historical data:
  - **Cloud Firestore:** Reserved strictly for real-time user profiles, synced wishlists, and remote college overrides.
  - **Edge Static CDN Snapshots:** Compiled official cutoffs into compressed static JSON files (`2022.json`, `2023.json`, `2024.json`) fetched on-demand. This reduced database costs to zero while achieving sub-50ms query times.

### Phase 3: The PWA vs. Native Android Dilemma
- **The Problem:** In my initial release, I configured a Progressive Web App (PWA) with a Service Worker. However, during rapid updates, the Service Worker aggressively cached outdated JavaScript bundles. When I deployed new code to Vercel, users experienced blank white screens caused by chunk hash mismatches.
- **The Solution (Commit `8355446`):** I completely purged the Service Worker and PWA dependencies. In their place, I integrated **Capacitor v8**, transforming the React web application into a true native Android application (`EduDiscovery-v1.0.1.apk`).

### Phase 4: Native Mobile Authentication Overhaul
- **The Challenge:** In Android WebViews, Google OAuth popups frequently fail or are blocked due to Google's strict OAuth policies forbidding WebViews.
- **The Solution:** I integrated `@capacitor-firebase/authentication` and configured `android/app/google-services.json`. When running on an Android device, the app delegates authentication directly to Google Play Services on the OS level, returning a credential that seamlessly signs into Firebase on the web layer.

---

## 9.3 Key Technical Lessons Learned

1. **Premature Optimization vs. Pragmatic Engineering:**
   Instead of over-engineering a complex microservices backend with Kubernetes or container clusters, choosing a serverless architecture (Vercel Functions + Cloud Firestore) allowed me to deliver high availability and zero operational maintenance overhead.
2. **Defensive Data Engineering:**
   Never assume government or third-party datasets are clean. Implementing rigorous validation (`tests/tier1_hub_profile_integrity.test.ts`) to assert that all 7,267 cutoff ranks were authentic positive integers between 1,000 and 250,000 prevented bad data from reaching the user interface.
3. **The Power of Static Typing:**
   Managing complex dimensional data (Years, Categories, Gender Pools, Quotas) in pure JavaScript would have led to endless runtime bugs. TypeScript interfaces provided strict compile-time contracts that made refactoring painless.
