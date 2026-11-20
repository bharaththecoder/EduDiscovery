# 7. Security & Performance Deep Dive — EduDiscovery

## 7.1 Security Architecture & Vulnerability Mitigation

EduDiscovery adopts a defense-in-depth posture across the frontend, cloud database, serverless backend, and mobile container layers.

| Threat / Vulnerability Vector | Potential Impact | Implementation Defense in EduDiscovery | Verified Code Reference |
| :--- | :--- | :--- | :--- |
| **Unauthorized Catalog Modification** | Malicious users tampering with college fees or cutoffs | Client-side writes blocked via Firestore rules (`allow write: if false`). Writes restricted exclusively to Firebase Admin SDK serverless endpoints. | `firestore.rules` (Lines 20-23) |
| **User Data Exfiltration / Snooping** | Attackers reading another student's profile, rank, or wishlist | Strict ownership check in Firestore rules: `request.auth.uid == userId`. Cross-user reads are denied at the database engine level. | `firestore.rules` (Lines 30-40) |
| **Client IP Header Spoofing** | Attackers forging `X-Forwarded-For` to bypass rate limiting | Rate limiter prioritizes trusted edge-injected headers (`x-vercel-forwarded-for`, `cf-connecting-ip`) over untrusted client-supplied headers. | `api/rateLimiter.js` (Lines 26-50) |
| **DDoS & Scraping Attacks** | High-volume bot requests overloading backend or exhaustion of cloud quotas | Upstash Redis token bucket rate limiter (10 requests/min on privileged endpoints; 60 requests/min on public APIs). | `api/rateLimiter.js`<br>`api/seed.js` |
| **Token Replay / Expired Tokens** | Reusing stale auth credentials | Server-side validation via `admin.auth().verifyIdToken(idToken)` checks JWT expiration timestamps and signature validity against Google's public keys. | `api/seed.js` (Lines 28-35) |
| **Cross-Site Scripting (XSS)** | Injection of malicious JS scripts via college names or search inputs | React 19's virtual DOM automatically escapes all rendered strings. Dangerous APIs like `dangerouslySetInnerHTML` are completely avoided. | Entire `src/` codebase |
| **OAuth WebView Redirect Failures** | Android WebView blocking Google OAuth redirects | `@capacitor-firebase/authentication` delegates sign-in directly to Android's native Google Play Services intent. | `src/contexts/AuthContext.tsx` |

---

## 7.2 Frontend Performance Optimization

### A. Rolldown / Rollup Optimized Chunk Splitting
By default, bundlers often package all node modules into a single monolithic JavaScript file (`bundle.js`), forcing mobile devices on slow connections to download several megabytes before the page can display anything.

In `vite.config.js`, EduDiscovery configures **explicit vendor chunk splitting**:

```javascript
// File: vite.config.js (Rolldown Chunk Configuration)
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        'charts-vendor': ['recharts'],
        'motion-vendor': ['framer-motion'],
        'icons-vendor': ['lucide-react']
      }
    }
  }
}
```

#### Production Build Distribution Impact:
When building the project (`npm run build`), Vite generates cleanly isolated chunks:
- `react-vendor-BM7f4X_-.js`: 178.32 kB (56.34 kB gzipped) — Loaded once, cached permanently.
- `charts-vendor-DiUuyx7N.js`: 421.97 kB (118.38 kB gzipped) — **Lazy-loaded only** when the user opens the Analytics or Cutoff section!
- `index-DEBPLgdK.js` (App Core): 36.23 kB (10.97 kB gzipped) — Loads in under 200ms on 4G cellular networks.

### B. Route-Level Code Splitting (`React.lazy`)
Every primary page (`HomePage`, `SearchPage`, `ComparePage`, `UniversityDetailPage`, `WebOptionsPage`, `WishlistPage`, `ProfilePage`) is isolated into its own independent JavaScript chunk via dynamic imports. A user browsing only the Search page never downloads the code for the Compare page or Admin Seeder.

### C. In-Memory Concurrent Request Deduplication
When multiple components simultaneously request the college catalog (e.g., Search filter + Wishlist context), multiple identical network calls could be dispatched. 

In `src/services/collegeQueries.ts`, an active promise reference is held:
```typescript
let inMemoryColleges: University[] | null = null;
let activeFetchPromise: Promise<University[]> | null = null;

export async function getAllColleges(forceRefresh = false): Promise<University[]> {
  if (!forceRefresh && inMemoryColleges) return inMemoryColleges;
  if (activeFetchPromise) return activeFetchPromise; // Share the inflight promise

  activeFetchPromise = (async () => {
    // Perform fetch...
  })().finally(() => { activeFetchPromise = null; });

  return activeFetchPromise;
}
```
This guarantees that exactly **one** network request is initiated regardless of how many UI components mount at the same instant.

---

## 7.3 Mobile Optimization & Safe-Area Inset Handling

Because EduDiscovery runs both as a mobile web app and as a native Android APK via Capacitor, mobile viewport adaptations are engineered into `src/index.css` and layout components:

1. **Mobile Bottom Navigation (`BottomNav.tsx`):**
   - Automatically hidden on desktop screens (`md:hidden`).
   - Sits above the native Android navigation bar using CSS environment variables:
     ```css
     padding-bottom: env(safe-area-inset-bottom, 16px);
     ```
2. **Touch Target Dimensions:**
   - All interactive icons, tabs, and buttons adhere to a minimum 44px by 44px clickable area (`tap-target-44`) to eliminate accidental taps on touchscreens.
3. **PWA Removal Decision (Engineering Integrity):**
   - In commit `8355446`, Service Worker caching and PWA manifests were consciously removed. The Service Worker cache was intermittently serving stale JavaScript manifests during rapid deployment cycles, causing white screen errors for returning users. Replacing this with native Capacitor compilation + `lazyWithRetry` dynamic reloading provided higher reliability and true native Android distribution.
