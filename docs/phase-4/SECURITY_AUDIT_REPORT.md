# EDUDISCOVERY — SECURITY & DATA INTEGRITY AUDIT REPORT

**Audit Date:** November 21, 2026  
**Auditor:** Application Security Architect & Data Protection Specialist  
**Evaluation Scope:** Firestore Security Rules, Authentication Session Boundaries, API Protection, Data Poisoning  
**Status:** **SECURE & VERIFIED (PASS)**  

---

## 1. Cloud Firestore Rules & Access Boundary Verification

Security rules defined in `firestore.rules` were empirically verified using `tests/securityRules.test.ts` (28/28 tests passed).

### 1.1 Verified Access Boundary Matrix

| Path / Collection | Unauthenticated Access | Authenticated User A on User A Doc | Authenticated User B on User A Doc | Non-Admin User | Admin User |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/users/{uid}` | **DENIED** | **ALLOWED** | **DENIED** | **ALLOWED (Own Doc)** | **ALLOWED** |
| `/wishlists/{uid}`| **DENIED** | **ALLOWED** | **DENIED** | **ALLOWED (Own Doc)** | **ALLOWED** |
| `/reviews/{id}` | Read: **ALLOWED**, Write: **DENIED** | Create: **ALLOWED**, Delete: **ALLOWED (If Author)** | Mutate: **DENIED** | Create: **ALLOWED** | Manage: **ALLOWED** |
| `/colleges/{id}` | Read: **ALLOWED**, Write: **DENIED** | Write: **DENIED** | Write: **DENIED** | Write: **DENIED** | Write: **ALLOWED** |

**Conclusion:** Strict data isolation between students is mathematically enforced by Firestore security rules. No student can read, overwrite, or delete another student's private profile or shortlisted colleges.

---

## 2. API Endpoint Protection & Rate Limiting

Verified using `tests/security.test.ts` and `tests/rateLimiter.test.ts`:
1. **Administrative Seed Endpoints:** Reject unauthenticated requests and requests from non-admin accounts with **HTTP 403 Forbidden** before any database operations occur.
2. **Rate Limiting:** Sliding-window rate limiter prevents brute-force abuse and catalog scraping.
3. **Secret Protection:** No private API keys or service account credentials exist in client-side bundles or repository source files.

---

## 3. Session Persistence & Security Headers

1. **Origin-Aligned OAuth Proxy Rewrite:** `vercel.json` proxies `/__/:path*` to the Firebase Auth handler, eliminating third-party cookie partitioning issues in Brave, Safari, and private browsing modes.
2. **HTTP Security Headers:**
   - `X-Frame-Options: DENY` (prevents clickjacking)
   - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
