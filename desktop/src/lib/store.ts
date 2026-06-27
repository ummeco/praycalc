import { load } from '@tauri-apps/plugin-store';
import { DEFAULT_SETTINGS } from './ipc-types';
import type { Settings } from './ipc-types';

let _store: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!_store) _store = await load('settings.json');
  return _store;
}

export async function loadSettings(): Promise<Settings> {
  const store = await getStore();
  const saved: Partial<Settings> = {};
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    const val = await store.get<Settings[typeof key]>(key);
    if (val !== undefined && val !== null) {
      (saved as Record<string, unknown>)[key] = val;
    }
  }
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const store = await getStore();
  for (const [key, val] of Object.entries(settings)) {
    await store.set(key, val);
  }
}
