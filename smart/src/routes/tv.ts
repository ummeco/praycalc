/**
 * TV-specific API routes for PrayCalc TV Command Center.
 *
 * Endpoints:
 *   POST /api/v1/tv/pair              — Validate 6-char code, link device (TV2-1.3)
 *   POST /api/v1/tv/auth/device       — RFC 8628: get device_code + user_code (TV2-1.4)
 *   GET  /api/v1/tv/auth/poll         — Poll for authorization status (TV2-1.6)
 *   POST /api/v1/tv/auth/refresh      — Refresh 30-day TV JWT (TV2-1.7)
 *   GET  /api/v1/tv/streams           — Curated stream library (TV2-3.8)
 *   POST /api/v1/tv/guest-qr         — Generate 24h guest prayer-time QR URL (PC-TV2-3)
 *   GET  /api/v1/tv/guest/:code      — Resolve guest QR code to lat/lng (PC-TV2-3)
 *   POST /api/v1/tv/heartbeat         — TV keepalive, updates last_seen (TV2-10.2)
 *   POST /api/v1/tv/:id/screenshot    — Request screenshot upload (TV2-10.3)
 *   PATCH /api/v1/tv/:id              — Rename device (TV2-10.5)
 *   PATCH /api/v1/tv/:id/settings     — Push settings_json to device (TV2-10.7)
 *   GET  /api/v1/tv/groups            — List TV groups for user (TV2-10.4)
 *   POST /api/v1/tv/groups            — Create TV group (TV2-10.4)
 *   PATCH /api/v1/tv/groups/:id/settings — Push settings to all TVs in group
 *   POST /api/v1/tv/:id/share         — Share device with another user (SHARE-3)
 *   DELETE /api/v1/tv/:id/share/:uid  — Remove a share (SHARE-4)
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';
import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { isMinioConfigured, createPresignedUploadUrl, photoKey } from '../lib/minio.js';
// CFG-B2: Import all tunable constants from the centralized config module.
import {
  HASURA_URL,
  HASURA_ADMIN_SECRET,
  HASURA_JWT_SECRET,
  TV_JWT_TTL_MS,
  DEVICE_NAME_MAX_LEN,
  ANNOUNCEMENT_TEXT_MAX_LEN,
} from '../lib/config.js';

// ── Security helpers ──────────────────────────────────────────────────────────

/** SEC-A8: Strip all HTML tags from a string so TV Text() widget can display safely. */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

export const tvRouter = Router();

// Parse Hasura JSON format {"type":"HS256","key":"<hex>"} or use raw string.
function parseJwtSecret(raw: string): string {
  if (!raw) return raw;
  try { const p = JSON.parse(raw); if (typeof p?.key === 'string') return p.key; } catch { /* not valid JSON */ }
  const m = raw.match(/key[=:]\s*([a-zA-Z0-9._~+/=\-]{16,})/);
  if (m?.[1]) return m[1];
  return raw;
}
const JWT_SECRET = parseJwtSecret(HASURA_JWT_SECRET || 'tv-secret');

/** In-memory device registry — fallback when Hasura is unavailable. */
interface DeviceRecord {
  id: string;
  device_name: string;
  model: string | null;
  manufacturer: string | null;
  is_online: boolean;
  last_seen: string;
  location_city_slug: string | null;
  firmware_version: string | null;
  settings_json: Record<string, unknown>;
  userId: string;
  created_at: string;
}
const deviceRegistry = new Map<string, DeviceRecord>(); // key: deviceId
const userDevices = new Map<string, Set<string>>();       // key: userId → Set<deviceId>

/**
 * Recent heartbeats — updated on every POST /heartbeat call.
 * This is the source of truth for online status and last_seen regardless
 * of whether Hasura is reachable (it often isn't in local dev via Docker URL).
 */
const deviceHeartbeats = new Map<string, { lastSeen: string; firmwareVersion: string | null }>();

function registerDevice(userId: string, deviceId: string, name: string) {
  const now = new Date().toISOString();
  deviceRegistry.set(deviceId, {
    id: deviceId, device_name: name, model: null, manufacturer: null,
    is_online: true, last_seen: now, location_city_slug: null,
    firmware_version: null, settings_json: {}, userId, created_at: now,
  });
  if (!userDevices.has(userId)) userDevices.set(userId, new Set());
  userDevices.get(userId)!.add(deviceId);
}

/** In-memory store for RFC 8628 device auth codes (expires in 10 min). */
const deviceAuthCodes = new Map<string, {
  userCode: string;
  deviceCode: string;
  userId: string | null;
  deviceId: string | null;
  expiresAt: number;
}>();

/** In-memory pairing codes store (expires in 5 min). */
const pairingCodes = new Map<string, {
  code: string;
  userId: string | null;
  deviceId: string | null;
  expiresAt: number;
}>();

/**
 * App-generated pairing codes (reversed flow).
 * App calls POST /app-code → gets 4-digit code → shows it to user.
 * TV enters the code → calls POST /activate → gets JWT.
 */
const appCodes = new Map<string, {
  code: string;
  userId: string;
  deviceId: string | null;
  expiresAt: number;
  activated: boolean;
}>();

async function hasuraQuery(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  // BUG-A9: 10-second timeout on all Hasura calls to prevent hanging requests.
  const signal = AbortSignal.timeout(10_000);
  const response = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  return response.json();
}

function generateTvJwt(userId: string, deviceId: string): string {
  // Simple JWT — in production use proper JWT library
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    'https://hasura.io/jwt/claims': {
      'x-hasura-user-id': userId,
      'x-hasura-default-role': 'user',
    },
    sub: userId,
    device_id: deviceId,
    exp: Math.floor((Date.now() + TV_JWT_TTL_MS) / 1000),
    iat: Math.floor(Date.now() / 1000),
  })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${sig}`;
}

// ── TV2-1.3: POST /api/v1/tv/pair ─────────────────────────────────────────────

tvRouter.post('/pair', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { code, deviceName, deviceModel, androidId } = req.body;

  if (!code || typeof code !== 'string' || code.length !== 6) {
    res.status(400).json({ error: 'code must be a 6-character string' });
    return;
  }

  // Mark the pairing code as claimed by this user
  const entry = pairingCodes.get(code.toUpperCase());
  if (!entry || entry.expiresAt < Date.now()) {
    res.status(400).json({ error: 'Invalid or expired pairing code' });
    return;
  }

  try {
    // Insert TV device record
    const result = await hasuraQuery(
      `mutation PairTvDevice($userId: uuid!, $name: String!, $model: String, $androidId: String, $code: String) {
        insert_pc_tv_devices_one(object: {
          user_id: $userId
          device_name: $name
          device_model: $model
          android_id: $androidId
          pairing_code: $code
          paired_at: "now()"
          is_online: true
        }) { id }
      }`,
      {
        userId,
        name: deviceName || 'My TV',
        model: deviceModel || null,
        androidId: androidId || null,
        code: code.toUpperCase(),
      },
    );

    const deviceId = result?.data?.insert_pc_tv_devices_one?.id;
    if (!deviceId) {
      // Hasura not available in dev — return a synthetic device ID
      const syntheticId = crypto.randomUUID();
      const jwt = generateTvJwt(userId, syntheticId);
      pairingCodes.delete(code.toUpperCase());
      res.json({ deviceId: syntheticId, jwt, paired: true });
      return;
    }

    const jwt = generateTvJwt(userId, deviceId);
    pairingCodes.delete(code.toUpperCase());
    res.json({ deviceId, jwt, paired: true });
  } catch (err) {
    console.error('[TV] Pair error:', err);
    res.status(500).json({ error: 'Pairing failed' });
  }
});

// ── TV2-1.3b: POST /api/v1/tv/code — TV requests a 4-digit pairing code ─────────

tvRouter.post('/code', async (req, res) => {
  // 4-digit numeric: 1000–9999
  const code = (Math.floor(Math.random() * 9000) + 1000).toString();

  pairingCodes.set(code, {
    code,
    userId: null,
    deviceId: null,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  res.json({
    code,
    expiresInSeconds: 300,
    qrData: `praycalc://pair?code=${code}`,
  });
});

