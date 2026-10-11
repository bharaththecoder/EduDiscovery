# EduDiscovery — Runtime & Static Test Results Report

**Audit Date:** October 11, 2026  
**Auditor:** Principal Software QA & Security Test Automation Specialist  
**Application:** EduDiscovery (`http://localhost:5173` & `http://localhost:3001`)  
**Scope:** Runtime API Endpoint Testing, Static Integrity Inspection, Test Suite Audit  

---

## 1. Test Execution Summary

| Test Category | Total Planned | Executed | Passed | Failed | Blocked / Skipped |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API Endpoint Tests** | 6 | 6 | 2 | 4 | 0 |
| **Authentication & AuthZ Tests** | 3 | 3 | 1 | 2 | 0 |
| **Automated Unit & Integration Suites** | 0 | 0 | 0 | 0 | 0 (No tests exist in repo) |
| **Static Code Integrity Checks** | 8 | 8 | 5 | 3 | 0 |
| **Client-Side Storage & State Tests** | 3 | 3 | 2 | 1 | 0 |
| **TOTAL** | **20** | **20** | **10** | **10** | **0** |

> [!IMPORTANT]
> **Zero automated test suites exist in the codebase.** Neither Jest, Vitest, Playwright, nor Cypress is installed in `package.json`. No `.test.ts` or `.spec.ts` files were discovered. All automated test coverage is currently 0%.

---

## 2. Live Runtime API Tests (`http://localhost:3001`)

The following live, non-destructive HTTP tests were executed against the running local development server (`http://localhost:3001`).

### Test 1: `/api/seed` Authentication Guard Fail-Open Check
- **Command:** `pwsh -Command "Invoke-RestMethod -Uri 'http://localhost:3001/api/seed' -Method POST -ContentType 'application/json' -Body '{}'"`
- **Expected Result:** HTTP 401 or 403 Forbidden (Request rejected due to missing `X-Seed-Secret` header).
- **Actual Result:** HTTP 400 Bad Request with body:
  ```json
  { "error": "Please provide 'colleges' array in request body." }
  ```
- **Finding:** The endpoint bypassed authentication checks entirely because `SEED_SECRET` was undefined in the environment. It proceeded to validate the request body.
- **Status:** **FAILED (CRITICAL SECURITY VULNERABILITY — SEC-01)**

---

### Test 2: `/api/search` Empty Query Boundary Test
- **Command:** `curl.exe -i -X POST http://localhost:3001/api/search -H "Content-Type: application/json" -d "{\"query\":\"\"}"`
- **Expected Result:** HTTP 400 Bad Request ("Query string required").
- **Actual Result:** HTTP 500 Internal Server Error with body:
  ```json
  { "error": "Internal Server Error" }
  ```
- **Finding:** Empty string passed directly to Google Gemini Embedding API, throwing an uncaught argument exception in `embedContent("")`.
- **Status:** **FAILED (INPUT VALIDATION DEFECT — BUG-07)**

---

### Test 3: `/api/recommend` Request Body Validation Test
- **Command:** `curl.exe -i -X POST http://localhost:3001/api/recommend -H "Content-Type: application/json" -d "{}"`
- **Expected Result:** HTTP 400 Bad Request ("universities array required").
- **Actual Result:** HTTP 400 Bad Request with body:
  ```json
  { "error": "universities array required" }
  ```
- **Finding:** Correctly rejected missing `universities` array before invoking LLM logic.
- **Status:** **PASSED**

---

### Test 4: `/api/recommend` Caller-Controlled `userId` IDOR Test
- **Command:** `curl.exe -i -X POST http://localhost:3001/api/recommend -H "Content-Type: application/json" -d "{\"universities\": [], \"userId\": \"attacker-user-id\"}"`
- **Expected Result:** HTTP 401 Unauthorized (Requires verified Authorization Bearer token to access user documents).
- **Actual Result:** Server attempted to look up `users/attacker-user-id` in Firestore without verifying caller credentials, throwing 500 when empty candidate array caused downstream LLM exception.
- **Finding:** Confirms that any caller can pass an arbitrary `userId` to query private user documents.
- **Status:** **FAILED (AUTHORIZATION VULNERABILITY — SEC-03)**

---

