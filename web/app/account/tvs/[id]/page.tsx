'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '../../../../hooks/useSession';
import TvQuranPanel from '../../../../components/tv/TvQuranPanel';
import IqamahTimesEditor from '../../../../components/tv/IqamahTimesEditor';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawDevice {
  id: string;
  device_name: string;
  model: string | null;
  manufacturer: string | null;
  is_online: boolean;
  last_seen: string | null;
  location_city_slug: string | null;
  firmware_version: string | null;
  settings_json: Record<string, unknown> | null;
}

interface TvDevice {
  id: string;
  deviceName: string;
  deviceModel: string;
  isOnline: boolean;
  lastSeen: string;
  locationCitySlug: string;
  locationCity?: string;
  locationCountry?: string;
  locationLat?: number;
  locationLng?: number;
  locationTimezone?: string;
  settingsJson: Record<string, unknown>;
}

function rawToDevice(d: RawDevice): TvDevice {
  const settings = d.settings_json ?? {};
  return {
    id: d.id,
    deviceName: d.device_name,
    deviceModel: [d.manufacturer, d.model].filter(Boolean).join(' ') || 'Android TV',
    isOnline:
      d.is_online &&
      !!d.last_seen &&
      Date.now() - new Date(d.last_seen).getTime() < 3 * 60 * 1000,
    lastSeen: d.last_seen ?? new Date().toISOString(),
    locationCitySlug: d.location_city_slug ?? '',
    locationCity: (settings['location_city'] as string) ?? undefined,
    locationCountry: (settings['location_country'] as string) ?? undefined,
    locationLat: (settings['location_lat'] as number) ?? undefined,
    locationLng: (settings['location_lng'] as number) ?? undefined,
    locationTimezone: (settings['location_timezone'] as string) ?? undefined,
    settingsJson: settings,
  };
}

// ---------------------------------------------------------------------------
// Layout presets
// ---------------------------------------------------------------------------

