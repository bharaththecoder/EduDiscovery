# EduDiscovery 🎓

> **The definitive engineering college discovery, decision intelligence, and web-options counseling platform for Andhra Pradesh.**  
> Comprehensive college discovery, interactive AP campus map, multi-institution comparison matrix, official AP EAPCET web-options priority generator, native Android APK build, and real-time in-app updates.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-edu--discovery.vercel.app-black?style=for-the-badge&logo=vercel)](https://edu-discovery.vercel.app)
&nbsp;
[![Android Release](https://img.shields.io/badge/Android%20APK-v1.0.1-10B981?style=for-the-badge&logo=android&logoColor=white)](https://github.com/bharaththecoder/EduDiscovery/releases/tag/v1.0.1)
[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor%20Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tests](https://img.shields.io/badge/Tests-Passing-10B981?style=for-the-badge&logo=vitest&logoColor=white)](#-testing--quality-assurance)

---

## ✨ Overview

**EduDiscovery** streamlines the engineering and higher education admissions journey across Andhra Pradesh. Instead of navigating dense, multi-page government PDF records or generic national aggregators, students get an authoritative, localized admissions platform:

- **Official AP EAPCET Web-Options Assistant:** Algorithmic probability clustering segregating choices into **Dream ➔ Target ➔ Safe** tiers with official 4-letter APSCHE institute codes (`AUCE`, `VRSE`, `GMRIT`, etc.), APHERMC fee gazettes, and local quota pools (`AU` vs `SVU`).
- **7,267 Verified Cutoff Closing Ranks:** Provenance-backed closing rank gazettes directly parsed from published government counselling records (2024, 2023, 2022) across OC, BC, SC, ST, and EWS categories.
- **Side-by-Side Comparison Matrix:** Multi-institution comparison across fees, NIRF/NAAC ratings, campus infrastructure, hostel standards, and Recharts radar & bar analytics.
- **Interactive Andhra Pradesh Campus Map Explorer:** Precise geographic vector projection mapping premier campuses with regional zones (Rayalaseema, Coastal Andhra, Uttarandhra).
- **Fast Filter & Discovery Catalog:** Multi-parameter search by district, branch, NAAC grade, tuition fee range, and government/autonomous status.
- **Native Android APK & In-App Update Checker:** Native hardware-accelerated Android experience with automated GitHub Releases version polling, dismissible update banners, and offline fallback.

---

## 🚀 Built Features & Capabilities

| Feature | Description | Key Tech |
|---|---|---|
| 📋 **Web-Options Priority Assistant** | Generates prioritized choice-filling lists with official 4-letter APSCHE codes, APHERMC fees, drag/drop priority reordering, offline `.html` export, and A4 print sheets | Intelligence Engine + React DOM Portal |
| 🔍 **College Discovery & Catalog** | Multi-facet filtering by branch, district, NAAC accreditation, fee tier, and government status with instant search | Fast In-Memory Indexing + React State |
| 🤖 **In-App Update Engine** | Client-side version checker polling GitHub Releases API, dismissible bottom banner with direct APK download link, and manual update trigger | Native Fetch + Cache Busting + LocalStorage |
| 📱 **Native Android APK** | Hardware-accelerated native Android build with custom adaptive vector icon suite, splash theming, and edge-to-edge system navigation | Capacitor 8 + Android Gradle |
| 🗺️ **AP Campus Map Explorer** | Geographically projected vector map of Andhra Pradesh spanning Rayalaseema, Coastal AP, and Uttarandhra with interactive college popup cards | Geodetic Projection + SVG Vector |
| ⚖️ **Compare Matrix** | Multi-college side-by-side comparison with radar graphs (ROI, Placements, Fees) and structured metrics | Recharts + Framer Motion |
| ❤️ **Wishlist Hub** | Shortlist colleges with heart animations, batch comparison, and cloud sync | Firebase Firestore + LocalStorage |
| 📰 **Admissions News Feed** | Real-time news feed covering EAPCET counselling schedules and fee gazettes with interactive reading modal | React Portals + Live Feed |
| 👤 **User Profile & Activity** | Track search history, bookmarked colleges, preferences, and editable student profile | Firebase Auth + Firestore |

---

## 🏛️ Statutory Data Provenance

All counseling intelligence, fee figures, and quota boundaries are backed by authentic statutory records:

1. **Closing Ranks Source:** Andhra Pradesh State Council of Higher Education (APSCHE) AP EAPCET Final Phase Allotment Statements (2024, 2023, 2022) with 7,267 verified records.
2. **Tuition Fee Gazette:** Andhra Pradesh Higher Education Regulatory and Monitoring Commission (APHERMC) G.O.Ms.No.17 and G.O.Ms.No.48 specifying audited convenor and management fee schedules.
3. **Local Candidate Quota (85%):** Evaluated in strict conformity with the Andhra Pradesh Educational Institutions (Regulation of Admissions) Order, 1974 (Presidential Order) for **Andhra University (AU)** and **Sri Venkateswara University (SVU)** local areas.

---

## 📱 Web & Android Native App

EduDiscovery is available both as a web app and a high-performance native Android application:

- **Web Application:** [edu-discovery.vercel.app](https://edu-discovery.vercel.app)
- **Android APK:** Direct download from [GitHub Releases v1.0.1](https://github.com/bharaththecoder/EduDiscovery/releases/tag/v1.0.1)
- **In-App Update Engine:** Automatically checks for new GitHub release tags and displays a dismissible update banner when a newer APK is available.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      React 19 SPA      │
                                  │ (Vite + Tailwind CSS)  │
                                  └───────────┬────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
               ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
               │ Firebase Client  │  │   Vercel Edge    │  │  Capacitor Core  │
               │ (Auth & Firestore)│ │ (API & OAuth Proxy)│ │ (Android Native) │
               └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🗂️ Project Structure

```
edudiscovery/
├── android/                    # Native Android project (Capacitor)
│   ├── app/src/main/res/       # Adaptive mipmap icons & splash drawables
│   └── app/build.gradle        # Android build configurations
│
├── api/                        # Vercel Serverless API Endpoints
│   ├── firebaseAdmin.js        # Server-side Firebase Admin SDK initialization
│   ├── news.js                 # Admissions news aggregator endpoint
│   └── recommend.js            # Rule-based college matching
│
├── gov-data-eapcet/            # Authoritative APSCHE / APHERMC Datasets
│   ├── eapcet_btech_colleges_master.json # 60 premier institutions with 4-letter codes
│   ├── eapcet_btech_cutoffs_master.json  # Category-wise closing ranks (OC, BC, SC, ST)
│   └── audit_data_sources.md   # Government gazette references
│
├── src/
│   ├── app/                    # App root & route configurations
│   ├── components/
│   │   ├── cards/              # UniversityCard, UniversityCardSkeleton
│   │   ├── layout/             # Navbar, BottomNav, AppUpdateBanner, Layout
│   │   ├── map/                # CampusMapExplorer (AP geographic vector map)
│   │   └── ui/                 # Accessible Button, Card, Badge primitives
│   │
│   ├── contexts/               # React Context Providers (Auth, University, Toast)
│   ├── data/                   # Real AP college dataset, news & coordinates
│   ├── pages/                  # Route views (Home, Search, WebOptions, Compare, Profile)
│   ├── services/               # Firebase SDK setup, appUpdateService, metadata
│   ├── utils/                  # webOptionsEngine, intelligenceEngine, ROI calculator
│   └── index.css               # Design system tokens, emerald theme & responsive rules
│
├── tests/                      # Automated Vitest test suites
├── public/                     # Favicons and images
├── vite.config.js              # Vite build & vendor code-splitting
└── vercel.json                 # API routing, OAuth rewrite proxy & SPA fallback
```

---

## ⚙️ Quick Start (Local Development)

### Prerequisites
- **Node.js 18+**
- **Firebase Project** with Firestore and Authentication enabled

### 1. Clone & Install
```bash
git clone https://github.com/bharaththecoder/EduDiscovery.git
cd EduDiscovery
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your credentials to `.env`:
```env
# Client-side Firebase credentials
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Assurance

EduDiscovery includes automated test suites verifying security, routing, rate limiting, and calculation engines:

```bash
# Run automated tests
npm test

# Run TypeScript type check
npx tsc --noEmit
```

---

## ☁️ Deployment

The project is continuously deployed on **Vercel** with automatic synchronization to **Capacitor Android**:

- **Production URL:** [https://edu-discovery.vercel.app](https://edu-discovery.vercel.app)
- **Framework:** Vite React 19 SPA
- **Serverless Functions:** `/api/*` mapped via `vercel.json`
- **OAuth Proxy Rewrite:** `/__/*` remapped directly to Firebase Auth domain, preventing browser storage-partitioning issues in privacy browsers like Brave and Safari.

---

## 📄 License

[MIT](LICENSE)