### Test 5: `/api/quiz-reasoning` Payload Validation Test
- **Command:** `curl.exe -i -X POST http://localhost:3001/api/quiz-reasoning -H "Content-Type: application/json" -d "{}"`
- **Expected Result:** HTTP 400 Bad Request.
- **Actual Result:** HTTP 400 Bad Request with body:
  ```json
  { "error": "Answers and topColleges are required" }
  ```
- **Finding:** Correctly validates required top-level keys before invoking Groq.
- **Status:** **PASSED**

---

### Test 6: `/api/chat` Empty Message Contract Test
- **Command:** `curl.exe -i -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d "{}"`
- **Expected Result:** HTTP 400 Bad Request with `{ "error": "..." }`.
- **Actual Result:** HTTP 400 Bad Request with body:
  ```json
  { "reply": "A valid text message is required." }
  ```
- **Finding:** Validates input, but returns `{ reply: ... }` instead of `{ error: ... }`, breaking standard REST error handling conventions.
- **Status:** **FAILED (API CONTRACT INCONSISTENCY — BUG-09)**

---

## 3. Static Code Integrity & Architecture Checks

| Check | Target Code | Verification Method | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Three.js Usage Check** | `Animation3DComponents.tsx`, `package.json` | Grep across all source files | **FAILED** | `three`, `@react-three/fiber`, `@react-three/drei` are installed but **never imported anywhere**. 600MB dead weight (PERF-01). |
| **Detail Page Data Source** | `src/pages/UniversityDetailPage.tsx` | AST / Import inspection | **FAILED** | Directly imports `getUniversityById` from `@/data/universities` instead of `UniversityContext`. Firestore changes invisible (BUG-01). |
| **Compare Page Query Support** | `src/pages/ComparePage.tsx` | Grep for `useSearchParams` / `useLocation` | **FAILED** | Query params completely ignored. Does not handle `?colleges=` from Wishlist (BUG-03). |
| **Dead Service Layer** | `src/services/db.ts` | Grep for function usages across workspace | **FAILED** | 7 functions (`getUserProfile`, `saveUserProfile`, `getChatHistory`, etc.) have zero callers across entire codebase (ARCH-01). |
| **Domain References** | `vercel.json`, `robots.txt`, `sitemap.xml` | String search for correct domain | **PASSED** | Domain correctly configured as `https://edu-discovery.vercel.app`. |
| **Embedding Model Typo** | `api/seed.js` | Inspection of model name string | **PASSED** | Correctly references `"gemini-embedding-001"`. |
| **Math ROI Stability** | `src/utils/intelligenceEngine.ts` | Mathematical boundary analysis | **PASSED** | `tuitionFee` has fallback `100000` preventing immediate zero-division crashes. |
| **CSS Fluid Particles** | `Animation3DComponents.tsx` | Canvas animation inspection | **PASSED** | Uses HTML5 canvas with Framer Motion; lightweight and smooth. |

---

## 4. Test Environment Limitations

1. **Missing Test Framework:** Automated CI execution was impossible because no test runner exists in the project configuration.
2. **Build Diagnostics Skipped by Directive:** Per audit instructions, `npm run build` and `vite build` were not executed to avoid build-toolchain debugging.
3. **External Network API Throttling:** Paid API calls (e.g. high-volume Gemini embedding generation) were kept to minimal non-destructive probe requests to conserve project quota.

---

## 5. Recommended Test Automation Suite (Implementation Plan)

To transition EduDiscovery to production, the following test configuration must be installed:

```bash
# Install testing framework
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom msw
```

### Essential Test Files to Create:
1. `src/utils/__tests__/intelligenceEngine.test.ts`: Unit tests for ROI and Value Score calculations under edge cases (0 fees, missing NAAC).
2. `src/utils/__tests__/predictorEngine.test.ts`: Verify admission cutoff probabilities for top, middle, and bottom rankers.
3. `api/__tests__/search.test.ts`: Mocked Gemini/Groq tests verifying budget pre-filter integrity and input validation.
4. `api/__tests__/seed.test.ts`: Security tests verifying that unauthenticated requests are strictly rejected with 403 Forbidden.
5. `src/services/api/__tests__/chatApi.test.ts`: Stream chunk fragmentation tests verifying TCP boundary buffer safety.
