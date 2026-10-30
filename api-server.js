import express from 'express';
import cors from 'cors';
import seedHandler from './api/seed.js';
import newsHandler from './api/news.js';

const app = express();
const PORT = 3001;

// Increase generic payload limit for seeding large arrays
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Educational news and updates
app.get('/api/news', async (req, res) => {
  console.log(`[GET /api/news]`);
  await newsHandler(req, res);
});

// Authorized college database seeder
app.post('/api/seed', async (req, res) => {
  console.log(`[POST /api/seed]`);
  await seedHandler(req, res);
});

// Deprecated AI endpoints return 410 Gone
const deprecatedAiHandler = (req, res) => {
  res.status(410).json({
    error: 'AI endpoints have been permanently decommissioned in favor of verified APSCHE historical cutoffs and statutory data.'
  });
};

app.get('/api/ai/health', deprecatedAiHandler);
app.post('/api/chat', deprecatedAiHandler);
app.post('/api/search', deprecatedAiHandler);
app.post('/api/quiz-reasoning', deprecatedAiHandler);
app.post('/api/recommend', deprecatedAiHandler);

app.listen(PORT, () => {
  console.log(`✅ API Development Server running on http://localhost:${PORT}`);
  console.log(`👉 Serving: /api/news, /api/seed`);
});
