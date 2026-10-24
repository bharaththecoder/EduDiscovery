# EduDiscovery — Prioritized Feature & Defect Backlog
**Date:** October 2026 | **Product Framework:** Value-First EdTech Discovery  
**Standard Priorities:** P0 (Critical/Blocker), P1 (High Impact Core Journey), P2 (Differentiating Value), P3 (Polish/Growth)

---

## 1. Feature Assessment & Prioritization Matrix

| ID | Feature / Fix | Category | Current Status | Evidence / File | User Benefit | Priority | Effort | Dependencies | Risk | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-01** | Public Discovery Route Decoupling | Routing / SEO | **Verified Working** | [`src/app/App.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/app/App.tsx) | Prospective students can browse colleges and deep-link without signing in. | **P0** | S | React Router | None | Unauthenticated access to `/search`, `/compare`, `/university/:id` loads instantly without bouncing. |
| **FEAT-02** | ESLint 9 Pipeline Configuration | Code Quality | **Verified Working** | [`eslint.config.js`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/eslint.config.js) | Enforces clean coding standards and catches Hook violations in CI. | **P0** | S | ESLint 9 | Low | `npm run lint` executes cleanly with 0 errors. |
| **FEAT-03** | ComparePage React Hook Rule Fix | Stability | **Verified Working** | [`src/pages/ComparePage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/ComparePage.tsx) | Prevents runtime crashes when clearing college comparison slots. | **P0** | S | React 19 | None | React never throws "Rendered fewer hooks than expected" during comparisons. |
| **FEAT-04** | AI Prompt Injection Guardrail | AI / Security | **Verified Working** | [`api/chat.js`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/api/chat.js) | Protects LLM from malicious prompt hijacking and credential leaks. | **P0** | S | Groq / Gemini API | None | User questions are bounded in triple-quotes; system prompt forbids instruction overrides. |
| **FEAT-05** | Compare URL Query State Sync | UX / Sharing | **Verified Working** | [`src/pages/ComparePage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/ComparePage.tsx) | Students can share or bookmark comparative views (`?colleges=vit-ap,srm-ap`). | **P1** | S | React Router | Low | Updating comparison slots immediately updates browser URL and retains state on page refresh. |
| **FEAT-06** | Guest Discovery CTAs on Landing Page | Onboarding | **Verified Working** | [`src/pages/LandingPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/LandingPage.tsx) | Unregistered students can discover colleges immediately with zero friction. | **P1** | S | Lucide Icons | None | Hero and footer offer clear "Guest Search" buttons navigating to `/search`. |
| **FEAT-07** | Modal Accessibility & Keyboard Handling | A11y (WCAG) | **Verified Working** | [`src/pages/LandingPage.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/pages/LandingPage.tsx) | Accessible to screen-readers and keyboard-only navigation users. | **P1** | S | ARIA Attributes | None | Modal includes `role="dialog"`, `aria-label`s on all fields, and closes cleanly on `Escape`. |
| **FEAT-08** | Multi-Constraint Search Filtering | Discovery | **Verified Working** | [`tests/search.test.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/tests/search.test.ts) | Students filter strictly by budget, branch, city, and NAAC accreditation. | **P1** | M | University Context | Medium | Combining Vijayawada + CSE + Under 75k returns exact matching colleges without budget fallback. |
| **FEAT-09** | Dead Code Removal (`services/db.ts`) | Architecture | **Verified Working** | [`src/services/db.ts`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/services/db.ts) | Eliminates code bloat and architectural confusion. | **P1** | S | Git | None | Dead file removed with 0 broken imports across codebase. |
| **FEAT-10** | Interactive Campus Map Explorer | Discovery | **Verified Working** | [`src/components/map/CampusMapExplorer.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/components/map/CampusMapExplorer.tsx) | Geographically calibrated exploration of 60 institutions by AP district contour and verified GPS coords. | **P2** | M | Equirectangular SVG | Low | Calibrated SVG map with district filters, campus preview popups, and verified coordinate pin distinction. |
| **FEAT-11** | Saved Comparisons Sync to Firestore | Personalization | **Verified Working** | [`src/contexts/WishlistContext.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/contexts/WishlistContext.tsx) | Account-safe shortlist persistence across mobile and desktop devices without account leakage. | **P2** | M | Firestore Auth | Low | Guest shortlists stored in isolated keys automatically merge into user's account once upon login via atomic operations. |
| **FEAT-12** | Multi-Year Cutoff Trend Analytics | Data / UX | **Verified Working** | [`src/components/analytics/FeeCutoffAnalytics.tsx`](file:///c:/Users/bhara/OneDrive/Documents/Antigravity/app/src/components/analytics/FeeCutoffAnalytics.tsx) | Visualizes defensible fee progression & placement data strictly sourced from APHERMC G.O.Ms.No.17. | **P2** | M | SVG / React | Low | Defensible fee progression charts with CAGR calculation and transparent "Data unavailable" fallback badges. |
| **FEAT-13** | Telugu Language UI Localization | Inclusivity | Backlog | i18next | Expands accessibility to non-English native Telugu speakers and parents. | **P3** | L | Translation JSON | Medium | Header language toggle switches search interface between English and Telugu. |
| **FEAT-14** | Peer Reviews & Verified Alumni Q&A | Community | Backlog | Firestore Collections | Direct student perspective on campus life, hostels, and faculty. | **P3** | XL | Moderation Backend | High | Authenticated alumni submit reviews with student ID verification gate. |

---

## 2. Priority Ranking & Urgency Rationale

### P0 (Must Have Before Release — 100% Implemented)
* **Public Discovery Route Decoupling:** Blocked 100% of guest traffic and Google indexation; solved immediately.
* **React Hook Violation in ComparePage:** Caused runtime white-screen crash; solved immediately.
* **ESLint 9 Pipeline:** Prevented regressions and enforces clean code gates; configured and passing.
* **AI Prompt Injection Hardening:** Prevented prompt override attacks; hardened with boundary delimiters.

### P1 (Core Experience & Trust — 100% Implemented)
* **Compare URL Sharing:** Students frequently share college comparisons with parents and peers; now fully enabled.
* **Accessibility Enhancements:** WCAG 2.2 compliant modal interaction and labeled inputs.
* **Multi-Filter Search Accuracy:** Guarantees students never receive colleges over their specified budget.
* **Dead Code Cleanup:** Cleaned legacy artifacts to streamline codebase maintenance.
* **Automated CI/CD Quality Gate:** GitHub Actions workflow checking lint, tsc, Vitest, and build on every push/PR.

### P2 (High Differentiating Value — 100% Implemented)
* **Interactive Campus Map View:** Calibrated AP vector map with verified campus GPS vs district centroids.
* **Account-Safe Shortlist Sync:** Atomic guest-to-user migration on login with zero account-crossing leakage.
* **Defensible Fee & Placement Analytics:** APHERMC-verified historical fee progression with transparent data gap indicators.
* **Error Boundary & Dynamic OpenGraph Metadata:** Resilient crash recovery with "Try Again" / "Explore Colleges" CTAs and social share previews.

### P3 (Future Product Expansion)
* **Regional Language Localization:** Telugu localization for tier-2/3 student demographics.
* **Verified Alumni Verification System:** Community reviews requiring college email or ID proof.
