# EduDiscovery 🎓

> **The smartest AI-powered college discovery & decision platform in Andhra Pradesh.**  
> Semantic AI search, RAG counselor chat, side-by-side comparison matrix, EAPCET rank predictor, and smart wishlist management — built for modern students.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-edudiscovery.vercel.app-black?style=for-the-badge&logo=vercel)](https://edu-discovery.vercel.app)
&nbsp;
[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini%202.0-8E75FF?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#-progressive-web-app-pwa)

---

## ✨ Overview

**EduDiscovery** solves the chaos of college admissions in Andhra Pradesh. Instead of digging through dozens of static university sites, students get:
- **Instant Semantic Search** matching plain queries (e.g. *"Top CSE colleges in Vijayawada under 1.5 Lakh"*).
- **RAG-Powered AI Counselor** (`C3 Insta Counselor`) offering real-time guidance on fee structures, placements, and eligibility.
- **Side-by-Side College Compare** matrix with interactive radar analysis and AI-generated verdicts.
- **EAPCET / ICET Rank Predictor** with admission probability indicators.
- **Shimmer Skeleton UI & Progressive Loading** ensuring fast perceived loading on 3G / mobile networks.

---

## 🚀 Built Features & Capabilities

| Feature | Description | Key Tech |
|---|---|---|
| 🤖 **Semantic AI Search** | Natural language intent parsing with Gemini embeddings + cosine similarity ranking + priority city intent boosting | Gemini API + Vector Math |
| 💬 **RAG AI Counselor** | Floating AI assistant streaming responses grounded in verified college dataset (fees, NAAC, placements) | Vercel Serverless + Gemini 2.0 |
| ⚡ **Shimmer Skeleton UI** | Skeleton card and detail page loading placeholders eliminating layout shifts on slower mobile connections | Custom CSS Shimmer + React |
| ⚖️ **Compare Matrix** | Multi-college side-by-side comparison with Recharts radar analysis (ROI, Placements, Fees) & AI Verdict | Recharts + Framer Motion |
| ❤️ **Wishlist Hub** | Shortlist colleges with heart animations, batch comparison, AI prompt prep, and cloud Firestore sync | Firebase Firestore + LocalStorage |
| 🎯 **EAPCET Rank Predictor** | Input rank to estimate college eligibility with probability indicators (High / Medium / Reach) | Intelligence Engine |
| 🧠 **Future Fit Quiz** | Personality-driven 3-step questionnaire matching students to ideal engineering / medical streams | React Context + State |
| 📱 **Mobile & PWA Polish** | Responsive bottom navigation bar with safe-area insets, installable web app banner, touch gestures | Service Workers + Web Manifest |
| 👤 **User Profile & Activity** | Track search history, bookmarked colleges, quiz results, and editable student profile | Firebase Auth + Firestore |
| 📰 **AP Admissions News** | Real-time news feed covering counselling schedules, fee regulation notifications, and updates | React Modal + Data Feed |

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
│   ├── recommend.js            # Rule-based college matching
│   └── quizReasoning.js        # AI quiz analysis generator
│
├── src/
│   ├── components/
│   │   ├── cards/              # UniversityCard, UniversityCardSkeleton
│   │   ├── chat/               # Counselor chat drawer & message bubbles
│   │   ├── layout/             # Navbar, BottomNav, PWAInstallBanner, Layout
│   │   └── ui/                 # Skeleton, Button, Card, Badge primitives
│   │
│   ├── contexts/               # React Context Providers
│   │   ├── AuthContext.tsx     # Firebase Authentication state
│   │   ├── WishlistContext.tsx # Wishlist sync & batch actions
│   │   ├── CounselorContext.tsx# RAG counselor drawer state
│   │   └── ToastContext.tsx    # Global notifications
│   │
│   ├── data/                   # Real AP College dataset & news articles
│   ├── pages/                  # Route views (Home, Search, Detail, Compare, Quiz, Wishlist)
│   ├── services/               # Firebase SDK setup, API wrappers
│   ├── utils/                  # Fit score algorithm, ROI calculator
│   └── index.css               # Design system tokens & shimmer animations
│
├── public/                     # Favicons, PWA icons, manifest.json
└── vercel.json                 # API routing & SPA fallback configuration
```

---

## ⚙️ Quick Start (Local Development)

### Prerequisites
- **Node.js 18+**
- **Firebase Project** with Firestore and Auth enabled
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
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deployment

Deploy directly to **Vercel**:
1. Connect repository on [Vercel Console](https://vercel.com/new).
2. Add environment variables under **Project Settings → Environment Variables**.
3. Deploy! `vercel.json` automatically routes `/api/*` to serverless functions and everything else to the Vite React SPA.

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome!  
Feel free to open an issue or submit a pull request.

---

## 📄 License

[MIT](LICENSE)
