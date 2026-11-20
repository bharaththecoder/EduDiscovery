# EDUDISCOVERY — USER JOURNEY & BEHAVIORAL TEST REPORT

**Evaluation Methodology:** Automated Integration Contracts, Component Emulation, Routing Matrix  
**Date:** November 21, 2026  
**Status:** **ALL PRIMARY JOURNEYS VALIDATED (PASS)**  

---

## 1. Persona 1: Guest Student (Unauthenticated Discovery)

### Journey Steps:
1. **Landing Page (`/`):**
   - **Verification:** Renders hero headlines, search prompt, animated badges, and direct call-to-actions.
   - **Behavior:** If an active session is detected, automatically redirects to `/home`. Unauthenticated users remain on landing page.
   - **Outcome:** **PASS**
2. **Catalog Discovery & Search (`/search`):**
   - **Verification:** Search page is registered under the public layout.
   - **Behavior:** Users can query colleges by name, city, district, branch, or category.
   - **Outcome:** **PASS**
3. **College Detail Inspection (`/university/:id` and legacy `/college/:id`):**
   - **Verification:** Resolved legacy route redirection (`<Route path="/college/:id" element={<Navigate to="/university/:id" replace />} />`).
   - **Behavior:** Direct links from XML sitemaps or external bookmarks automatically resolve to the university detail view.
   - **Outcome:** **PASS**
4. **Official Cutoff & Fee Explorer:**
   - **Verification:** Sourced APHERMC tuition fees and APSCHE closing ranks are rendered with category breakdowns.
   - **Outcome:** **PASS**

---

## 2. Persona 2: Authenticated Applicant (Cloud Synced)

### Journey Steps:
1. **Sign-In Flow:**
   - **Web:** Firebase OAuth popup and redirect resolvers (`browserPopupRedirectResolver`).
   - **Android:** Native Google Play Services bridging via `@capacitor-firebase/authentication`.
   - **Outcome:** **PASS**
2. **Wishlist Interaction & Sync:**
   - **Verification:** `WishlistContext.tsx` handles initial guest localStorage entries and silently merges them into Firestore upon authentication.
   - **Persistence:** Document IDs stored as lightweight strings (`universities.map(u => u.id)`), avoiding Firestore document payload bloat.
   - **Outcome:** **PASS**
3. **Profile Customization & Avatar Upload:**
   - **Verification:** Profile tags (Stem Scholar, Merit Student, AP EAPCET) update in real-time.
   - **Cloud Storage:** Image uploads leverage the dynamic `getFirebaseStorage()` loader. Files > 2 MB are rejected client-side with user-friendly alerts.
   - **Outcome:** **PASS**
4. **Cross-University Comparison (`/compare`):**
   - **Verification:** Allows up to 4 institutions side-by-side with statutory fee comparisons, ROI scoring, and cutoff charts.
   - **Outcome:** **PASS**

---

## 3. Edge Case Matrix & Resiliency

| Edge Case Scenario | Expected Behavior | Observed Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Zero Search Matches** | Show friendly empty state with filter reset button | Empty results component rendered cleanly without crash | **PASS** |
| **Invalid University ID** | Normalize ID and fallback to 404 handler | Handled gracefully by `resolveSynchronously` and `NotFoundPage` | **PASS** |
| **Slow Network / Lazy Chunk Delay** | Display spinner / skeleton loader | `lazyWithRetry` and `LoadingScreen` render during network delays | **PASS** |
| **Offline Network Interruption** | Display non-blocking toast warning | In-flight mutations display informative warning | **PASS** |
| **Duplicate Wishlist Additions** | Prevent duplicate records | Deduplication set preserves single unique ID | **PASS** |
