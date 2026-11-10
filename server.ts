import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateSipRecommendations } from './src/server/geminiService.js';
import { DRINK_REFERENCES } from './src/data/drinkReferences.js';

dotenv.config();

const app = express();
app.use(express.json());

// API Endpoints
app.post('/api/recommend', async (req, res) => {
  try {
    const payload = await generateSipRecommendations(req.body);
    res.json(payload);
  } catch (error: any) {
    console.error('Error generating sip recommendations:', error);
    const message = error?.message || 'Failed to generate drink recommendations.';
    const status = message.includes('API_KEY') ? 401 : 500;
    res.status(status).json({
      error: message,
      details: error?.stack || null,
    });
  }
});

app.get('/api/references', (_req, res) => {
  res.json({
    total: DRINK_REFERENCES.length,
    drinks: DRINK_REFERENCES,
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = parseInt(process.env.PORT || '3000', 10);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res, next) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍹 Sip Buddy server listening on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Sip Buddy server:', err);
  process.exit(1);
});
