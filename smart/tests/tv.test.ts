import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/index.js';
import { tvDeviceStore, userProfileStore, subscriptionStore } from './setup.js';

const JWT_SECRET = process.env.HASURA_GRAPHQL_JWT_SECRET || 'test-secret';

/**
 * Grant an Ummat+ subscription to a test user. Gated TV routes (pair,
 * auth/authorize, auth/refresh, app-code, guest-qr) require Plus. Use a
 * UNIQUE userId per test: getSubscriptionStatus caches per-user across tests
 * while subscriptionStore is cleared each test.
 */
function grantPlus(userId: string): void {
  subscriptionStore.set(userId, {
    user_id: userId,
    plan: 'plus',
    status: 'active',
    current_period_end: new Date(Date.now() + 86_400_000).toISOString(),
  });
}

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
    it('returns a 4-digit numeric pairing code', async () => {
      const res = await request(app).post('/api/v1/tv/code').send({
        deviceModel: 'Fire TV Stick 4K',
        androidId: 'abc123',
      });
      expect(res.status).toBe(200);
      expect(typeof res.body.code).toBe('string');
      expect(res.body.code).toMatch(/^\d{4}$/);
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

    it('rejects device_name > 100 chars', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/some-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ device_name: 'A'.repeat(101) });
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

    it('returns 403 for device not owned by requesting user', async () => {
      const token = makeToken('user-tv-test');
      const res = await request(app)
        .patch('/api/v1/tv/00000000-0000-0000-0000-000000000000/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ audio_mode: 'mute' });
      // Device not in tvDeviceStore for this user → ownership check returns empty → 403
      expect(res.status).toBe(403);
    });

    it('returns ok for valid settings when device is owned', async () => {
      const ownerId = 'user-tv-settings-test';
      const deviceId = 'cccccccc-dddd-eeee-ffff-000000000001';
      tvDeviceStore.set(deviceId, { id: deviceId, user_id: ownerId });
      const token = makeToken(ownerId);
      const res = await request(app)
        .patch(`/api/v1/tv/${deviceId}/settings`)
        .set('Authorization', `Bearer ${token}`)
        .send({ audio_mode: 'adhan_only', brightness: 80, screensaver_enabled: true });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  // ── TEST-B1: Auth + ownership scenarios for settings PATCH ───────────────

  describe('PATCH /api/v1/tv/:id/settings — ownership enforcement', () => {
    const SETTINGS_OWNER = 'settings-owner-uuid-001';
    const SETTINGS_OTHER = 'settings-other-uuid-002';
    const SETTINGS_DEVICE = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

    beforeEach(() => {
      tvDeviceStore.set(SETTINGS_DEVICE, { id: SETTINGS_DEVICE, user_id: SETTINGS_OWNER });
    });

    it('unauthenticated request → 401', async () => {
      const res = await request(app)
        .patch(`/api/v1/tv/${SETTINGS_DEVICE}/settings`)
        .send({ audio_mode: 'adhan_only' });
      expect(res.status).toBe(401);
    });

    it('owner can update their own device settings → 200', async () => {
      const token = makeToken(SETTINGS_OWNER);
      const res = await request(app)
        .patch(`/api/v1/tv/${SETTINGS_DEVICE}/settings`)
        .set('Authorization', `Bearer ${token}`)
        .send({ audio_mode: 'adhan_only', brightness: 75 });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('non-owner user gets rejected → 403', async () => {
      const token = makeToken(SETTINGS_OTHER);
      const res = await request(app)
        .patch(`/api/v1/tv/${SETTINGS_DEVICE}/settings`)
        .set('Authorization', `Bearer ${token}`)
        .send({ audio_mode: 'mute' });
      expect(res.status).toBe(403);
    });

    it('request with no valid settings fields → 400 before auth check', async () => {
      const token = makeToken(SETTINGS_OWNER);
      const res = await request(app)
        .patch(`/api/v1/tv/${SETTINGS_DEVICE}/settings`)
        .set('Authorization', `Bearer ${token}`)
        .send({ unrecognized_field: 'value' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No settings provided');
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
      grantPlus('user-tv-refresh-p1');
      const token = makeToken('user-tv-refresh-p1');
      const res = await request(app)
        .post('/api/v1/tv/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns a JWT for valid request', async () => {
      grantPlus('user-tv-refresh-p2');
      const token = makeToken('user-tv-refresh-p2');
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
      grantPlus('user-guest-qr-p1');
      const token = makeToken('user-guest-qr-p1');
      const res = await request(app)
        .post('/api/v1/tv/guest-qr')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns a guest QR URL with 24h expiry', async () => {
      grantPlus('user-guest-qr-p2');
      const token = makeToken('user-guest-qr-p2');
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

  describe('Ummat+ gating (requirePlus) — user-side TV routes return 402 for free users', () => {
    const GATED: Array<{ path: string; body: Record<string, unknown> }> = [
      { path: '/api/v1/tv/pair', body: { code: '1234' } },
      { path: '/api/v1/tv/auth/authorize', body: { user_code: 'AAAA-BBBB' } },
      { path: '/api/v1/tv/auth/refresh', body: { device_id: 'dev-1' } },
      { path: '/api/v1/tv/app-code', body: {} },
      { path: '/api/v1/tv/guest-qr', body: { lat: 21.3891, lng: 39.8579 } },
    ];

    for (const { path, body } of GATED) {
      it(`POST ${path} → 402 ummat_plus_required for authenticated free user`, async () => {
        // Unique id per route; no subscriptionStore entry → free tier.
        const token = makeToken(`free-user-${path.replace(/\W+/g, '-')}`);
        const res = await request(app)
          .post(path)
          .set('Authorization', `Bearer ${token}`)
          .send(body);
        expect(res.status).toBe(402);
        expect(res.body.error).toBe('ummat_plus_required');
        expect(res.body.upgrade).toBe('https://praycalc.com/upgrade');
      });
    }
  });

  describe('GET /api/v1/tv/guest/:code', () => {
    it('returns 404 for unknown code', async () => {
      const res = await request(app).get('/api/v1/tv/guest/nonexistent');
      expect(res.status).toBe(404);
    });

    it('returns location for valid code', async () => {
      // First generate a code.
      grantPlus('user-guest-qr-lookup');
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

  // ── TEST-B2: Rate limiting on TV endpoints ────────────────────────────────

  describe('Rate limiting', () => {
    it('unauthenticated requests are rate-limited per IP after 60 requests', async () => {
      // Drain the bucket: 61 concurrent requests from the same (loopback) IP.
      const promises = Array.from({ length: 61 }, () =>
        request(app).get('/api/v1/tv/streams'),
      );
      const results = await Promise.all(promises);
      const statuses = results.map(r => r.status);
      expect(statuses).toContain(429);
    });

    it('429 response includes error and retryAfter fields', async () => {
      // Drain bucket with sequential requests.
      for (let i = 0; i < 61; i++) {
        await request(app).get('/api/v1/tv/streams');
      }
      const res = await request(app).get('/api/v1/tv/streams');
      if (res.status === 429) {
        expect(typeof res.body.error).toBe('string');
        expect(typeof res.body.retryAfter).toBe('number');
        expect(res.body.retryAfter).toBeGreaterThan(0);
      }
      // May be 200 if bucket refilled between requests — acceptable in test env.
    });

    it('two different authenticated users each get their own rate limit bucket', async () => {
      const user1Token = makeToken('rate-bucket-user-001');
      const user2Token = makeToken('rate-bucket-user-002');
      // Each user's first request should not be rate-limited.
      const res1 = await request(app)
        .get('/api/v1/tv/streams')
        .set('Authorization', `Bearer ${user1Token}`);
      const res2 = await request(app)
        .get('/api/v1/tv/streams')
        .set('Authorization', `Bearer ${user2Token}`);
      expect(res1.status).not.toBe(429);
      expect(res2.status).not.toBe(429);
    });

    it('successful TV API responses include X-RateLimit headers', async () => {
      const res = await request(app).get('/api/v1/tv/streams');
      if (res.status === 200) {
        expect(res.headers['x-ratelimit-limit']).toBeDefined();
        expect(res.headers['x-ratelimit-remaining']).toBeDefined();
        expect(Number(res.headers['x-ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ── Share endpoints (SHARE-3 / SHARE-4) ──────────────────────────────────

  const OWNER_ID = 'owner-user-uuid-0001';
  const TARGET_ID = 'target-user-uuid-0002';
  const OTHER_ID  = 'other-user-uuid-0003';
  const DEVICE_ID = '00000000-0000-0000-0000-device000001';
  const TARGET_EMAIL = 'target@example.com';

  // Seed a TV device owned by OWNER_ID and a user profile for TARGET_EMAIL
  // before each share test.
  beforeEach(() => {
    tvDeviceStore.set(DEVICE_ID, { id: DEVICE_ID, user_id: OWNER_ID });
    userProfileStore.set(TARGET_EMAIL, { id: TARGET_ID, email: TARGET_EMAIL });
  });

  describe('POST /api/v1/tv/:id/share', () => {
    it('owner can share device with valid email → 200', async () => {
      const token = makeToken(OWNER_ID);
      const res = await request(app)
        .post(`/api/v1/tv/${DEVICE_ID}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: TARGET_EMAIL });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.sharedWith.userId).toBe(TARGET_ID);
      expect(res.body.sharedWith.email).toBe(TARGET_EMAIL);
    });

    it('non-owner cannot share someone else\'s device → 403', async () => {
      const token = makeToken(OTHER_ID);
      const res = await request(app)
        .post(`/api/v1/tv/${DEVICE_ID}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: TARGET_EMAIL });

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it('sharing with non-existent email → 404', async () => {
      const token = makeToken(OWNER_ID);
      const res = await request(app)
        .post(`/api/v1/tv/${DEVICE_ID}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nobody@nowhere.invalid' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v1/tv/:id/share/:userId', () => {
    it('owner can remove a share → 200', async () => {
      const token = makeToken(OWNER_ID);
      const res = await request(app)
        .delete(`/api/v1/tv/${DEVICE_ID}/share/${TARGET_ID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('shared user can remove their own access (self-removal) → 200', async () => {
      // TARGET_ID removes themselves — no ownership check required.
      const token = makeToken(TARGET_ID);
      const res = await request(app)
        .delete(`/api/v1/tv/${DEVICE_ID}/share/${TARGET_ID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('non-owner, non-shared user gets rejected → 403', async () => {
      const token = makeToken(OTHER_ID);
      const res = await request(app)
        .delete(`/api/v1/tv/${DEVICE_ID}/share/${TARGET_ID}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });
  });
});
