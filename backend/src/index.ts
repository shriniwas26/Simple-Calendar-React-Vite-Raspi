import express from 'express';
import { config } from './config.js';
import { router } from './router.js';

const app = express();

app.use('/api', router);

app.listen(config.port, () => {
  console.log(`Calendar backend listening on port ${config.port}`);
});