// ── TV2-1.4: POST /api/v1/tv/auth/device — RFC 8628 device auth ───────────────

tvRouter.post('/auth/device', async (_req, res) => {
  const deviceCode = crypto.randomBytes(16).toString('hex');
  const userCodeRaw = Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const userCode = `${userCodeRaw.slice(0, 4)}-${userCodeRaw.slice(4)}`;

  deviceAuthCodes.set(deviceCode, {
    userCode,
    deviceCode,
    userId: null,
    deviceId: null,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
  });

  res.json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: 'https://praycalc.com/activate',
    verification_uri_complete: `https://praycalc.com/activate?code=${userCode}`,
    expires_in: 600,
    interval: 5,
  });
});

// ── TV2-1.6: GET /api/v1/tv/auth/poll — Poll for authorization ────────────────

tvRouter.get('/auth/poll', async (req, res) => {
  const { device_code } = req.query as { device_code: string };

  if (!device_code) {
    res.status(400).json({ error: 'device_code required' });
    return;
  }

  const entry = deviceAuthCodes.get(device_code);
  if (!entry) {
    res.status(400).json({ status: 'expired', error: 'Invalid or expired device_code' });
    return;
  }

  if (entry.expiresAt < Date.now()) {
    deviceAuthCodes.delete(device_code);
    res.json({ status: 'expired' });
    return;
  }

  if (!entry.userId) {
    res.json({ status: 'pending' });
    return;
  }

  // Authorized — issue JWT
  const jwt = generateTvJwt(entry.userId, entry.deviceId || 'unknown');
  deviceAuthCodes.delete(device_code);
  res.json({ status: 'authorized', jwt, userId: entry.userId, deviceId: entry.deviceId });
});

// ── TV2-1.6b: POST /api/v1/tv/auth/authorize — Mobile claims a pairing code ───
//   Accepts either:
//   • 4-digit code shown on TV (pairingCodes map)
//   • 8-char RFC 8628 user_code (deviceAuthCodes map)

tvRouter.post('/auth/authorize', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { user_code } = req.body;

  if (!user_code || typeof user_code !== 'string') {
    res.status(400).json({ error: 'user_code required' });
    return;
  }

  const trimmed = user_code.trim();

  // ── Case 1: 4-digit numeric code (pairingCodes) ──────────────────────────────
  if (/^\d{4}$/.test(trimmed)) {
    const entry = pairingCodes.get(trimmed);
    if (!entry || entry.expiresAt < Date.now()) {
      pairingCodes.delete(trimmed);
      res.status(400).json({ error: 'Invalid or expired code. Check the TV screen.' });
      return;
    }
    entry.userId = userId;
    pairingCodes.set(trimmed, entry);
    res.json({ authorized: true });
    return;
  }

  // ── Case 2: RFC 8628 8-char user_code (deviceAuthCodes) ──────────────────────
  const normalizedUpper = trimmed.replace('-', '').toUpperCase();
  let found: { deviceCode: string; entry: typeof deviceAuthCodes extends Map<string, infer V> ? V : never } | null = null;
  for (const [deviceCode, entry] of deviceAuthCodes) {
    if (entry.userCode.replace('-', '') === normalizedUpper) {
      found = { deviceCode, entry };
      break;
    }
  }

  if (!found || found.entry.expiresAt < Date.now()) {
    res.status(400).json({ error: 'Invalid or expired code. Check the TV screen.' });
    return;
  }

  // Insert TV device and link
  let deviceId: string;
  try {
    const result = await hasuraQuery(
      `mutation InsertTvDeviceForOAuth($userId: uuid!) {
        insert_pc_tv_devices_one(object: { user_id: $userId, device_name: "My TV", is_online: false }) { id }
      }`,
      { userId },
    );
    deviceId = result?.data?.insert_pc_tv_devices_one?.id || crypto.randomUUID();
  } catch (err) {
    console.error('[tv/auth] Hasura insert failed during activation; using ephemeral deviceId:', err);
    deviceId = crypto.randomUUID();
  }

  found.entry.userId = userId;
  found.entry.deviceId = deviceId;
  deviceAuthCodes.set(found.deviceCode, found.entry);

  res.json({ authorized: true });
});

// ── TV2-1.7: POST /api/v1/tv/auth/refresh — Refresh TV JWT ───────────────────

tvRouter.post('/auth/refresh', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { device_id } = req.body;

  if (!device_id) {
    res.status(400).json({ error: 'device_id required' });
    return;
  }

  const jwt = generateTvJwt(userId, device_id);
  res.json({ jwt, expiresIn: TV_JWT_TTL_MS / 1000 });
});

// ── TV2-1.6c: GET /api/v1/tv/code/:code/status — TV polls for auth (no auth) ──

tvRouter.get('/code/:code/status', (req, res) => {
  const { code } = req.params;
  if (!code) { res.status(400).json({ error: 'code required' }); return; }

  const entry = pairingCodes.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    pairingCodes.delete(code);
    res.json({ status: 'expired' });
    return;
  }

  if (!entry.userId) {
    res.json({ status: 'pending' });
    return;
  }

  // Authorized — generate JWT and clean up
  const deviceId = entry.deviceId || crypto.randomUUID();
  const jwt = generateTvJwt(entry.userId, deviceId);
  pairingCodes.delete(code);
  res.json({ status: 'authorized', jwt, userId: entry.userId, deviceId });
});

// ── Reversed pairing flow: App generates code, TV enters it ──────────────────
//
//   POST /api/v1/tv/app-code           — authenticated (app/web user)
//   GET  /api/v1/tv/app-code/:c/status — authenticated poll (app waits for TV)
//   POST /api/v1/tv/activate           — unauthenticated (TV submits code, gets JWT)

tvRouter.post('/app-code', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const code = (Math.floor(Math.random() * 9000) + 1000).toString();

  appCodes.set(code, {
    code,
    userId,
    deviceId: null,
    expiresAt: Date.now() + 5 * 60 * 1000,
    activated: false,
  });

  res.json({ code, expiresInSeconds: 300 });
});

tvRouter.get('/app-code/:code/status', requireAuth, (req: AuthRequest, res) => {
  const userId = req.userId!;
  const code = req.params['code'] as string;

  const entry = appCodes.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    appCodes.delete(code);
    res.json({ status: 'expired' });
    return;
  }
  // Reject if code doesn't belong to this user
  if (entry.userId !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (!entry.activated) {
    res.json({ status: 'pending' });
    return;
  }
  const deviceId = entry.deviceId as string;
  appCodes.delete(code);
  res.json({ status: 'activated', deviceId });
});

