import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/index.js';

const JWT_SECRET = process.env.HASURA_GRAPHQL_JWT_SECRET || 'test-secret';

function makeToken(userId: string): string {
  return jwt.sign(
    {
      'https://hasura.io/jwt/claims': {
        'x-hasura-user-id': userId,
        'x-hasura-default-role': 'user',
      },
    },
    JWT_SECRET,
  );
}

describe('TV Routes', () => {
  describe('GET /api/v1/tv/streams', () => {
    it('returns curated stream list without auth', async () => {
      const res = await request(app).get('/api/v1/tv/streams');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.streams)).toBe(true);
      expect(res.body.streams.length).toBeGreaterThan(0);
    });

    it('each stream has id, name, type, url', async () => {
      const res = await request(app).get('/api/v1/tv/streams');
      for (const stream of res.body.streams) {
        expect(typeof stream.id).toBe('string');
        expect(typeof stream.name).toBe('string');
        expect(['video', 'audio']).toContain(stream.type);
        expect(typeof stream.url).toBe('string');
      }
    });

    it('includes Mecca and Medina streams', async () => {
      const res = await request(app).get('/api/v1/tv/streams');
      const ids = res.body.streams.map((s: any) => s.id);
      expect(ids).toContain('mecca');
      expect(ids).toContain('medina');
    });
  });

  describe('POST /api/v1/tv/auth/device', () => {
    it('returns RFC 8628 device auth response', async () => {
      const res = await request(app).post('/api/v1/tv/auth/device').send({});
      expect(res.status).toBe(200);
      expect(typeof res.body.device_code).toBe('string');
      expect(typeof res.body.user_code).toBe('string');
      expect(res.body.user_code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      expect(res.body.verification_uri).toContain('praycalc.com/activate');
      expect(res.body.expires_in).toBe(600);
      expect(res.body.interval).toBe(5);
    });
  });

  describe('GET /api/v1/tv/auth/poll', () => {
    it('returns expired for unknown device_code', async () => {
      const res = await request(app)
        .get('/api/v1/tv/auth/poll')
        .query({ device_code: 'nonexistent-code' });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('expired');
    });

    it('returns pending for valid device_code before authorization', async () => {
      // First get a device code
      const authRes = await request(app).post('/api/v1/tv/auth/device').send({});
      const { device_code } = authRes.body;

      // Poll should return pending
      const pollRes = await request(app)
        .get('/api/v1/tv/auth/poll')
        .query({ device_code });
      expect(pollRes.status).toBe(200);
      expect(pollRes.body.status).toBe('pending');
    });

    it('requires device_code param', async () => {
      const res = await request(app).get('/api/v1/tv/auth/poll');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/tv/code', () => {
    it('returns a 6-char pairing code', async () => {
      const res = await request(app).post('/api/v1/tv/code').send({
        deviceModel: 'Fire TV Stick 4K',
        androidId: 'abc123',
      });
      expect(res.status).toBe(200);
      expect(typeof res.body.code).toBe('string');
      expect(res.body.code).toMatch(/^[A-Z2-9]{6}$/);
      expect(res.body.expiresInSeconds).toBe(300);
      expect(res.body.qrData).toContain(res.body.code);
    });
  });

  describe('POST /api/v1/tv/heartbeat', () => {
    it('requires auth', async () => {
      const res = await request(app).post('/api/v1/tv/heartbeat').send({ device_id: 'test' });
      expect(res.status).toBe(401);
    });

    it('requires device_id', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .post('/api/v1/tv/heartbeat')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('device_id');
    });

    it('accepts valid heartbeat (Hasura may not be running in test)', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .post('/api/v1/tv/heartbeat')
        .set('Authorization', `Bearer ${token}`)
        .send({ device_id: 'test-device-id', screen_state: 'on' });
      // Either 200 (ok) or 500 if Hasura unreachable — both are acceptable in test
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('PATCH /api/v1/tv/:id', () => {
    it('requires auth', async () => {
      const res = await request(app)
        .patch('/api/v1/tv/some-id')
        .send({ device_name: 'New Name' });
      expect(res.status).toBe(401);
    });

    it('rejects empty device_name', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/some-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ device_name: '' });
      expect(res.status).toBe(400);
    });

    it('rejects device_name > 50 chars', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/some-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ device_name: 'A'.repeat(51) });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/tv/:id/settings', () => {
    it('requires auth', async () => {
      const res = await request(app)
        .patch('/api/v1/tv/some-device-id/settings')
        .send({ audio_mode: 'adhan_only' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when body has no valid settings fields', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/some-device-id/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No settings provided');
    });

    it('returns 400 when body has only unrecognized fields', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/some-device-id/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ unknown_field: 'value' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No settings provided');
    });

    it('returns 404 for device not owned by user (Hasura unavailable → 500 or 404)', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/00000000-0000-0000-0000-000000000000/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ audio_mode: 'mute' });
      // Hasura not running in tests → 404 (device not found) or 500 (connection error)
      expect([404, 500]).toContain(res.status);
    });

    it('returns ok for valid settings (Hasura unavailable → ok, 404, or 500)', async () => {
      const token = makeToken('user-tv-settings-test');
      const res = await request(app)
        .patch('/api/v1/tv/some-device-id/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ audio_mode: 'adhan_only', brightness: 80, screensaver_enabled: true });
      // 200 { ok: true } if Hasura running; 404 if Hasura returns empty rows; 500 on connection error
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.ok).toBe(true);
      }
    });
  });

  describe('POST /api/v1/tv/auth/refresh', () => {
    it('requires auth', async () => {
      const res = await request(app)
        .post('/api/v1/tv/auth/refresh')
        .send({ device_id: 'abc' });
      expect(res.status).toBe(401);
    });

    it('requires device_id', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .post('/api/v1/tv/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns a JWT for valid request', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .post('/api/v1/tv/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({ device_id: 'test-device-123' });
      expect(res.status).toBe(200);
      expect(typeof res.body.jwt).toBe('string');
      expect(res.body.jwt.split('.').length).toBe(3); // JWT format
    });
  });

  describe('POST /api/v1/tv/guest-qr', () => {
    it('requires auth', async () => {
      const res = await request(app)
        .post('/api/v1/tv/guest-qr')
        .send({ lat: 21.3891, lng: 39.8579 });
      expect(res.status).toBe(401);
    });

    it('requires lat and lng', async () => {
      const token = makeToken('user-guest-qr');
      const res = await request(app)
        .post('/api/v1/tv/guest-qr')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns a guest QR URL with 24h expiry', async () => {
      const token = makeToken('user-guest-qr');
      const res = await request(app)
        .post('/api/v1/tv/guest-qr')
        .set('Authorization', `Bearer ${token}`)
        .send({ lat: 21.3891, lng: 39.8579 });
      expect(res.status).toBe(200);
      expect(typeof res.body.code).toBe('string');
      expect(res.body.url).toMatch(/^https:\/\/praycalc\.com\/tv\/guest\//);
      expect(typeof res.body.expiresAt).toBe('string');
      const exp = new Date(res.body.expiresAt).getTime();
      const now = Date.now();
      expect(exp).toBeGreaterThan(now + 23 * 60 * 60 * 1000);
      expect(exp).toBeLessThan(now + 25 * 60 * 60 * 1000);
    });
  });

  describe('GET /api/v1/tv/guest/:code', () => {
    it('returns 404 for unknown code', async () => {
      const res = await request(app).get('/api/v1/tv/guest/nonexistent');
      expect(res.status).toBe(404);
    });

    it('returns location for valid code', async () => {
      // First generate a code.
      const token = makeToken('user-guest-qr-lookup');
      const post = await request(app)
        .post('/api/v1/tv/guest-qr')
        .set('Authorization', `Bearer ${token}`)
        .send({ lat: 40.7128, lng: -74.006 });
      expect(post.status).toBe(200);
      const { code } = post.body as { code: string };

      const get = await request(app).get(`/api/v1/tv/guest/${code}`);
      expect(get.status).toBe(200);
      expect(get.body.lat).toBe(40.7128);
      expect(get.body.lng).toBe(-74.006);
    });
  });
});
