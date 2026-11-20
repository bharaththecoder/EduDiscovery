# EDUDISCOVERY — PRODUCTION RELEASE CHECKLIST

**Release Version:** v1.0.1  
**Target Date:** November 2026  
**Release Manager:** Principal Software Architect  
**Branch:** `cleanup/production-codebase-optimization`  
**Git Checkpoint Commit:** `aded3a6`  

---

## 1. Pre-Deployment Quality Gates (All Must Be Checked)

- [x] **TypeScript Strict Check:** `npx tsc --noEmit` exits with code 0 (zero compiler errors).
- [x] **ESLint Static Analysis:** `npm run lint` exits with code 0 (zero warnings, zero errors).
- [x] **Automated Regression Suite:** All 20 operational test files in Vitest pass (468 tests passed).
- [x] **Production Bundle Build:** `npm run build` completes successfully with 0 rollup chunk warnings.
- [x] **Vendor Chunk Size Optimization:** `dist/assets/vendor-*.js` <= 50 kB raw (measured 48.25 kB).
- [x] **Security Rules Verification:** Firestore rules tested with 28 passing unit assertions in `securityRules.test.ts`.
- [x] **Admin Route Protection:** Seed endpoint verified to return HTTP 403 Forbidden for non-admin requests in `security.test.ts`.
- [x] **Official Data Provenance:** APSCHE 2024, 2023, 2022 datasets cryptographically verified against SHA-256 hashes.
- [x] **Zero Synthetic Ranks:** 496 unallotted seats preserved with null values without artificial zeroes.
- [x] **SEO Route Redirection:** `/college/:id` redirect paths active in `App.tsx` matching all 60 sitemap URLs.
- [x] **Capacitor Mobile Configuration:** Target SDK 34, native Google Auth plugin, safe-area insets verified.

---

## 2. Production Smoke-Test Checklist (Post-Deployment)

Execute immediately following a production deployment:

1. **Guest Public Discovery:**
   - [ ] Visit `https://edu-discovery.vercel.app/`.
   - [ ] Confirm hero animations load without layout shift.
   - [ ] Navigate to `/search` and execute a search query (e.g. "VIT").
   - [ ] Filter by district (e.g. "Guntur") and branch (e.g. "CSE").
   - [ ] Open an engineering college detail page (e.g. `/university/vit-ap`).
   - [ ] Confirm official cutoffs table loads with category filters (OC, BC_A, SC, ST).
   - [ ] Test legacy redirect: Open `/college/vit-ap` and confirm redirection to `/university/vit-ap`.
2. **Student Authentication & Cloud Sync:**
   - [ ] Click "Sign In" and authenticate with Google.
   - [ ] Confirm user profile displays authenticated name and avatar.
   - [ ] Bookmark 2 colleges to wishlist.
   - [ ] Open `/wishlist` and verify shortlisted colleges appear.
   - [ ] Open `/compare` and compare 2 shortlisted colleges.
   - [ ] Log out and verify session clears safely.
3. **Android Native APK Smoke Test:**
   - [ ] Launch application on Android test device.
   - [ ] Confirm splash screen dismisses smoothly.
   - [ ] Test native Google Play Services sign-in bottom sheet.
   - [ ] Verify bottom navigation bar sits cleanly above Android gesture bar.
   - [ ] Test native back button navigation between search and home.

---

## 3. Rollback Procedure

If a critical defect is identified post-release:
1. **Vercel Rollback:**
   - In the Vercel Dashboard, select **Deployments**.
   - Locate the previous stable deployment (commit `67e3c22` or `f0824b3`).
   - Click **Instant Rollback**. Traffic is immediately routed to the prior build within seconds without rebuilding.
2. **Git Recovery:**
   - Check out the known stable commit: `git checkout cleanup/production-codebase-optimization`.
   - Revert any problematic commits using `git revert <commit-hash>`.