// SEC-A6: Strict per-IP rate limit on /activate — max 10 req/min/IP to prevent brute-force.
const activateBuckets = new Map<string, { tokens: number; lastRefill: number }>();
function activateRateLimit(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = activateBuckets.get(ip);
  if (!bucket) { bucket = { tokens: 10, lastRefill: now }; activateBuckets.set(ip, bucket); }
  const refill = Math.floor((now - bucket.lastRefill) / 60_000) * 10;
  if (refill > 0) { bucket.tokens = Math.min(10, bucket.tokens + refill); bucket.lastRefill = now; }
  if (bucket.tokens <= 0) { res.status(429).json({ error: 'Too many activation attempts. Try again in 1 minute.' }); return; }
  bucket.tokens--;
  next();
}
setInterval(() => { const cutoff = Date.now() - 300_000; activateBuckets.forEach((b, k) => { if (b.lastRefill < cutoff) activateBuckets.delete(k); }); }, 300_000);

tvRouter.post('/activate', activateRateLimit, async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code || typeof code !== 'string' || !/^\d{4}$/.test(code.trim())) {
    res.status(400).json({ error: 'A 4-digit code is required' });
    return;
  }

  const trimmed = code.trim();
  const entry = appCodes.get(trimmed);
  if (!entry || entry.expiresAt < Date.now()) {
    appCodes.delete(trimmed);
    res.status(400).json({ error: 'Invalid or expired code. Get a new one from the app.' });
    return;
  }
  if (entry.activated) {
    res.status(400).json({ error: 'Code already used.' });
    return;
  }

  const deviceId = crypto.randomUUID();
  const jwt = generateTvJwt(entry.userId, deviceId);

  entry.deviceId = deviceId;
  entry.activated = true;
  appCodes.set(trimmed, entry);

  // Register in-memory so GET /tv lists it immediately (even if Hasura is down).
  registerDevice(entry.userId, deviceId, 'My TV');

  // Persist device to DB (non-blocking — TV gets JWT even if Hasura is down)
  hasuraQuery(
    `mutation InsertTvDevice($userId: uuid!, $deviceId: uuid!) {
      insert_pc_tv_devices_one(object: {
        id: $deviceId, user_id: $userId, device_name: "My TV", is_online: true
      }, on_conflict: { constraint: pc_tv_devices_pkey, update_columns: [is_online] }) { id }
    }`,
    { userId: entry.userId, deviceId },
  ).catch((err: unknown) => { console.warn('[tv/activate] Hasura persist failed (non-critical):', err); });

  res.json({ jwt, deviceId, userId: entry.userId });
});

// ── PC-TV2-3: Guest QR code ───────────────────────────────────────────────────

/** In-memory store for guest prayer-time QR codes (24h expiry). */
const guestCodes = new Map<string, { lat: number; lng: number; expiresAt: number }>();
const GUEST_QR_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * POST /api/v1/tv/guest-qr
 * Body: { lat: number, lng: number }
 * Returns: { url: string, expiresAt: string }
 *
 * Generates a 24h QR code URL that points to the public guest prayer-time page.
 * The TV sends its home coordinates; guests scan the resulting QR to view prayer
 * times for that location without creating an account.
 */
tvRouter.post('/guest-qr', requireAuth, (req: AuthRequest, res) => {
  const { lat, lng } = req.body as { lat?: unknown; lng?: unknown };
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    res.status(400).json({ error: 'lat and lng (numbers) required' });
    return;
  }
  const code = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + GUEST_QR_TTL_MS;
  guestCodes.set(code, { lat, lng, expiresAt });
  res.json({
    code,
    url: `https://praycalc.com/tv/guest/${code}`,
    expiresAt: new Date(expiresAt).toISOString(),
  });
});

/**
 * GET /api/v1/tv/guest/:code
 * Public — called by the web landing page to resolve the guest code to a location.
 * Returns: { lat: number, lng: number } or 404 if expired/not found.
 */
tvRouter.get('/guest/:code', (req, res) => {
  const code = req.params['code'] as string;
  const entry = guestCodes.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    guestCodes.delete(code);
    res.status(404).json({ error: 'Code expired or not found' });
    return;
  }
  res.json({ lat: entry.lat, lng: entry.lng });
});

// ── TV2-3.8: GET /api/v1/tv/streams — Curated stream library ─────────────────

tvRouter.get('/streams', (_req, res) => {
  res.json({
    streams: [
      {
        // Al Quran Al Kareem TV — Saudi state channel broadcast from Mecca/Kaaba.
        // Served on Akamai CDN as HLS — stable, no embedding restrictions.
        id: 'mecca',
        name: 'Mecca — Al Quran Al Kareem TV',
        type: 'video',
        url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
        thumbnail: 'https://praycalc.com/images/streams/mecca.jpg',
        thumbnailEmoji: '🕋',
        category: 'live',
        healthy: true,
      },
      {
        // Makkah TV — alternative HLS stream from Mecca.
        id: 'makkah-tv',
        name: 'Makkah TV — Live',
        type: 'video',
        url: 'https://media2.streambrothers.com:1936/8122/8122/playlist.m3u8',
        thumbnail: 'https://praycalc.com/images/streams/mecca.jpg',
        thumbnailEmoji: '🕌',
        category: 'live',
        healthy: true,
      },
      {
        id: 'medina',
        name: 'Medina — Masjid an-Nabawi',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=2L1LRFnl3As',
        thumbnail: 'https://praycalc.com/images/streams/medina.jpg',
        thumbnailEmoji: '🌿',
        category: 'live',
        healthy: true,
      },
      {
        id: 'aqsa',
        name: 'Al-Aqsa Mosque, Jerusalem',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6FRfPF0SPAI',
        thumbnail: 'https://praycalc.com/images/streams/aqsa.jpg',
        thumbnailEmoji: '🏛️',
        category: 'live',
        healthy: true,
      },
      {
        id: 'mishary-radio',
        name: 'Mishary Rashid — Quran Radio',
        type: 'audio',
        url: 'https://stream.radiojar.com/mishary',
        thumbnail: 'https://praycalc.com/images/streams/mishary.jpg',
        thumbnailEmoji: '🎙️',
        category: 'quran',
        healthy: true,
      },
      {
        id: 'sudais-radio',
        name: 'Abd al-Rahman al-Sudais — Quran Radio',
        type: 'audio',
        url: 'https://stream.radiojar.com/sudais',
        thumbnail: 'https://praycalc.com/images/streams/sudais.jpg',
        thumbnailEmoji: '🎙️',
        category: 'quran',
        healthy: true,
      },
      {
        id: 'islamweb-quran',
        name: 'IslamWeb Quran — 24/7',
        type: 'audio',
        url: 'https://audio.islamweb.net/audio/Alquraan_Radio128K.mp3',
        thumbnail: 'https://praycalc.com/images/streams/islamweb.jpg',
        thumbnailEmoji: '📻',
        category: 'quran',
        healthy: true,
      },
    ],
  });
});

// ── R-1: GET /api/v1/tv — List user's TV devices (owned + shared) ────────────

tvRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    // Fetch owned devices and shared devices in parallel.
    const [ownedResult, sharedResult] = await Promise.all([
      hasuraQuery(
        `query ListUserTvDevices($userId: uuid!) {
          pc_tv_devices(
            where: { user_id: { _eq: $userId } }
            order_by: { created_at: asc }
          ) {
            id
            device_name
            model
            manufacturer
            is_online
            last_seen
            location_city_slug
            firmware_version
            settings_json
          }
        }`,
        { userId },
      ),
      hasuraQuery(
        `query ListSharedTvDevices($userId: uuid!) {
          pc_tv_shares(where: { shared_with_user_id: { _eq: $userId } }) {
            permissions
            pc_tv_device {
              id
              device_name
              model
              manufacturer
              is_online
              last_seen
              location_city_slug
              firmware_version
              settings_json
            }
          }
        }`,
        { userId },
      ),
    ]);

    const ownedDevices: DeviceRecord[] = ownedResult?.data?.pc_tv_devices ?? [];
    const sharedRows: Array<{ permissions: Record<string, boolean>; pc_tv_device: DeviceRecord }> =
      sharedResult?.data?.pc_tv_shares ?? [];

    // Merge with in-memory registry: add any in-memory devices not in Hasura results.
    const ownedIds = new Set(ownedDevices.map((d: DeviceRecord) => d.id));
    const memIds = userDevices.get(userId) ?? new Set<string>();
    const memOnly = [...memIds]
      .filter(id => !ownedIds.has(id))
      .map(id => deviceRegistry.get(id))
      .filter(Boolean) as DeviceRecord[];

    // Overlay live heartbeat data — heartbeat timestamps always override the DB.
    // This ensures TVs that recently sent a heartbeat show as online even when
    // Hasura's last_seen is stale (e.g. Docker URL unreachable in local dev).
    const ONLINE_WINDOW_MS = 3 * 60 * 1000; // 3 minutes — matches web dashboard

    const applyHeartbeat = (d: DeviceRecord) => {
      const hb = deviceHeartbeats.get(d.id);
      if (hb && Date.now() - new Date(hb.lastSeen).getTime() < ONLINE_WINDOW_MS) {
        return { ...d, is_online: true, last_seen: hb.lastSeen };
      }
      return d;
    };

    const ownedWithHb = [...ownedDevices, ...memOnly].map(applyHeartbeat);
    const sharedWithHb = sharedRows
      .filter(row => row.pc_tv_device)
      .map(row => applyHeartbeat(row.pc_tv_device));

    // Strip userId from owned devices; tag all with isShared flag.
    const owned = ownedWithHb.map(({ userId: _u, ...d }) => ({ ...d, isShared: false }));
    const shared = sharedWithHb.map(({ userId: _u, ...d }) => ({ ...d, isShared: true }));

    res.json({ devices: [...owned, ...shared] });
  } catch (err) {
    console.error('[GET /tv] list devices error:', err);
    // Fallback to in-memory only if Hasura is completely unreachable.
    const ONLINE_WINDOW_MS_FB = 3 * 60 * 1000;
    const memIds = userDevices.get(userId) ?? new Set<string>();
    const devices = [...memIds]
      .map(id => deviceRegistry.get(id))
      .filter(Boolean)
      .map(d => {
        const hb = deviceHeartbeats.get(d!.id);
        if (hb && Date.now() - new Date(hb.lastSeen).getTime() < ONLINE_WINDOW_MS_FB) {
          return { ...d!, is_online: true, last_seen: hb.lastSeen };
        }
        return d!;
      })
      .map(({ userId: _u, ...d }) => ({ ...(d as Omit<DeviceRecord, 'userId'>), isShared: false }));
    res.json({ devices });
  }
});

// ── TV2-10.2: POST /api/v1/tv/heartbeat — TV keepalive ───────────────────────

tvRouter.post('/heartbeat', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { device_id, screen_state, firmware_version, location_city, location_country, location_lat, location_lng, location_timezone } = req.body;

  if (!device_id) {
    res.status(400).json({ error: 'device_id required' });
    return;
  }

  const now = new Date().toISOString();

  // Always update in-memory heartbeat cache — this is the live source of truth
  // for online status. Hasura updates are best-effort (Docker URL may be
  // unreachable in local dev).
  deviceHeartbeats.set(device_id, { lastSeen: now, firmwareVersion: firmware_version || null });

  // If TV reports its location, merge into settings_json (only fills gaps —
  // doesn't overwrite location already set from the web dashboard).
  const locationPatch: Record<string, unknown> = {};
  if (location_city) {
    const memDevice = deviceRegistry.get(device_id);
    const existing = memDevice?.settings_json ?? {};
    if (!existing['location_city']) {
      locationPatch['location_city'] = location_city;
      locationPatch['location_country'] = location_country ?? '';
      if (location_lat !== undefined) locationPatch['location_lat'] = location_lat;
      if (location_lng !== undefined) locationPatch['location_lng'] = location_lng;
      if (location_timezone) locationPatch['location_timezone'] = location_timezone;
    }
  }

  // Update device registry if this device is tracked in-memory.
  const memDevice = deviceRegistry.get(device_id);
  if (memDevice) {
    memDevice.is_online = true;
    memDevice.last_seen = now;
    if (firmware_version) memDevice.firmware_version = firmware_version;
    if (Object.keys(locationPatch).length) {
      memDevice.settings_json = { ...memDevice.settings_json, ...locationPatch };
    }
  } else {
    // Server restart wipes in-memory registry. Re-register the device so it
    // shows up in GET /tv even if Hasura is unreachable.
    registerDevice(userId, device_id, 'My TV');
    const restored = deviceRegistry.get(device_id)!;
    if (firmware_version) restored.firmware_version = firmware_version;
    if (Object.keys(locationPatch).length) {
      restored.settings_json = { ...restored.settings_json, ...locationPatch };
    }
  }

  // Persist to Hasura (non-blocking — TV stays online even if this fails).
  hasuraQuery(
    `mutation TvHeartbeat($deviceId: uuid!, $userId: uuid!, $firmware: String) {
      update_pc_tv_devices(
        where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
        _set: { last_seen: "now()", is_online: true, firmware_version: $firmware }
      ) { affected_rows }
    }`,
    { deviceId: device_id, userId, firmware: firmware_version || null },
  ).catch((err: unknown) => { console.warn('[tv/heartbeat] Hasura persist failed (non-critical):', err); });

  // Push live status to any open web dashboard SSE connections for this user.
  tvEventEmitter.emit(`dashboard:${userId}`, {
    type: 'heartbeat',
    deviceId: device_id,
    isOnline: true,
    lastSeen: now,
    screenState: screen_state ?? null,
  });

  res.json({ ok: true, screen_state });
});

// ── TV2-10.3: POST /api/v1/tv/:id/screenshot ─────────────────────────────────

tvRouter.post('/:id/screenshot', requireAuth, async (req: AuthRequest, res) => {
  // Check if MinIO is configured
  const minioConfigured = !!(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_BUCKET
  );
  if (!minioConfigured) {
    return res.status(503).json({ error: 'Photo upload not configured', code: 'MINIO_NOT_CONFIGURED' });
  }
  // Real presigned URL generation comes in MINIO-2.
  // Required env vars: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
  return res.status(501).json({ error: 'Not yet implemented' });
});

// ── MINIO-2: POST /api/v1/tv/:id/photo/upload — Presigned user photo upload URL ──

