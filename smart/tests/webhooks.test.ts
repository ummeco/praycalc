import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/index.js';

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

const VALID_WEBHOOK = {
  callbackUrl: 'https://example.com/webhook',
  lat: 40.7128,
  lng: -74.006,
  events: ['adhan'],
};

describe('POST /api/v1/webhooks', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/webhooks')
      .send(VALID_WEBHOOK);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', 'Bearer invalid-token-here')
      .send(VALID_WEBHOOK);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('creates a webhook registration with valid auth', async () => {
    const token = makeToken('user-webhook-create');
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_WEBHOOK);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('userId', 'user-webhook-create');
    expect(res.body).toHaveProperty('callbackUrl', VALID_WEBHOOK.callbackUrl);
    expect(res.body).toHaveProperty('lat', VALID_WEBHOOK.lat);
    expect(res.body).toHaveProperty('lng', VALID_WEBHOOK.lng);
    expect(res.body).toHaveProperty('events');
    expect(res.body.events).toContain('adhan');
    expect(res.body).toHaveProperty('active', true);
    expect(res.body).toHaveProperty('createdAt');
  });

  it('returns 400 for missing callbackUrl', async () => {
    const token = makeToken('user-missing-url');
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: 40.7128, lng: -74.006 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('callbackUrl');
  });

  it('returns 400 for invalid callbackUrl', async () => {
    const token = makeToken('user-bad-url');
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ callbackUrl: 'not-a-url', lat: 40.7128, lng: -74.006 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('callbackUrl');
  });

  it('returns 400 for invalid coordinates', async () => {
    const token = makeToken('user-bad-coords');
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({ callbackUrl: 'https://example.com/hook', lat: 999, lng: -74.006 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('lat');
  });

  it('defaults events to adhan when not specified', async () => {
    const token = makeToken('user-default-events');
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        callbackUrl: 'https://example.com/hook',
        lat: 40.7128,
        lng: -74.006,
      });

    expect(res.status).toBe(201);
    expect(res.body.events).toContain('adhan');
  });
});

describe('GET /api/v1/webhooks', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .get('/api/v1/webhooks');

    expect(res.status).toBe(401);
  });

  it('lists webhooks for authenticated user', async () => {
    const userId = 'user-list-webhooks';
    const token = makeToken(userId);

    // Create a webhook first
    await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_WEBHOOK);

    const res = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('webhooks');
    expect(Array.isArray(res.body.webhooks)).toBe(true);
    expect(res.body.webhooks.length).toBeGreaterThanOrEqual(1);
    expect(res.body.webhooks[0]).toHaveProperty('callbackUrl');
  });

  it('does not return webhooks from other users', async () => {
    const token1 = makeToken('user-isolation-a');
    const token2 = makeToken('user-isolation-b');

    await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token1}`)
      .send(VALID_WEBHOOK);

    const res = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    const urls = res.body.webhooks.map((w: any) => w.callbackUrl);
    // user-isolation-b should not see user-isolation-a's webhooks
    // (they may have their own from other tests, but userId should differ)
    for (const webhook of res.body.webhooks) {
      expect(webhook.userId).toBe('user-isolation-b');
    }
  });
});

describe('DELETE /api/v1/webhooks/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .delete('/api/v1/webhooks/some-id');

    expect(res.status).toBe(401);
  });

  it('removes a webhook registration', async () => {
    const userId = 'user-delete-webhook';
    const token = makeToken(userId);

    // Create
    const createRes = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_WEBHOOK);

    expect(createRes.status).toBe(201);
    const webhookId = createRes.body.id;

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/v1/webhooks/${webhookId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(204);

    // Verify it is gone
    const listRes = await request(app)
      .get('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    const ids = listRes.body.webhooks.map((w: any) => w.id);
    expect(ids).not.toContain(webhookId);
  });

  it('returns 404 for non-existent webhook', async () => {
    const token = makeToken('user-delete-nonexistent');
    const res = await request(app)
      .delete('/api/v1/webhooks/does-not-exist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Webhook not found');
  });
});

describe('Webhook limits', () => {
  it('returns 409 after exceeding max 5 webhooks per user', async () => {
    const userId = 'user-max-webhooks';
    const token = makeToken(userId);

    // Create 5 webhooks
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/v1/webhooks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          callbackUrl: `https://example.com/hook-${i}`,
          lat: 40.7128,
          lng: -74.006,
          events: ['adhan'],
        });

      expect(res.status).toBe(201);
    }

    // The 6th should fail
    const res = await request(app)
      .post('/api/v1/webhooks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        callbackUrl: 'https://example.com/hook-6',
        lat: 40.7128,
        lng: -74.006,
        events: ['adhan'],
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Maximum webhooks reached');
    expect(res.body.message).toContain('5');
  });
});
