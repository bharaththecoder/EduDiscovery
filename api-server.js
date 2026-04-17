import express from 'express';
import cors from 'cors';
import chatHandler from './api/chat.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy route for local development
app.post('/api/chat', async (req, res) => {
  console.log('--- Development API Server ---');
  console.log(`Request received: ${req.method} ${req.url}`);
  
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error('Error in local API handler:', error);
    res.status(500).json({ reply: 'Development server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Development Server running on http://localhost:${PORT}`);
  console.log(`👉 Proxies /api/chat to the handler in api/chat.js`);
});