tvRouter.post('/:id/photo/upload', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params.id as string;

  // Ownership check: device must belong to this user
  const memDevice = deviceRegistry.get(deviceId);
  if (!memDevice || memDevice.userId !== userId) {
    // Fall back to Hasura ownership check
    try {
      const result = await hasuraQuery(
        `query CheckTvDeviceOwnership($deviceId: uuid!, $userId: uuid!) {
          pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) {
            id
          }
        }`,
        { deviceId, userId },
      );
      const devices = result?.data?.pc_tv_devices ?? [];
      if (devices.length === 0) {
        return res.status(403).json({ error: 'Device not found or access denied' });
      }
    } catch (err) {
      console.error("[tv] Hasura ownership check error:", err);
      return res.status(403).json({ error: "Device not found or access denied" });
    }
  }

  const { filename, contentType } = req.body as { filename?: unknown; contentType?: unknown };

  if (!filename || typeof filename !== 'string' || filename.length === 0 || filename.length > 100) {
    return res.status(400).json({ error: 'filename must be a non-empty string (max 100 chars)' });
  }
  if (!contentType || typeof contentType !== 'string' || !contentType.startsWith('image/')) {
    return res.status(400).json({ error: 'contentType must be an image/* MIME type' });
  }

  if (!isMinioConfigured()) {
    return res.status(503).json({ error: 'Photo storage not configured', code: 'MINIO_NOT_CONFIGURED' });
  }

  try {
    const key = photoKey(deviceId, filename);
    const uploadUrl = await createPresignedUploadUrl(key, contentType);
    console.log(`[TV] Generated presigned upload URL for device ${deviceId}`);
    return res.json({ uploadUrl, key, expiresIn: 300 });
  } catch (err) {
    console.error('[TV] Failed to generate presigned upload URL:', err);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// ── MINIO-3: GET /api/v1/tv/:id/photos — List user-uploaded photos w/ presigned download URLs ──

tvRouter.get('/:id/photos', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params.id as string;

  // Ownership check
  const memDevice = deviceRegistry.get(deviceId);
  if (!memDevice || memDevice.userId !== userId) {
    try {
      const result = await hasuraQuery(
        `query CheckTvDeviceOwnership($deviceId: uuid!, $userId: uuid!) {
          pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) {
            id settings_json
          }
        }`,
        { deviceId, userId },
      );
      const devices = result?.data?.pc_tv_devices ?? [];
      if (devices.length === 0) {
        return res.status(403).json({ error: 'Device not found or access denied' });
      }
    } catch (err) {
      console.error("[tv] Hasura ownership check error:", err);
      return res.status(403).json({ error: "Device not found or access denied" });
    }
  }

  if (!isMinioConfigured()) {
    return res.json({ photos: [] });
  }

  // Read user_photo_keys from in-memory settings or Hasura
  let keys: string[] = [];
  if (memDevice?.settings_json?.user_photo_keys) {
    keys = memDevice.settings_json.user_photo_keys as string[];
  } else {
    try {
      const result = await hasuraQuery(
        `query GetTvSettings($deviceId: uuid!) {
          pc_tv_devices_by_pk(id: $deviceId) { settings_json }
        }`,
        { deviceId },
      );
      const storedKeys = result?.data?.pc_tv_devices_by_pk?.settings_json?.user_photo_keys;
      if (Array.isArray(storedKeys)) keys = storedKeys as string[];
    } catch { /* return empty on error */ }
  }

  if (keys.length === 0) {
    return res.json({ photos: [] });
  }

  try {
    const photos = await Promise.all(
      keys.map(async (key) => {
        const { createPresignedDownloadUrl } = await import('../lib/minio.js');
        const downloadUrl = await createPresignedDownloadUrl(key, 3600);
        return { key, downloadUrl };
      }),
    );
    return res.json({ photos });
  } catch (err) {
    console.error('[TV] Failed to generate presigned download URLs:', err);
    return res.status(500).json({ error: 'Failed to generate download URLs' });
  }
});

// ── TV2-10.5: PATCH /api/v1/tv/:id — Rename device ───────────────────────────

tvRouter.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id as string;
  const { device_name } = req.body;

  // SEC-A7: max 100 chars for device_name
  if (!device_name || typeof device_name !== 'string' || device_name.length === 0 || device_name.length > 100) {
    res.status(400).json({ error: 'device_name must be a non-empty string (max 100 chars)' });
    return;
  }

  // Always update in-memory registry immediately — this is the source of truth
  // for GET /tvs and prevents the name from reverting on the next poll.
  const memDevice = deviceRegistry.get(id);
  if (memDevice && memDevice.userId === userId) {
    memDevice.device_name = device_name;
  }

  // Persist to Hasura (non-blocking — in-memory update is immediately visible).
  hasuraQuery(
    `mutation RenameTvDevice($deviceId: uuid!, $userId: uuid!, $name: String!) {
      update_pc_tv_devices(
        where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
        _set: { device_name: $name }
      ) { affected_rows }
    }`,
    { deviceId: id, userId, name: device_name },
  ).catch(err => {
    console.error('[TV] Rename Hasura error (in-memory updated):', err);
  });

  res.json({ ok: true, device_name });
});

// ── DELETE /api/v1/tv/:id — Remove a TV device ───────────────────────────────

tvRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id as string;

  // Remove from in-memory registry
  deviceRegistry.delete(id);
  userDevices.get(userId)?.delete(id);

  try {
    await hasuraQuery(
      `mutation DeleteTvDevice($deviceId: uuid!, $userId: uuid!) {
        delete_pc_tv_devices(
          where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
        ) { affected_rows }
      }`,
      { deviceId: id, userId },
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[TV] Delete error:', err);
    // In-memory already cleaned — return ok so UI removes it
    res.json({ ok: true });
  }
});

// ── SHARE-3: POST /api/v1/tv/:id/share — Share a device with another user ────

tvRouter.post('/:id/share', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params.id as string;
  const { email, permissions } = req.body as {
    email?: unknown;
    permissions?: { view?: boolean; control?: boolean; announce?: boolean };
  };

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address required' });
    return;
  }

  // Verify caller owns the device.
  try {
    const ownerCheck = await hasuraQuery(
      `query CheckTvDeviceOwnerForShare($deviceId: uuid!, $userId: uuid!) {
        pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id }
      }`,
      { deviceId, userId },
    );
    const owned = ownerCheck?.data?.pc_tv_devices ?? [];
    if (owned.length === 0) {
      res.status(403).json({ error: 'Device not found or not owned by you' });
      return;
    }
  } catch (err) {
    console.error('[TV] Share ownership check error:', err);
    res.status(500).json({ error: 'Failed to verify device ownership' });
    return;
  }

  // Look up target user by email.
  let targetUserId: string;
  let targetEmail: string;
  try {
    const userLookup = await hasuraQuery(
      `query LookupUserByEmail($email: String!) {
        umm_user_profiles(where: { email: { _eq: $email } }) { id email }
      }`,
      { email },
    );
    const users = userLookup?.data?.umm_user_profiles ?? [];
    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    targetUserId = users[0].id as string;
    targetEmail = users[0].email as string;
  } catch (err) {
    console.error('[TV] Share user lookup error:', err);
    res.status(500).json({ error: 'Failed to look up user' });
    return;
  }

  // Prevent sharing with yourself.
  if (targetUserId === userId) {
    res.status(400).json({ error: 'Cannot share a device with yourself' });
    return;
  }

  const resolvedPermissions = {
    view: permissions?.view ?? true,
    control: permissions?.control ?? true,
    announce: permissions?.announce ?? false,
  };

  // Insert or update the share record.
  try {
    await hasuraQuery(
      `mutation UpsertTvShare($deviceId: uuid!, $sharedWithUserId: uuid!, $permissions: jsonb!) {
        insert_pc_tv_shares_one(
          object: {
            device_id: $deviceId
            shared_with_user_id: $sharedWithUserId
            permissions: $permissions
          }
          on_conflict: {
            constraint: pc_tv_shares_device_id_shared_with_user_id_key
            update_columns: [permissions]
          }
        ) { device_id shared_with_user_id }
      }`,
      { deviceId, sharedWithUserId: targetUserId, permissions: resolvedPermissions },
    );

    res.json({ success: true, sharedWith: { userId: targetUserId, email: targetEmail } });
  } catch (err) {
    console.error('[TV] Share upsert error:', err);
    res.status(500).json({ error: 'Failed to create share' });
  }
});

