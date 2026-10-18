import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  POPULAR_LEAGUES, 
  searchLeagues, 
  getLeagueFixtures, 
  normalizeLeagueUrl 
} from './src/server/leaguesService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoints
  // 1. Get popular / featured leagues
  app.get('/api/leagues/popular', async (_req: Request, res: Response) => {
    try {
      res.json({ success: true, leagues: POPULAR_LEAGUES });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Search leagues by query
  app.get('/api/leagues/search', async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const leagues = await searchLeagues(q);
      res.json({ success: true, leagues });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Get fixtures for a specific league
  app.get('/api/leagues/fixtures', async (req: Request, res: Response) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ success: false, error: 'url parameter is required' });
      }
      const data = await getLeagueFixtures(url);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('Error in /api/leagues/fixtures:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Quick health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'leisure-leagues-manager' });
  });

  // Mount Vite or static dist
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚽ Leisure Leagues Manager running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
