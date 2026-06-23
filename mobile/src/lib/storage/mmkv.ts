/**
 * Purpose: MMKV storage singleton for fast synchronous key-value storage.
 * Inputs: STORAGE_KEYS constants.
 * Outputs: mmkv instance + typed helpers.
 * Constraints: react-native-mmkv peer dep required; survives cold start.
 */

import { MMKV } from 'react-native-mmkv';

export const mmkv = new MMKV({ id: 'praycalc' });

export function getStoredJson<T>(key: string): T | null {
  const raw = mmkv.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredJson<T>(key: string, value: T): void {
  mmkv.set(key, JSON.stringify(value));
}

export function clearStoredKey(key: string): void {
  mmkv.delete(key);
}
