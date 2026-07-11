/**
 * Global test setup — mocks fetch for Hasura and Auth service calls.
 *
 * All tests run without a live Hasura instance. This mock:
 * - Simulates Hasura GraphQL for tables used by the smart service
 * - Returns predictable in-memory data so tests remain deterministic
 * - Passes through non-Hasura/non-Auth URLs (e.g. Apple/Stripe test endpoints)
 */

import { vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { resetRateLimiter } from '../src/middleware/rate-limit.js';
import { hashToken } from '../src/routes/oauth.js';

// Set env vars before app modules are loaded — the auth middleware reads these at module init
process.env.HASURA_GRAPHQL_JWT_SECRET = 'test-secret';
process.env.HASURA_GRAPHQL_URL = 'http://hasura:8080/v1/graphql';
process.env.HASURA_GRAPHQL_ADMIN_SECRET = 'test-admin-secret';
process.env.HASURA_AUTH_URL = 'http://auth:4000';

// In-memory stores simulating Hasura tables
const webhookStore = new Map<string, any>();
export const subscriptionStore = new Map<string, any>(); // userId => { plan, status, ... }
const freeTierStore = new Map<string, number>(); // "identifier:date" => count
const integrationStore = new Map<string, any>();
// Saved locations (pc_saved_locations) — keyed by userId. Set with
// { latitude, longitude, timezone } to match the real column names selected
// by lib/user-location.ts's GetUserLocation query.
export const locationStore = new Map<string, any>();
// Smart-home device registry (pc_smart_home_devices) — keyed by device row id.
export const smartHomeDeviceStore = new Map<string, any>();
// Device pairing codes (pc_device_pairings) — keyed by uppercased code.
export const devicePairingStore = new Map<string, any>();
// OAuth authorization codes (pc_oauth_codes) — keyed by code.
export const oauthCodeStore = new Map<string, any>();
// OAuth access/refresh tokens (pc_oauth_tokens) — keyed by token_hash.
export const oauthTokenStore = new Map<string, any>();

/** Seed a valid OAuth access token directly (bypasses the full authorize+exchange flow). */
export function seedOAuthAccessToken(rawToken: string, userId: string, provider: string, ttlMs = 60 * 60 * 1000): void {
  oauthTokenStore.set(hashToken(rawToken), {
    user_id: userId,
    token_type: 'access',
    provider,
    revoked: false,
    expires_at: new Date(Date.now() + ttlMs).toISOString(),
    created_at: new Date().toISOString(),
  });
}
// TV device and share stores (used by SHARE-3 / SHARE-4 tests)
export const tvDeviceStore = new Map<string, any>(); // deviceId => { id, user_id }
export const tvShareStore = new Map<string, any>();  // `${deviceId}:${sharedUserId}` => record
export const userProfileStore = new Map<string, any>(); // email => { id, email }

// Reset stores and rate limiter between tests for isolation
beforeEach(() => {
  webhookStore.clear();
  subscriptionStore.clear();
  freeTierStore.clear();
  integrationStore.clear();
  locationStore.clear();
  smartHomeDeviceStore.clear();
  devicePairingStore.clear();
  oauthCodeStore.clear();
  oauthTokenStore.clear();
  tvDeviceStore.clear();
  tvShareStore.clear();
  userProfileStore.clear();
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

  // ─── Smart-home devices (pc_smart_home_devices) ───────────────────────
  if (query.includes('GetSmartHomeDevices')) {
    const userId = variables.userId;
    const rows = [...smartHomeDeviceStore.values()]
      .filter(d => d.user_id === userId)
      .sort((a, b) => (a.linked_at < b.linked_at ? 1 : -1));
    return { data: { pc_smart_home_devices: rows } };
  }
  if (query.includes('UpsertSmartHomeDevice') || query.includes('insert_pc_smart_home_devices_one')) {
    const { userId, platform, deviceId, deviceName } = variables;
    const existingId = [...smartHomeDeviceStore.entries()]
      .find(([, d]) => d.user_id === userId && d.platform === platform && d.device_id === deviceId)?.[0];
    const now = new Date().toISOString();
    const id = existingId || crypto.randomUUID();
    const row = {
      id,
      user_id: userId,
      platform,
      device_id: deviceId,
      device_name: deviceName ?? smartHomeDeviceStore.get(id)?.device_name ?? null,
      status: 'linked',
      linked_at: smartHomeDeviceStore.get(id)?.linked_at ?? now,
      updated_at: now,
    };
    smartHomeDeviceStore.set(id, row);
    return { data: { insert_pc_smart_home_devices_one: row } };
  }
  if (query.includes('DeleteSmartHomeDevice')) {
    const { id, userId } = variables;
    const existing = smartHomeDeviceStore.get(id);
    if (existing && existing.user_id === userId) {
      smartHomeDeviceStore.delete(id);
      return { data: { delete_pc_smart_home_devices: { affected_rows: 1 } } };
    }
    return { data: { delete_pc_smart_home_devices: { affected_rows: 0 } } };
  }

  // ─── Device pairing codes (pc_device_pairings) ────────────────────────
  if (query.includes('InsertDevicePairing')) {
    const { code, deviceId, deviceType, expiresAt } = variables;
    devicePairingStore.set(code, {
      code, device_id: deviceId, device_type: deviceType, expires_at: expiresAt,
      user_id: null, used: false,
    });
    return { data: { insert_pc_device_pairings_one: { code } } };
  }
  if (query.includes('GetDevicePairing')) {
    const pairing = devicePairingStore.get(variables.code);
    return { data: { pc_device_pairings: pairing ? [pairing] : [] } };
  }
  if (query.includes('ClaimDevicePairing')) {
    const { code, userId } = variables;
    const pairing = devicePairingStore.get(code);
    if (pairing) {
      pairing.user_id = userId;
      pairing.used = true;
      devicePairingStore.set(code, pairing);
      return { data: { update_pc_device_pairings: { affected_rows: 1 } } };
    }
    return { data: { update_pc_device_pairings: { affected_rows: 0 } } };
  }

  // ─── OAuth authorization codes (pc_oauth_codes) ───────────────────────
  if (query.includes('InsertOAuthCode')) {
    const { code, userId, clientId, codeChallenge, expiresAt } = variables;
    oauthCodeStore.set(code, { user_id: userId, client_id: clientId, code_challenge: codeChallenge, expires_at: expiresAt });
    return { data: { insert_pc_oauth_codes_one: { code } } };
  }
  if (query.includes('GetOAuthCode') || query.includes('pc_oauth_codes_by_pk')) {
    const found = oauthCodeStore.get(variables.code);
    return { data: { pc_oauth_codes_by_pk: found ?? null } };
  }
  if (query.includes('DeleteOAuthCode')) {
    oauthCodeStore.delete(variables.code);
    return { data: { delete_pc_oauth_codes_by_pk: { code: variables.code } } };
  }

  // ─── OAuth access/refresh tokens (pc_oauth_tokens) ────────────────────
  if (query.includes('InsertOAuthTokens')) {
    const objects = (variables.objects as any[]) || [];
    for (const obj of objects) {
      oauthTokenStore.set(obj.token_hash, {
        user_id: obj.user_id,
        token_type: obj.token_type,
        provider: obj.provider ?? null,
        expires_at: obj.expires_at,
        revoked: false,
        created_at: new Date().toISOString(),
      });
    }
    return { data: { insert_pc_oauth_tokens: { affected_rows: objects.length } } };
  }
  if (query.includes('InsertOAuthToken')) {
    const { tokenHash, userId, provider, expiresAt } = variables;
    oauthTokenStore.set(tokenHash, {
      user_id: userId, token_type: 'access', provider: provider ?? null,
      expires_at: expiresAt, revoked: false, created_at: new Date().toISOString(),
    });
    return { data: { insert_pc_oauth_tokens_one: { token_hash: tokenHash } } };
  }
  // NOTE: check RevokeOAuthToken (mutation) BEFORE GetOAuthToken (query) —
  // "update_pc_oauth_tokens_by_pk" contains "pc_oauth_tokens_by_pk" as a
  // substring, so the looser read-only check would otherwise shadow the
  // revoke mutation and silently no-op it.
  if (query.includes('RevokeOAuthToken')) {
    const found = oauthTokenStore.get(variables.tokenHash);
    if (found) { found.revoked = true; oauthTokenStore.set(variables.tokenHash, found); }
    return { data: { update_pc_oauth_tokens_by_pk: found ? { token_hash: variables.tokenHash } : null } };
  }
  if (query.includes('GetOAuthToken') || query.includes('pc_oauth_tokens_by_pk')) {
    const found = oauthTokenStore.get(variables.tokenHash);
    return { data: { pc_oauth_tokens_by_pk: found ?? null } };
  }
  if (query.includes('ListLinkedProviders')) {
    const userId = variables.userId;
    const rows = [...oauthTokenStore.values()]
      .filter(t => t.user_id === userId && !t.revoked && t.provider)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map(t => ({ provider: t.provider, created_at: t.created_at }));
    return { data: { pc_oauth_tokens: rows } };
  }
  if (query.includes('DeleteLinkedProviderTokens')) {
    const { userId, provider } = variables;
    let affected = 0;
    for (const [hash, t] of oauthTokenStore.entries()) {
      if (t.user_id === userId && t.provider === provider) { oauthTokenStore.delete(hash); affected++; }
    }
    return { data: { delete_pc_oauth_tokens: { affected_rows: affected } } };
  }

  // ─── User location ───────────────────────────────────────────────────
  if (query.includes('pc_saved_locations')) {
    const userId = variables.userId;
    const loc = locationStore.get(userId);
    // Mirrors real Hasura semantics: no seeded row => no rows (getUserLocation
    // then returns null, and the caller falls back to NO_LOCATION_SPEECH).
    // Keys must match the real column names (latitude/longitude) selected by
    // lib/user-location.ts's GetUserLocation query — previously this used
    // lat/lng, which getUserLocation() never reads, so any linked-account
    // test hit NaN coordinates silently (dead code path; no existing test
    // resolved a userId before reaching this branch).
    return { data: { pc_saved_locations: loc ? [loc] : [] } };
  }

  // ─── TV devices (ownership checks for settings, share/unshare) ──────
  if (
    query.includes('CheckTvDeviceOwnership') ||
    query.includes('CheckTvDeviceOwnerForShare') ||
    query.includes('CheckTvDeviceOwnerForUnshare') ||
    query.includes('CheckTvDeviceOwnerForComplete') ||
    query.includes('GetTvDeviceOwner')
  ) {
    const { deviceId, userId } = variables;
    const device = tvDeviceStore.get(deviceId);
    const rows = device && device.user_id === userId
      ? [{ id: deviceId, settings_json: device.settings_json ?? {} }]
      : [];
    return { data: { pc_tv_devices: rows } };
  }

  // ─── User profile lookup by email (for sharing) ───────────────────────
  if (query.includes('LookupUserByEmail')) {
    const profile = userProfileStore.get(variables.email);
    const rows = profile ? [profile] : [];
    return { data: { umm_user_profiles: rows } };
  }

  // ─── TV share upsert ──────────────────────────────────────────────────
  if (query.includes('UpsertTvShare') || query.includes('insert_pc_tv_shares_one')) {
    const { deviceId, sharedWithUserId, permissions } = variables;
    const key = `${deviceId}:${sharedWithUserId}`;
    tvShareStore.set(key, { device_id: deviceId, shared_with_user_id: sharedWithUserId, permissions });
    return { data: { insert_pc_tv_shares_one: { device_id: deviceId, shared_with_user_id: sharedWithUserId } } };
  }

  // ─── TV share delete ──────────────────────────────────────────────────
  if (query.includes('DeleteTvShare') || query.includes('delete_pc_tv_shares')) {
    const { deviceId, sharedWithUserId } = variables;
    const key = `${deviceId}:${sharedWithUserId}`;
    const existed = tvShareStore.has(key);
    tvShareStore.delete(key);
    return { data: { delete_pc_tv_shares: { affected_rows: existed ? 1 : 0 } } };
  }

  // ─── TV shares list (used by GET /api/v1/tv) ─────────────────────────
  if (query.includes('pc_tv_shares')) {
    const userId = variables.userId;
    const rows = [...tvShareStore.values()].filter(s => s.shared_with_user_id === userId);
    return { data: { pc_tv_shares: rows } };
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
