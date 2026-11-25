<div align="center">
  <img src="./public/logo.jpg" alt="EduDiscovery Logo" width="96" height="96" style="border-radius: 20px;" />
  <h1>EduDiscovery — AP EAPCET College Discovery & Counseling Platform</h1>
  <p>
    <strong>Discover, compare, and predict engineering admissions across Andhra Pradesh with verified APSCHE cutoffs, APHERMC statutory fees, and a $0-cost ZeroGPU AI Counselor.</strong>
  </p>

  <p>
    <a href="https://edu-discovery.vercel.app"><img src="https://img.shields.io/badge/Live%20App-edu--discovery.vercel.app-059669?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" /></a>
    <img src="https://img.shields.io/badge/Tests-420%20Passing-10b981?style=for-the-badge&logo=vitest&logoColor=white" alt="Tests" />
    <img src="https://img.shields.io/badge/React-19%20%2B%20Vite%208-0ea5e9?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/AI-Hugging%20Face%20ZeroGPU-f59e0b?style=for-the-badge&logo=huggingface&logoColor=white" alt="ZeroGPU AI" />
  </p>
</div>

---

## Key Features

- **EduAI Counselor (Gemini-Style Chat):** $0-cost AI assistant powered by **Hugging Face Spaces (ZeroGPU)** with an instant **Verified Local EAPCET Engine** fallback. Answers rank, cutoff, JVD fee reimbursement, and branch/career questions.
- **AP EAPCET Web-Options Assistant:** Enter your rank, category, gender, and region (`AU` / `SVU`) to generate a prioritized **Dream → Target → Safe** choice sheet with official counseling codes.
- **3-Year Official APSCHE Cutoffs:** Historical closing ranks (2022–2024) and branch-wise **Admission Probability Analysis**.
- **Side-by-Side College Compare:** Compare up to 4 AP engineering institutions on fees, NAAC/NIRF ratings, placements, and cutoffs.
- **Candidate Counseling Vault & Profile:** Sync your rank, hall ticket, document verification checklist, and wishlist across Web and Android APK.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion |
| **Backend / Auth / DB** | Firebase Auth (Google Sign-In), Cloud Firestore, Vercel Serverless |
| **AI Inference** | Hugging Face Spaces (ZeroGPU · `Qwen/Qwen2.5-1.5B-Instruct`) + Local Fallback |
| **Mobile** | Capacitor Android (`EduDiscovery.apk`) |
| **Testing** | Vitest (21 test files, 420+ unit & integration tests) |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
# Add your Firebase keys and optional VITE_HF_SPACE_URL

# 3. Run development server
npm run dev

# 4. Run full test suite & production build
npx vitest run
npm run build
```

---

## Legal & Links
- **Live Web App:** [https://edu-discovery.vercel.app](https://edu-discovery.vercel.app)
- **Privacy Policy:** [https://edu-discovery.vercel.app/privacy](https://edu-discovery.vercel.app/privacy)
- **Terms of Service:** [https://edu-discovery.vercel.app/terms](https://edu-discovery.vercel.app/terms)
