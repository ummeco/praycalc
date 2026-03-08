import { Router } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'praycalc-smart',
    version,
    timestamp: new Date().toISOString(),
  });
});
