/**
 * Global test setup — mocks fetch for Hasura and Auth service calls.
 *
 * All tests run without a live Hasura instance. This mock:
 * - Simulates Hasura GraphQL for tables used by the smart service
 * - Returns predictable in-memory data so tests remain deterministic
 * - Passes through non-Hasura/non-Auth URLs (e.g. Apple/Stripe test endpoints)
 */

import { vi, beforeEach } from 'vitest';
import { resetRateLimiter } from '../src/middleware/rate-limit.js';

// Set env vars before app modules are loaded — the auth middleware reads these at module init
process.env.HASURA_GRAPHQL_JWT_SECRET = 'test-secret';
process.env.HASURA_GRAPHQL_URL = 'http://hasura:8080/v1/graphql';
process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'test-admin-secret';
process.env.HASURA_AUTH_URL = 'http://auth:4000';

// In-memory stores simulating Hasura tables
const webhookStore = new Map<string, any>();
const subscriptionStore = new Map<string, any>();
const freeTierStore = new Map<string, number>(); // "identifier:date" => count
const integrationStore = new Map<string, any>();
const deviceStore = new Map<string, any>();
const locationStore = new Map<string, any>();

// Reset stores and rate limiter between tests for isolation
beforeEach(() => {
  webhookStore.clear();
  subscriptionStore.clear();
  freeTierStore.clear();
  integrationStore.clear();
  deviceStore.clear();
  locationStore.clear();
  resetRateLimiter();
});

const HASURA_HOSTS = ['hasura', 'hasura:8080', 'api.ummat.dev', 'api.praycalc.com'];
const AUTH_HOSTS = ['auth', 'auth:4000', 'auth.ummat.dev'];

function isHasuraUrl(url: string): boolean {
  return HASURA_HOSTS.some(h => url.includes(h)) && url.includes('/v1/graphql');
}

function isAuthUrl(url: string): boolean {
  return AUTH_HOSTS.some(h => url.includes(h));
}

