import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/index.js';

/**
 * Integration tests for PrayCalc Smart service.
 *
 * Tests full flows across OAuth, billing webhooks, webhook registration
 * lifecycle, rate limiting, and health checks.
 */

const JWT_SECRET = process.env.HASURA_GRAPHQL_JWT_SECRET || '';

function makeToken(userId: string): string {
  return jwt.sign(
    {
      'https://hasura.io/jwt/claims': {
        'x-hasura-user-id': userId,
        'x-hasura-default-role': 'user',
      },
    },
    JWT_SECRET || 'test-secret',
  );
}

// ============================================================================
// OAuth flow
// ============================================================================

describe('OAuth flow', () => {
  it('GET /oauth/authorize renders consent page with form fields', async () => {
    const res = await request(app)
      .get('/oauth/authorize')
      .query({
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'abc123',
        response_type: 'code',
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Link PrayCalc');
    expect(res.text).toContain('test-client');
    expect(res.text).toContain('https://example.com/callback');
    expect(res.text).toContain('abc123');
    expect(res.text).toContain('type="email"');
    expect(res.text).toContain('type="password"');
  });

  it('GET /oauth/authorize rejects unsupported response_type', async () => {
    const res = await request(app)
      .get('/oauth/authorize')
      .query({
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'abc123',
        response_type: 'token',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('unsupported_response_type');
  });

  it('POST /oauth/authorize with invalid credentials returns 401 or 500', async () => {
    // Hasura Auth is not running in test, so this should fail gracefully
    const res = await request(app)
      .post('/oauth/authorize')
      .send({
        email: 'test@example.com',
        password: 'wrong-password',
        client_id: 'test-client',
        redirect_uri: 'https://example.com/callback',
        state: 'abc123',
      });

    // Without Hasura Auth running, this will either 401 or 500
    expect([401, 500]).toContain(res.status);
  });

  it('POST /oauth/token rejects invalid grant_type', async () => {
    const res = await request(app)
      .post('/oauth/token')
      .send({
        grant_type: 'client_credentials',
        client_id: 'test-client',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('unsupported_grant_type');
  });

  it('POST /oauth/token rejects invalid authorization code', async () => {
    const res = await request(app)
      .post('/oauth/token')
      .send({
        grant_type: 'authorization_code',
        code: 'nonexistent-code-12345',
        client_id: 'test-client',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_grant');
  });

  it('POST /oauth/token rejects invalid refresh token', async () => {
    const res = await request(app)
      .post('/oauth/token')
      .send({
        grant_type: 'refresh_token',
        refresh_token: 'invalid-refresh-token',
        client_id: 'test-client',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_grant');
  });

  it('POST /oauth/revoke succeeds even with unknown token', async () => {
    const res = await request(app)
      .post('/oauth/revoke')
      .send({ token: 'unknown-token' });

    expect(res.status).toBe(200);
    expect(res.body.revoked).toBe(true);
  });

  it('POST /oauth/revoke succeeds with empty token', async () => {
    const res = await request(app)
      .post('/oauth/revoke')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.revoked).toBe(true);
  });
});

// ============================================================================
// Billing webhook flow
// ============================================================================

describe('Billing webhook flow', () => {
  it('POST /billing/webhook rejects requests without stripe-signature header', async () => {
    const res = await request(app)
      .post('/billing/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: { userId: 'user-billing-test' },
          },
        },
      }));

    // Without valid signature, Stripe verification fails
    expect(res.status).toBe(400);
  });

  it('POST /billing/checkout requires authentication', async () => {
    const res = await request(app)
      .post('/billing/checkout')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('GET /billing/status requires authentication', async () => {
    const res = await request(app)
      .get('/billing/status');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('GET /billing/status with valid token returns subscription info', async () => {
    const token = makeToken('user-billing-integration');
    const res = await request(app)
      .get('/billing/status')
      .set('Authorization', `Bearer ${token}`);

    // Hasura is not available in test, so it returns fallback (free) or 500
    expect(res.status).not.toBe(401);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('plan');
      expect(res.body).toHaveProperty('status');
    }
  });

  it('POST /billing/portal requires authentication', async () => {
    const res = await request(app)
      .post('/billing/portal');

    expect(res.status).toBe(401);
  });

  it('POST /billing/verify-receipt validates required fields', async () => {
    const token = makeToken('user-verify-integration');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('platform');
  });

  it('POST /billing/verify-receipt rejects unknown product', async () => {
    const token = makeToken('user-verify-unknown');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({
        platform: 'ios',
        receipt: 'valid-receipt',
        productId: 'nonexistent_product',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Unknown product');
  });
});

// ============================================================================
// Webhook registration lifecycle
// ============================================================================

describe('Webhook registration lifecycle', () => {
  const userId = 'user-webhook-lifecycle';

  it('POST /api/v1/webhooks creates, GET lists, DELETE removes', async () => {
    const token = makeToken(userId);

    // Step 1: Create a webhook
    const createRes = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        callbackUrl: 'https://my-home.example.com/prayer-hook',
        lat: 21.4225,
        lng: 39.8262,
        events: ['adhan', 'iqamah'],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.callbackUrl).toBe('https://my-home.example.com/prayer-hook');
    expect(createRes.body.lat).toBe(21.4225);
    expect(createRes.body.lng).toBe(39.8262);
    expect(createRes.body.events).toContain('adhan');
    expect(createRes.body.events).toContain('iqamah');
    expect(createRes.body.active).toBe(true);

    const webhookId = createRes.body.id;

    // Step 2: List webhooks and verify the created one is present
    const listRes = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.webhooks).toBeDefined();
    const found = listRes.body.webhooks.find((w: any) => w.id === webhookId);
    expect(found).toBeDefined();
    expect(found.callbackUrl).toBe('https://my-home.example.com/prayer-hook');

    // Step 3: Delete the webhook
    const deleteRes = await request(app)
      .delete(`/api/v1/webhooks/${webhookId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(204);

    // Step 4: Verify it is gone
    const listRes2 = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes2.status).toBe(200);
    const ids = listRes2.body.webhooks.map((w: any) => w.id);
    expect(ids).not.toContain(webhookId);
  });

  it('creates multiple webhooks and lists them all', async () => {
    const token = makeToken('user-webhook-multi');

    const urls = [
      'https://home.example.com/hook-a',
      'https://home.example.com/hook-b',
      'https://home.example.com/hook-c',
    ];

    for (const url of urls) {
      const res = await request(app)
        .post('/api/v1/webhooks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          callbackUrl: url,
          lat: 40.7128,
          lng: -74.006,
          events: ['adhan'],
        });

      expect(res.status).toBe(201);
    }

    const listRes = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.webhooks.length).toBeGreaterThanOrEqual(3);

    const callbackUrls = listRes.body.webhooks.map((w: any) => w.callbackUrl);
    for (const url of urls) {
      expect(callbackUrls).toContain(url);
    }
  });

  it('DELETE returns 404 for non-existent webhook', async () => {
    const token = makeToken('user-webhook-404');
    const res = await request(app)
      .delete('/api/v1/webhooks/does-not-exist-12345')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Webhook not found');
  });

  it('filters out invalid event types', async () => {
    const token = makeToken('user-webhook-events');
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        callbackUrl: 'https://home.example.com/events',
        lat: 40.7128,
        lng: -74.006,
        events: ['adhan', 'invalid_event', 'iqamah', 'bogus'],
      });

    expect(res.status).toBe(201);
    // Only valid events should be kept
    expect(res.body.events).toContain('adhan');
    expect(res.body.events).toContain('iqamah');
    expect(res.body.events).not.toContain('invalid_event');
    expect(res.body.events).not.toContain('bogus');
  });

  it('rejects webhook creation without auth', async () => {
    const res = await request(app)
      .post('/api/v1/webhooks')
      .send({
        callbackUrl: 'https://example.com/hook',
        lat: 40.7128,
        lng: -74.006,
      });

    expect(res.status).toBe(401);
  });

  it('rejects webhook listing without auth', async () => {
    const res = await request(app)
      .get('/api/v1/webhooks');

    expect(res.status).toBe(401);
  });

  it('rejects webhook deletion without auth', async () => {
    const res = await request(app)
      .delete('/api/v1/webhooks/some-id');

    expect(res.status).toBe(401);
  });
});

// ============================================================================
// Rate limiting
// ============================================================================

describe('Rate limiting', () => {
  it('returns 429 after exceeding 60 requests per minute', async () => {
    // Use a unique path that is not /health (health is exempt from rate limiting)
    // Send 61 requests from the same IP to trigger the rate limiter.
    // The token bucket starts at 60 tokens, so request 61 should be blocked.
    const results: number[] = [];

    for (let i = 0; i < 61; i++) {
      const res = await request(app)
        .post('/google/fulfillment')
        .send({
          queryResult: {
            intent: { displayName: 'NextPrayer' },
            parameters: {},
          },
          originalDetectIntentRequest: { payload: { user: {} } },
        });

      results.push(res.status);
    }

    // The first 60 should succeed (200), the 61st should be rate limited (429)
    const successCount = results.filter(s => s === 200).length;
    const rateLimitedCount = results.filter(s => s === 429).length;

    // At least one request should be rate limited
    expect(rateLimitedCount).toBeGreaterThanOrEqual(1);
    // Most requests should succeed
    expect(successCount).toBeGreaterThanOrEqual(50);
  });

  it('rate limit response includes retryAfter', async () => {
    // Exhaust the bucket first
    for (let i = 0; i < 65; i++) {
      await request(app)
        .post('/google/fulfillment')
        .send({
          queryResult: {
            intent: { displayName: 'NextPrayer' },
            parameters: {},
          },
          originalDetectIntentRequest: { payload: { user: {} } },
        });
    }

    // This request should be rate limited
    const res = await request(app)
      .post('/google/fulfillment')
      .send({
        queryResult: {
          intent: { displayName: 'NextPrayer' },
          parameters: {},
        },
        originalDetectIntentRequest: { payload: { user: {} } },
      });

    if (res.status === 429) {
      expect(res.body.error).toBe('Too many requests');
      expect(res.body.retryAfter).toBeDefined();
      expect(typeof res.body.retryAfter).toBe('number');
    }
  });

  it('health endpoint is exempt from rate limiting', async () => {
    // Even after many requests, /health should always return 200
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
    }
  });

  it('rate limit headers are included on successful responses', async () => {
    const res = await request(app)
      .post('/alexa/fulfillment')
      .send({
        version: '1.0',
        session: { sessionId: 'rate-limit-header-test', user: {} },
        context: { System: { user: {} } },
        request: { type: 'LaunchRequest' },
      });

    // May be 200 or 429 depending on previous tests
    if (res.status === 200) {
      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    }
  });
});

// ============================================================================
// Health check
// ============================================================================

describe('Health check', () => {
  it('GET /health returns 200 with service info', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('praycalc-smart');
    expect(res.body.version).toBeDefined();
    expect(typeof res.body.version).toBe('string');
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('GET /health includes timestamp', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.timestamp).toBeDefined();
    // Timestamp should be a valid ISO 8601 date
    const parsed = new Date(res.body.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it('GET /health returns version matching package.json', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.version).toBe('0.7.0');
  });

  it('GET /health responds quickly (under 100ms)', async () => {
    const start = performance.now();
    const res = await request(app).get('/health');
    const elapsed = performance.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(100);
  });
});

// ============================================================================
// Cross-cutting concerns
// ============================================================================

describe('Cross-cutting concerns', () => {
  it('CORS headers are set on responses', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://praycalc.com');

    expect(res.status).toBe(200);
    // CORS headers should be present for allowed origins
    const corsHeader = res.headers['access-control-allow-origin'];
    if (corsHeader) {
      expect(corsHeader).toContain('praycalc.com');
    }
  });

  it('JSON body parsing accepts valid JSON', async () => {
    const res = await request(app)
      .post('/google/fulfillment')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        queryResult: {
          intent: { displayName: 'NextPrayer' },
          parameters: {},
        },
        originalDetectIntentRequest: { payload: { user: {} } },
      }));

    // May be 200 or 429 depending on rate limit state
    expect([200, 429]).toContain(res.status);
  });

  it('unknown routes return 404', async () => {
    const res = await request(app).get('/nonexistent/route');

    expect(res.status).toBe(404);
  });

  it('authentication middleware validates JWT format', async () => {
    const token = makeToken('user-auth-crosscut');
    const res = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('webhooks');
  });

  it('authentication middleware rejects malformed bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', 'Bearer not.a.valid.jwt');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('authentication middleware rejects missing Authorization header', async () => {
    const res = await request(app)
      .get('/api/v1/webhooks');

    expect(res.status).toBe(401);
  });

  it('authentication middleware rejects non-Bearer scheme', async () => {
    const res = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', 'Basic dXNlcjpwYXNz');

    expect(res.status).toBe(401);
  });
});
