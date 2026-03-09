/**
 * Prayer agenda routes.
 *
 * Endpoints:
 *   GET  /api/v1/agendas          — List user's agendas (auth required)
 *   POST /api/v1/agendas          — Create agenda (auth required)
 *   GET  /api/v1/agendas/:id      — Get agenda (owner or public)
 *   PATCH /api/v1/agendas/:id     — Update agenda (owner only)
 *   DELETE /api/v1/agendas/:id    — Delete agenda (owner only)
 *   GET  /api/v1/agendas/share/:slug — Public share page data (no auth)
 */

import crypto from 'crypto';
import { Router } from 'express';
import { requireAuth, optionalAuth, type AuthRequest } from '../middleware/auth.js';

export const agendasRouter = Router();

const HASURA_URL = process.env.HASURA_GRAPHQL_URL || 'http://hasura:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

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

function generateSlug(): string {
  return crypto.randomBytes(6).toString('base64url');
}

// ── GET /api/v1/agendas — List user's agendas ─────────────────────────────────

agendasRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const result = await hasuraQuery(`
    query ListAgendas($userId: uuid!) {
      pc_agendas(
        where: { user_id: { _eq: $userId } }
        order_by: { updated_at: desc }
      ) {
        id title description slug is_public lat lng timezone
        items_json created_at updated_at
      }
    }
  `, { userId: req.userId });

  if (result.errors) {
    res.status(500).json({ error: 'Failed to fetch agendas' });
    return;
  }
  res.json({ agendas: result.data?.pc_agendas ?? [] });
});

// ── POST /api/v1/agendas — Create agenda ──────────────────────────────────────

agendasRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, description, items_json, lat, lng, timezone, is_public } = req.body as {
    title?: string;
    description?: string;
    items_json?: unknown[];
    lat?: number;
    lng?: number;
    timezone?: string;
    is_public?: boolean;
  };

  if (!title?.trim()) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const slug = is_public ? generateSlug() : null;

  const result = await hasuraQuery(`
    mutation CreateAgenda(
      $userId: uuid!, $title: String!, $description: String,
      $slug: String, $items: jsonb!, $lat: float8, $lng: float8,
      $tz: String!, $public: Boolean!
    ) {
      insert_pc_agendas_one(object: {
        user_id: $userId, title: $title, description: $description,
        slug: $slug, items_json: $items, lat: $lat, lng: $lng,
        timezone: $tz, is_public: $public
      }) {
        id title description slug is_public lat lng timezone
        items_json created_at updated_at
      }
    }
  `, {
    userId: req.userId,
    title: title.trim(),
    description: description ?? null,
    slug,
    items: items_json ?? [],
    lat: lat ?? null,
    lng: lng ?? null,
    tz: timezone ?? 'UTC',
    public: is_public ?? false,
  });

  if (result.errors) {
    res.status(500).json({ error: 'Failed to create agenda' });
    return;
  }
  res.status(201).json(result.data?.insert_pc_agendas_one);
});

// ── GET /api/v1/agendas/:id — Get agenda (owner or public) ───────────────────

agendasRouter.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };

  const result = await hasuraQuery(`
    query GetAgenda($id: uuid!) {
      pc_agendas_by_pk(id: $id) {
        id title description slug is_public lat lng timezone
        items_json user_id created_at updated_at
      }
    }
  `, { id });

  const agenda = result.data?.pc_agendas_by_pk;
  if (!agenda) {
    res.status(404).json({ error: 'Agenda not found' });
    return;
  }
  // Private agendas: only owner can view
  if (!agenda.is_public && agenda.user_id !== req.userId) {
    res.status(404).json({ error: 'Agenda not found' });
    return;
  }
  res.json(agenda);
});

// ── PATCH /api/v1/agendas/:id — Update agenda (owner only) ───────────────────

agendasRouter.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };

  // Verify ownership first
  const check = await hasuraQuery(`
    query CheckOwner($id: uuid!) { pc_agendas_by_pk(id: $id) { user_id is_public } }
  `, { id });
  const existing = check.data?.pc_agendas_by_pk;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  if (existing.user_id !== req.userId) { res.status(403).json({ error: 'Forbidden' }); return; }

  const { title, description, items_json, lat, lng, timezone, is_public } = req.body as Record<string, unknown>;

  // Generate slug if publishing for the first time
  const slug = is_public === true && !existing.is_public ? generateSlug() : undefined;

  const set: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) set.title = (title as string).trim();
  if (description !== undefined) set.description = description;
  if (items_json !== undefined) set.items_json = items_json;
  if (lat !== undefined) set.lat = lat;
  if (lng !== undefined) set.lng = lng;
  if (timezone !== undefined) set.timezone = timezone;
  if (is_public !== undefined) set.is_public = is_public;
  if (slug !== undefined) set.slug = slug;

  const result = await hasuraQuery(`
    mutation UpdateAgenda($id: uuid!, $set: pc_agendas_set_input!) {
      update_pc_agendas_by_pk(pk_columns: { id: $id }, _set: $set) {
        id title description slug is_public lat lng timezone
        items_json updated_at
      }
    }
  `, { id, set });

  if (result.errors) { res.status(500).json({ error: 'Update failed' }); return; }
  res.json(result.data?.update_pc_agendas_by_pk);
});

// ── DELETE /api/v1/agendas/:id — Delete agenda (owner only) ──────────────────

agendasRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };

  const check = await hasuraQuery(`
    query CheckOwner($id: uuid!) { pc_agendas_by_pk(id: $id) { user_id } }
  `, { id });
  const existing = check.data?.pc_agendas_by_pk;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  if (existing.user_id !== req.userId) { res.status(403).json({ error: 'Forbidden' }); return; }

  await hasuraQuery(`
    mutation DeleteAgenda($id: uuid!) { delete_pc_agendas_by_pk(id: $id) { id } }
  `, { id });

  res.status(204).send();
});

// ── GET /api/v1/agendas/share/:slug — Public share page data ─────────────────

agendasRouter.get('/share/:slug', async (req, res) => {
  const { slug } = req.params as { slug: string };

  const result = await hasuraQuery(`
    query GetBySlug($slug: String!) {
      pc_agendas(where: { slug: { _eq: $slug }, is_public: { _eq: true } }, limit: 1) {
        id title description lat lng timezone items_json updated_at
      }
    }
  `, { slug });

  const list = result.data?.pc_agendas ?? [];
  if (list.length === 0) {
    res.status(404).json({ error: 'Agenda not found or not public' });
    return;
  }
  res.json(list[0]);
});
