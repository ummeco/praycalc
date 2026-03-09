/**
 * TV-specific API routes for PrayCalc TV Command Center.
 *
 * Endpoints:
 *   POST /api/v1/tv/pair              — Validate 6-char code, link device (TV2-1.3)
 *   POST /api/v1/tv/auth/device       — RFC 8628: get device_code + user_code (TV2-1.4)
 *   GET  /api/v1/tv/auth/poll         — Poll for authorization status (TV2-1.6)
 *   POST /api/v1/tv/auth/refresh      — Refresh 30-day TV JWT (TV2-1.7)
 *   GET  /api/v1/tv/streams           — Curated stream library (TV2-3.8)
 *   POST /api/v1/tv/heartbeat         — TV keepalive, updates last_seen (TV2-10.2)
 *   POST /api/v1/tv/:id/screenshot    — Request screenshot upload (TV2-10.3)
 *   PATCH /api/v1/tv/:id              — Rename device (TV2-10.5)
 *   PATCH /api/v1/tv/:id/settings     — Push settings_json to device (TV2-10.7)
 *   GET  /api/v1/tv/groups            — List TV groups for user (TV2-10.4)
 *   POST /api/v1/tv/groups            — Create TV group (TV2-10.4)
 *   PATCH /api/v1/tv/groups/:id/settings — Push settings to all TVs in group
 */

import crypto from 'crypto';
import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const tvRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';
const JWT_SECRET = process.env.HASURA_GRAPHQL_JWT_SECRET || 'tv-secret';
const TV_JWT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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

// ── TV2-1.3b: POST /api/v1/tv/code — TV requests a pairing code ───────────────

