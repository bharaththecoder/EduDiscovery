# EduDiscovery 🎓

> A smart college discovery platform for students in Andhra Pradesh — find your best-fit university based on your stream, budget, and location.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://edudiscovery.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase)](https://firebase.google.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-0055FF?logo=framer)](https://www.framer.com/motion/)

---

## ✨ Features

- 🔐 **Google Sign-In** via Firebase Authentication
- 🏛️ **37 curated Andhra Pradesh universities** with NAAC grades, NIRF rankings, fees, and official imagery
- 🔍 **Smart Search** — filter by college name, city, or branch in real time
- 🎯 **College Finder** — answer 3 questions (stream, location, budget) to get filtered college matches
- ⚡ **Future Fit Quiz** — short quiz to narrow down your ideal college type
- ❤️ **Wishlist** — save favourites and manage your shortlist
- 📰 **Student News Feed** — latest updates relevant to AP college admissions
- 👤 **Profile** — editable bio, branch preference, and stats

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + JSX |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore |
| Hosting | Vercel |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A Firebase project (see [Firebase Console](https://console.firebase.google.com))

### 1. Clone the repo
```bash
git clone https://github.com/your-username/edudiscovery.git
cd edudiscovery
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your Firebase project credentials in `.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### 4. Start the dev server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components (BottomNav, UniversityCard, etc.)
├── context/           # React context providers (Auth, Wishlist, Toast)
├── data/              # Static data: universities, news articles, curated colleges
├── pages/             # Route-level pages
│   ├── Landing.jsx    # Unauthenticated landing page
│   ├── Home.jsx       # Dashboard with top matches and news
│   ├── Search.jsx     # Full search with city/branch filters
│   ├── UniversityDetail.jsx  # Individual university profile
│   ├── RecommendationPage.jsx # Smart college finder (3-step filter)
│   ├── Quiz.jsx       # Future Fit Quiz
│   ├── QuizResult.jsx # Quiz results
│   └── Profile.jsx    # User profile and settings
├── firebase.js        # Firebase initialisation (reads from .env)
└── App.jsx            # Root router
```

---

## 🔒 Security Notes

- Firebase credentials are stored in `.env` and excluded from version control via `.gitignore`
- Firebase project has **Authorised Domains** configured to restrict API key usage
- Firestore rules restrict data access to authenticated users only

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)
