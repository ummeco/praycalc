/**
 * Purpose: Stable per-install device identifier for TV pairing.
 * Inputs: none (reads/writes SecureStore)
 * Outputs: getOrCreateDeviceId() — persisted UUID-ish string, stable across app opens
 * Constraints: Generated once per install; stored in SecureStore (not user PII).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-pairing-device-id
 */

import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'praycalc_device_id';

function generateDeviceId(): string {
  return `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Returns the persisted device ID, creating and storing one on first call. */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;
  const created = generateDeviceId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, created);
  return created;
}
