# EduDiscovery 🎓

> **The smartest way to find your college in Andhra Pradesh.**  
> AI-powered search, instant recommendations, and a personal counselor — all in one place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-edudiscovery.vercel.app-black?style=for-the-badge&logo=vercel)](https://edu-discovery.vercel.app)
&nbsp;
[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

## ✨ What is EduDiscovery?

EduDiscovery helps students in Andhra Pradesh cut through the noise and find the right college — fast. Instead of browsing dozens of websites, students get personalised, AI-ranked results in seconds based on their stream, budget, location, and goals.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🤖 **AI-Powered Search** | Natural language search with Gemini semantic embeddings + cosine similarity ranking |
| 💬 **AI Counselor** | Real-time AI chat with RAG over your college database — gets actual fee & placement data right |
| 🏛️ **45+ AP Colleges** | Curated dataset with NAAC grades, NIRF rankings, branch-wise fees, placements, and campus imagery |
| 🔍 **Smart Filters** | Filter instantly by city, branch, or budget with priority-boosted city intent detection |
| 🎯 **College Finder** | 3-step questionnaire (stream → location → budget) that surfaces your best-fit options |
| 🧠 **Future Fit Quiz** | Personality-driven quiz to match students to the right type of institution |
| ❤️ **Wishlist** | Save and manage a personal shortlist of favourite colleges |
| 👤 **Profile** | Editable bio, branch preference tracking, and quiz history |
| 🔐 **Google Sign-In** | One-click auth via Firebase Authentication |
| 📰 **Student News** | Curated AP admissions news feed on the home dashboard |

---

## 🎯 Quick Start

1. **Visit the app:** [edu-discovery.vercel.app](https://edu-discovery.vercel.app)
2. **Sign in** with Google
3. **Search colleges** naturally or use the College Finder quiz
4. **Chat with AI** (AI Counselor) for instant fee data
5. **Save to Wishlist** and compare your top picks

**No installation needed.** The app is live and ready to use.

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript, Vite 8 |
| **Routing** | React Router DOM v7 |
| **Styling** | Vanilla CSS + custom design system |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Database** | Cloud Firestore |
| **AI / Embeddings** | Google Gemini API (`gemini-embedding-001`, `gemini-2.0-flash`) |
| **Backend APIs** | Vercel Serverless Functions (`/api/*`) |
| **Hosting** | Vercel |

---

## 🗂️ Project Structure

```
edudiscovery/
├── api/                        # Vercel Serverless Functions
│   ├── firebaseAdmin.js        # Centralised Firebase Admin SDK init (env-var aware)
│   ├── search.js               # AI semantic search with cosine similarity + city boost
│   ├── chat.js                 # RAG-powered streaming chat (C3 Insta Counselor)
│   ├── recommend.js            # Rule-based college recommendations
│   ├── seed.js                 # Database seeder endpoint
│   ├── quizReasoning.js        # Quiz result AI reasoning
│   └── aiHelper.js             # Unified Gemini / OpenRouter text generation
│
├── src/
│   ├── app/                    # App router and layout
│   ├── components/             # Reusable UI components
│   │   ├── chat/               # C3 Insta Counselor chat widget
│   │   ├── search/             # Search bar, filter chips, result cards
│   │   └── ui/                 # Shared primitives (buttons, modals, toasts)
│   ├── contexts/               # React context providers (Auth, Wishlist, Toast)
│   ├── data/                   # Static data: colleges, news articles
│   ├── pages/                  # Route-level page components
│   │   ├── LandingPage         # Unauthenticated splash page
│   │   ├── HomePage            # Dashboard with top matches and news
│   │   ├── SearchPage          # AI search + smart filter interface
│   │   ├── UniversityDetailPage# Full college profile
│   │   ├── ComparePage         # Side-by-side college comparison
│   │   ├── QuizPage            # Future Fit Quiz
│   │   ├── QuizResultPage      # Personalised quiz results
│   │   └── ProfilePage         # User profile and settings
│   ├── services/               # Firebase client, API service wrappers
│   ├── types/                  # TypeScript interfaces and types
│   └── utils/                  # Helpers (scoring, formatting, etc.)
│
├── vercel.json                 # Vercel routing (API first, then SPA fallback)
├── vite.config.js
└── .env.example                # Environment variable template
```

---

## ⚙️ Running Locally

### Prerequisites
- **Node.js 18+**
- A **Firebase project** ([Firebase Console](https://console.firebase.google.com)) with Firestore and Authentication enabled
- A **Gemini API key** ([Google AI Studio](https://aistudio.google.com))

### 1. Clone & install

```bash
git clone https://github.com/bharaththecoder/EduDiscovery.git
cd EduDiscovery
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Firebase (Client SDK — used by the React frontend)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side APIs — download from Firebase Console → Service Accounts)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"

# AI
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key   # optional fallback
```

> **Local only:** You can alternatively place your `serviceAccountKey.json` (downloaded from Firebase Console) in the project root. The API server will use it automatically when the env vars above are not set.

### 3. Start development server

```bash
npm run dev
```

This runs the Vite frontend and the Express API server concurrently.  
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deploying to Vercel

### 1. Push to GitHub and import on Vercel

[Import your repository](https://vercel.com/new) on Vercel. The `vercel.json` already handles routing correctly — API calls go to serverless functions; everything else falls back to the React SPA.

### 2. Add Environment Variables

In your Vercel project: **Settings → Environment Variables**

| Variable | Where to find it |
|---|---|
| `VITE_FIREBASE_*` | Firebase Console → Project Settings → Your Apps |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Service Accounts → Generate new private key |
| `FIREBASE_PRIVATE_KEY` | Same JSON file (paste the full `private_key` string) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

### 3. Redeploy

Vercel auto-deploys on every push to `main`. The AI search and chat features will work immediately after the environment variables are set.

---

## 🔒 Security

- All Firebase credentials are stored in environment variables and excluded from version control via `.gitignore`
- `serviceAccountKey.json` is git-ignored — never commit it
- Firebase Authentication with **Authorised Domains** restricts API key usage to your domain
- Firestore security rules restrict data access to authenticated users

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)
