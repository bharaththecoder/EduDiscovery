# 8. Testing & Production Deployment — EduDiscovery

## 8.1 Automated Testing Architecture (Vitest)

EduDiscovery employs **Vitest** (`^5.0.3`) as its test runner. Because Vitest shares Vite's transformation pipeline and configuration, test execution runs directly against modern ESM and TypeScript code without requiring slow Babel or Webpack pre-transpilation.

### Verified Test Suites Breakdown:
The project includes a comprehensive suite of unit and security integration tests located in `/tests`:

| Test Suite File | What It Tests & Verifies | Status |
| :--- | :--- | :--- |
| `tests/security.test.ts` | **RBAC & Seed Security:** Verifies that `/api/seed` rejects unauthenticated callers, invalid tokens, and non-admin users with `403 Forbidden`. | **PASSED** (3/3) |
| `tests/securityRules.test.ts` | **Firestore Access Rules:** Verifies that client writes to `/colleges` are blocked and user subcollections are strictly scoped to document owners. | **PASSED** (28/28) |
| `tests/rateLimiter.test.ts` | **Token Bucket Throttling:** Verifies client IP resolution, header anti-spoofing (`x-vercel-forwarded-for`), and rejection of requests exceeding threshold with `429`. | **PASSED** (8/8) |
| `tests/publicRouting.test.ts` | **Route Protection Matrix:** Verifies that guest users can access `/search` publicly, while protected routes (`/home`, `/profile`, `/wishlist`) redirect cleanly to login. | **PASSED** (10/10) |
| `tests/intelligenceEngine.test.ts`| **Prediction & Strategy Logic:** Verifies math correctness of rank categorizations (Aggressive, Realistic, Safe) under varying reservation conditions. | **PASSED** (10/10) |
| `tests/mapCoordinates.test.ts` | **Geographic Data Validation:** Validates coordinate bounds (lat/lng) of all AP engineering colleges ensuring markers fall within Andhra Pradesh boundaries. | **PASSED** (9/9) |
| `tests/tier1_discovery_details.test.ts` | **Catalog Data Integrity:** Asserts that all colleges contain valid statutory fee integers, established years, and verified branch allocations. | **PASSED** (36/36) |
| `tests/tier1_hub_profile_integrity.test.ts` | **Closing Rank Constraints:** Validates that all 7,267 cutoff ranks are genuine positive integers bounded strictly within `[1000, 250000]`. | **PASSED** (18/18) |

### Executing the Test Suite:
```bash
# Run the complete test suite
npm test

# Run a specific security verification test
npx vitest run tests/security.test.ts
```

---

## 8.2 Production Build Workflow (Vite & Rolldown)

The production build generates optimized static web assets packaged into the `/dist` directory.

### Build Command:
```bash
npm run build
```

### Build Execution Trace:
When executed, Vite performs the following pipeline:
1. **TypeScript Verification:** Validates types using `tsconfig.app.json`.
2. **CSS Atomic Generation:** Tailwind CSS v4 analyzes class usage across all `.tsx` files and compiles minimal CSS rules into `dist/assets/index-BgJJ02yf.css` (77.29 kB).
3. **Module Resolution & Dynamic Splitting:** Code splitting divides application logic into independent asynchronous chunks.
4. **Gzip & Minification:** Minifies JavaScript and computes compressed payload sizes.

```
vite v8.1.5 building client environment for production...
transforming...✓ 2825 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                   2.62 kB │ gzip:   1.04 kB
dist/assets/index-BgJJ02yf.css                   77.29 kB │ gzip:  15.32 kB
dist/assets/react-vendor-BM7f4X_-.js            178.32 kB │ gzip:  56.34 kB
dist/assets/WebOptionsPage-B19Ntw-A.js          192.37 kB │ gzip:  47.28 kB
dist/assets/universities-Nx5tc9ZU.js            249.83 kB │ gzip:  27.26 kB
dist/assets/charts-vendor-DiUuyx7N.js           421.97 kB │ gzip: 118.38 kB
dist/assets/firebase-fuJaKWfk.js                642.64 kB │ gzip: 190.98 kB
✓ built in 1.82s
```

---

## 8.3 Web Deployment: Vercel Production Infrastructure

EduDiscovery is hosted on **Vercel's Global Edge Network**.

### Deployment Architecture:
1. **Git Integration:** Pushing commits to the `main` branch of GitHub repository `bharaththecoder/EduDiscovery` automatically triggers an atomic Vercel build.
2. **Configuration (`vercel.json`):**
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
         ]
       }
     ]
   }
   ```
   - **SPA Routing Rule:** All incoming browser URLs (e.g. `/search`, `/web-options`) are rewritten to `/index.html`, allowing React Router to manage client-side routing without HTTP 404 errors.
   - **Serverless API Rule:** Calls to `/api/*` bypass the SPA rewrite and invoke the respective Vercel Serverless Function in `/api`.
   - **Immutable Cache Headers:** Hashed production assets in `/assets/` are cached permanently by browser and CDN caches.

---

## 8.4 Android Native APK Compilation Workflow (Capacitor v8)

EduDiscovery is compiled into an installable Android APK (`EduDiscovery-v1.0.1.apk`) using **Capacitor v8** and the Android Gradle build system.

### Build and Packaging Commands:
```bash
# 1. Build the production web assets
npm run build

# 2. Synchronize web assets and native plugins into the android project
npx cap sync android

# 3. Open project in Android Studio (or build via Gradle CLI)
npx cap open android

# 4. Compile release APK using Gradle
cd android
./gradlew assembleRelease
```

### What Happens Internally During `npx cap sync`?
1. Capacitor cleans `android/app/src/main/assets/public/`.
2. The entire contents of `dist/` (HTML, JS chunks, CSS, cutoff JSONs) are copied directly into the Android native assets directory.
3. Capacitor inspects `package.json` for installed Capacitor plugins (e.g., `@capacitor-firebase/authentication`, `@capacitor/splash-screen`) and automatically links their native Java/Kotlin classes into `MainActivity.java` and `settings.gradle`.
4. When launched on an Android device, the native `WebView` loads `https://localhost` or `android.bridge` with zero network delay, providing instant offline UI availability.
