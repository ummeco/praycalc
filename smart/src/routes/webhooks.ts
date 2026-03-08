import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const webhookRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

interface WebhookRegistration {
  id: string;
  userId: string;
  callbackUrl: string;
  lat: number;
  lng: number;
  timezone: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

const MAX_WEBHOOKS_PER_USER = 5;

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

/** POST /api/v1/webhooks — Register a webhook callback. */
webhookRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { callbackUrl, lat, lng, timezone, events } = req.body;
  const userId = req.userId!;

  if (!callbackUrl || typeof callbackUrl !== 'string') {
    res.status(400).json({ error: 'callbackUrl is required' });
    return;
  }

  try {
    new URL(callbackUrl);
  } catch {
    res.status(400).json({ error: 'callbackUrl must be a valid URL' });
    return;
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Valid lat (-90..90) and lng (-180..180) required' });
    return;
  }

  const validEvents = ['adhan', 'iqamah'];
  const eventList = Array.isArray(events) ? events.filter((e: string) => validEvents.includes(e)) : ['adhan'];

  // Check existing count
  const countResult = await hasuraQuery(
    `query CountWebhooks($userId: uuid!) {
      pc_webhook_registrations_aggregate(where: { user_id: { _eq: $userId }, active: { _eq: true } }) {
        aggregate { count }
      }
    }`,
    { userId },
  );
  const currentCount = countResult?.data?.pc_webhook_registrations_aggregate?.aggregate?.count || 0;
  if (currentCount >= MAX_WEBHOOKS_PER_USER) {
    res.status(409).json({
      error: 'Maximum webhooks reached',
      message: `Maximum ${MAX_WEBHOOKS_PER_USER} webhooks per user`,
    });
    return;
  }

  const id = crypto.randomUUID();
  const result = await hasuraQuery(
    `mutation InsertWebhook($id: uuid!, $userId: uuid!, $callbackUrl: String!, $lat: float8!, $lng: float8!, $timezone: String!, $events: jsonb!, $active: Boolean!) {
      insert_pc_webhook_registrations_one(object: {
        id: $id
        user_id: $userId
        callback_url: $callbackUrl
        lat: $lat
        lng: $lng
        timezone: $timezone
        events: $events
        active: $active
      }) {
        id user_id callback_url lat lng timezone events active created_at
      }
    }`,
    { id, userId, callbackUrl, lat, lng, timezone: timezone || 'UTC', events: eventList, active: true },
  );

  const row = result?.data?.insert_pc_webhook_registrations_one;
  if (!row) {
    res.status(500).json({ error: 'Failed to create webhook registration' });
    return;
  }

  const registration: WebhookRegistration = {
    id: row.id,
    userId: row.user_id,
    callbackUrl: row.callback_url,
    lat: row.lat,
    lng: row.lng,
    timezone: row.timezone,
    events: row.events,
    active: row.active,
    createdAt: row.created_at,
  };

  res.status(201).json(registration);
});

/** GET /api/v1/webhooks — List user's webhook registrations. */
webhookRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const result = await hasuraQuery(
    `query GetUserWebhooks($userId: uuid!) {
      pc_webhook_registrations(where: { user_id: { _eq: $userId }, active: { _eq: true } }) {
        id user_id callback_url lat lng timezone events active created_at
      }
    }`,
    { userId: req.userId! },
  );

  const rows = result?.data?.pc_webhook_registrations || [];
  const webhooks: WebhookRegistration[] = rows.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    callbackUrl: r.callback_url,
    lat: r.lat,
    lng: r.lng,
    timezone: r.timezone,
    events: r.events,
    active: r.active,
    createdAt: r.created_at,
  }));

  res.json({ webhooks });
});

/** DELETE /api/v1/webhooks/:id — Remove a webhook. */
webhookRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const result = await hasuraQuery(
    `mutation DeleteWebhook($id: uuid!, $userId: uuid!) {
      delete_pc_webhook_registrations(where: { id: { _eq: $id }, user_id: { _eq: $userId } }) {
        affected_rows
      }
    }`,
    { id: req.params.id, userId: req.userId! },
  );

  const affected = result?.data?.delete_pc_webhook_registrations?.affected_rows || 0;
  if (affected === 0) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }

  res.status(204).send();
});

/** Get all active registrations (for cron to fire). Queries Hasura. */
export async function getAllActiveRegistrations(): Promise<WebhookRegistration[]> {
  try {
    const result = await hasuraQuery(
      `query GetAllActiveWebhooks {
        pc_webhook_registrations(where: { active: { _eq: true } }) {
          id user_id callback_url lat lng timezone events active created_at
        }
      }`,
    );

    const rows = result?.data?.pc_webhook_registrations || [];
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      callbackUrl: r.callback_url,
      lat: r.lat,
      lng: r.lng,
      timezone: r.timezone || 'UTC',
      events: r.events,
      active: r.active,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error('[WEBHOOKS] Failed to query active registrations:', err);
    return [];
  }
}
