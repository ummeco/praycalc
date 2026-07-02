import { load } from '@tauri-apps/plugin-store';
import { DEFAULT_SETTINGS, METHODS } from './ipc-types';
import type { Settings } from './ipc-types';

// Pre-v1.1.2 builds stored slug-style method values (e.g. 'isna', 'makkah') that
// never reached the API. METHODS now uses pray-calc's real ids, which ARE sent
// as /api/prayers?method= — map legacy slugs across and drop anything unknown
// to '' (PrayCalc default) so an old settings.json can never cause a 400.
const LEGACY_METHOD_MAP: Record<string, string> = {
  // 'isna' was the old stored DEFAULT while the picker was a no-op, so it carries
  // no user intent — everyone with it was actually getting PrayCalc dynamic times.
  // It maps to '' (keep current behavior) rather than 'ISNA' (silent time change).
  isna: '',
  mwl: 'MWL',
  egypt: 'Egypt',
  makkah: 'UAQ',
  karachi: 'Karachi',
  gulf: 'Qatar',
  kuwait: 'Kuwait',
  qatar: 'Qatar',
  singapore: 'MUIS',
  france: 'UOIF',
  turkey: 'DIBT',
  russia: 'SAMR',
  // 'tehran' intentionally unmapped — Tehran/Jafari is not offered (D-P3-19);
  // it falls through to '' (PrayCalc default).
};

/** Normalize a stored method value to a valid METHODS option ('' = PrayCalc default). */
export function normalizeMethod(method: string): string {
  if (METHODS.some((m) => m.value === method)) return method;
  return LEGACY_METHOD_MAP[method] ?? '';
}

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
  const merged = { ...DEFAULT_SETTINGS, ...saved };
  merged.method = normalizeMethod(merged.method);
  return merged;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const store = await getStore();
  for (const [key, val] of Object.entries(settings)) {
    await store.set(key, val);
  }
}
