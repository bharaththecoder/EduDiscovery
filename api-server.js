import express from 'express';
import cors from 'cors';
import chatHandler from './api/chat.js';
import seedHandler from './api/seed.js';
import searchHandler from './api/search.js';
import quizReasoningHandler from './api/quizReasoning.js';

const app = express();
const PORT = 3001;

// Increase generic payload limit for seeding large arrays
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Development routes proxy
app.post('/api/chat', async (req, res) => {
  console.log(`[POST /api/chat]`);
  await chatHandler(req, res);
});

app.post('/api/seed', async (req, res) => {
  console.log(`[POST /api/seed]`);
  await seedHandler(req, res);
});

app.post('/api/search', async (req, res) => {
  console.log(`[POST /api/search]`);
  await searchHandler(req, res);
});

app.post('/api/quiz-reasoning', async (req, res) => {
  console.log(`[POST /api/quiz-reasoning]`);
  await quizReasoningHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`✅ API Development Server running on http://localhost:${PORT}`);
  console.log(`👉 Serving: /api/chat, /api/seed, /api/search, /api/quiz-reasoning`);
});
