# 3. Complete System Architecture — EduDiscovery

## 3.1 High-Level System Architecture

EduDiscovery is built upon a **decoupled hybrid architecture** where a client-side Single Page Application (SPA) / Native Mobile Container interfaces with three distinct data and service tiers:
1. **Cloud Firestore Tier:** For real-time user profiles, wishlists, and remote college overrides.
2. **Static Edge CDN Tier:** For zero-latency, high-volume historical cutoff data (2022–2024 JSON snapshots) and static media assets.
3. **Serverless Compute Tier:** Vercel Serverless Functions (Node.js) backed by Firebase Admin SDK and Upstash Redis for privileged operations and rate-limited tasks.

```mermaid
flowchart TD
    subgraph Client["Client Devices"]
        WebBrowser["Modern Desktop/Mobile Browser\n(https://edu-discovery.vercel.app)"]
        AndroidApp["Native Android APK (Capacitor Runtime)\n(com.edudiscovery.app)"]
    end

    subgraph CDN["Global Edge CDN (Vercel Edge Network)"]
        EdgeStatic["Static Web Bundle (HTML, JS, CSS)\nPre-chunked via Vite"]
        CutoffCDN["Static Cutoff Snapshots\n(/data/official-cutoffs/{2022,2023,2024}.json)"]
    end

    subgraph AuthTier["Authentication & Identity"]
        FirebaseAuth["Google Firebase Auth\n(OAuth 2.0 / JWT Tokens)"]
        PlayServices["Google Play Services\n(@capacitor-firebase/authentication)"]
    end

    subgraph DataTier["Data & Persistence Tier"]
        Firestore["Cloud Firestore NoSQL\n- users/{uid}\n- colleges/{collegeId}\n- user_activity/{uid}"]
        LocalCache["Client Storage\n- localStorage (Guest Wishlists)\n- in-memory session singletons"]
    end

    subgraph ServerlessTier["Backend Compute Tier (Vercel Serverless)"]
        APIProxy["Vercel Serverless API (/api/*)"]
        RateLimiter["Rate Limiter (Token Bucket)\nUpstash Redis REST"]
        AdminSDK["Firebase Admin SDK\nPrivileged Seeding & Claims"]
    end

    WebBrowser --> EdgeStatic
    AndroidApp --> EdgeStatic
    WebBrowser --> CutoffCDN
    AndroidApp --> CutoffCDN

    WebBrowser --> FirebaseAuth
    AndroidApp --> PlayServices
    PlayServices --> FirebaseAuth

    WebBrowser --> Firestore
    AndroidApp --> Firestore
    WebBrowser --> LocalCache
    AndroidApp --> LocalCache

    WebBrowser --> APIProxy
    APIProxy --> RateLimiter
    APIProxy --> AdminSDK
    AdminSDK --> Firestore
```

---

## 3.2 Frontend Architecture & Component Hierarchy

The frontend follows an **Idiomatic React Architecture** using clean separation of concerns:
- **`src/app/`**: Application bootstrap, global context providers, error boundaries, and top-level route tree.
- **`src/contexts/`**: Global state containers managing Auth, Universities, Wishlists, Theme, and UI Toasts.
- **`src/pages/`**: Route-level screen components dynamically loaded via `lazyWithRetry`.
- **`src/components/`**: Reusable modular UI building blocks divided into UI primitives, layout containers, analytics charts, and cards.
- **`src/services/`**: External communication adapters (Firestore queries, Auth API, Cutoff CDN fetcher).
- **`src/utils/`**: Pure algorithmic computation engines (Web Options engine, cutoff search filters).

```mermaid
graph TD
    Main["main.tsx\n(React 19 Root Render)"] --> AppProviders["AppProviders.tsx\n(Hierarchical Context Wrapping)"]
    
    subgraph ContextHierarchy["Global State Tree"]
        AppProviders --> ThemeProvider["ThemeProvider\n(Light / Dark Mode State)"]
        ThemeProvider --> AuthProvider["AuthProvider\n(User Auth & JWT Listener)"]
        AuthProvider --> UniversityProvider["UniversityProvider\n(Live Firestore / Fallback Catalog)"]
        UniversityProvider --> WishlistProvider["WishlistProvider\n(Dual Local/Firestore Sync)"]
        WishlistProvider --> ToastProvider["ToastProvider\n(Feedback Notifications)"]
    end

    ToastProvider --> App["App.tsx\n(Router & Route Guard Layer)"]

    subgraph RouteGuards["Routing & Layout System"]
        App --> ErrorBoundary["ErrorBoundary\n(Catches Uncaught UI Crashes)"]
        ErrorBoundary --> BrowserRouter["BrowserRouter\n(HTML5 History API)"]
        BrowserRouter --> Suspense["Suspense + lazyWithRetry\n(Resilient Chunk Loading)"]
        
        Suspense --> PublicRoutes["Public Routes\n- / (LandingPage)\n- /search (SearchPage)"]
        Suspense --> ProtectedRoutes["Protected Routes (RequireAuth)\n- /home (HomePage)\n- /compare (ComparePage)\n- /university/:id (UniversityDetailPage)\n- /web-options (WebOptionsPage)\n- /wishlist (WishlistPage)\n- /profile (ProfilePage)"]
    end
```

