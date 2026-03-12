import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { healthRouter } from './routes/health.js';
import { prayerTimesRouter } from './routes/prayer-times.js';
import { googleRouter } from './routes/google.js';
import { alexaRouter } from './routes/alexa.js';
import { webhookRouter } from './routes/webhooks.js';
import { billingRouter } from './routes/billing.js';
import { oauthRouter } from './routes/oauth.js';
import { integrationsRouter } from './routes/integrations.js';
import { devicesRouter } from './routes/devices.js';
import { tvRouter } from './routes/tv.js';
import { agendasRouter } from './routes/agendas.js';
import { statsRouter } from './routes/stats.js';
import digestRouter from './routes/digest.js';
import publicTimesRouter from './routes/public-times.js';
import { rateLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { analyticsMiddleware } from './middleware/analytics.js';
import { startPrayerCron } from './cron/prayer-events.js';

const app = express();
const PORT = parseInt(process.env.PORT || '4010', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://praycalc.com',
    'https://www.praycalc.com',
    'https://api.praycalc.com',
    /\.google\.com$/,
    /\.amazon\.com$/,
    /\.amazonaws\.com$/,
    // Local development
    'http://localhost:3041',
    'http://localhost:3000',
    'http://localhost:8080',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);
app.use(analyticsMiddleware);

// Serve OpenAPI spec
app.get('/api/v1/openapi.yaml', (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dir = dirname(__filename);
    const spec = readFileSync(join(__dir, 'openapi.yaml'), 'utf-8');
    res.type('text/yaml').send(spec);
  } catch {
    res.status(404).json({ error: 'OpenAPI spec not found' });
  }
});

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/public', cors({ origin: '*' }), publicTimesRouter);
app.use('/api/v1/times', prayerTimesRouter);
app.use('/api/v1/webhooks', webhookRouter);
app.use('/google', googleRouter);
app.use('/alexa', alexaRouter);
app.use('/billing', billingRouter);
app.use('/oauth', oauthRouter);
app.use('/api/v1/integrations', integrationsRouter);
app.use('/api/v1/devices', devicesRouter);
app.use('/api/v1/tv', tvRouter);
app.use('/api/v1/agendas', agendasRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/digest', digestRouter);

// Error handler
app.use(errorHandler);

// Only start the server and cron when run directly, not when imported by tests
const isMain = process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('index.ts');
if (isMain) {
  startPrayerCron();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`praycalc-smart running on port ${PORT}`);
  });
}

export { app };
