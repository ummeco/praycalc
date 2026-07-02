import { Router } from 'express';
import { requireAuth, requirePlus, type AuthRequest } from '../middleware/auth.js';

export const devicesRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

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

/** GET /api/v1/devices — List user's smart home devices. */
devicesRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    const result = await hasuraQuery(
      `query GetDevices($userId: uuid!) {
        pc_devices(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
          id
          name
          type
          platform
          metadata
          created_at
          updated_at
        }
      }`,
      { userId },
    );

    const devices = result?.data?.pc_devices || [];
    res.json({ devices });
  } catch (err) {
    console.error('[DEVICES] Failed to list devices:', err);
    res.status(500).json({ error: 'Failed to list devices' });
  }
});

/** POST /api/v1/devices — Register a smart home device. GATE: Ummat+ required (device/token issuance). */
devicesRouter.post('/', requireAuth, requirePlus, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { name, type, platform, metadata } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  if (!type || typeof type !== 'string') {
    res.status(400).json({ error: 'type is required (e.g. "speaker", "display", "hub")' });
    return;
  }

  try {
    const result = await hasuraQuery(
      `mutation InsertDevice($userId: uuid!, $name: String!, $type: String!, $platform: String, $metadata: jsonb) {
        insert_pc_devices_one(object: {
          user_id: $userId
          name: $name
          type: $type
          platform: $platform
          metadata: $metadata
        }) {
          id
          name
          type
          platform
          metadata
          created_at
          updated_at
        }
      }`,
      { userId, name, type, platform: platform || null, metadata: metadata || {} },
    );

    const device = result?.data?.insert_pc_devices_one;
    if (!device) {
      res.status(500).json({ error: 'Failed to register device' });
      return;
    }

    res.status(201).json(device);
  } catch (err) {
    console.error('[DEVICES] Failed to register device:', err);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/** DELETE /api/v1/devices/:id — Remove a smart home device. */
devicesRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const deviceId = req.params.id;

  try {
    const result = await hasuraQuery(
      `mutation DeleteDevice($id: uuid!, $userId: uuid!) {
        delete_pc_devices(where: { id: { _eq: $id }, user_id: { _eq: $userId } }) {
          affected_rows
        }
      }`,
      { id: deviceId, userId },
    );

    const affected = result?.data?.delete_pc_devices?.affected_rows || 0;
    if (affected === 0) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error('[DEVICES] Failed to delete device:', err);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});