---

## 3.3 Backend Serverless Architecture & Execution Pipeline

EduDiscovery utilizes a hybrid backend runtime:
1. **Production Runtime:** Vercel Serverless Functions (`api/*.js`) executed as isolated ephemeral Node.js micro-instances at edge points of presence.
2. **Local Development Runtime:** `api-server.js` running Express on port `3001`, providing local proxy endpoints that execute identical handler logic.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Client / Browser
    participant API as Vercel Serverless API (/api/seed.js)
    participant Limiter as Upstash Redis Rate Limiter
    participant Auth as Firebase Admin SDK
    participant DB as Cloud Firestore

    Admin->>API: POST /api/seed (Authorization: Bearer <ID_TOKEN>)
    activate API
    API->>Limiter: checkRateLimit(ClientIP, Limit: 10/min)
    alt Rate Limit Exceeded
        Limiter-->>API: 429 Too Many Requests
        API-->>Admin: HTTP 429 { error: "Rate limit exceeded" }
    else Rate Limit OK
        Limiter-->>API: Allow Request
        API->>Auth: verifyIdToken(token)
        alt Token Missing or Invalid
            Auth-->>API: Verification Error
            API-->>Admin: HTTP 403 Forbidden { error: "Unauthorized" }
        else Token Valid (Check Claims)
            Auth-->>API: Decoded Token (uid, email, admin: true)
            API->>DB: Batch Write Colleges Collection
            DB-->>API: Write Acknowledged
            API-->>Admin: HTTP 200 { success: true, count: N }
        end
    end
    deactivate API
```

---

## 3.4 Data Flow Architecture: The Web Options Engine Flow

A critical feature evaluators examine is how student inputs (Rank, Reservation Category, Gender Pool, and Target Branches) travel through the system to produce prioritized admission options:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as WebOptionsPage.tsx
    participant Service as officialCutoffService.ts
    participant Cache as In-Memory Cutoff Cache
    participant CDN as Vercel Edge CDN (/data/official-cutoffs/2024.json)
    participant Engine as webOptionsEngine.ts

    Student->>UI: Selects Rank: 14500, Category: BC-B, Gender: Girls, Region: AU
    UI->>Service: queryHistoricalCutoffs({ year: 2024, category: 'BCB', gender: 'Girls' })
    activate Service
    alt Dataset already in Memory?
        Service->>Cache: Read 2024 JSON cache
        Cache-->>Service: Return 2,800+ Cutoff Records
    else Dataset Not in Memory
        Service->>CDN: HTTP GET /data/official-cutoffs/2024.json
        CDN-->>Service: Return Raw Cutoff Payload (850 KB)
        Service->>Cache: Store parsed records in singleton
    end
    Service-->>UI: Return Filtered Cutoff Records
    deactivate Service

    UI->>Engine: computeWebOptionsStrategy({ studentRank: 14500, cutoffs, margin: 0.15 })
    activate Engine
    Note over Engine: Categorizes Options:<br/>- Aggressive: Closing Rank < 12,325<br/>- Realistic: 12,325 <= Closing Rank <= 17,250<br/>- Safe: Closing Rank > 17,250
    Engine-->>UI: Return Prioritized Strategic List
    deactivate Engine
    UI->>Student: Renders Categorized Interactive Web Options Cards
```

---

## 3.5 Production Build and Deployment Pipeline

The application is deployed through an automated GitHub-to-Vercel CI/CD workflow combined with local Capacitor Android native compilation:

```mermaid
flowchart LR
    subgraph GitRepo["Source Repository"]
        Commit["Git Commit / Push to main\n(git push origin main)"]
    end

    subgraph WebCI["Web Production CI/CD (Vercel)"]
        VercelHook["Vercel Webhook Triggered"]
        VercelBuild["Vite Build Execution\n(npm run build)"]
        VercelOptimize["Rolldown Chunk Splitting &\nGzip Compression"]
        VercelDeploy["Global Edge Deployment\n(edu-discovery.vercel.app)"]
    end

    subgraph MobileBuild["Android Native Compilation"]
        CapSync["Capacitor Sync\n(npx cap sync android)"]
        AndroidGradle["Android Studio / Gradle Build\n(./gradlew assembleRelease)"]
        SignedAPK["Release APK Generated\n(EduDiscovery-v1.0.1.apk)"]
    end

    Commit --> VercelHook
    VercelHook --> VercelBuild
    VercelBuild --> VercelOptimize
    VercelOptimize --> VercelDeploy

    Commit --> CapSync
    CapSync --> AndroidGradle
    AndroidGradle --> SignedAPK
```