tvRouter.post('/code', async (req, res) => {
  const { deviceModel, androidId } = req.body;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  pairingCodes.set(code, {
    code,
    userId: null,
    deviceId: null,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  res.json({
    code,
    expiresInSeconds: 300,
    qrData: `praycalc://pair?code=${code}&model=${encodeURIComponent(deviceModel || '')}&androidId=${androidId || ''}`,
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

// ── TV2-1.6b: POST /api/v1/tv/auth/authorize — Called by web /activate page ───

tvRouter.post('/auth/authorize', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { user_code } = req.body;

  if (!user_code || typeof user_code !== 'string') {
    res.status(400).json({ error: 'user_code required' });
    return;
  }

  const normalized = user_code.replace('-', '').toUpperCase();

  // Find matching entry by user_code
  let found: { deviceCode: string; entry: typeof deviceAuthCodes extends Map<string, infer V> ? V : never } | null = null;
  for (const [deviceCode, entry] of deviceAuthCodes) {
    if (entry.userCode.replace('-', '') === normalized) {
      found = { deviceCode, entry };
      break;
    }
  }

  if (!found || found.entry.expiresAt < Date.now()) {
    res.status(400).json({ error: 'Invalid or expired user code' });
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
  } catch {
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

// ── TV2-3.8: GET /api/v1/tv/streams — Curated stream library ─────────────────

tvRouter.get('/streams', (_req, res) => {
  res.json({
    streams: [
      {
        id: 'mecca',
        name: 'Mecca — Masjid al-Haram',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XfrItTSiJAE',
        embed: 'https://www.youtube-nocookie.com/embed/XfrItTSiJAE?autoplay=1&mute=0',
        thumbnail: 'https://praycalc.com/images/streams/mecca.jpg',
        healthy: true,
      },
      {
        id: 'medina',
        name: 'Medina — Masjid an-Nabawi',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=2L1LRFnl3As',
        embed: 'https://www.youtube-nocookie.com/embed/2L1LRFnl3As?autoplay=1&mute=0',
        thumbnail: 'https://praycalc.com/images/streams/medina.jpg',
        healthy: true,
      },
      {
        id: 'aqsa',
        name: 'Al-Aqsa Mosque, Jerusalem',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6FRfPF0SPAI',
        embed: 'https://www.youtube-nocookie.com/embed/6FRfPF0SPAI?autoplay=1&mute=0',
        thumbnail: 'https://praycalc.com/images/streams/aqsa.jpg',
        healthy: true,
      },
      {
        id: 'mishary-radio',
        name: 'Mishary Rashid — Quran Radio',
        type: 'audio',
        url: 'https://stream.radiojar.com/mishary',
        thumbnail: 'https://praycalc.com/images/streams/mishary.jpg',
        healthy: true,
      },
      {
        id: 'sudais-radio',
        name: 'Abd al-Rahman al-Sudais — Quran Radio',
        type: 'audio',
        url: 'https://stream.radiojar.com/sudais',
        thumbnail: 'https://praycalc.com/images/streams/sudais.jpg',
        healthy: true,
      },
      {
        id: 'islamweb-quran',
        name: 'IslamWeb Quran — 24/7',
        type: 'audio',
        url: 'https://audio.islamweb.net/audio/Alquraan_Radio128K.mp3',
        thumbnail: 'https://praycalc.com/images/streams/islamweb.jpg',
        healthy: true,
      },
    ],
  });
});

// ── TV2-10.2: POST /api/v1/tv/heartbeat — TV keepalive ───────────────────────

tvRouter.post('/heartbeat', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { device_id, screen_state, firmware_version } = req.body;

  if (!device_id) {
    res.status(400).json({ error: 'device_id required' });
    return;
  }

  try {
    await hasuraQuery(
      `mutation TvHeartbeat($deviceId: uuid!, $userId: uuid!, $firmware: String) {
        update_pc_tv_devices(
          where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
          _set: { last_seen: "now()", is_online: true, firmware_version: $firmware }
        ) { affected_rows }
      }`,
      { deviceId: device_id, userId, firmware: firmware_version || null },
    );
  } catch {
    // Silently fail — TV continues operation even if heartbeat can't persist
  }

  res.json({ ok: true, screen_state });
});

// ── TV2-10.3: POST /api/v1/tv/:id/screenshot ─────────────────────────────────

tvRouter.post('/:id/screenshot', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  // In production: notify the TV via WebSocket/MQTT to take a screenshot and upload to MinIO.
  // The TV uploads to praycalc-tv-screenshots/{device_id}/{timestamp}.png in MinIO.
  // Here we return a signed URL for the TV to upload to.
  const screenshotUrl = `https://storage.praycalc.com/praycalc-tv-screenshots/${id}/latest.png`;
  const signedUploadUrl = `https://storage.praycalc.com/praycalc-tv-screenshots/${id}/latest.png?upload_token=placeholder`;

  res.json({
    screenshotUrl,
    signedUploadUrl,
    expiresIn: 300, // 5 min
    requestedAt: new Date().toISOString(),
  });
});

// ── TV2-10.5: PATCH /api/v1/tv/:id — Rename device ───────────────────────────

tvRouter.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { device_name } = req.body;

  if (!device_name || typeof device_name !== 'string' || device_name.length > 50) {
    res.status(400).json({ error: 'device_name must be a non-empty string (max 50 chars)' });
    return;
  }

  try {
    const result = await hasuraQuery(
      `mutation RenameTvDevice($deviceId: uuid!, $userId: uuid!, $name: String!) {
        update_pc_tv_devices(
          where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
          _set: { device_name: $name }
        ) { affected_rows }
      }`,
      { deviceId: id, userId, name: device_name },
    );

    const affected = result?.data?.update_pc_tv_devices?.affected_rows;
    if (affected === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json({ ok: true, device_name });
  } catch (err) {
    console.error('[TV] Rename error:', err);
    res.status(500).json({ error: 'Failed to rename device' });
  }
});

// ── TV2-10.7: PATCH /api/v1/tv/:id/settings ─────────────────────────────────

const ALLOWED_SETTINGS_FIELDS = [
  'city_slug',
  'audio_mode',
  'layout_preset',
  'screensaver_enabled',
  'brightness',
  'night_mode_enabled',
  'kiosk_mode',
] as const;

tvRouter.patch('/:id/settings', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  // Extract only the allowed fields from the request body
  const patch: Record<string, unknown> = {};
  for (const field of ALLOWED_SETTINGS_FIELDS) {
    if (field in req.body) {
      patch[field] = req.body[field];
    }
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'No settings provided' });
    return;
  }

  try {
    // First verify the device belongs to this user
    const checkResult = await hasuraQuery(
      `query CheckTvDeviceOwner($deviceId: uuid!, $userId: uuid!) {
        pc_tv_devices(where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }) {
          id
          settings
        }
      }`,
      { deviceId: id, userId },
    );

    const devices = checkResult?.data?.pc_tv_devices || [];
    if (devices.length === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    // Merge patch into existing settings via JSONB merge (|| operator)
    const currentSettings = devices[0].settings || {};
    const mergedSettings = { ...currentSettings, ...patch };

    const result = await hasuraQuery(
      `mutation UpdateTvDeviceSettings($deviceId: uuid!, $userId: uuid!, $settings: jsonb!) {
        update_pc_tv_devices(
          where: { id: { _eq: $deviceId }, user_id: { _eq: $userId } }
          _set: { settings: $settings, updated_at: "now()" }
        ) { affected_rows }
      }`,
      { deviceId: id, userId, settings: mergedSettings },
    );

    const affected = result?.data?.update_pc_tv_devices?.affected_rows;
    if (affected === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[TV] Settings update error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

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
  const { id } = req.params;
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
  const { id: groupId } = req.params;
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

    if (deviceIds.length < 3) {
      res.status(400).json({ error: 'Bulk announcements require at least 3 TVs in the group' });
      return;
    }

    const announcement = {
      id: crypto.randomUUID(),
      text: text.trim(),
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
  const { id: deviceId } = req.params;
  const now = Date.now();

  const all = pendingAnnouncements.get(deviceId) ?? [];
  // Return only non-expired announcements; clear expired ones
  const active = all.filter(a => a.expiresAt > now);
  pendingAnnouncements.set(deviceId, active);

  res.json({ announcements: active });
});
