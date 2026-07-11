/**
 * WMD account-linking dashboard endpoints — GET/DELETE /api/v1/links.
 *
 * PURPOSE: let a signed-in user see which smart-home/voice providers (Google,
 *   Alexa, ...) are linked to their PrayCalc account, and revoke a provider's
 *   access, ahead of the WMD linking UX (WTH Epic H, Wave H2).
 * SCHEMA: public.pc_oauth_tokens (smart/migrations/003_oauth_tokens.sql),
 *   extended with a `provider` column in migrations/012 — populated at
 *   token-issuance time in oauth.ts from the OAuth client_id (e.g.
 *   "google-home-praycalc", "alexa-praycalc").
 * CONSTRAINTS: follows the same requireAuth + Hasura-admin-query conventions
 *   as devices.ts/integrations.ts. Revocation is a hard delete of every token
 *   row (access + refresh) for that user+provider, per the ticket contract —
 *   this is stronger than the soft `revoked` flag used by POST /oauth/revoke,
 *   which targets a single token rather than an entire provider link.
 */
import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const linksRouter = Router();

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

// ── GET /api/v1/links — List linked providers ───────────────────────────────

linksRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    const result = await hasuraQuery(
      `query ListLinkedProviders($userId: uuid!) {
        pc_oauth_tokens(
          where: { user_id: { _eq: $userId }, revoked: { _eq: false }, provider: { _is_null: false } }
          order_by: { created_at: desc }
        ) {
          provider
          created_at
        }
      }`,
      { userId },
    );

    const rows: Array<{ provider: string; created_at: string }> = result?.data?.pc_oauth_tokens || [];

    // Dedupe by provider, keeping the most recent linked_at (rows are already
    // ordered created_at desc, so the first occurrence per provider wins).
    const seen = new Set<string>();
    const links: Array<{ provider: string; linked_at: string }> = [];
    for (const row of rows) {
      if (seen.has(row.provider)) continue;
      seen.add(row.provider);
      links.push({ provider: row.provider, linked_at: row.created_at });
    }

    res.json({ links });
  } catch (err) {
    console.error('[LINKS] Failed to list linked providers:', err);
    res.status(500).json({ error: 'Failed to list linked providers' });
  }
});

// ── DELETE /api/v1/links/:provider — Revoke a linked provider ───────────────

linksRouter.delete('/:provider', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const provider = req.params.provider;

  try {
    const result = await hasuraQuery(
      `mutation DeleteLinkedProviderTokens($userId: uuid!, $provider: String!) {
        delete_pc_oauth_tokens(where: { user_id: { _eq: $userId }, provider: { _eq: $provider } }) {
          affected_rows
        }
      }`,
      { userId, provider },
    );

    const affected = result?.data?.delete_pc_oauth_tokens?.affected_rows || 0;
    if (affected === 0) {
      res.status(404).json({ error: 'Provider not linked' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error('[LINKS] Failed to revoke provider:', err);
    res.status(500).json({ error: 'Failed to revoke provider' });
  }
});
