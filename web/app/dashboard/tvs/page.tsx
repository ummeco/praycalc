'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import TvSettingsPanel, { type TvDevice } from '../../../components/tv/TvSettingsPanel';
import TvScreenshotModal from '../../../components/tv/TvScreenshotModal';
import ShareTvModal from '../../../components/tv/ShareTvModal';
import { useSession } from '../../../hooks/useSession';

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
  isShared?: boolean;
}

interface TvDeviceExtended extends TvDevice {
  locationCity?: string;
  locationCountry?: string;
  locationLat?: number;
  locationLng?: number;
  locationTimezone?: string;
  isShared?: boolean;
}

function rawToDevice(d: RawDevice): TvDeviceExtended {
  const settings = d.settings_json ?? {};
  return {
    id: d.id,
    deviceName: d.device_name,
    deviceModel: [d.manufacturer, d.model].filter(Boolean).join(' ') || 'Android TV',
    // Consider online only if last_seen within 3 minutes (heartbeat window)
    isOnline: d.is_online && !!d.last_seen &&
      (Date.now() - new Date(d.last_seen).getTime()) < 3 * 60 * 1000,
    lastSeen: d.last_seen ?? new Date().toISOString(),
    currentDisplay: (settings['currentDisplay'] as string) ?? 'home',
    locationCitySlug: d.location_city_slug ?? '',
    locationCity: (settings['location_city'] as string) ?? undefined,
    locationCountry: (settings['location_country'] as string) ?? undefined,
    locationLat: (settings['location_lat'] as number) ?? undefined,
    locationLng: (settings['location_lng'] as number) ?? undefined,
    locationTimezone: (settings['location_timezone'] as string) ?? undefined,
    isShared: d.isShared ?? false,
  };
}

// ---------------------------------------------------------------------------
// Add TV Modal
// ---------------------------------------------------------------------------

type ModalState = 'idle' | 'loading' | 'showing' | 'activated' | 'error';

