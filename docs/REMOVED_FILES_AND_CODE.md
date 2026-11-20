# EduDiscovery — Inventory of Removed Files & Pruned Code

**Project:** EduDiscovery (v1.0.1)  
**Date:** November 2026  

---

## 1. Removed Files

| File Path | Original Purpose | Reason for Removal | Evidence of Non-Usage |
| :--- | :--- | :--- | :--- |
| `src/get_colleges.ts` | Temporary college list logging script | One-off scratch script duplicated by official tooling | Verified zero imports in `src/` and `tests/` via `git grep` |
| `src/components/analytics/OfficialCutoffPreview.tsx` | Re-export alias for `OfficialCutoffsSection` | Redundant proxy file; consumers import target component directly | Zero external references in codebase |

---

## 2. Removed NPM Configuration & Dead Scripts

| Script Name | Command Removed | Reason |
| :--- | :--- | :--- |
| `data:audit` | `python scripts/fetch_ap_colleges_data.py` | Target file does not exist in `scripts/` |
| `images:download` | `python scripts/download_highres_images.py` | Target file does not exist in `scripts/` |
| `images:sync` | `node scripts/sync-local-images.mjs` | Target file does not exist in `scripts/` |

---

## 3. Dead Code & Pruned Imports Breakdown

### A. React & Icon Imports Pruned
- `src/components/analytics/FeeCutoffAnalytics.tsx`: Removed `Info`, `Calendar`, `DollarSign`, `Award`, `Briefcase`.
- `src/components/map/CampusMapExplorer.tsx`: Removed `Navigation`, `ExternalLink`, `Award`, `Sparkles`.
- `src/components/analytics/OfficialCutoffsSection.tsx`: Removed `Calendar`, `Layers`, `Filter`, `Building`, `Compass`, `CheckCircle`.
- `src/components/layout/AppUpdateBanner.tsx`: Removed `ExternalLink`.
- `src/pages/HomePage.tsx`: Removed `MapPin`, `Laptop`, `Compass`, `Target`, `Banknote`, `auth`, `Variants`.
- `src/pages/LandingPage.tsx`: Removed `Zap`, `BookOpen`, `MessageSquare`, `FloatingEmoji3D`, `GlowButton`, `SpotlightCard`, `VelocityText`, `useMotionValue`, `useTransform`, `AnimatePresence`, `useEffect`, `useRef`.
- `src/pages/UniversityDetailPage.tsx`: Removed `Award`, `Calendar`, `CreditCard`, `BadgePercent`.
- `src/components/Animation3DComponents.tsx`: Removed `useCallback`, `AnimatePresence`.

### B. Unused Component & Animation Helpers
- `src/pages/LandingPage.tsx`: Deleted unreferenced `TiltCard` component helper.
- `src/pages/HomePage.tsx`: Deleted unused Framer Motion animation objects `containerVariants` and `itemVariants`.
- `src/utils/intelligenceEngine.ts`: Deleted unused `rankTierValues` dictionary.
