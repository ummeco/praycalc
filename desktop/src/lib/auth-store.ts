/**
 * Purpose: Persist the Ummat auth session to a dedicated tauri-plugin-store file.
 * Inputs: AuthSession objects to save; none to load/clear.
 * Outputs: Cached + persisted session, mirroring lib/store.ts's settings.json pattern
 *   but kept in its own `auth.json` file so auth state never mingles with prayer settings.
 * Constraints: no `any`; module-level cache like store.ts's `_store`.
 * SPORT: praycalc desktop — account sign-in (auth-store).
 */
import { load } from '@tauri-apps/plugin-store';
import type { AuthSession } from './auth-types';

const AUTH_KEYS = ['accessToken', 'refreshToken', 'expiresAt', 'email', 'displayName'] as const;

let _store: Awaited<ReturnType<typeof load>> | null = null;

async function getAuthStore() {
  if (!_store) _store = await load('auth.json');
  return _store;
}

export async function loadPersistedSession(): Promise<AuthSession | null> {
  const store = await getAuthStore();
  const partial: Partial<AuthSession> = {};
  for (const key of AUTH_KEYS) {
    const val = await store.get<AuthSession[typeof key]>(key);
    if (val !== undefined && val !== null) {
      (partial as Record<string, unknown>)[key] = val;
    }
  }
  if (
    typeof partial.accessToken !== 'string' ||
    typeof partial.refreshToken !== 'string' ||
    typeof partial.expiresAt !== 'number'
  ) {
    return null;
  }
  return {
    accessToken: partial.accessToken,
    refreshToken: partial.refreshToken,
    expiresAt: partial.expiresAt,
    email: partial.email ?? '',
    displayName: partial.displayName ?? '',
  };
}

export async function persistSession(session: AuthSession): Promise<void> {
  const store = await getAuthStore();
  for (const key of AUTH_KEYS) {
    await store.set(key, session[key]);
  }
  await store.save();
}

export async function clearPersistedSession(): Promise<void> {
  const store = await getAuthStore();
  for (const key of AUTH_KEYS) {
    await store.delete(key);
  }
  await store.save();
}
