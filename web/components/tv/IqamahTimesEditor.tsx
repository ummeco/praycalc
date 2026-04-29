'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../../lib/session';

const PRAYERS = [
  { key: 'fajr',    name: 'Fajr',     arabic: 'فجر' },
  { key: 'dhuhr',   name: 'Dhuhr',    arabic: 'ظهر' },
  { key: 'asr',     name: 'Asr',      arabic: 'عصر' },
  { key: 'maghrib', name: 'Maghrib',  arabic: 'مغرب' },
  { key: 'isha',    name: 'Isha',     arabic: 'عشاء' },
  { key: 'jumuah',  name: "Jumu'ah",  arabic: 'جمعة' },
] as const;

type PrayerKey = (typeof PRAYERS)[number]['key'];
type IqamahMode = 'offset' | 'fixed';

interface PrayerIqamah {
  mode: IqamahMode;
  offsetMinutes: number;
  fixedTime: string;
}

type IqamahMap = Record<PrayerKey, PrayerIqamah>;

const DEFAULT_IQAMAH: IqamahMap = {
  fajr:    { mode: 'offset', offsetMinutes: 20, fixedTime: '05:30' },
  dhuhr:   { mode: 'offset', offsetMinutes: 15, fixedTime: '13:00' },
  asr:     { mode: 'offset', offsetMinutes: 15, fixedTime: '16:30' },
  maghrib: { mode: 'offset', offsetMinutes: 5,  fixedTime: '' },
  isha:    { mode: 'offset', offsetMinutes: 20, fixedTime: '20:00' },
  jumuah:  { mode: 'fixed',  offsetMinutes: 30, fixedTime: '13:30' },
};

type Props = {
  deviceId: string;
  onSave?: () => void;
};

export default function IqamahTimesEditor({ deviceId, onSave }: Props) {
  const [iqamah, setIqamah] = useState<IqamahMap>(DEFAULT_IQAMAH);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { settings?: { iqamah?: Partial<IqamahMap> } };
      if (data.settings?.iqamah) {
        setIqamah(prev => ({ ...prev, ...data.settings!.iqamah }));
      }
    } catch {
      // keep defaults on load error
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  function update(prayer: PrayerKey, field: keyof PrayerIqamah, value: string | number) {
    setIqamah(prev => ({
      ...prev,
      [prayer]: { ...prev[prayer], [field]: value },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) { setError('Not signed in'); setSaving(false); return; }
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/settings`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iqamah }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSave?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">
        Iqamah Schedule
      </h3>

      {loading ? (
        <div className="space-y-2">
          {PRAYERS.map(p => (
            <div key={p.key} className="h-14 bg-black/20 border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {PRAYERS.map(p => {
            const val = iqamah[p.key];
            return (
              <div
                key={p.key}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                {/* Prayer name */}
                <div className="w-28 shrink-0">
                  <span className="text-white text-sm font-medium">{p.name}</span>
                  <span className="text-white/40 text-xs ml-1.5">{p.arabic}</span>
                </div>

                {/* Mode toggle */}
                <div className="flex gap-1 bg-white/5 rounded-lg p-0.5 shrink-0">
                  {(['offset', 'fixed'] as IqamahMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => update(p.key, 'mode', mode)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        val.mode === mode
                          ? 'bg-[#1E5E2F] text-[#C9F27A]'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {mode === 'offset' ? 'Offset' : 'Fixed'}
                    </button>
                  ))}
                </div>

                {/* Value input */}
                <div className="flex-1 flex items-center gap-2 justify-end">
                  {val.mode === 'offset' ? (
                    <>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={val.offsetMinutes}
                        onChange={e =>
                          update(
                            p.key,
                            'offsetMinutes',
                            Math.max(0, Math.min(120, Number(e.target.value))),
                          )
                        }
                        className="w-16 bg-black/30 border border-white/10 rounded-xl px-2 py-1.5 text-white text-sm text-center focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                      />
                      <span className="text-white/40 text-xs shrink-0">min</span>
                    </>
                  ) : (
                    <input
                      type="time"
                      value={val.fixedTime}
                      onChange={e => update(p.key, 'fixedTime', e.target.value)}
                      className="bg-black/30 border border-white/10 rounded-xl px-2 py-1.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
      {saved && <p className="text-[#C9F27A] text-xs mt-2 text-center">Iqamah schedule saved — applying to TV...</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className="mt-3 w-full bg-black/20 hover:bg-[#1E5E2F]/40 disabled:opacity-50 text-[#C9F27A] font-semibold rounded-xl py-2.5 transition-colors border border-[#79C24C]/20 text-sm"
      >
        {saving ? 'Saving...' : 'Save Iqamah Schedule'}
      </button>
    </section>
  );
}
