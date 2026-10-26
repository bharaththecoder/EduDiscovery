# EduDiscovery 🎓

> **The smartest AI-powered college discovery, decision, and web-options counseling platform for Andhra Pradesh.**  
> Semantic AI search, RAG counselor chat, interactive AP campus map, side-by-side comparison matrix, official EAPCET web-options priority generator, and smart wishlist management — built for modern students.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-edu--discovery.vercel.app-black?style=for-the-badge&logo=vercel)](https://edu-discovery.vercel.app)
&nbsp;
[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini%202.0-8E75FF?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Tests-103%20Passed-10B981?style=for-the-badge&logo=vitest&logoColor=white)](#-testing--quality-assurance)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#-progressive-web-app-pwa)

---

## ✨ Overview

**EduDiscovery** streamlines the engineering and higher education admissions journey across Andhra Pradesh. Instead of navigating static government PDFs or generic national aggregators, students get an intelligent, localized admissions companion:

- **Official AP EAPCET Web-Options Assistant:** Sequences choices into **Dream ➔ Target ➔ Safe** tiers with official 4-letter APSCHE institute codes, APHERMC fee gazettes, and local quota pools (`AU` vs `SVU`).
- **Interactive Andhra Pradesh Campus Map Explorer:** Precise geographic vector projection mapping premier campuses with regional zones (Rayalaseema, Coastal Andhra, Uttarandhra).
- **Instant Semantic AI Search:** Natural language intent parsing matching queries like *"Top CSE colleges in Vijayawada under 1.5 Lakh"*.
- **RAG-Powered AI Counselor (`C3 Insta Counselor`):** Real-time conversational guidance grounded in verified cutoffs, fee structures, and placement statistics.
- **Side-by-Side College Compare:** Multi-institution comparison matrix with Recharts radar analysis (ROI, Placements, Fees) and AI-generated synthesis.
- **Real-Time Admissions News Feed:** Live EAPCET counseling notifications, phase dates, and regulatory announcements.

---

## 🚀 Built Features & Capabilities

| Feature | Description | Key Tech |
|---|---|---|
| 📋 **Web-Options Priority Assistant** | Generates prioritized choice-filling lists with official 4-letter APSCHE codes (`AUCE`, `VRSE`, etc.), APHERMC fees, drag/drop priority reordering, offline `.html` export, and A4 print sheets | Intelligence Engine + React DOM Portal |
| 🗺️ **AP Campus Map Explorer** | Geographically projected vector map of Andhra Pradesh spanning Rayalaseema, Coastal AP, and Uttarandhra with interactive college popup cards | Geodetic Projection + SVG Vector |
| 🤖 **Semantic AI Search** | Natural language intent parsing with Gemini embeddings + cosine similarity ranking + priority city intent boosting | Gemini API + Vector Math |
| 💬 **RAG AI Counselor** | Floating AI assistant streaming responses grounded in verified college dataset (fees, NAAC, placements, cutoffs) | Vercel Serverless + Gemini 2.0 |
| ⚖️ **Compare Matrix** | Multi-college side-by-side comparison with radar graphs (ROI, Placements, Fees) and instant AI Verdict | Recharts + Framer Motion |
| ❤️ **Wishlist Hub** | Shortlist colleges with heart animations, batch comparison, AI prompt prep, and cloud sync | Firebase Firestore + LocalStorage |
| 📰 **Admissions News Feed** | Real-time news feed covering EAPCET counselling schedules and fee gazettes with interactive reading modal | React Portals + Live Feed |
| 📱 **Mobile-First PWA** | Installable Progressive Web App with mobile navigation, responsive search, touch interactions, and offline caching | Vite PWA + Workbox |
| 👤 **User Profile & Activity** | Track search history, bookmarked colleges, quiz preferences, and editable student profile | Firebase Auth + Firestore |

---

## 🏛️ Statutory Data Provenance

All counseling intelligence, fee figures, and quota boundaries are backed by authentic statutory records:

1. **Closing Ranks Source:** Andhra Pradesh State Council of Higher Education (APSCHE) AP EAPCET Final Phase Allotment Statements.
2. **Tuition Fee Gazette:** Andhra Pradesh Higher Education Regulatory and Monitoring Commission (APHERMC) G.O.Ms.No.17 dated 07.07.2023 specifying audited convenor fee schedules.
3. **Local Candidate Quota (85%):** Evaluated in strict conformity with the Andhra Pradesh Educational Institutions (Regulation of Admissions) Order, 1974 (Presidential Order) for **Andhra University (AU)** and **Sri Venkateswara University (SVU)** local areas.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      React 19 SPA      │
                                  │   (Vite + Tailwind)    │
                                  └───────────┬────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
               ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
               │ Firebase Client  │  │ Vercel Serverless│  │  Local Storage   │
               │ (Auth & Firestore)│ │  (/api/search)   │  │ (Wishlist/Cache) │
               └──────────────────┘  └────────┬─────────┘  └──────────────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │  Google Gemini   │
                                     │  (Embeddings &   │
                                     │   RAG Chatbot)   │
                                     └──────────────────┘
```

---

## 🗂️ Project Structure

```
edudiscovery/
├── api/                        # Vercel Serverless API Endpoints
│   ├── firebaseAdmin.js        # Server-side Firebase Admin SDK initialization
│   ├── search.js               # AI semantic vector search with intent boosting
│   ├── chat.js                 # RAG streaming counselor endpoint
│   ├── news.js                 # Admissions news aggregator endpoint
│   ├── recommend.js            # Rule-based college matching
│   └── quizReasoning.js        # AI quiz analysis generator
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
│   │   ├── chat/               # Counselor chat drawer & message bubbles
│   │   ├── layout/             # Navbar, BottomNav, PWAInstallBanner, Layout
│   │   ├── map/                # CampusMapExplorer (AP geographic vector map)
│   │   └── ui/                 # Skeleton, Button, Card, Badge primitives
│   │
│   ├── contexts/               # React Context Providers (Auth, Wishlist, Counselor, Toast)
│   ├── data/                   # Real AP college dataset, news & coordinates
│   ├── pages/                  # Route views (Home, Search, WebOptions, Compare, Detail, Profile)
│   ├── services/               # Firebase SDK setup, API wrappers, metadata
│   ├── utils/                  # webOptionsEngine, intelligenceEngine, ROI calculator
│   └── index.css               # Design system tokens, glassmorphism & shimmer animations
│
├── tests/                      # Automated Vitest test suites (103 unit & integration tests)
├── public/                     # Favicons, PWA icons, manifest.json
├── vite.config.js              # Vite build, Workbox PWA caching & vendor code-splitting
└── vercel.json                 # API routing & SPA fallback configuration
```

---

## ⚙️ Quick Start (Local Development)

### Prerequisites
- **Node.js 18+**
- **Firebase Project** with Firestore and Authentication enabled
- **Gemini API Key** ([Google AI Studio](https://aistudio.google.com))

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

# Server-side Firebase Admin & Gemini API
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Assurance

EduDiscovery includes an automated test suite with **103 unit and integration tests** verifying security, routing, rate limiting, and calculation engines:

```bash
# Run all automated tests
npm test

# Run TypeScript type check
npx tsc --noEmit
```

### Test Coverage Highlights
- **Public Routing:** Validates guest access restrictions (`/search` public; `/home`, `/web-options`, `/compare`, `/wishlist` protected).
- **Security & Authorization:** Token validation, IDOR prevention, and role-based access control.
- **Web-Options Engine:** Validates Dream/Target/Safe distribution, quota application, and sorting algorithms.
- **Rate Limiting:** Protects serverless inference endpoints against abuse.

---

## ☁️ Deployment

The project is continuously deployed on **Vercel**:

- **Production URL:** [https://edu-discovery.vercel.app](https://edu-discovery.vercel.app)
- **Framework:** Vite React 19 SPA
- **Serverless Functions:** `/api/*` mapped via `vercel.json`
- **PWA Workbox:** Optimized with 15 MiB precache headroom and granular vendor chunking (`ai-vendor`, `motion-vendor`, `charts-vendor`, `icons-vendor`, `firebase`, `react-vendor`).

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome!  
Feel free to open an issue or submit a pull request.

---

## 📄 License

[MIT](LICENSE)
