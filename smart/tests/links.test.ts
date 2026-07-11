import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/index.js';
import { seedOAuthAccessToken } from './setup.js';

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

/**
 * Tests for the WMD account-linking dashboard endpoints
 * (GET/DELETE /api/v1/links), backed by pc_oauth_tokens.provider
 * (migrations/012_oauth_token_provider.sql).
 */

describe('GET /api/v1/links', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/links');
    expect(res.status).toBe(401);
  });

  it('returns an empty list for a user with no linked providers', async () => {
    const token = makeToken('user-links-none');
    const res = await request(app)
      .get('/api/v1/links')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.links).toEqual([]);
  });

  it('lists each linked provider once with a linked_at timestamp', async () => {
    const userId = 'user-links-list';
    // Seed two distinct OAuth access tokens for two different providers.
    seedOAuthAccessToken('raw-token-google-1', userId, 'google-home-praycalc');
    seedOAuthAccessToken('raw-token-alexa-1', userId, 'alexa-praycalc');

    const token = makeToken(userId);
    const res = await request(app)
      .get('/api/v1/links')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.links).toHaveLength(2);
    const providers = res.body.links.map((l: any) => l.provider).sort();
    expect(providers).toEqual(['alexa-praycalc', 'google-home-praycalc']);
    for (const link of res.body.links) {
      expect(link).toHaveProperty('linked_at');
      expect(typeof link.linked_at).toBe('string');
    }
  });

  it('does not list another user\'s linked providers', async () => {
    seedOAuthAccessToken('raw-token-isolation', 'user-links-owner', 'google-home-praycalc');

    const token = makeToken('user-links-intruder');
    const res = await request(app)
      .get('/api/v1/links')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.links).toEqual([]);
  });

  it('does not list a revoked token\'s provider', async () => {
    const userId = 'user-links-revoked';
    seedOAuthAccessToken('raw-token-revoked', userId, 'alexa-praycalc');

    const token = makeToken(userId);

    // Revoke via the general-purpose revoke endpoint (RFC 7009 style).
    await request(app).post('/oauth/revoke').send({ token: 'raw-token-revoked' });

    const res = await request(app)
      .get('/api/v1/links')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.links).toEqual([]);
  });
});

describe('DELETE /api/v1/links/:provider', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/v1/links/google-home-praycalc');
    expect(res.status).toBe(401);
  });

  it('returns 404 when the provider is not linked', async () => {
    const token = makeToken('user-links-delete-404');
    const res = await request(app)
      .delete('/api/v1/links/never-linked-provider')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('revokes a linked provider and removes it from the list', async () => {
    const userId = 'user-links-delete-ok';
    seedOAuthAccessToken('raw-token-delete-ok', userId, 'google-home-praycalc');

    const token = makeToken(userId);
    const del = await request(app)
      .delete('/api/v1/links/google-home-praycalc')
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(204);

    const list = await request(app)
      .get('/api/v1/links')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.links).toEqual([]);
  });

  it('does not allow revoking another user\'s provider link', async () => {
    seedOAuthAccessToken('raw-token-other-user', 'user-links-victim', 'google-home-praycalc');

    const token = makeToken('user-links-attacker');
    const del = await request(app)
      .delete('/api/v1/links/google-home-praycalc')
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(404);

    // Victim's link must still be intact.
    const victimToken = makeToken('user-links-victim');
    const list = await request(app)
      .get('/api/v1/links')
      .set('Authorization', `Bearer ${victimToken}`);
    expect(list.body.links).toHaveLength(1);
  });
});
