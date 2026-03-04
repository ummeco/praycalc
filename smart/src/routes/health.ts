import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'praycalc-smart',
    version: '0.7.0',
    timestamp: new Date().toISOString(),
  });
});