type LayoutPreset = {
  id: string;
  name: string;
  desc: string;
  isDefault?: boolean;
  // layoutSettings sent to TV (matches TvLayoutSettings.fromJson)
  layoutSettings: Record<string, string | null>;
  diagram: React.ReactNode;
};

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'split-stream',
    name: 'Video + Times',
    desc: 'Live stream on left, prayer times on right',
    isDefault: true,
    layoutSettings: { preset: 'splitStream', leftPanel: 'liveStream', rightPanel: 'prayerTimes', topBar: null, bottomBar: null },
    diagram: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="flex-[2] bg-[#79C24C]/30 rounded-sm" />
        <div className="flex-1 bg-white/10 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'prayer-only',
    name: 'Prayer Only',
    desc: 'Full screen prayer times and Qibla',
    layoutSettings: { preset: 'prayerOnly', leftPanel: null, rightPanel: 'prayerTimes', topBar: null, bottomBar: 'hadithTicker' },
    diagram: (
      <div className="w-full h-full bg-white/10 rounded-sm flex items-center justify-center">
        <div className="w-2/3 h-2/3 bg-[#79C24C]/25 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'split-art',
    name: 'Art + Times',
    desc: 'Islamic art on left, times on right',
    layoutSettings: { preset: 'splitArt', leftPanel: 'artSlideshow', rightPanel: 'prayerTimes', topBar: null, bottomBar: 'hadithTicker' },
    diagram: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="flex-[2] bg-[#C9F27A]/20 rounded-sm" />
        <div className="flex-1 bg-white/10 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'info-rich',
    name: 'Info Rich',
    desc: 'Prayer times, Hijri calendar, weather and more',
    layoutSettings: { preset: 'infoRich', leftPanel: 'prayerTimes', rightPanel: 'weatherFull', topBar: 'announcementCrawler', bottomBar: 'hadithTicker' },
    diagram: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="flex gap-0.5 flex-1">
          <div className="flex-1 bg-white/10 rounded-sm" />
          <div className="flex-1 bg-[#79C24C]/25 rounded-sm" />
        </div>
        <div className="flex gap-0.5 flex-1">
          <div className="flex-1 bg-[#C9F27A]/15 rounded-sm" />
          <div className="flex-1 bg-white/10 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'masjid',
    name: 'Masjid',
    desc: 'Large type for congregation viewing',
    layoutSettings: { preset: 'masjid', leftPanel: null, rightPanel: 'prayerTimes', topBar: null, bottomBar: 'announcementCrawler' },
    diagram: (
      <div className="w-full h-full bg-[#0D2F17] rounded-sm flex flex-col items-center justify-center gap-0.5">
        <div className="w-3/4 h-1.5 bg-[#C9F27A]/60 rounded-full" />
        <div className="w-1/2 h-1 bg-white/20 rounded-full" />
        <div className="w-1/2 h-1 bg-white/20 rounded-full" />
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Stream options (matching smart server stream library)
// ---------------------------------------------------------------------------

const STREAMS = [
  { id: 'mecca', name: 'Mecca — Al Quran Al Kareem TV', emoji: '🕋' },
  { id: 'makkah-tv', name: 'Makkah TV — Live', emoji: '🕌' },
  { id: 'medina', name: 'Medina — Masjid an-Nabawi', emoji: '🌿' },
  { id: 'aqsa', name: 'Al-Aqsa Mosque, Jerusalem', emoji: '🏛️' },
  { id: 'mishary-radio', name: 'Mishary Rashid — Quran Radio', emoji: '🎙️' },
  { id: 'sudais-radio', name: 'Al-Sudais — Quran Radio', emoji: '🎙️' },
  { id: 'islamweb-quran', name: 'IslamWeb Quran — 24/7', emoji: '📻' },
];

type VideoAreaSource = 'live-stream' | 'artwork-cycle' | 'masjid-photos' | 'prayer-only';

// ---------------------------------------------------------------------------
// LocationPicker
// ---------------------------------------------------------------------------

interface LocationResult {
  lat: number;
  lng: number;
  city: string;
  country: string;
  state?: string;
  timezone: string;
  displayName: string;
}

function LocationPicker({
  onSave,
  onCancel,
  current,
}: {
  onSave: (loc: { lat: number; lng: number; city: string; country: string; state?: string; timezone: string }) => void;
  onCancel: () => void;
  current?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveIdx(0);
    if (query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) { setResults([]); return; }
        const data = (await res.json()) as LocationResult[];
        setResults(data.slice(0, 8));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function pick(r: LocationResult) {
    onSave({ lat: r.lat, lng: r.lng, city: r.city, country: r.country, state: r.state, timezone: r.timezone ?? 'UTC' });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results.length > 0) pick(results[activeIdx]); }
    else if (e.key === 'Escape') { onCancel(); }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/50 text-xs">
        {current ? `Current: ${current}` : 'No location — TV will show setup screen until configured.'}
      </p>
      <div className="relative">
        <input
          type="text"
          placeholder="Type city name, e.g. Mecca, Chicago, London…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#060e06] border border-[#79C24C]/50 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#79C24C] transition-colors"
          autoFocus
          autoComplete="off"
        />
        {searching && (
          <div className="absolute right-3 top-3 w-4 h-4 border border-[#79C24C]/40 border-t-[#79C24C] rounded-full animate-spin" />
        )}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#0a1a0a] border border-[#79C24C]/30 rounded-xl shadow-2xl overflow-hidden">
            {results.map((r, i) => (
              <button key={i} type="button"
                onMouseDown={e => { e.preventDefault(); pick(r); }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${i === activeIdx ? 'bg-[#1E5E2F]/60 text-white' : 'text-white/70 hover:bg-[#1E5E2F]/30 hover:text-white'}`}
              >
                <span className="font-medium">{r.city}</span>
                {r.state && r.state !== r.country && <span className="text-white/50">, {r.state}</span>}
                <span className="text-white/40"> · {r.country.toUpperCase()}</span>
                {r.timezone && <span className="text-white/25 text-xs ml-2">{r.timezone}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {!searching && query.length >= 2 && results.length === 0 && (
        <p className="text-white/30 text-xs">No results — try a different spelling or nearby city.</p>
      )}
      <button type="button" onClick={onCancel} className="text-white/35 hover:text-white/60 text-xs self-start mt-1 transition-colors">
        Cancel
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToggleRow
// ---------------------------------------------------------------------------

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-white/80 text-sm">{label}</span>
      <button
        type="button" role="switch" aria-checked={checked ? 'true' : 'false'} title={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? 'bg-[#79C24C]' : 'bg-white/20'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type Tab = 'layout' | 'settings' | 'quran';

export default function TvDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : (params.id?.[0] ?? '');
  const { session, hydrated, isLoggedIn } = useSession();
  const token = session?.tokens?.accessToken ?? '';

  const [device, setDevice] = useState<TvDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // UI state
  const [tab, setTab] = useState<Tab>('settings');
  const [editingLocation, setEditingLocation] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSending, setShareSending] = useState(false);
  const [showTransferTooltip, setShowTransferTooltip] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Layout tab state
  const [layout, setLayout] = useState('split-stream');

  // Settings tab — Video Area
  const [videoAreaSource, setVideoAreaSource] = useState<VideoAreaSource>('live-stream');
  const [selectedStreamId, setSelectedStreamId] = useState('mecca');
  const [streamAudio, setStreamAudio] = useState(false); // false = silent, true = audio on

  // Settings tab — Screensaver
  const [screensaverEnabled, setScreensaverEnabled] = useState(false);
  const [photoSource, setPhotoSource] = useState('built-in');
  const [changeInterval, setChangeInterval] = useState('30');

  // Settings tab — Iqama
  const [iqamahEnabled, setIqamahEnabled] = useState(false);

  // Settings tab — City override
  const [cityOverride, setCityOverride] = useState('');

  // Quran tab — video mode preference
  const [quranVideoMode, setQuranVideoMode] = useState<'keep-video' | 'quran-display'>('keep-video');

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [saveLayoutSuccess, setSaveLayoutSuccess] = useState(false);

  // Load device from list API
  const fetchDevice = useCallback(
    async (accessToken: string) => {
      if (!accessToken) { setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard/tvs', {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        if (!res.ok) { setLoading(false); return; }
        const json = (await res.json()) as { devices: RawDevice[] };
        const raw = (json.devices ?? []).find(d => d.id === id);
        if (!raw) { setNotFound(true); setLoading(false); return; }
        const dev = rawToDevice(raw);
        setDevice(dev);

        // Hydrate form state from device settings
        const s = raw.settings_json ?? {};
        setLayout((s['layout'] as string) ?? 'split-stream');
        setVideoAreaSource((s['videoAreaSource'] as VideoAreaSource) ?? 'live-stream');
        setSelectedStreamId((s['selectedStreamId'] as string) ?? 'mecca');
        setStreamAudio((s['tvAudioMode'] as string) === 'stream');
        setScreensaverEnabled((s['screensaverEnabled'] as boolean) ?? false);
        setPhotoSource((s['screensaverPhotoSource'] as string) ?? 'built-in');
        setChangeInterval(String((s['screensaverIntervalSeconds'] as number) ?? 30));
        setIqamahEnabled((s['iqamahEnabled'] as boolean) ?? false);
        setCityOverride((s['cityOverride'] as string) ?? '');
        setQuranVideoMode((s['quranVideoMode'] as 'keep-video' | 'quran-display') ?? 'keep-video');
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (hydrated && token) void fetchDevice(token);
    else if (hydrated) setLoading(false);
  }, [hydrated, token, fetchDevice]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSaveLocation(loc: { lat: number; lng: number; city: string; country: string; state?: string; timezone: string }) {
    try {
      await fetch(`/api/dashboard/tvs/${id}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLat: loc.lat, locationLng: loc.lng,
          locationCity: loc.city, locationCountry: loc.country,
          locationState: loc.state, locationTimezone: loc.timezone,
        }),
      });
      setDevice(d => d ? { ...d, locationCity: loc.city, locationCountry: loc.country, locationLat: loc.lat, locationLng: loc.lng, locationTimezone: loc.timezone } : d);
    } catch { /* silent */ }
    setEditingLocation(false);
  }

  async function handleSaveLayout() {
    setSavingLayout(true);
    setSaveLayoutSuccess(false);
    const preset = LAYOUT_PRESETS.find(p => p.id === layout) ?? LAYOUT_PRESETS[0];
    try {
      await fetch(`/api/dashboard/tvs/${id}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, layoutSettings: preset.layoutSettings }),
      });
      setSaveLayoutSuccess(true);
      setTimeout(() => setSaveLayoutSuccess(false), 2500);
    } catch {
      showToast('Failed to save layout.');
    } finally {
      setSavingLayout(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    setSaveSuccess(false);
    // tvAudioMode controls whether stream audio plays (stream = audio on, silent = muted).
    // videoAreaSource is the separate control for what's shown in the left panel.
    const tvAudioMode = videoAreaSource === 'live-stream' && streamAudio ? 'stream' : 'silent';
    // Also send layoutSettings so the TV knows to show the left panel for live-stream.
    const layoutSettings = videoAreaSource === 'live-stream'
      ? { preset: 'splitStream', leftPanel: 'liveStream', rightPanel: 'prayerTimes', topBar: null, bottomBar: null }
      : videoAreaSource === 'prayer-only'
      ? { preset: 'prayerOnly', leftPanel: null, rightPanel: 'prayerTimes', topBar: null, bottomBar: 'hadithTicker' }
      : { preset: 'splitArt', leftPanel: 'artSlideshow', rightPanel: 'prayerTimes', topBar: null, bottomBar: 'hadithTicker' };
    try {
      await fetch(`/api/dashboard/tvs/${id}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoAreaSource,
          selectedStreamId,
          tvAudioMode,
          layoutSettings,
          screensaverEnabled,
          screensaverPhotoSource: photoSource,
          screensaverIntervalSeconds: Number(changeInterval),
          iqamahEnabled,
          cityOverride,
          quranVideoMode,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      showToast('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!shareEmail.trim()) return;
    setShareSending(true); setShareError(null);
    try {
      const res = await fetch(`/api/dashboard/tvs/${id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shareEmail.trim() }),
      });
      if (!res.ok) throw new Error('failed');
      setShareEmail('');
      showToast('Invite sent.');
    } catch { setShareError('Sharing not yet available'); }
    finally { setShareSending(false); }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await fetch(`/api/dashboard/tvs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      router.push('/account/tvs');
    } catch {
      showToast('Failed to remove TV. Try again.');
      setRemoving(false);
      setShowRemoveConfirm(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render: loading / not-logged-in / not-found
  // ---------------------------------------------------------------------------

  if (!hydrated || loading) {
    return (
      <main className="account-page account-page--dashboard">
        <div className="w-full max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-48 h-6 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-80 lg:w-96 bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl h-96 animate-pulse" />
            <div className="flex-1 bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl h-96 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    const googleUrl = `${process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'}/signin/provider/google?redirectTo=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/account/tvs/${id}` : `/account/tvs/${id}`)}`;
    return (
      <main className="account-page account-page--dashboard">
        <div className="w-full max-w-6xl px-4 flex flex-col items-center py-24 gap-4 text-white/40">
          <p className="text-lg">Sign in to manage your TVs.</p>
          <a href={googleUrl} className="flex items-center gap-3 px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors border border-[#79C24C]/30">
            Sign in with Google
          </a>
        </div>
      </main>
    );
  }

  if (notFound || !device) {
    return (
      <main className="account-page account-page--dashboard">
        <div className="w-full max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/account/tvs" className="text-white/40 hover:text-white/70 text-sm transition-colors">← My TVs</Link>
          </div>
          <div className="flex flex-col items-center py-24 gap-4 text-white/40">
            <div className="text-6xl">📺</div>
            <p className="text-xl text-white">TV not found</p>
            <p>This device may have been removed or does not belong to your account.</p>
            <Link href="/account/tvs" className="mt-2 text-[#C9F27A]/70 hover:text-[#C9F27A] text-sm underline transition-colors">Back to My TVs</Link>
          </div>
        </div>
      </main>
    );
  }

  const locationLabel = device.locationCity
    ? `${device.locationCity}${device.locationCountry ? ', ' + device.locationCountry : ''}`
    : null;

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <main className="account-page account-page--dashboard">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#0D2F17] border border-[#79C24C]/40 text-white/90 px-4 py-3 rounded-xl shadow-2xl text-sm max-w-xs">
          {toast}
        </div>
      )}

      <div className="w-full max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link href="/account/tvs" className="text-white/40 hover:text-white/70 text-sm transition-colors">← My TVs</Link>
          <span className="text-white/20 text-sm">/</span>
          <h1 className="text-white font-bold text-xl">{device.deviceName}</h1>
          <div className="flex items-center gap-1.5 ml-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${device.isOnline ? 'bg-green-400' : 'bg-white/20'}`} />
            <span className={`text-xs ${device.isOnline ? 'text-green-400' : 'text-white/30'}`}>
              {device.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {device.deviceModel && <span className="text-white/30 text-xs ml-1">{device.deviceModel}</span>}
        </div>

        {/* 2-column layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col gap-4">
            {/* TV preview */}
            <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-4">
              <div className="bg-black/40 rounded-xl aspect-video flex items-center justify-center text-white/20 text-5xl border border-white/5">
                📺
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide">Location</p>
              {editingLocation ? (
                <LocationPicker
                  onSave={loc => void handleSaveLocation(loc)}
                  onCancel={() => setEditingLocation(false)}
                  current={locationLabel ?? undefined}
                />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white/30 text-sm">📍</span>
                    {locationLabel
                      ? <span className="text-white/70 text-sm truncate">{locationLabel}</span>
                      : <span className="text-amber-400/70 text-sm">No location set</span>}
                  </div>
                  <button type="button" onClick={() => setEditingLocation(true)}
                    className="text-[#C9F27A]/60 hover:text-[#C9F27A] text-xs px-2 py-1 rounded-lg border border-[#79C24C]/20 hover:border-[#79C24C]/50 transition-colors whitespace-nowrap flex-shrink-0">
                    {locationLabel ? 'Change' : 'Set location'}
                  </button>
                </div>
              )}
            </div>

            {/* Share & Access */}
            <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-4 flex flex-col gap-4">
              <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide">Share & Access</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1E5E2F] border border-[#79C24C]/30 flex items-center justify-center text-xs text-[#C9F27A] font-bold flex-shrink-0">
                  Y
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">You</p>
                  <p className="text-white/40 text-xs">Owner</p>
                </div>
                <span className="text-amber-400 text-sm" title="Owner">👑</span>
              </div>
              <div>
                <p className="text-white/50 text-xs font-medium mb-2">TV Admins</p>
                <p className="text-white/30 text-xs italic">No one else has access yet</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-white/50 text-xs font-medium">+ Invite</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Email address…"
                    value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && void handleShare()}
                    className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#79C24C]/50 transition-colors"
                  />
                  <button type="button" onClick={() => void handleShare()}
                    disabled={shareSending || !shareEmail.trim()}
                    className="px-3 py-2 bg-[#1E5E2F]/60 hover:bg-[#1E5E2F] text-[#C9F27A] rounded-lg text-xs font-medium transition-colors disabled:opacity-40 whitespace-nowrap">
                    {shareSending ? '…' : 'Send'}
                  </button>
                </div>
                {shareError && <p className="text-red-400 text-xs">{shareError}</p>}
              </div>
              <div className="relative border-t border-white/5 pt-3">
                <button type="button" onClick={() => setShowTransferTooltip(v => !v)}
                  className="text-white/25 hover:text-white/40 text-xs underline transition-colors">
                  Transfer ownership
                </button>
                {showTransferTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[#0D2F17] border border-[#79C24C]/20 rounded-xl text-white/60 text-xs shadow-xl max-w-[200px]">
                    Coming soon — ownership transfer will be available in a future update.
                  </div>
                )}
              </div>
            </div>

            {/* Remove TV */}
            <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-4">
              {showRemoveConfirm ? (
                <div className="flex flex-col gap-3">
                  <p className="text-white/70 text-sm leading-relaxed">
                    This will unlink the TV. The TV app will return to the welcome screen and need to be paired again. Only you have access to this TV.
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowRemoveConfirm(false)}
                      className="flex-1 py-2 text-sm text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button type="button" onClick={() => void handleRemove()} disabled={removing}
                      className="flex-1 py-2 text-sm bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 transition-colors disabled:opacity-40">
                      {removing ? 'Removing…' : 'Remove TV'}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowRemoveConfirm(true)}
                  className="w-full py-2.5 text-sm text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-colors">
                  Remove TV
                </button>
              )}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Tab bar — 3 tabs */}
            <div className="flex gap-1 bg-black/20 border border-white/5 rounded-xl p-1">
              {([
                { key: 'layout', label: 'Layout', icon: '⬜' },
                { key: 'settings', label: 'Settings', icon: '⚙️' },
                { key: 'quran', label: 'Quran', icon: '📖' },
              ] as const).map(t => (
                <button key={t.key} type="button" onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-[#1E5E2F]/60 text-white border border-[#79C24C]/20' : 'text-white/40 hover:text-white/70'}`}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            {/* ── Layout tab ─────────────────────────────────────────────────── */}
            {tab === 'layout' && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide mb-1">Screen Layout</p>
                  <p className="text-white/40 text-xs mb-4">Choose how content is arranged on the TV screen.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {LAYOUT_PRESETS.map(preset => {
                      const selected = layout === preset.id;
                      return (
                        <button key={preset.id} type="button" onClick={() => setLayout(preset.id)}
                          className={`text-left p-3 rounded-xl border transition-all ${selected ? 'border-[#79C24C] bg-[#1E5E2F]/40' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                          <div className="aspect-video w-full mb-2.5 p-1 bg-black/30 rounded-lg overflow-hidden">
                            {preset.diagram}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-white/70'}`}>{preset.name}</span>
                            {preset.isDefault && !selected && (
                              <span className="text-[10px] text-white/30 border border-white/10 rounded px-1">default</span>
                            )}
                          </div>
                          <p className="text-white/40 text-xs mt-0.5 leading-snug">{preset.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button type="button" onClick={() => void handleSaveLayout()} disabled={savingLayout}
                  className="w-full bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl py-3 font-semibold border border-[#79C24C]/30 transition-colors disabled:opacity-50">
                  {savingLayout ? 'Saving…' : saveLayoutSuccess ? 'Layout Saved!' : 'Apply Layout'}
                </button>
              </div>
            )}

            {/* ── Settings tab ───────────────────────────────────────────────── */}
            {tab === 'settings' && (
              <div className="flex flex-col gap-5">
                {/* Video Area */}
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide mb-1">Video Area</p>
                  <p className="text-white/40 text-xs mb-4">What to show in the main content area of the screen.</p>

                  {/* Source picker */}
                  <div className="flex flex-col gap-2 mb-4">
                    {([
                      { id: 'live-stream', label: 'Live Stream', desc: 'Mecca, Medina, Al-Aqsa or Quran radio', icon: '📡' },
                      { id: 'artwork-cycle', label: 'Islamic Art', desc: 'Cycle through curated Islamic artwork', icon: '🖼️' },
                      { id: 'masjid-photos', label: 'Masjid Photos', desc: 'Your photos from Google Photos', icon: '🕌' },
                      { id: 'prayer-only', label: 'Prayer Times Only', desc: 'Clean display, no video or images', icon: '🌙' },
                    ] as { id: VideoAreaSource; label: string; desc: string; icon: string }[]).map(opt => (
                      <button key={opt.id} type="button" onClick={() => setVideoAreaSource(opt.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${videoAreaSource === opt.id ? 'border-[#79C24C] bg-[#1E5E2F]/40' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                        <span className="text-xl flex-shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${videoAreaSource === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                          <p className="text-white/40 text-xs">{opt.desc}</p>
                        </div>
                        {videoAreaSource === opt.id && (
                          <div className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-[#79C24C] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#0D2F17]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Live Stream sub-options */}
                  {videoAreaSource === 'live-stream' && (
                    <div className="flex flex-col gap-3 pl-1 border-l-2 border-[#79C24C]/20 ml-1">
                      <div>
                        <label className="text-white/60 text-xs block mb-1.5">Stream</label>
                        <select title="Stream" value={selectedStreamId} onChange={e => setSelectedStreamId(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none">
                          {STREAMS.map(s => (
                            <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                          ))}
                        </select>
                      </div>
                      <ToggleRow label="Play audio from stream" checked={streamAudio} onChange={setStreamAudio} />
                    </div>
                  )}

                  {/* Artwork Cycle sub-options */}
                  {videoAreaSource === 'artwork-cycle' && (
                    <div className="flex flex-col gap-3 pl-1 border-l-2 border-[#79C24C]/20 ml-1">
                      <div>
                        <label className="text-white/60 text-xs block mb-1.5">Change photo every</label>
                        <select title="Change photo every" value={changeInterval} onChange={e => setChangeInterval(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none">
                          <option value="15">15 seconds</option>
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                          <option value="300">5 minutes</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Masjid Photos sub-options */}
                  {videoAreaSource === 'masjid-photos' && (
                    <div className="flex flex-col gap-3 pl-1 border-l-2 border-[#79C24C]/20 ml-1">
                      <p className="text-white/50 text-xs">
                        Connect your Google Photos album in the TV app to show your own masjid photos.
                      </p>
                      <div>
                        <label className="text-white/60 text-xs block mb-1.5">Change photo every</label>
                        <select title="Change photo every" value={changeInterval} onChange={e => setChangeInterval(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none">
                          <option value="15">15 seconds</option>
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                          <option value="300">5 minutes</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Screensaver */}
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide mb-4">Screensaver</p>
                  <ToggleRow label="Enable screensaver" checked={screensaverEnabled} onChange={setScreensaverEnabled} />
                  {screensaverEnabled && (
                    <div className="mt-4 flex flex-col gap-3 pl-1">
                      <div>
                        <label className="text-white/60 text-xs block mb-1.5">Photo Source</label>
                        <select value={photoSource} onChange={e => setPhotoSource(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none">
                          <option value="built-in">Built-in Islamic Art</option>
                          <option value="google-photos">Google Photos</option>
                          <option value="nasa">NASA APOD</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white/60 text-xs block mb-1.5">Change Interval</label>
                        <select value={changeInterval} onChange={e => setChangeInterval(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none">
                          <option value="15">Every 15 seconds</option>
                          <option value="30">Every 30 seconds</option>
                          <option value="60">Every minute</option>
                          <option value="300">Every 5 minutes</option>
                          <option value="600">Every 10 minutes</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Iqama Times */}
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide mb-4">Iqama Times</p>
                  <ToggleRow label="Show Iqama times on TV" checked={iqamahEnabled} onChange={setIqamahEnabled} />
                  {iqamahEnabled && (
                    <div className="mt-4">
                      <IqamahTimesEditor deviceId={device.id} />
                    </div>
                  )}
                </div>

                {/* City Override */}
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide mb-1">City Display Override</p>
                  <p className="text-white/40 text-xs mb-3">Override the city name shown on screen. Leave blank to use the detected location.</p>
                  <input type="text" placeholder="e.g. East Side Masjid"
                    value={cityOverride} onChange={e => setCityOverride(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#79C24C]/50 transition-colors"
                  />
                </div>

                {/* Save button */}
                <button type="button" onClick={() => void handleSaveSettings()} disabled={saving}
                  className="w-full bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl py-3 font-semibold border border-[#79C24C]/30 transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save Settings'}
                </button>
              </div>
            )}

            {/* ── Quran tab ──────────────────────────────────────────────────── */}
            {tab === 'quran' && (
              <div className="flex flex-col gap-4">
                {/* When Quran plays: video mode choice */}
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <p className="text-[#C9F27A] font-semibold text-xs uppercase tracking-wide mb-1">When Quran Plays</p>
                  <p className="text-white/40 text-xs mb-4">
                    Playing Quran automatically silences any other audio. Choose what shows on screen.
                  </p>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'keep-video', label: 'Keep video running', desc: 'Live stream or artwork stays visible — Quran plays over it silently', icon: '📺' },
                      { id: 'quran-display', label: 'Per-ayat view', desc: 'Screen switches to show Arabic text and translation for each verse as it plays', icon: '📖' },
                    ] as const).map(opt => (
                      <button key={opt.id} type="button" onClick={() => setQuranVideoMode(opt.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${quranVideoMode === opt.id ? 'border-[#79C24C] bg-[#1E5E2F]/40' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                        <span className="text-xl flex-shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${quranVideoMode === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                          <p className="text-white/40 text-xs leading-snug">{opt.desc}</p>
                        </div>
                        {quranVideoMode === opt.id && (
                          <div className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-[#79C24C] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#0D2F17]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => void handleSaveSettings()} disabled={saving}
                    className="mt-4 w-full py-2 text-sm bg-[#1E5E2F]/60 hover:bg-[#1E5E2F] text-[#C9F27A] rounded-xl border border-[#79C24C]/20 transition-colors disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save preference'}
                  </button>
                </div>

                {/* Quran panel */}
                <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-5">
                  <TvQuranPanel deviceId={device.id} isOnline={device.isOnline} quranVideoMode={quranVideoMode} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
