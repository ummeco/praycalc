'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '../../../../lib/session';

const PRAYERS = [
  { key: 'fajr', name: 'Fajr', arabicName: 'الفجر' },
  { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر' },
  { key: 'asr', name: 'Asr', arabicName: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب' },
  { key: 'isha', name: 'Isha', arabicName: 'العشاء' },
] as const;

type PrayerKey = (typeof PRAYERS)[number]['key'];
type IqamahMode = 'offset' | 'fixed';

interface PrayerIqamah {
  mode: IqamahMode;
  offsetMinutes: number;
  fixedTime: string; // "HH:MM"
}

type IqamahMap = Record<PrayerKey, PrayerIqamah>;

const DEFAULT_IQAMAH: IqamahMap = {
  fajr:    { mode: 'offset', offsetMinutes: 20, fixedTime: '06:00' },
  dhuhr:   { mode: 'offset', offsetMinutes: 15, fixedTime: '13:15' },
  asr:     { mode: 'offset', offsetMinutes: 15, fixedTime: '16:30' },
  maghrib: { mode: 'offset', offsetMinutes: 5,  fixedTime: '19:30' },
  isha:    { mode: 'offset', offsetMinutes: 15, fixedTime: '21:00' },
};

export default function IqamahEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deviceId = searchParams.get('deviceId');

  const [deviceName, setDeviceName] = useState<string>('TV');
  const [iqamah, setIqamah] = useState<IqamahMap>(DEFAULT_IQAMAH);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!deviceId) { setLoading(false); return; }
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { device?: { device_name?: string }; settings?: { iqamah?: IqamahMap } };
      if (data.device?.device_name) setDeviceName(data.device.device_name);
      if (data.settings?.iqamah) {
        setIqamah(prev => ({ ...prev, ...data.settings!.iqamah }));
      }
    } catch {
      // keep defaults
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
    if (!deviceId) return;
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!deviceId) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-24 text-white/40">
        <p className="text-lg">No device selected.</p>
        <Link href="/dashboard/tvs" className="mt-4 inline-block text-[#C9F27A] text-sm hover:underline">
          ← Back to TVs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/tvs" className="text-white/40 hover:text-white/70 text-sm mb-4 inline-flex items-center gap-1">
          ← Paired TVs
        </Link>
        <h1 className="text-3xl font-bold text-white mt-2 mb-1">Iqamah Times</h1>
        <p className="text-white/50">{deviceName}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {PRAYERS.map(p => (
            <div key={p.key} className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {PRAYERS.map(p => {
            const val = iqamah[p.key];
            return (
              <div key={p.key} className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                {/* Prayer name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{p.name}</span>
                    <span className="text-white/40 text-sm font-arabic">{p.arabicName}</span>
                  </div>
                  {/* Mode toggle */}
                  <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                    {(['offset', 'fixed'] as IqamahMode[]).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => update(p.key, 'mode', mode)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          val.mode === mode
                            ? 'bg-[#1E5E2F] text-[#C9F27A]'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {mode === 'offset' ? '+ Offset' : 'Fixed time'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                {val.mode === 'offset' ? (
                  <div className="flex items-center gap-3">
                    <label htmlFor={`offset-${p.key}`} className="text-white/50 text-sm w-36">
                      Minutes after adhan
                    </label>
                    <input
                      id={`offset-${p.key}`}
                      type="number"
                      min={0}
                      max={120}
                      value={val.offsetMinutes}
                      onChange={e => update(p.key, 'offsetMinutes', Math.max(0, Math.min(120, Number(e.target.value))))}
                      className="w-24 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm text-center focus:border-[#79C24C]/50 outline-none"
                    />
                    <span className="text-white/40 text-sm">min</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label htmlFor={`fixed-${p.key}`} className="text-white/50 text-sm w-36">
                      Fixed time
                    </label>
                    <input
                      id={`fixed-${p.key}`}
                      type="time"
                      value={val.fixedTime}
                      onChange={e => update(p.key, 'fixedTime', e.target.value)}
                      className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-[#79C24C]/50 outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 space-y-3">
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {saved && <p className="text-[#C9F27A] text-sm text-center">Saved — applying to TV display...</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full bg-[#79C24C] hover:bg-[#C9F27A] disabled:opacity-40 text-[#0D2F17] font-semibold rounded-2xl py-3.5 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Iqamah Times'}
        </button>
        <p className="text-white/25 text-xs text-center">Changes apply to your TV within 3 seconds</p>
      </div>
    </div>
  );
}
