import { Router } from 'express';
import { getOrRefresh } from './cache.js';

export const router = Router();

router.get('/events', async (_req, res) => {
  try {
    const data = await getOrRefresh();
    res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`GET /api/events failed: ${msg}`);
    res.status(503).json({
      error: {
        code: 'CALENDAR_UNAVAILABLE',
        message: 'No calendar data available',
      },
    });
  }
});
