import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const integrationsRouter = Router();

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

/** GET /api/v1/integrations — List user's connected integrations (Google, Alexa). */
integrationsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    const result = await hasuraQuery(
      `query GetIntegrations($userId: uuid!) {
        pc_integrations(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
          id
          type
          metadata
          created_at
          updated_at
        }
      }`,
      { userId },
    );

    const integrations = result?.data?.pc_integrations || [];
    res.json({ integrations });
  } catch (err) {
    console.error('[INTEGRATIONS] Failed to list integrations:', err);
    res.status(500).json({ error: 'Failed to list integrations' });
  }
});

/** POST /api/v1/integrations — Connect a new integration. */
integrationsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { type, metadata } = req.body;

  if (!type || typeof type !== 'string') {
    res.status(400).json({ error: 'type is required (e.g. "google", "alexa")' });
    return;
  }

  const validTypes = ['google', 'alexa'];
  if (!validTypes.includes(type.toLowerCase())) {
    res.status(400).json({ error: `Invalid integration type. Supported: ${validTypes.join(', ')}` });
    return;
  }

  try {
    const result = await hasuraQuery(
      `mutation UpsertIntegration($userId: uuid!, $type: String!, $metadata: jsonb) {
        insert_pc_integrations_one(
          object: {
            user_id: $userId
            type: $type
            metadata: $metadata
          }
          on_conflict: {
            constraint: pc_integrations_user_id_type_key
            update_columns: [metadata, updated_at]
          }
        ) {
          id
          type
          metadata
          created_at
          updated_at
        }
      }`,
      { userId, type: type.toLowerCase(), metadata: metadata || {} },
    );

    const integration = result?.data?.insert_pc_integrations_one;
    if (!integration) {
      res.status(500).json({ error: 'Failed to create integration' });
      return;
    }

    res.status(201).json(integration);
  } catch (err) {
    console.error('[INTEGRATIONS] Failed to create integration:', err);
    res.status(500).json({ error: 'Failed to create integration' });
  }
});