function mockHasura(query: string, variables: Record<string, any>): any {
  // ─── Webhook operations ───────────────────────────────────────────────
  if (query.includes('CountWebhooks')) {
    const userId = variables.userId;
    const userWebhooks = [...webhookStore.values()].filter(w => w.user_id === userId && w.active);
    return { data: { pc_webhook_registrations_aggregate: { aggregate: { count: userWebhooks.length } } } };
  }
  if (query.includes('InsertWebhook')) {
    const row = {
      id: variables.id,
      user_id: variables.userId,
      callback_url: variables.callbackUrl,
      lat: variables.lat,
      lng: variables.lng,
      timezone: variables.timezone || 'UTC',
      events: variables.events,
      active: variables.active,
      created_at: new Date().toISOString(),
    };
    webhookStore.set(variables.id, row);
    return { data: { insert_pc_webhook_registrations_one: row } };
  }
  if (query.includes('GetUserWebhooks')) {
    const userId = variables.userId;
    const rows = [...webhookStore.values()].filter(w => w.user_id === userId && w.active);
    return { data: { pc_webhook_registrations: rows } };
  }
  if (query.includes('GetAllActiveWebhooks')) {
    const rows = [...webhookStore.values()].filter(w => w.active);
    return { data: { pc_webhook_registrations: rows } };
  }
  if (query.includes('DeleteWebhook')) {
    const { id, userId } = variables;
    const existing = webhookStore.get(id);
    if (existing && existing.user_id === userId) {
      webhookStore.delete(id);
      return { data: { delete_pc_webhook_registrations: { affected_rows: 1 } } };
    }
    return { data: { delete_pc_webhook_registrations: { affected_rows: 0 } } };
  }

  // ─── Subscription operations ──────────────────────────────────────────
  if (query.includes('GetSubscription') || query.includes('umm_subscriptions_by_pk')) {
    const userId = variables.userId;
    const sub = subscriptionStore.get(userId) || null;
    return { data: { umm_subscriptions_by_pk: sub } };
  }
  if (query.includes('insert_umm_subscriptions_one')) {
    const userId = variables.userId;
    const row = {
      user_id: userId,
      plan: variables.plan,
      status: variables.status,
      stripe_customer_id: variables.stripeCustomerId,
      stripe_subscription_id: variables.stripeSubscriptionId,
      current_period_end: variables.currentPeriodEnd,
    };
    subscriptionStore.set(userId, row);
    return { data: { insert_umm_subscriptions_one: { user_id: userId } } };
  }

  // ─── Free-tier usage ─────────────────────────────────────────────────
  if (query.includes('EnsureFreeTierRow')) {
    const key = `${variables.identifier}:${variables.date}`;
    if (!freeTierStore.has(key)) freeTierStore.set(key, 0);
    return { data: { insert_pc_free_tier_usage_one: { identifier: variables.identifier } } };
  }
  if (query.includes('IncrementFreeTierUsage')) {
    const key = `${variables.identifier}:${variables.date}`;
    const current = freeTierStore.get(key) || 0;
    const newCount = current + 1;
    freeTierStore.set(key, newCount);
    return { data: { update_pc_free_tier_usage_by_pk: { count: newCount } } };
  }

  // ─── Integrations ────────────────────────────────────────────────────
  if (query.includes('GetIntegrations')) {
    const userId = variables.userId;
    const rows = [...integrationStore.values()].filter(i => i.user_id === userId && i.active);
    return { data: { pc_integrations: rows } };
  }
  if (query.includes('insert_pc_integrations_one')) {
    const row = {
      id: variables.id,
      user_id: variables.userId,
      type: variables.type,
      metadata: variables.metadata,
      active: true,
      created_at: new Date().toISOString(),
    };
    integrationStore.set(variables.id, row);
    return { data: { insert_pc_integrations_one: row } };
  }

  // ─── Devices ─────────────────────────────────────────────────────────
  if (query.includes('GetDevices')) {
    const userId = variables.userId;
    const rows = [...deviceStore.values()].filter(d => d.user_id === userId && d.active);
    return { data: { pc_devices: rows } };
  }
  if (query.includes('insert_pc_devices_one')) {
    const row = {
      id: variables.id,
      user_id: variables.userId,
      name: variables.name,
      type: variables.type,
      metadata: variables.metadata,
      active: true,
      created_at: new Date().toISOString(),
    };
    deviceStore.set(variables.id, row);
    return { data: { insert_pc_devices_one: row } };
  }
  if (query.includes('DeleteDevice')) {
    const { id, userId } = variables;
    const existing = deviceStore.get(id);
    if (existing && existing.user_id === userId) {
      deviceStore.delete(id);
      return { data: { delete_pc_devices: { affected_rows: 1 } } };
    }
    return { data: { delete_pc_devices: { affected_rows: 0 } } };
  }

  // ─── User location ───────────────────────────────────────────────────
  if (query.includes('pc_saved_locations')) {
    const userId = variables.userId;
    const loc = locationStore.get(userId);
    // Default test location (New York) for all test users without an explicit location
    const defaultLoc = { lat: 40.7128, lng: -74.006, timezone: 'America/New_York', is_home: true };
    const rows = [loc || defaultLoc];
    return { data: { pc_saved_locations: rows } };
  }

  // ─── Fallback ────────────────────────────────────────────────────────
  return { data: {} };
}

vi.stubGlobal('fetch', async (url: string, options?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : String(url);

  // Mock Hasura GraphQL endpoint
  if (isHasuraUrl(urlStr)) {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const result = mockHasura(body.query || '', body.variables || {});
    return {
      ok: true,
      status: 200,
      json: async () => result,
      text: async () => JSON.stringify(result),
    } as Response;
  }

  // Mock auth service token validation
  if (isAuthUrl(urlStr) && urlStr.includes('/token')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ valid: false }),
      text: async () => '{"valid":false}',
    } as Response;
  }

  // Pass through all other URLs (Stripe, Apple, etc.) as network errors in test
  return {
    ok: false,
    status: 503,
    json: async () => ({ error: 'Test environment — external calls not allowed' }),
    text: async () => 'Test environment',
  } as Response;
});