// ── SHARE-4: DELETE /api/v1/tv/:id/share/:userId — Remove a share ────────────

tvRouter.delete('/:id/share/:sharedUserId', requireAuth, async (req: AuthRequest, res) => {
  const callerId = req.userId!;
  const deviceId = req.params.id as string;
  const sharedUserId = req.params.sharedUserId as string;

  // Allow if: caller owns the device OR caller is removing their own access.
  const isSelfRemoval = callerId === sharedUserId;

  if (!isSelfRemoval) {
    // Check device ownership.
    try {
      const ownerCheck = await hasuraQuery(
        `query CheckTvDeviceOwnerForUnshare($deviceId: uuid!, $userId: uuid!) {
          pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id }
        }`,
        { deviceId, userId: callerId },
      );
      const owned = ownerCheck?.data?.pc_tv_devices ?? [];
      if (owned.length === 0) {
        res.status(403).json({ error: 'Forbidden: you do not own this device' });
        return;
      }
    } catch (err) {
      console.error('[TV] Unshare ownership check error:', err);
      res.status(500).json({ error: 'Failed to verify device ownership' });
      return;
    }
  }

  // Delete the share record.
  try {
    await hasuraQuery(
      `mutation DeleteTvShare($deviceId: uuid!, $sharedWithUserId: uuid!) {
        delete_pc_tv_shares(
          where: {
            device_id: { _eq: $deviceId }
            shared_with_user_id: { _eq: $sharedWithUserId }
          }
        ) { affected_rows }
      }`,
      { deviceId, sharedWithUserId: sharedUserId },
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[TV] Unshare delete error:', err);
    res.status(500).json({ error: 'Failed to remove share' });
  }
});

// ── TV2-10.7: PATCH /api/v1/tv/:id/settings ─────────────────────────────────

const ALLOWED_SETTINGS_FIELDS = [
  // Legacy snake_case fields
  'city_slug', 'audio_mode', 'layout_preset', 'screensaver_enabled',
  'brightness', 'night_mode_enabled', 'kiosk_mode',
  // Location fields (snake_case — remapped by the web proxy)
  'location_lat', 'location_lng', 'location_city', 'location_country', 'location_state', 'location_timezone',
  // TV camelCase fields (matching TvSettings.fromJson keys used by the Flutter TV app)
  'tvAudioMode', 'selectedStreamId', 'selectedReciterId',
  'videoAreaSource',
  'layout', 'layoutSettings',
  'screensaverPhotoSource', 'screensaverIntervalSeconds', 'screensaverIdleSeconds',
  'screensaverMode', 'photoSource', 'slideshowDurationSeconds',
  'iqamahEnabled', 'iqamahOffsets', 'isMasjidMode', 'masjidName',
  'mediaPauseEnabled',
  'cityOverride',
  'quranVideoMode', 'quranPlaybackMode', 'quranSpecificSurah',
  'contentCycle', 'contentCycleCustomized',
  'kioskMode', 'kioskPinHash',
  'skyBackgroundEnabled', 'geometricPatternEnabled', 'geometricPatternStyle',
  'tvFontScale', 'colorPalette',
  'goodNightEnabled', 'goodNightDelayMinutes',
  'railPosition',
  'showStreamAyahBar', 'showStreamRamadanOverlay',
  'infoBarConfig',
] as const;

/** In-memory settings per device — source of truth for TV polling. */
const deviceSettings = new Map<string, Record<string, unknown>>();

// ── GET /api/v1/tv/:id/settings — TV polls for its latest settings ────────────
// SEC-A1: requireAuth + ownership check — only the owning user may read their TV's settings.

tvRouter.get('/:id/settings', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id as string;

  // Ownership: check in-memory registry first, fall back to Hasura.
  const memDevice = deviceRegistry.get(id);
  const isOwner = memDevice?.userId === userId;

  if (!isOwner) {
    try {
      const result = await hasuraQuery(
        `query CheckTvOwnerOrShare($deviceId: uuid!, $userId: uuid!) {
          owned: pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id }
          shared: pc_tv_shares(where: { device_id: { _eq: $deviceId }, shared_with_user_id: { _eq: $userId } }) { device_id }
        }`,
        { deviceId: id, userId },
      );
      const ownedCount = result?.data?.owned?.length ?? 0;
      const sharedCount = result?.data?.shared?.length ?? 0;
      if (ownedCount === 0 && sharedCount === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } catch (err) {
      console.error("[tv] Hasura access check error:", err);
      return res.status(403).json({ error: "Access denied" });
    }
  }

  const mem = deviceSettings.get(id) ?? {};

  // Try Hasura for persisted settings too
  try {
    const result = await hasuraQuery(
      `query GetTvSettings($deviceId: uuid!) {
        pc_tv_devices_by_pk(id: $deviceId) { settings_json }
      }`,
      { deviceId: id },
    );
    const dbSettings = result?.data?.pc_tv_devices_by_pk?.settings_json ?? {};
    // Merge: in-memory wins (more recent push)
    return res.json({ settings: { ...dbSettings, ...mem } });
  } catch (err) {
    console.warn('[tv/settings] Hasura read failed, serving in-memory settings:', err);
    return res.json({ settings: mem });
  }
});

tvRouter.patch('/:id/settings', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id as string;

  // Extract only the allowed fields from the request body
  const patch: Record<string, unknown> = {};
  for (const field of ALLOWED_SETTINGS_FIELDS) {
    if (field in req.body) {
      patch[field] = (req.body as Record<string, unknown>)[field];
    }
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'No settings provided' });
    return;
  }

  // SEC-A7: Limit string field sizes to prevent oversized payloads.
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === 'string' && value.length > 500) {
      return res.status(400).json({ error: `Field '${key}' must be 500 characters or fewer` });
    }
  }

  // SEC: Synchronous ownership check — must verify before writing to in-memory state.
  // Check in-memory registry first (O(1)), fall back to Hasura if device not registered.
  const regDevice = deviceRegistry.get(id);
  if (!regDevice || regDevice.userId !== userId) {
    try {
      const ownerResult = await hasuraQuery(
        `query GetTvDeviceOwner($deviceId: uuid!, $userId: uuid!) {
          pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id settings_json }
        }`,
        { deviceId: id, userId },
      );
      const owned = ownerResult?.data?.pc_tv_devices ?? [];
      if (owned.length === 0) {
        return res.status(403).json({ error: 'Device not found or access denied' });
      }
    } catch (err) {
      console.error('[tv/settings] Ownership check error:', err);
      return res.status(403).json({ error: 'Device not found or access denied' });
    }
  }

  // Always update in-memory first — TV polling will pick it up immediately.
  // SYNC-B2: Stamp last_modified so the TV app can do conflict resolution.
  const current = deviceSettings.get(id) ?? {};
  const merged = { ...current, ...patch, last_modified: new Date().toISOString() };
  deviceSettings.set(id, merged);

  // Update device registry if device is in memory.
  const memDevice = deviceRegistry.get(id);
  if (memDevice && memDevice.userId === userId) {
    memDevice.settings_json = merged;
  }

  // ── SSE push — TV gets the update instantly without polling ──────────────────
  // tvEventEmitter is declared later in this file but initialized before any
  // request handler runs, so this reference is always valid at call time.
  tvEventEmitter.emit(`settings:${id}`, { settings: merged });

  // Persist to Hasura (non-blocking — in-memory is immediately available).
  hasuraQuery(
    `query GetTvDeviceOwner($deviceId: uuid!, $userId: uuid!) {
      pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id settings_json }
    }`,
    { deviceId: id, userId },
  ).then(checkResult => {
    const devices = checkResult?.data?.pc_tv_devices || [];
    if (devices.length === 0) return;
    const mergedDb = { ...(devices[0].settings_json || {}), ...patch };
    return hasuraQuery(
      `mutation UpdateTvDeviceSettings($deviceId: uuid!, $userId: uuid!, $settings: jsonb!) {
        update_pc_tv_devices(
          where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
          _set: { settings_json: $settings, updated_at: "now()" }
        ) { affected_rows }
      }`,
      { deviceId: id, userId, settings: mergedDb },
    );
  }).catch((err: unknown) => { console.warn('[tv/settings] Hasura persist failed (non-critical):', err); });

  res.json({ ok: true });
});

