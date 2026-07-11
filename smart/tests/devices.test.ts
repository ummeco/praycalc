import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/index.js';
import { subscriptionStore } from './setup.js';

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

function makePlusUser(userId: string): string {
  subscriptionStore.set(userId, { plan: 'plus', status: 'active', current_period_end: '2099-01-01' });
  return makeToken(userId);
}

/**
 * Integration tests for smart/routes/devices.ts against the REAL schema
 * (pc_smart_home_devices + pc_device_pairings, migrations/002). Guards
 * against a regression to the nonexistent `pc_devices` table this file used
 * to query (WTH Epic H / H1 fix).
 */

describe('GET /api/v1/devices', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/devices');
    expect(res.status).toBe(401);
  });

  it('lists linked devices for the authenticated user', async () => {
    const userId = 'user-devices-list';
    const token = makePlusUser(userId);

    await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'alexa', device_id: 'echo-dot-1', device_name: 'Kitchen Echo' });

    const res = await request(app)
      .get('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.devices)).toBe(true);
    expect(res.body.devices.length).toBe(1);
    expect(res.body.devices[0]).toMatchObject({
      platform: 'alexa',
      device_id: 'echo-dot-1',
      device_name: 'Kitchen Echo',
      status: 'linked',
    });
    // Never expose token hashes
    expect(res.body.devices[0]).not.toHaveProperty('access_token_hash');
    expect(res.body.devices[0]).not.toHaveProperty('refresh_token_hash');
  });

  it('does not return devices linked by other users', async () => {
    const tokenA = makePlusUser('user-devices-iso-a');
    const tokenB = makePlusUser('user-devices-iso-b');

    await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ platform: 'google', device_id: 'nest-hub-1' });

    const res = await request(app)
      .get('/api/v1/devices')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.devices).toEqual([]);
  });
});

describe('POST /api/v1/devices', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/v1/devices')
      .send({ platform: 'alexa', device_id: 'x' });
    expect(res.status).toBe(401);
  });

  it('returns 402 for a free (non-Plus) user', async () => {
    const token = makeToken('user-devices-free');
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'alexa', device_id: 'echo-1' });

    expect(res.status).toBe(402);
    expect(res.body.error).toBe('ummat_plus_required');
  });

  it('returns 400 for an invalid platform', async () => {
    const token = makePlusUser('user-devices-bad-platform');
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'not-a-real-platform', device_id: 'x' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('platform');
  });

  it('returns 400 for a missing device_id', async () => {
    const token = makePlusUser('user-devices-no-id');
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'homeassistant' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('device_id');
  });

  it('registers a device with 201 and the real schema shape', async () => {
    const token = makePlusUser('user-devices-register');
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'siri', device_id: 'homepod-mini-1', device_name: 'Living Room' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({
      platform: 'siri',
      device_id: 'homepod-mini-1',
      device_name: 'Living Room',
      status: 'linked',
    });
    expect(res.body).toHaveProperty('linked_at');
  });

  it('upserts on (user_id, platform, device_id) instead of duplicating', async () => {
    const token = makePlusUser('user-devices-upsert');

    const first = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'alexa', device_id: 'echo-dup', device_name: 'Old Name' });

    const second = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'alexa', device_id: 'echo-dup', device_name: 'New Name' });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
    expect(second.body.device_name).toBe('New Name');

    const list = await request(app)
      .get('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.devices.length).toBe(1);
  });
});

describe('DELETE /api/v1/devices/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/v1/devices/some-id');
    expect(res.status).toBe(401);
  });

  it('returns 404 for a non-existent device', async () => {
    const token = makeToken('user-devices-delete-404');
    const res = await request(app)
      .delete('/api/v1/devices/does-not-exist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('unlinks a device the user owns', async () => {
    const token = makePlusUser('user-devices-delete-ok');

    const created = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ platform: 'google', device_id: 'nest-mini-1' });

    const del = await request(app)
      .delete(`/api/v1/devices/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(204);

    const list = await request(app)
      .get('/api/v1/devices')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.devices).toEqual([]);
  });

  it('does not allow deleting another user\'s device', async () => {
    const tokenA = makePlusUser('user-devices-delete-owner');
    const tokenB = makeToken('user-devices-delete-intruder');

    const created = await request(app)
      .post('/api/v1/devices')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ platform: 'alexa', device_id: 'echo-protected' });

    const del = await request(app)
      .delete(`/api/v1/devices/${created.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(del.status).toBe(404);
  });
});

describe('Device pairing codes (pc_device_pairings)', () => {
  it('POST /pairings issues a 6-character code without auth', async () => {
    const res = await request(app)
      .post('/api/v1/devices/pairings')
      .send({ device_id: 'watch-abc-123', device_type: 'watch' });

    expect(res.status).toBe(201);
    expect(res.body.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(res.body.expiresInSeconds).toBe(600);
  });

  it('POST /pairings rejects an invalid device_type', async () => {
    const res = await request(app)
      .post('/api/v1/devices/pairings')
      .send({ device_id: 'thing-1', device_type: 'toaster' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('device_type');
  });

  it('GET /pairings/:code reports pending before it is claimed', async () => {
    const create = await request(app)
      .post('/api/v1/devices/pairings')
      .send({ device_id: 'desktop-xyz', device_type: 'desktop' });

    const status = await request(app).get(`/api/v1/devices/pairings/${create.body.code}`);
    expect(status.status).toBe(200);
    expect(status.body.status).toBe('pending');
  });

  it('GET /pairings/:code returns 404/expired for an unknown code', async () => {
    const res = await request(app).get('/api/v1/devices/pairings/ZZZZZZ');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('expired');
  });

  it('claim requires auth, then the code resolves to linked', async () => {
    const create = await request(app)
      .post('/api/v1/devices/pairings')
      .send({ device_id: 'watch-claim-1', device_type: 'watch' });
    const code = create.body.code;

    const unauthClaim = await request(app).post(`/api/v1/devices/pairings/${code}/claim`);
    expect(unauthClaim.status).toBe(401);

    const token = makeToken('user-devices-pairing-claim');
    const claim = await request(app)
      .post(`/api/v1/devices/pairings/${code}/claim`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(claim.status).toBe(200);
    expect(claim.body).toMatchObject({ claimed: true, deviceId: 'watch-claim-1', deviceType: 'watch' });

    const status = await request(app).get(`/api/v1/devices/pairings/${code}`);
    expect(status.status).toBe(200);
    expect(status.body).toMatchObject({ status: 'linked', userId: 'user-devices-pairing-claim' });
  });

  it('claiming an already-used code fails', async () => {
    const create = await request(app)
      .post('/api/v1/devices/pairings')
      .send({ device_id: 'watch-claim-2', device_type: 'watch' });
    const code = create.body.code;
    const token = makeToken('user-devices-pairing-reclaim');

    await request(app)
      .post(`/api/v1/devices/pairings/${code}/claim`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    const second = await request(app)
      .post(`/api/v1/devices/pairings/${code}/claim`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(second.status).toBe(400);
  });
});
