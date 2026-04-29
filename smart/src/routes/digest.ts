/**
 * Email digest subscription routes for PrayCalc.
 *
 * Endpoints:
 *   POST /api/v1/digest/subscribe      — Subscribe with email + optional location
 *   GET  /api/v1/digest/confirm        — Confirm subscription via token
 *   GET  /api/v1/digest/unsubscribe    — Unsubscribe via token
 *   POST /api/v1/digest/send           — Internal: trigger digest send (cron-protected)
 */

import { Router, type Request, type Response } from 'express';

const router = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

async function hasuraQuery(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const response = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

// POST /api/v1/digest/subscribe
// Body: { email: string, lat?: number, lng?: number, city?: string, method?: string }
router.post('/subscribe', async (req: Request, res: Response) => {
  const { email, lat, lng, city, method = 'isna' } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email required' });
    return;
  }

  const confirmToken = crypto.randomUUID();
  const unsubToken = crypto.randomUUID();

  try {
    await hasuraQuery(
      `mutation InsertDigestSubscriber(
        $email: String!
        $lat: numeric
        $lng: numeric
        $city: String
        $method: String!
        $confirmToken: String!
        $unsubToken: String!
      ) {
        insert_pc_digest_subscribers_one(
          object: {
            email: $email
            lat: $lat
            lng: $lng
            city: $city
            method: $method
            confirm_token: $confirmToken
            unsub_token: $unsubToken
            confirmed: false
          }
          on_conflict: {
            constraint: pc_digest_subscribers_email_key
            update_columns: [confirm_token, unsub_token, lat, lng, city, method]
          }
        ) { id }
      }`,
      {
        email,
        lat: lat ?? null,
        lng: lng ?? null,
        city: city ?? null,
        method,
        confirmToken,
        unsubToken,
      },
    );
  } catch (err) {
    // Log but do not block — DB may not be ready in dev; still send email
    console.warn('[digest] DB insert failed (non-fatal):', err);
  }

  const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY;
  const confirmUrl = `${process.env.WEB_URL ?? 'https://praycalc.com'}/digest/confirm?token=${confirmToken}`;

  if (ELASTIC_EMAIL_API_KEY) {
    try {
      await fetch('https://api.elasticemail.com/v4/emails/transactional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ElasticEmail-ApiKey': ELASTIC_EMAIL_API_KEY,
        },
        body: JSON.stringify({
          Recipients: { To: [email] },
          Content: {
            From: 'noreply@praycalc.com',
            ReplyTo: 'hello@praycalc.com',
            Subject: 'Confirm your PrayCalc digest subscription',
            Body: [
              {
                ContentType: 'HTML',
                Content: `<p>Assalamu Alaikum,</p>
<p>Click below to confirm your weekly prayer times digest:</p>
<p><a href="${confirmUrl}" style="background:#1E5E2F;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Confirm Subscription</a></p>
<p>JazakAllah Khayran,<br>PrayCalc Team</p>`,
              },
            ],
          },
        }),
      });
    } catch (err) {
      console.error('[digest] Elastic Email send failed:', err);
    }
  } else {
    console.warn('[digest] ELASTIC_EMAIL_API_KEY not set — skipping confirmation email');
  }

  res.json({ message: 'Confirmation email sent' });
});

// GET /api/v1/digest/confirm?token=...
router.get('/confirm', async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  try {
    const result = await hasuraQuery(
      `mutation ConfirmDigestSubscriber($token: String!) {
        update_pc_digest_subscribers(
          where: { confirm_token: { _eq: $token }, confirmed: { _eq: false } }
          _set: { confirmed: true, confirmed_at: "now()" }
        ) { affected_rows }
      }`,
      { token },
    );

    const affected = result?.data?.update_pc_digest_subscribers?.affected_rows;
    if (affected === 0) {
      // Already confirmed or token not found — still return success to avoid leaking info
      res.json({ message: 'Subscription confirmed! You will receive your first digest next Monday.' });
      return;
    }
  } catch (err) {
    console.warn('[digest] DB confirm failed (non-fatal):', err);
  }

  res.json({ message: 'Subscription confirmed! You will receive your first digest next Monday.' });
});

// GET /api/v1/digest/unsubscribe?token=...
router.get('/unsubscribe', async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  try {
    await hasuraQuery(
      `mutation UnsubscribeDigest($token: String!) {
        update_pc_digest_subscribers(
          where: { unsub_token: { _eq: $token } }
          _set: { unsubscribed: true, unsubscribed_at: "now()" }
        ) { affected_rows }
      }`,
      { token },
    );
  } catch (err) {
    console.warn('[digest] DB unsubscribe failed (non-fatal):', err);
  }

  res.json({ message: 'You have been unsubscribed.' });
});

// POST /api/v1/digest/send — internal endpoint (called by Vercel cron or scheduler)
// Protected by x-api-key header matching INTERNAL_API_KEY env var
router.post('/send', async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'];

  if (!process.env.INTERNAL_API_KEY || apiKey !== process.env.INTERNAL_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let subscribers: Array<{ id: string; email: string; lat: number | null; lng: number | null; city: string | null; method: string }> = [];

  try {
    const result = await hasuraQuery(
      `query GetConfirmedDigestSubscribers {
        pc_digest_subscribers(
          where: { confirmed: { _eq: true }, unsubscribed: { _neq: true } }
        ) {
          id
          email
          lat
          lng
          city
          method
        }
      }`,
    );
    subscribers = result?.data?.pc_digest_subscribers ?? [];
  } catch (err) {
    console.error('[digest] Failed to fetch subscribers:', err);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
    return;
  }

  const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY;
  if (!ELASTIC_EMAIL_API_KEY) {
    console.warn('[digest] ELASTIC_EMAIL_API_KEY not set — skipping digest send');
    res.json({ count: 0, message: 'ELASTIC_EMAIL_API_KEY not configured' });
    return;
  }

  const errors: string[] = [];

  // Send in parallel with concurrency cap of 10 to avoid OOM on large subscriber lists
  // and stay within Elastic Email rate limits.
  const CONCURRENCY = 10;
  for (let i = 0; i < subscribers.length; i += CONCURRENCY) {
    const batch = subscribers.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((sub) =>
        fetch('https://api.elasticemail.com/v4/emails/transactional', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ElasticEmail-ApiKey': ELASTIC_EMAIL_API_KEY,
          },
          body: JSON.stringify({
            Recipients: { To: [sub.email] },
            Content: {
              From: 'noreply@praycalc.com',
              ReplyTo: 'hello@praycalc.com',
              Subject: 'Your weekly PrayCalc prayer times digest',
              Body: [
                {
                  ContentType: 'HTML',
                  Content: `<p>Assalamu Alaikum,</p>
<p>Your weekly prayer times digest from PrayCalc is ready.</p>
<p>Visit <a href="https://praycalc.com">praycalc.com</a> to view accurate prayer times for your location.</p>
<p style="font-size:12px;color:#666;">To unsubscribe, visit https://praycalc.com/digest/unsubscribe?token=[unsub_token]</p>`,
                },
              ],
            },
          }),
        }).then((r) => ({ sub, ok: r.ok })),
      ),
    );
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const sub = batch[j];
      if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok)) {
        errors.push(sub.email);
        console.error(`[digest] Failed to send to ${sub.email}`);
      }
    }
  }

  const sent = subscribers.length - errors.length;
  res.json({ count: sent, errors: errors.length > 0 ? errors : undefined, message: 'Digest send complete' });
});

export default router;