// SEC-A3: The Quran command handler with full Hasura ownership check is registered
// further below (T-8 section). This duplicate with in-memory-only check was removed.

// ── TV2-10.4: TV Groups ───────────────────────────────────────────────────────

tvRouter.get('/groups', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    const result = await hasuraQuery(
      `query GetTvGroups($userId: uuid!) {
        pc_tv_groups(where: { user_id: { _eq: $userId } }, order_by: { created_at: asc }) {
          id
          name
          created_at
          pc_tv_device_groups { device_id }
        }
      }`,
      { userId },
    );

    const groups = result?.data?.pc_tv_groups || [];
    res.json({ groups });
  } catch (err) {
    console.error('[TV] Groups list error:', err);
    res.status(500).json({ error: 'Failed to list groups' });
  }
});

tvRouter.post('/groups', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name required' });
    return;
  }

  try {
    const result = await hasuraQuery(
      `mutation CreateTvGroup($userId: uuid!, $name: String!) {
        insert_pc_tv_groups_one(object: { user_id: $userId, name: $name }) { id name created_at }
      }`,
      { userId, name },
    );

    const group = result?.data?.insert_pc_tv_groups_one;
    if (!group) {
      res.status(500).json({ error: 'Failed to create group' });
      return;
    }

    res.status(201).json({ group });
  } catch (err) {
    console.error('[TV] Group create error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

tvRouter.patch('/groups/:id/settings', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id as string;
  const { settings_json } = req.body;

  if (!settings_json) {
    res.status(400).json({ error: 'settings_json required' });
    return;
  }

  try {
    // Get all device IDs in this group
    const groupResult = await hasuraQuery(
      `query GetGroupDevices($groupId: uuid!, $userId: uuid!) {
        pc_tv_groups(where: { id: { _eq: $groupId }, user_id: { _eq: $userId } }) {
          pc_tv_device_groups { device_id }
        }
      }`,
      { groupId: id, userId },
    );

    const groups = groupResult?.data?.pc_tv_groups || [];
    if (groups.length === 0) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const deviceIds = groups[0].pc_tv_device_groups.map((d: any) => d.device_id);

    // Batch update all devices
    await hasuraQuery(
      `mutation BatchUpdateTvSettings($deviceIds: [uuid!]!, $settings: jsonb!) {
        update_pc_tv_devices(
          where: { id: { _in: $deviceIds } }
          _set: { settings_json: $settings }
        ) { affected_rows }
      }`,
      { deviceIds, settings: settings_json },
    );

    res.json({ ok: true, updatedCount: deviceIds.length });
  } catch (err) {
    console.error('[TV] Group settings error:', err);
    res.status(500).json({ error: 'Failed to update group settings' });
  }
});

// ── TV2-11.5: POST /api/v1/tv/groups/:id/announce ────────────────────────────
// Send a crawler announcement to all TVs in a masjid group (3+ TVs required).
// The announcement is stored per-device and fetched on the next TV heartbeat.

// In-memory announcement store keyed by device_id.
// In production this would be persisted via Hasura (pc_tv_announcements table).
const pendingAnnouncements = new Map<string, Array<{ id: string; text: string; expiresAt: number }>>();

tvRouter.post('/groups/:id/announce', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const groupId = req.params.id as string;
  const { text, expires_in_minutes = 60 } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  if (text.length > 500) {
    res.status(400).json({ error: 'text must be 500 characters or fewer' });
    return;
  }

  try {
    const groupResult = await hasuraQuery(
      `query GetGroupDevices($groupId: uuid!, $userId: uuid!) {
        pc_tv_groups(where: { id: { _eq: $groupId }, user_id: { _eq: $userId } }) {
          pc_tv_device_groups { device_id }
        }
      }`,
      { groupId, userId },
    );

    const groups = groupResult?.data?.pc_tv_groups || [];
    if (groups.length === 0) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const deviceIds: string[] = groups[0].pc_tv_device_groups.map((d: any) => d.device_id);

    // UX-A10: Removed the 3-TV minimum — groups with even 1 TV can use bulk announcements.
    if (deviceIds.length < 1) {
      res.status(400).json({ error: 'Group has no TVs' });
      return;
    }

    const announcement = {
      id: crypto.randomUUID(),
      text: stripHtml(text),
      expiresAt: Date.now() + expires_in_minutes * 60 * 1000,
    };

    for (const deviceId of deviceIds) {
      const existing = pendingAnnouncements.get(deviceId) ?? [];
      // Cap at 5 pending announcements per device
      const updated = [...existing, announcement].slice(-5);
      pendingAnnouncements.set(deviceId, updated);
    }

    res.json({ ok: true, announcementId: announcement.id, sentTo: deviceIds.length });
  } catch (err) {
    console.error('[TV] Group announce error:', err);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
});

// ── TV2-11.5: GET /api/v1/tv/:id/announcements ───────────────────────────────
// TV polls this to fetch pending announcements (called alongside heartbeat).

tvRouter.get('/:id/announcements', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params['id'] as string;

  // SEC-A2: Verify the requesting user owns (or shares) this device.
  const memDevice = deviceRegistry.get(deviceId);
  const isOwner = memDevice?.userId === userId;

  if (!isOwner) {
    try {
      const result = await hasuraQuery(
        `query CheckTvOwnerOrShare($deviceId: uuid!, $userId: uuid!) {
          owned: pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id }
          shared: pc_tv_shares(where: { device_id: { _eq: $deviceId }, shared_with_user_id: { _eq: $userId } }) { device_id }
        }`,
        { deviceId, userId },
      );
      const ownedCount = result?.data?.owned?.length ?? 0;
      const sharedCount = result?.data?.shared?.length ?? 0;
      if (ownedCount === 0 && sharedCount === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } catch (err) {
      console.error("[tv] Hasura access check error:", err);
      return res.status(403).json({ error: "Access denied" });
    }
  }

  const now = Date.now();
  const all = pendingAnnouncements.get(deviceId) ?? [];
  // Return only non-expired announcements; clear expired ones
  const active = all.filter(a => a.expiresAt > now);
  pendingAnnouncements.set(deviceId, active);

  return res.json({ announcements: active });
});

// ── S-1: GET /api/v1/tv/platform-config ──────────────────────────────────────
// Public endpoint — no auth required. Returns platform-wide defaults that all
// TVs fetch on startup and every 60 minutes. Changing this file + deploying
// updates all TVs within 60 min without a Flutter release.

tvRouter.get('/platform-config', (req, res) => {
  res.json({
    version: '1',
    attributionText: 'PrayCalc · praycalc.com',
    defaultRailPosition: 'top',
    defaultContentCycle: [
      { type: 'artSlideshow', durationSeconds: 30, enabled: true },
      { type: 'ayahOfHour',   durationSeconds: 60, enabled: true },
      { type: 'weather',      durationSeconds: 20, enabled: true },
      { type: 'clock',        durationSeconds: 20, enabled: true },
    ],
    featureFlags: {
      quranPlayerEnabled: true,
      googlePhotosEnabled: false,
      sseEnabled: true,
    },
    minAppVersion: '0.9.7',
    updatedAt: '2026-03-09T00:00:00Z',
  });
});

// ── R-7: Server-Sent Events for real-time settings push ──────────────────────
// GET /api/v1/tv/:id/events — authenticated by device bearer JWT.
// PATCH settings also emits to the SSE channel for instant push.
// TV falls back to 30s polling if SSE disconnects.

const tvEventEmitter = new EventEmitter();
tvEventEmitter.setMaxListeners(200); // support up to 200 concurrent TVs

// ── GET /api/v1/tv/dashboard/stream — real-time device status for web dashboard ──
//
// Authenticated by user bearer JWT. Streams heartbeat + status events for all
// TVs belonging to this user. Web dashboard subscribes once on page load instead
// of polling every 30s.

tvRouter.get('/dashboard/stream', requireAuth, (req: AuthRequest, res) => {
  const userId = req.userId!;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  res.write('event: ping\ndata: {}\n\n');

  const onEvent = (payload: unknown) => {
    res.write(`event: device\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const key = `dashboard:${userId}`;
  tvEventEmitter.on(key, onEvent);

  const keepalive = setInterval(() => res.write('event: ping\ndata: {}\n\n'), 25_000);

  req.on('close', () => {
    clearInterval(keepalive);
    tvEventEmitter.off(key, onEvent);
  });
});

tvRouter.get('/:id/events', requireAuth, (req: AuthRequest, res) => {
  const deviceId = req.params['id'] as string;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial ping so client knows connection is live
  res.write('event: ping\ndata: {}\n\n');

  const onSettings = (payload: unknown) => {
    res.write(`event: settings\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const onQuran = (payload: unknown) => {
    res.write(`event: quran\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const onPrayerComplete = (payload: unknown) => {
    res.write(`event: prayer_complete\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const settingsKey = `settings:${deviceId}`;
  const quranKey = `quran:${deviceId}`;
  const prayerCompleteKey = `prayer_complete:${deviceId}`;

  tvEventEmitter.on(settingsKey, onSettings);
  tvEventEmitter.on(quranKey, onQuran);
  tvEventEmitter.on(prayerCompleteKey, onPrayerComplete);

  // Keepalive ping every 25 seconds to prevent proxy timeouts
  const keepalive = setInterval(() => {
    if (!res.writableEnded) res.write('event: ping\ndata: {}\n\n');
  }, 25_000);

  req.on('close', () => {
    clearInterval(keepalive);
    tvEventEmitter.off(settingsKey, onSettings);
    tvEventEmitter.off(quranKey, onQuran);
    tvEventEmitter.off(prayerCompleteKey, onPrayerComplete);
  });
});

// ── L-5: POST /api/v1/tv/:id/prayer-complete ─────────────────────────────────
// Body: { prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' }
// Marks a prayer as complete for the TV device and broadcasts via SSE to connected clients.
// Emits a 'prayer_complete' SSE event on the existing /:id/events channel.

tvRouter.post('/:id/prayer-complete', requireAuth, async (req: AuthRequest, res) => {
  const deviceId = req.params.id as string;
  const userId = req.userId!;
  const { prayer } = req.body;

  const validPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  if (!prayer || !validPrayers.includes(prayer)) {
    res.status(400).json({ error: `Valid prayer name required. Must be one of: ${validPrayers.join(', ')}` });
    return;
  }

  // Verify device ownership before broadcasting
  try {
    const check = await hasuraQuery(
      `query CheckTvDeviceOwnerForComplete($deviceId: uuid!, $userId: uuid!) {
        pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id }
      }`,
      { deviceId, userId },
    );
    const devices = check?.data?.pc_tv_devices ?? [];
    if (devices.length === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
  } catch (err) {
    // If Hasura is unavailable (dev), allow the broadcast to proceed.
    console.error('[tv/prayer-complete] Hasura check error (proceeding with broadcast):', err);
  }

  const payload = { prayer, completedAt: new Date().toISOString() };
  tvEventEmitter.emit(`prayer_complete:${deviceId}`, payload);

  const listenerCount = tvEventEmitter.listenerCount(`prayer_complete:${deviceId}`);
  res.json({ ok: true, prayer, broadcastTo: listenerCount });
});

// ── T-8: POST /api/v1/tv/:id/quran — Quran playback control ─────────────────
// Authenticated by user bearer JWT. Accepts play/pause/resume/stop and
// surah/reciter selection. Emits SSE event for instant TV response.

tvRouter.post('/:id/quran', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params.id as string;
  const { action, surahNumber, reciterId, verseNumber, backgroundMode } = req.body;

  const validActions = ['play', 'pause', 'resume', 'stop', 'next-verse', 'prev-verse', 'next-surah', 'prev-surah'];
  if (!action || !validActions.includes(action)) {
    res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` });
    return;
  }

  try {
    // Verify ownership
    const check = await hasuraQuery(
      `query CheckOwner($deviceId: uuid!, $userId: uuid!) {
        pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) { id settings }
      }`,
      { deviceId, userId },
    );
    const devices = check?.data?.pc_tv_devices ?? [];
    if (devices.length === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    const command = {
      action,
      surahNumber: surahNumber ?? undefined,
      verseNumber: verseNumber ?? undefined,
      reciterId: reciterId ?? undefined,
      backgroundMode: backgroundMode ?? undefined,
      issuedAt: new Date().toISOString(),
    };

    // Merge quranCommand into settings JSONB
    const currentSettings = devices[0].settings || {};
    await hasuraQuery(
      `mutation UpdateQuranCmd($deviceId: uuid!, $userId: uuid!, $settings: jsonb!) {
        update_pc_tv_devices(
          where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
          _set: { settings: $settings, updated_at: "now()" }
        ) { affected_rows }
      }`,
      { deviceId, userId, settings: { ...currentSettings, quranCommand: command } },
    );

    // Emit SSE for instant push
    tvEventEmitter.emit(`quran:${deviceId}`, command);

    res.json({ ok: true, command });
  } catch (err) {
    console.error('[TV] Quran command error:', err);
    res.status(500).json({ error: 'Failed to send Quran command' });
  }
});
