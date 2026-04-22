import express from 'express';
import { config } from './config.js';
import { router } from './router.js';

const app = express();

app.use('/api', router);

app.use(express.static(config.staticDir));

app.get('/{*path}', (_req, res) => {
  res.sendFile('index.html', { root: config.staticDir });
});

app.listen(config.port, () => {
  console.log(`Calendar backend listening on port ${config.port}`);
  console.log(`Serving static files from ${config.staticDir}`);
});