function AddTvModal({ onClose, onPaired, token }: { onClose: () => void; onPaired: () => void; token: string }) {
  const t = useTranslations('tv');
  const [state, setState] = useState<ModalState>('loading');
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(300);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = useRef<() => void>(() => {});

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function requestCode() {
      if (!token) {
        if (!cancelled) { setState('error'); setErrorMsg(t('mustBeSignedIn')); }
        return;
      }

      try {
        const res = await fetch('/api/tv/app-code', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await res.json() as { code?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !json.code) {
          setState('error');
          setErrorMsg(json.error ?? 'Failed to generate code. Try again.');
          return;
        }

        const newCode = json.code;
        setCode(newCode);
        setRemaining(300);
        setState('showing');

        // Countdown
        const cRef = setInterval(() => {
          setRemaining(r => {
            if (r <= 1) {
              clearInterval(cRef);
              pollRef.current && clearInterval(pollRef.current);
              setState('error');
              setErrorMsg('Code expired. Click below to try again.');
              return 0;
            }
            return r - 1;
          });
        }, 1000);
        countdownRef.current = cRef;

        // Poll for TV activation
        const pRef = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/tv/app-code/${newCode}/status`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: 'no-store',
            });
            const statusJson = await statusRes.json() as { status?: string };
            if (statusJson.status === 'activated') {
              clearInterval(pRef);
              clearInterval(cRef);
              setState('activated');
              setTimeout(onPaired, 2000);
            } else if (statusJson.status === 'expired') {
              clearInterval(pRef);
              clearInterval(cRef);
              setState('error');
              setErrorMsg('Code expired. Click below to try again.');
            }
          } catch {
            // network hiccup — keep polling
          }
        }, 3000);
        pollRef.current = pRef;
      } catch {
        if (!cancelled) { setState('error'); setErrorMsg('Could not reach the server. Check your connection.'); }
      }
    }
    retryRef.current = () => { clearTimers(); void requestCode(); };
    void requestCode();
    return () => { cancelled = true; clearTimers(); };
  }, [onPaired, token, t, clearTimers]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D2F17] border border-[#79C24C]/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">{t('addTv')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 border-2 border-[#79C24C]/40 border-t-[#79C24C] rounded-full animate-spin" />
            <p className="text-white/50 text-sm">{t('generatingCode')}</p>
          </div>
        )}

        {state === 'showing' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">{t('openOnTv')}</p>
              <p className="text-white/60 text-sm">{t('enterCode')}</p>
            </div>
            {/* Big code display */}
            <div className="bg-[#1E5E2F]/40 border-2 border-[#79C24C] rounded-2xl px-8 py-5 tracking-[0.5em] text-[#C9F27A] text-6xl font-bold font-mono">
              {code}
            </div>
            <p className="text-white/40 text-xs">{t('expiresIn', { time: `${mm}:${ss}` })}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#79C24C] animate-pulse" />
              <p className="text-white/50 text-sm">{t('waitingForTv')}</p>
            </div>
          </div>
        )}

        {state === 'activated' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-[#1E5E2F] flex items-center justify-center text-4xl">
              ✓
            </div>
            <p className="text-white font-bold text-xl">{t('tvConnected')}</p>
            <p className="text-white/50 text-sm">{t('tvPaired')}</p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            <button
              type="button"
              onClick={() => { setState('loading'); retryRef.current(); }}
              className="px-6 py-2 bg-[#1E5E2F]/60 hover:bg-[#1E5E2F] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PairedTvsPage() {
  const t = useTranslations('tv');
  const { session, hydrated, isLoggedIn, loginWithResult, logout } = useSession();
  const [devices, setDevices] = useState<TvDeviceExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [tokenRejected, setTokenRejected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TvDevice | null>(null);
  const [screenshotDevice, setScreenshotDevice] = useState<TvDevice | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showAddTv, setShowAddTv] = useState(false);
  const [sharingDeviceId, setSharingDeviceId] = useState<string | null>(null);
  const [devLoggingIn, setDevLoggingIn] = useState(false);
  const [devLoginError, setDevLoginError] = useState<string | null>(null);
  const [locationEditId, setLocationEditId] = useState<string | null>(null);
  // BUG-A11: Track SSE fallback poll interval so it can be cleared before creating new one.
  const sseFallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = session?.tokens?.accessToken ?? '';

  const fetchDevices = useCallback(async (accessToken: string) => {
    if (!accessToken) { setLoading(false); return; }
    setLoading(true);
    setListError(null);
    setTokenRejected(false);
    try {
      const res = await fetch('/api/dashboard/tvs', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      if (res.status === 401) {
        setTokenRejected(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { devices: RawDevice[] };
      setDevices((json.devices ?? []).map(rawToDevice));
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  async function devLogin() {
    setDevLoggingIn(true);
    setDevLoginError(null);
    try {
      const res = await fetch('/api/dev/login', { method: 'POST' });
      const data = await res.json() as { session?: { accessToken: string; accessTokenExpiresIn: number; refreshToken: string; user: { id: string; email: string; displayName?: string; avatarUrl?: string | null } }; error?: string };
      if (data.session) {
        loginWithResult({ user: { id: data.session.user.id, email: data.session.user.email, displayName: data.session.user.displayName ?? data.session.user.email, avatarUrl: data.session.user.avatarUrl ?? undefined }, tokens: { accessToken: data.session.accessToken, refreshToken: data.session.refreshToken, accessTokenExpiresAt: Date.now() + data.session.accessTokenExpiresIn * 1000 } });
      } else {
        setDevLoginError(data.error ?? `Server returned ${res.status} with no session`);
      }
    } catch (err) {
      setDevLoginError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setDevLoggingIn(false);
    }
  }

  useEffect(() => {
    if (hydrated && token) void fetchDevices(token);
    else if (hydrated) setLoading(false);
  }, [hydrated, token, fetchDevices]);

  // Real-time status updates via SSE — patches individual device state on heartbeat.
  useEffect(() => {
    if (!hydrated || !token) return;

    const es = new EventSource(`/api/dashboard/tvs/stream?t=${encodeURIComponent(token)}`);

    es.addEventListener('device', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent<string>).data) as {
          type: string;
          deviceId: string;
          isOnline: boolean;
          lastSeen: string;
          screenState?: string | null;
        };
        if (data.type === 'heartbeat') {
          setDevices(prev => prev.map(d =>
            d.id === data.deviceId
              ? { ...d, isOnline: true, lastSeen: data.lastSeen,
                  currentDisplay: data.screenState ?? d.currentDisplay }
              : d
          ));
        }
      } catch { /* malformed — ignore */ }
    });

    es.onerror = () => {
      // SSE disconnected — fall back to a periodic full refresh.
      // BUG-A11: Clear any existing fallback interval before creating a new one to prevent
      // interval accumulation on repeated disconnects (onerror return value is ignored by browser).
      es.close();
      if (sseFallbackRef.current) clearInterval(sseFallbackRef.current);
      sseFallbackRef.current = setInterval(() => void fetchDevices(token), 30_000);
    };

    // Mark devices offline when their last_seen exceeds the 3-minute window.
    const staleness = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        isOnline: (Date.now() - new Date(d.lastSeen).getTime()) < 3 * 60 * 1000,
      })));
    }, 15_000);

    return () => {
      es.close();
      clearInterval(staleness);
      // BUG-A11: Also clear the SSE fallback interval on unmount.
      if (sseFallbackRef.current) clearInterval(sseFallbackRef.current);
    };
  }, [hydrated, token, fetchDevices]);

  async function handleRemove(id: string) {
    // Optimistically remove from UI
    setDevices(d => d.filter(tv => tv.id !== id));
    try {
      await fetch(`/api/dashboard/tvs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // If the API call fails, re-fetch to restore accurate state
      void fetchDevices(token);
    }
  }

  function handleRename(device: TvDevice) {
    setRenamingId(device.id);
    setNewName(device.deviceName);
  }

  function confirmRename(id: string) {
    setDevices(d => d.map(tv => tv.id === id ? { ...tv, deviceName: newName } : tv));
    setRenamingId(null);
  }

  function handlePaired() {
    setShowAddTv(false);
    void fetchDevices(token);
  }

  async function handleSaveLocation(deviceId: string, loc: { lat: number; lng: number; city: string; country: string; state?: string; timezone: string }) {
    try {
      await fetch(`/api/dashboard/tvs/${deviceId}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLat: loc.lat,
          locationLng: loc.lng,
          locationCity: loc.city,
          locationCountry: loc.country,
          locationState: loc.state,
          locationTimezone: loc.timezone,
        }),
      });
      setDevices(d => d.map(tv => tv.id === deviceId ? {
        ...tv,
        locationCity: loc.city,
        locationCountry: loc.country,
        locationLat: loc.lat,
        locationLng: loc.lng,
        locationTimezone: loc.timezone,
      } : tv));
    } catch { /* silent */ }
    setLocationEditId(null);
  }

  // Show spinner while hydrating
  if (!hydrated || loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('pairedTvs')}</h1>
            <p className="text-white/60">{t('manageTvs')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Token was accepted by session but rejected by the API — stale/invalid JWT
  if (isLoggedIn && tokenRejected) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('pairedTvs')}</h1>
        <div className="flex flex-col items-center py-24 gap-4 text-white/40">
          <p className="text-lg">{t('sessionExpired')}</p>
          <button
            type="button"
            onClick={() => void logout().then(() => { setTokenRejected(false); })}
            className="px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors border border-[#79C24C]/30"
          >
            Sign out and sign in again
          </button>
        </div>
      </div>
    );
  }

  // Not signed in — show auth gate
  if (!isLoggedIn) {
    const googleUrl = `${process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'}/signin/provider/google?redirectTo=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/dashboard/tvs` : '/dashboard/tvs')}`;
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('pairedTvs')}</h1>
        <div className="flex flex-col items-center py-24 gap-4 text-white/40">
          <p className="text-lg">{t('signInToManage')}</p>
          <a
            href={googleUrl}
            className="flex items-center gap-3 px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors border border-[#79C24C]/30"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="currentColor"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="currentColor"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="currentColor"/>
            </svg>
            Sign in with Google
          </a>
          {devLoginError && (
            <p className="text-red-400 text-sm max-w-sm text-center">{devLoginError}</p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={() => void devLogin()}
              disabled={devLoggingIn}
              className="px-6 py-2 bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 rounded-xl text-sm font-medium"
            >
              {devLoggingIn ? 'Signing in…' : '⚡ Dev Login (alisalaah@gmail.com)'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('pairedTvs')}</h1>
          <p className="text-white/60">{t('manageTvs')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchDevices(token)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
            title={t('refreshStatus')}
            aria-label={t('refreshStatus')}
          >
            ↻
          </button>
          <button
            type="button"
            onClick={() => setShowAddTv(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
          >
            <span className="text-lg leading-none">+</span>
            {t('addTv')}
          </button>
        </div>
      </div>

      {listError && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <span>{t('couldNotLoad', { error: listError ?? '' })}</span>
          <button type="button" onClick={() => void fetchDevices(token)} className="ml-auto text-red-300 hover:text-white underline">
            Retry
          </button>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-center py-24 text-white/40">
          <svg className="mx-auto mb-4 opacity-30" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <p className="text-xl">{t('noPairedTvs')}</p>
          <p className="mt-2 mb-6">{t('openOnTvInstructions')}</p>
          <button
            type="button"
            onClick={() => setShowAddTv(true)}
            className="px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl font-medium transition-colors"
          >
            + Add Your First TV
          </button>
        </div>
      ) : (
        <>
          {/* My TVs */}
          {devices.filter(d => !d.isShared).length > 0 && (
            <div className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.filter(d => !d.isShared).map(device => (
                  <TvCard
                    key={device.id}
                    device={device}
                    isRenaming={renamingId === device.id}
                    newName={newName}
                    onNewNameChange={setNewName}
                    onRename={() => handleRename(device)}
                    onConfirmRename={() => confirmRename(device.id)}
                    onSettings={() => setSelectedDevice(device)}
                    onScreenshot={() => setScreenshotDevice(device)}
                    onRemove={() => handleRemove(device.id)}
                    onShare={() => setSharingDeviceId(device.id)}
                    isEditingLocation={locationEditId === device.id}
                    onEditLocation={() => setLocationEditId(device.id)}
                    onCancelLocation={() => setLocationEditId(null)}
                    onSaveLocation={(loc) => void handleSaveLocation(device.id, loc)}
                    token={token}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shared with me */}
          {devices.filter(d => d.isShared).length > 0 && (
            <div>
              <h2 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4">{t('sharedWithMe')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.filter(d => d.isShared).map(device => (
                  <TvCard
                    key={device.id}
                    device={device}
                    isRenaming={renamingId === device.id}
                    newName={newName}
                    onNewNameChange={setNewName}
                    onRename={() => handleRename(device)}
                    onConfirmRename={() => confirmRename(device.id)}
                    onSettings={() => setSelectedDevice(device)}
                    onScreenshot={() => setScreenshotDevice(device)}
                    onRemove={() => handleRemove(device.id)}
                    isEditingLocation={locationEditId === device.id}
                    onEditLocation={() => setLocationEditId(device.id)}
                    onCancelLocation={() => setLocationEditId(null)}
                    onSaveLocation={(loc) => void handleSaveLocation(device.id, loc)}
                    token={token}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedDevice && (
        <TvSettingsPanel
          device={selectedDevice}
          token={token}
          onClose={() => setSelectedDevice(null)}
        />
      )}

      {screenshotDevice && (
        <TvScreenshotModal
          device={screenshotDevice}
          onClose={() => setScreenshotDevice(null)}
        />
      )}

      {showAddTv && (
        <AddTvModal
          onClose={() => setShowAddTv(false)}
          onPaired={handlePaired}
          token={token}
        />
      )}

      {sharingDeviceId && (() => {
        const sharingDevice = devices.find(d => d.id === sharingDeviceId);
        return sharingDevice ? (
          <ShareTvModal
            deviceId={sharingDeviceId}
            deviceName={sharingDevice.deviceName}
            token={token}
            onClose={() => setSharingDeviceId(null)}
          />
        ) : null;
      })()}
    </div>
  );
}

interface LocationResult {
  lat: number;
  lng: number;
  city: string;
  country: string;
  state?: string;
  timezone: string;
  displayName: string;
}

function LocationPicker({ onSave, onCancel, current }: {
  onSave: (loc: { lat: number; lng: number; city: string; country: string; state?: string; timezone: string }) => void;
  onCancel: () => void;
  current?: string;
}) {
  const t = useTranslations('tv');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIdx(0);
    if (query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) { setResults([]); return; }
        const data = await res.json() as LocationResult[];
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
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) pick(results[activeIdx]);
    }
    else if (e.key === 'Escape') onCancel();
  }

  return (
    <div ref={wrapperRef} className="flex flex-col gap-2">
      <p className="text-white/50 text-xs">
        {current ? `Current: ${current}` : 'No location — TV will show setup screen until configured.'}
      </p>
      <div className="relative">
        <input
          type="text"
          placeholder={t('citySearchPlaceholder')}
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
              <button
                key={i}
                type="button"
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
        <p className="text-white/30 text-xs">{t('noResults')}</p>
      )}
      <button type="button" onClick={onCancel} className="text-white/35 hover:text-white/60 text-xs self-start mt-1 transition-colors">{t('cancel')}</button>
    </div>
  );
}

function useScreenshot(deviceId: string, token: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const fetchScreenshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/screenshot`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json() as { imageUrl?: string | null; capturedAt?: string | null };
      setImageUrl(data.imageUrl ?? null);
      setCapturedAt(data.capturedAt ?? null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [deviceId]);

  useEffect(() => {
    void fetchScreenshot();

    // Refresh every 30 seconds
    const interval = setInterval(() => void fetchScreenshot(), 30_000);

    // Refresh on window focus
    const onFocus = () => void fetchScreenshot();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchScreenshot]);

  return { imageUrl, capturedAt, loading, refresh: fetchScreenshot };
}

function ScreenshotPreview({ deviceId, token }: { deviceId: string; token: string }) {
  const t = useTranslations('tv');
  const { imageUrl, capturedAt, loading } = useScreenshot(deviceId, token);

  const [lastUpdatedText, setLastUpdatedText] = useState<string | null>(null);
  useEffect(() => {
    if (!capturedAt) return;
    function update() {
      const diffMs = Date.now() - new Date(capturedAt!).getTime();
      const diffMin = Math.floor(diffMs / 60_000);
      if (diffMin < 1) { setLastUpdatedText('Just now'); return; }
      if (diffMin === 1) { setLastUpdatedText('1 min ago'); return; }
      if (diffMin < 60) { setLastUpdatedText(`${diffMin} min ago`); return; }
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr === 1) { setLastUpdatedText('1 hr ago'); return; }
      setLastUpdatedText(`${diffHr} hr ago`);
    }
    update();
    const timer = setInterval(update, 60_000);
    return () => { clearInterval(timer); setLastUpdatedText(null); };
  }, [capturedAt]);

  return (
    <div className="flex flex-col gap-1">
      <div className="bg-black/30 rounded-xl aspect-video overflow-hidden border border-white/5 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#79C24C]/30 border-t-[#79C24C] rounded-full animate-spin" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt="TV screenshot"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">
            📺
          </div>
        )}
      </div>
      {lastUpdatedText && (
        <p className="text-white/25 text-xs text-right">{t('updatedAt', { time: lastUpdatedText })}</p>
      )}
    </div>
  );
}

function TvCard({
  device,
  isRenaming,
  newName,
  onNewNameChange,
  onRename,
  onConfirmRename,
  onSettings,
  onScreenshot,
  onRemove,
  onShare,
  isEditingLocation,
  onEditLocation,
  onCancelLocation,
  onSaveLocation,
  token,
}: {
  device: TvDeviceExtended;
  isRenaming: boolean;
  newName: string;
  onNewNameChange: (v: string) => void;
  onRename: () => void;
  onConfirmRename: () => void;
  onSettings: () => void;
  onScreenshot: () => void;
  onRemove: () => void;
  onShare?: () => void;
  isEditingLocation: boolean;
  onEditLocation: () => void;
  onCancelLocation: () => void;
  onSaveLocation: (loc: { lat: number; lng: number; city: string; country: string; state?: string; timezone: string }) => void;
  token: string;
}) {
  const t = useTranslations('tv');
  const displayModeLabel = { home: 'Prayer Times', masjid: 'Masjid Display', ambient: 'Ambient Mode' }[device.currentDisplay] ?? device.currentDisplay;
  const lastSeenText = device.isOnline ? t('online') : `${new Date(device.lastSeen).toLocaleString()}`;
  const locationLabel = device.locationCity
    ? `${device.locationCity}${device.locationCountry ? ', ' + device.locationCountry : ''}`
    : null;

  return (
    <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex gap-2">
              <label htmlFor={`rename-${device.id}`} className="sr-only">{t('newTvName')}</label>
              <input
                id={`rename-${device.id}`}
                className="bg-black/30 border border-[#79C24C]/40 rounded-lg px-3 py-1 text-white text-lg flex-1 min-w-0"
                value={newName}
                onChange={e => onNewNameChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onConfirmRename()}
                autoFocus
              />
              <button type="button" onClick={onConfirmRename} className="text-[#C9F27A] text-sm px-3 py-1 border border-[#79C24C]/40 rounded-lg hover:bg-[#79C24C]/10">
                Save
              </button>
            </div>
          ) : (
            <h3 className="text-white font-bold text-xl truncate">{device.deviceName}</h3>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-white/50 text-sm truncate">{device.deviceModel}</p>
            {device.isShared && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1E5E2F]/40 border border-[#79C24C]/20 rounded-full text-[#79C24C] text-xs font-medium whitespace-nowrap">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Shared with you
              </span>
            )}
          </div>
        </div>
        {/* Status dot */}
        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${device.isOnline ? 'bg-green-400' : 'bg-white/20'}`} title={lastSeenText} />
      </div>

      {/* Screenshot */}
      <ScreenshotPreview deviceId={device.id} token={token} />

      {/* Location — always visible, edit inline */}
      <div className="border border-[#79C24C]/10 rounded-xl p-3 bg-black/20">
        {isEditingLocation ? (
          <LocationPicker
            onSave={onSaveLocation}
            onCancel={onCancelLocation}
            current={locationLabel ?? undefined}
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white/30 text-sm">📍</span>
              {locationLabel ? (
                <span className="text-white/70 text-sm truncate">{locationLabel}</span>
              ) : (
                <span className="text-amber-400/70 text-sm">{t('noLocationSet')}</span>
              )}
            </div>
            <button
              type="button"
              onClick={onEditLocation}
              className="text-[#C9F27A]/60 hover:text-[#C9F27A] text-xs px-2 py-1 rounded-lg border border-[#79C24C]/20 hover:border-[#79C24C]/50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {locationLabel ? 'Change' : 'Set location'}
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`${device.isOnline ? 'text-green-400' : 'text-white/40'}`}>{lastSeenText}</span>
        {device.isOnline && (
          <>
            <span className="text-white/20">•</span>
            <span className="text-[#C9F27A]">{displayModeLabel}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          onClick={onSettings}
          className="flex-1 bg-[#1E5E2F]/40 hover:bg-[#1E5E2F]/60 text-[#C9F27A] rounded-xl py-2 text-sm font-medium transition-colors"
        >
          Settings
        </button>
        {device.isOnline && (
          <button
            type="button"
            onClick={onScreenshot}
            className="px-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl py-2 text-sm transition-colors"
            title={t('viewCurrentScreen')}
            aria-label={t('viewCurrentScreen')}
          >
            🖥️
          </button>
        )}
        {!device.isShared && onShare && (
          <button
            type="button"
            onClick={onShare}
            className="px-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-[#C9F27A] rounded-xl py-2 text-sm transition-colors"
            aria-label={t('shareTV')}
            title={t('shareTV')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onRename}
          className="px-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl py-2 text-sm transition-colors"
          aria-label={t('renameTv')}
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-xl py-2 text-sm transition-colors"
          aria-label={t('removeTv')}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
