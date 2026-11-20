# 2. Complete Technology Stack — EduDiscovery

## 2.1 Technology Stack Architecture Matrix

Every technology running in EduDiscovery was selected purposefully to satisfy strict constraints: sub-second mobile page loads, zero hosting costs on free-tier serverless clouds, statutory data fidelity, and seamless offline-tolerant capability.

| Technology | Category | Version in Repo | Where Used in Codebase | Justification & Architectural Role | Alternatives Considered |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **React** | Frontend UI Framework | `^19.2.4` | `src/**/*.tsx` | Declarative, component-driven UI library. Enables reactive state synchronisation across complex filters and comparative views. | Vue.js, Angular, Vanilla JS |
| **Vite** | Build Tool & Bundler | `^8.0.1` | `vite.config.js`<br>`package.json` | Next-generation ESM-based build tool providing instant Hot Module Replacement (HMR) and optimized Rollup/Rolldown production chunking. | Webpack, Create React App |
| **TypeScript** | Type Safety System | `^6.0.2` | `tsconfig.app.json`<br>`src/**/*.ts, .tsx` | Static typing that enforces data structure contracts (such as `University`, `OfficialCutoffRecord`, `ReservationCategory`), preventing runtime crashes. | Plain JavaScript |
| **Tailwind CSS** | Styling System | `^4.2.2` | `src/index.css`<br>`vite.config.js` | Utility-first CSS engine compiled via `@tailwindcss/vite`. Eliminates runtime CSS overhead and produces atomic, tiny CSS bundles. | Styled Components, Bootstrap |
| **React Router** | Client-Side Routing | `^7.13.2` | `src/app/App.tsx` | Declarative declarative SPA routing with dynamic route parameters (`/university/:id`), protected layout outlets (`RequireAuth`), and route-level code splitting. | TanStack Router |
| **Cloud Firestore** | NoSQL Document Database | Firebase `^12.13.0` | `src/services/firebase.ts`<br>`src/services/collegeQueries.ts` | Scalable cloud document database for user profiles, real-time wishlist synchronisation, and master college entity updates. | MongoDB Atlas, PostgreSQL, Supabase |
| **Firebase Auth** | Identity Management | Firebase `^12.13.0` | `src/contexts/AuthContext.tsx` | Secure client-side OAuth identity management providing Google sign-in and Email/Password credentials with JSON Web Tokens (JWT). | Auth0, Custom JWT Server, Supabase Auth |
| **Capacitor** | Native Mobile Runtime | `^8.5.3` | `capacitor.config.ts`<br>`android/` | Cross-platform bridge converting the web application into a high-performance native Android application with native plugin access. | React Native, Flutter |
| **@capacitor-firebase/authentication** | Native Auth Bridge | `^8.6.0` | `src/contexts/AuthContext.tsx` | Bridges native Google Play Services authentication on Android directly into the web Firebase Auth instance, preventing WebView redirect issues. | Standard Browser Redirects in WebView |
| **Express & Node.js** | Local API Proxy / Server | `^5.2.1` | `api-server.js` | Local simulation environment mirroring production Vercel Serverless Functions during offline development. | Standalone Vite Dev Server |
| **Upstash Redis (REST)** | Serverless In-Memory Store | REST API | `api/rateLimiter.js` | Low-latency distributed rate limiter preventing brute force and scraping on serverless endpoints using HTTP-based Redis calls. | In-memory Node Maps, Cloudflare KV |
| **Framer Motion** | Motion & Animation Engine | `^12.38.0` | `src/components/layout/Navbar.tsx`<br>`src/pages/LandingPage.tsx` | Hardware-accelerated UI transition animations, spring dynamics, and smooth layout transitions (`layoutId="activeNavIndicator"`). | Pure CSS keyframes, React Spring |
| **Lucide React** | Iconography | `^1.7.0` | All UI components | Lightweight, tree-shakable SVG icon collection consistent across the entire application. | FontAwesome, React Icons |
| **Vitest** | Automated Test Runner | `^5.0.3` | `tests/*.test.ts` | Blazing-fast Vite-native unit and integration test runner sharing the exact same transformation pipeline as the application. | Jest, Mocha |

---

## 2.2 In-Depth Technology Analysis

### A. React 19 & Vite 8: Why React SPA over Next.js SSR?
- **The Evaluator Question:** *"Why did you use a Single Page Application (SPA) with Vite instead of Server-Side Rendering (SSR) with Next.js?"*
- **Engineering Defense:**
  1. **Zero-Latency Mobile Transitions:** Once the initial bundle loads, navigating between Search, Compare, and Web Options happens instantly on the client device with zero network round-trip overhead.
  2. **Native Mobile Compilation (Capacitor):** A pure client-side SPA produces static HTML, CSS, and JS artifacts in the `dist/` directory. This static bundle can be directly copied into Android's `assets/public` folder by Capacitor (`npx cap sync`). A Next.js SSR backend cannot run locally inside an offline Android APK container without an active internet connection.
  3. **Cost Efficiency:** A static SPA can be distributed freely across global Edge CDNs (Vercel Edge, Cloudflare Pages), eliminating persistent server maintenance costs.

### B. Tailwind CSS v4: Modern Build-Time Engine
EduDiscovery leverages Tailwind CSS v4 via `@tailwindcss/vite`.
- Unlike Tailwind v3, which required `tailwind.config.js` and PostCSS plugins, Tailwind v4 uses a modern Rust-based engine with pure CSS configuration (`@theme` blocks in `src/index.css`).
- It completely eliminates unused styles through tree-shaking, resulting in a compiled stylesheet of only **77.29 kB** (15.32 kB gzipped) for the entire application.

### C. Cloud Firestore: Real-Time NoSQL
- Used specifically for user-specific dynamic data:
  - `users/{uid}`: Profile information, academic rank, preferred branches, and synced college wishlists.
  - `user_activity/{uid}`: Anonymous search and view activity tracking to compute personalized recommendations.
  - `colleges/{collegeId}`: Master catalog of colleges, enabling real-time remote updates without forcing users to update their client code.

### D. Hybrid Static Cutoff Architecture (JSON over Database)
Instead of storing 25,000+ historical cutoff rows in Firestore (which would incur massive read charges and slow down queries on cellular connections), official cutoffs are pre-compiled into static JSON files (`/public/data/official-cutoffs/2022.json`, `2023.json`, `2024.json`).
- These files are cached permanently by browser HTTP caches and Vercel's global CDN.
- Cutoff data is only fetched on-demand when a student opens the Cutoff Explorer, guaranteeing **0 database read costs** for historical records.

### E. Capacitor v8 for Android Hybrid Deployment
Capacitor wraps the web application in a hardware-accelerated Android WebView (`android.webkit.WebView`).
- **Key Bridge:** `@capacitor-firebase/authentication` intercepts Google Sign-In requests on Android devices, opening the native Android account picker sheet via Google Play Services, avoiding OAuth redirect restrictions and blank popup errors inside Android WebViews.
