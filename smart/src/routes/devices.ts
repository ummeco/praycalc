/**
 * Smart-home device registry — GET/POST/DELETE /api/v1/devices.
 *
 * PURPOSE: manage a user's linked smart-home platform devices (Google Home,
 *   Alexa, Siri Shortcuts, Home Assistant) and issue short-lived pairing
 *   codes for companion devices (watch, desktop) that lack an OAuth flow.
 * SCHEMA: public.pc_smart_home_devices + public.pc_device_pairings, both
 *   defined in smart/migrations/002_smart_home_devices.sql. There is NO
 *   `pc_devices` table — a previous version of this file queried that
 *   nonexistent table (WTH Epic H / H1 fix).
 * CONSTRAINTS: platform is constrained to
 *   ('google' | 'alexa' | 'siri' | 'homeassistant') by a CHECK constraint;
 *   (user_id, platform, device_id) is UNIQUE, so linking the same device_id
 *   twice for a platform is an upsert, not a duplicate row. Token hashes are
 *   never returned to the client.
 */
import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth, requirePlus, type AuthRequest } from '../middleware/auth.js';

export const devicesRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

const VALID_PLATFORMS = ['google', 'alexa', 'siri', 'homeassistant'] as const;
type Platform = (typeof VALID_PLATFORMS)[number];

const VALID_PAIRING_DEVICE_TYPES = ['tv', 'watch', 'desktop'] as const;
type PairingDeviceType = (typeof VALID_PAIRING_DEVICE_TYPES)[number];

const PAIRING_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Execute a Hasura admin query. */
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

/** Generate a short, unambiguous pairing code (excludes 0/O/1/I look-alikes). */
function generatePairingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
}

// ── GET /api/v1/devices — List user's linked smart-home devices ─────────────

devicesRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    const result = await hasuraQuery(
      `query GetSmartHomeDevices($userId: uuid!) {
        pc_smart_home_devices(where: { user_id: { _eq: $userId } }, order_by: { linked_at: desc }) {
          id
          platform
          device_id
          device_name
          status
          linked_at
          updated_at
        }
      }`,
      { userId },
    );

    const devices = result?.data?.pc_smart_home_devices || [];
    res.json({ devices });
  } catch (err) {
    console.error('[DEVICES] Failed to list devices:', err);
    res.status(500).json({ error: 'Failed to list devices' });
  }
});

// ── POST /api/v1/devices — Link a smart-home device. GATE: Ummat+ ───────────
// required (device/token issuance), consistent with the Ummat+ gate on
// smart-home OAuth account linking in oauth.ts.

devicesRouter.post('/', requireAuth, requirePlus, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { platform, device_id, device_name } = req.body;

  if (!platform || typeof platform !== 'string' || !VALID_PLATFORMS.includes(platform as Platform)) {
    res.status(400).json({ error: `platform is required and must be one of: ${VALID_PLATFORMS.join(', ')}` });
    return;
  }

  if (!device_id || typeof device_id !== 'string') {
    res.status(400).json({ error: 'device_id is required' });
    return;
  }

  if (device_name !== undefined && (typeof device_name !== 'string' || device_name.length > 100)) {
    res.status(400).json({ error: 'device_name must be a string under 100 chars' });
    return;
  }

  try {
    const result = await hasuraQuery(
      `mutation UpsertSmartHomeDevice($userId: uuid!, $platform: String!, $deviceId: String!, $deviceName: String) {
        insert_pc_smart_home_devices_one(
          object: {
            user_id: $userId
            platform: $platform
            device_id: $deviceId
            device_name: $deviceName
            status: "linked"
          }
          on_conflict: {
            constraint: pc_smart_home_devices_user_id_platform_device_id_key
            update_columns: [device_name, status, updated_at]
          }
        ) {
          id
          platform
          device_id
          device_name
          status
          linked_at
          updated_at
        }
      }`,
      { userId, platform, deviceId: device_id, deviceName: device_name || null },
    );

    const device = result?.data?.insert_pc_smart_home_devices_one;
    if (!device) {
      res.status(500).json({ error: 'Failed to link device' });
      return;
    }

    res.status(201).json(device);
  } catch (err) {
    console.error('[DEVICES] Failed to link device:', err);
    res.status(500).json({ error: 'Failed to link device' });
  }
});

// ── DELETE /api/v1/devices/:id — Unlink a smart-home device ─────────────────

devicesRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params.id;

  try {
    const result = await hasuraQuery(
      `mutation DeleteSmartHomeDevice($id: uuid!, $userId: uuid!) {
        delete_pc_smart_home_devices(where: { id: { _eq: $id }, user_id: { _eq: $userId } }) {
          affected_rows
        }
      }`,
      { id: deviceId, userId },
    );

    const affected = result?.data?.delete_pc_smart_home_devices?.affected_rows || 0;
    if (affected === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error('[DEVICES] Failed to unlink device:', err);
    res.status(500).json({ error: 'Failed to unlink device' });
  }
});

// ── POST /api/v1/devices/pairings — Companion device requests a code ────────
// Unauthenticated: called by the companion device itself (watch/desktop)
// before it has any user context, mirroring the TV pairing pattern in tv.ts
// but persisted (not in-memory) per pc_device_pairings' intended design.

devicesRouter.post('/pairings', async (req, res) => {
  const { device_id, device_type } = req.body as { device_id?: unknown; device_type?: unknown };

  if (!device_id || typeof device_id !== 'string') {
    res.status(400).json({ error: 'device_id is required' });
    return;
  }

  if (!device_type || typeof device_type !== 'string' || !VALID_PAIRING_DEVICE_TYPES.includes(device_type as PairingDeviceType)) {
    res.status(400).json({ error: `device_type is required and must be one of: ${VALID_PAIRING_DEVICE_TYPES.join(', ')}` });
    return;
  }

  const code = generatePairingCode();
  const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS).toISOString();

  try {
    await hasuraQuery(
      `mutation InsertDevicePairing($code: String!, $deviceId: String!, $deviceType: String!, $expiresAt: timestamptz!) {
        insert_pc_device_pairings_one(object: {
          code: $code
          device_id: $deviceId
          device_type: $deviceType
          expires_at: $expiresAt
        }) { code }
      }`,
      { code, deviceId: device_id, deviceType: device_type, expiresAt },
    );

    res.status(201).json({ code, expiresInSeconds: PAIRING_CODE_TTL_MS / 1000 });
  } catch (err) {
    console.error('[DEVICES] Failed to create pairing code:', err);
    res.status(500).json({ error: 'Failed to create pairing code' });
  }
});

// ── POST /api/v1/devices/pairings/:code/claim — User claims a pairing code ──

devicesRouter.post('/pairings/:code/claim', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const code = ((req.params.code as string) || '').toUpperCase();

  try {
    const lookup = await hasuraQuery(
      `query GetDevicePairing($code: String!) {
        pc_device_pairings(where: { code: { _eq: $code } }) {
          code device_id device_type expires_at used
        }
      }`,
      { code },
    );

    const pairing = lookup?.data?.pc_device_pairings?.[0];
    if (!pairing || pairing.used || new Date(pairing.expires_at) < new Date()) {
      res.status(400).json({ error: 'Invalid or expired pairing code' });
      return;
    }

    await hasuraQuery(
      `mutation ClaimDevicePairing($code: String!, $userId: uuid!) {
        update_pc_device_pairings(
          where: { code: { _eq: $code } }
          _set: { user_id: $userId, used: true }
        ) { affected_rows }
      }`,
      { code, userId },
    );

    res.json({ claimed: true, deviceId: pairing.device_id, deviceType: pairing.device_type });
  } catch (err) {
    console.error('[DEVICES] Failed to claim pairing code:', err);
    res.status(500).json({ error: 'Failed to claim pairing code' });
  }
});

// ── GET /api/v1/devices/pairings/:code — Companion device polls status ──────
// Unauthenticated: the companion device polls with the code it was given.

devicesRouter.get('/pairings/:code', async (req, res) => {
  const code = ((req.params.code as string) || '').toUpperCase();

  try {
    const lookup = await hasuraQuery(
      `query GetDevicePairing($code: String!) {
        pc_device_pairings(where: { code: { _eq: $code } }) {
          user_id device_id device_type expires_at used
        }
      }`,
      { code },
    );

    const pairing = lookup?.data?.pc_device_pairings?.[0];
    if (!pairing || new Date(pairing.expires_at) < new Date()) {
      res.status(404).json({ status: 'expired' });
      return;
    }

    if (!pairing.used || !pairing.user_id) {
      res.json({ status: 'pending' });
      return;
    }

    res.json({ status: 'linked', userId: pairing.user_id, deviceType: pairing.device_type });
  } catch (err) {
    console.error('[DEVICES] Failed to poll pairing code:', err);
    res.status(500).json({ error: 'Failed to poll pairing code' });
  }
});
