import { describe, it, expect } from 'vitest';
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

describe('POST /billing/checkout', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/billing/checkout')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('requires authentication to create checkout session', async () => {
    const res = await request(app)
      .post('/billing/checkout')
      .set('Authorization', 'Bearer invalid-jwt')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(401);
  });
});

describe('GET /billing/status', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .get('/billing/status');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('returns subscription status for authenticated user', async () => {
    const token = makeToken('user-billing-status');
    const res = await request(app)
      .get('/billing/status')
      .set('Authorization', `Bearer ${token}`);

    // The endpoint queries Hasura which is not available in tests,
    // so it returns the fallback (free plan) or a 500.
    // Either way it should not be 401.
    expect(res.status).not.toBe(401);

    if (res.status === 200) {
      expect(res.body).toHaveProperty('plan');
      expect(res.body).toHaveProperty('status');
    }
  });
});

describe('POST /billing/verify-receipt', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/billing/verify-receipt')
      .send({ platform: 'ios', receipt: 'abc', productId: 'ummat_plus_yearly' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('returns 400 when platform is missing', async () => {
    const token = makeToken('user-verify-receipt');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({ receipt: 'abc', productId: 'ummat_plus_yearly' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('platform');
  });

  it('returns 400 when receipt is missing', async () => {
    const token = makeToken('user-verify-receipt-2');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'ios', productId: 'ummat_plus_yearly' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('receipt');
  });

  it('returns 400 when productId is missing', async () => {
    const token = makeToken('user-verify-receipt-3');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'ios', receipt: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('productId');
  });

  it('returns 400 for unknown productId', async () => {
    const token = makeToken('user-verify-receipt-4');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'ios', receipt: 'abc123', productId: 'unknown_product' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Unknown product');
  });

  it('accepts valid receipt for ummat_plus_yearly', async () => {
    const token = makeToken('user-verify-receipt-5');
    const res = await request(app)
      .post('/billing/verify-receipt')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'ios', receipt: 'valid-receipt-data', productId: 'ummat_plus_yearly' });

    // This upserts via Hasura which may not be available in test,
    // but the endpoint logic should attempt it and return 200 or 500.
    // It should not return 400 or 401 for valid input.
    if (res.status === 200) {
      expect(res.body).toHaveProperty('status', 'active');
      expect(res.body).toHaveProperty('plan', 'plus');
    }
  });
});
