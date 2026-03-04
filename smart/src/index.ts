import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.js';
import { prayerTimesRouter } from './routes/prayer-times.js';
import { googleRouter } from './routes/google.js';
import { alexaRouter } from './routes/alexa.js';
import { webhookRouter } from './routes/webhooks.js';
import { billingRouter } from './routes/billing.js';
import { oauthRouter } from './routes/oauth.js';
import { rateLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
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
  ],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/times', prayerTimesRouter);
app.use('/api/v1/webhooks', webhookRouter);
app.use('/google', googleRouter);
app.use('/alexa', alexaRouter);
app.use('/billing', billingRouter);
app.use('/oauth', oauthRouter);

// Error handler
app.use(errorHandler);

// Start cron for prayer event webhooks
startPrayerCron();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`praycalc-smart running on port ${PORT}`);
});

export { app };
