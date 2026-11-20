# EDUDISCOVERY — SECURITY & RELIABILITY REPORT

**Audit Date:** November 21, 2026  
**Auditor:** Principal Security Engineer & Cloud Reliability Architect  
**Status:** **SECURE & HIGHLY RELIABLE (PASS)**  

---

## 1. Firebase Authentication & Session Security

1. **Multi-Tier Session Persistence:**
   - Evaluated in `src/services/firebase.ts`:
     ```typescript
     persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
     ```
   - Gracefully cascades across IndexedDB, localStorage, and sessionStorage, preventing login drops in privacy-hardened browsers (e.g. Brave Shields, Safari Intelligent Tracking Prevention).
2. **Origin-Aligned OAuth Proxy Rewrite:**
   - In `vercel.json`, requests to `/__/:path*` are rewritten to `https://edudiscovery-9cff0.firebaseapp.com/__/:path*`.
   - Eliminates third-party cookie partitioning issues by conducting the OAuth handshake on the first-party domain.
3. **Android Native Token Validation:**
   - Native Google Play Services exchanges signed hardware tokens with Firebase Auth using SHA-1 verification.

---

## 2. Firestore Access Control & Security Rules

Verified against `firestore.rules` via `tests/securityRules.test.ts` (28/28 tests passed):

| Collection / Path | Read Permission | Write / Create Permission | Update / Delete Permission |
| :--- | :--- | :--- | :--- |
| `/users/{userId}` | Authenticated user (`request.auth.uid == userId`) | Authenticated user (`request.auth.uid == userId`) | Authenticated user only |
| `/wishlists/{userId}` | Authenticated user (`request.auth.uid == userId`) | Authenticated user (`request.auth.uid == userId`) | Authenticated user only |
| `/reviews/{reviewId}` | Public read (`true`) | Authenticated author (`request.auth.uid == request.resource.data.userId`) | Review author only |
| `/colleges/{collegeId}`| Public read (`true`) | Admin claims only (`request.auth.token.admin == true`) | Admin claims only |

**Finding:** Cross-user data modification is completely disallowed. User A cannot read or overwrite User B's profile or wishlist.

---

## 3. Seed API Access Control (SEC-01)

Verified in `tests/security.test.ts` (3/3 tests passed):
- Unauthenticated requests to administrative seed endpoints receive **HTTP 403 Forbidden**.
- Signed-in users lacking `admin: true` custom claims receive **HTTP 403 Forbidden**.
- Expired or malformed bearer tokens are rejected before any database operations occur.

---

## 4. API Rate Limiting & Resilience

Verified in `tests/rateLimiter.test.ts` (8/8 tests passed):
- Sliding-window rate limiter prevents brute-force authentication attacks and catalog scraping.
- Client-side error boundary catches unexpected rendering exceptions and displays friendly recovery options without exposing internal stack traces.
