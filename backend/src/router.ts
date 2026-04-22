import { Router } from 'express';
import { getOrRefresh } from './cache.js';

export const router = Router();

router.get('/events', async (_req, res) => {
  try {
    const data = await getOrRefresh();
    res.json(data);
  } catch {
    res.status(503).json({ error: 'No calendar data available' });
  }
});
