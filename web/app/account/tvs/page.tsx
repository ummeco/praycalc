'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
}

interface TvDeviceExtended {
  id: string;
  deviceName: string;
  deviceModel: string;
  isOnline: boolean;
  lastSeen: string;
  currentDisplay: string;
  locationCitySlug: string;
  locationCity?: string;
  locationCountry?: string;
}

function rawToDevice(d: RawDevice): TvDeviceExtended {
  const settings = d.settings_json ?? {};
  return {
    id: d.id,
    deviceName: d.device_name,
    deviceModel: [d.manufacturer, d.model].filter(Boolean).join(' ') || 'Android TV',
    isOnline: d.is_online && !!d.last_seen &&
      (Date.now() - new Date(d.last_seen).getTime()) < 3 * 60 * 1000,
    lastSeen: d.last_seen ?? new Date().toISOString(),
    currentDisplay: (settings['currentDisplay'] as string) ?? 'home',
    locationCitySlug: d.location_city_slug ?? '',
    locationCity: (settings['location_city'] as string) ?? undefined,
    locationCountry: (settings['location_country'] as string) ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Add TV Modal
// ---------------------------------------------------------------------------

type ModalState = 'idle' | 'loading' | 'showing' | 'activated' | 'error';

function AddTvModal({ onClose, onPaired, token }: { onClose: () => void; onPaired: () => void; token: string }) {
  const [state, setState] = useState<ModalState>('loading');
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(300);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function requestCode() {
      if (!token) { if (!cancelled) { setState('error'); setErrorMsg('You must be signed in to add a TV.'); } return; }
      try {
        const res = await fetch('/api/tv/app-code', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await res.json() as { code?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !json.code) { setState('error'); setErrorMsg(json.error ?? 'Failed to generate code. Try again.'); return; }
        const newCode = json.code;
        setCode(newCode);
        setRemaining(300);
        setState('showing');
        const cRef = setInterval(() => {
          setRemaining(r => {
            if (r <= 1) { clearInterval(cRef); pollRef.current && clearInterval(pollRef.current); setState('error'); setErrorMsg('Code expired. Click below to try again.'); return 0; }
            return r - 1;
          });
        }, 1000);
        countdownRef.current = cRef;
        const pRef = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/tv/app-code/${newCode}/status`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
            const statusJson = await statusRes.json() as { status?: string };
            if (statusJson.status === 'activated') { clearInterval(pRef); clearInterval(cRef); setState('activated'); setTimeout(onPaired, 2000); }
            else if (statusJson.status === 'expired') { clearInterval(pRef); clearInterval(cRef); setState('error'); setErrorMsg('Code expired. Click below to try again.'); }
          } catch { /* keep polling */ }
        }, 3000);
        pollRef.current = pRef;
      } catch {
        if (!cancelled) { setState('error'); setErrorMsg('Could not reach the server. Check your connection.'); }
      }
    }
    void requestCode();
    return () => { cancelled = true; clearTimers(); };
  }, [onPaired, token, clearTimers]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D2F17] border border-[#79C24C]/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">Add TV</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 text-2xl leading-none" aria-label="Close">×</button>
        </div>
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 border-2 border-[#79C24C]/40 border-t-[#79C24C] rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Generating code…</p>
          </div>
        )}
        {state === 'showing' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">Open PrayCalc on your TV</p>
              <p className="text-white/60 text-sm">and enter this code:</p>
            </div>
            <div className="bg-[#1E5E2F]/40 border-2 border-[#79C24C] rounded-2xl px-8 py-5 tracking-[0.5em] text-[#C9F27A] text-6xl font-bold font-mono">{code}</div>
            <p className="text-white/40 text-xs">Expires in {mm}:{ss}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#79C24C] animate-pulse" />
              <p className="text-white/50 text-sm">Waiting for TV…</p>
            </div>
          </div>
        )}
        {state === 'activated' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-[#1E5E2F] flex items-center justify-center text-4xl">✓</div>
            <p className="text-white font-bold text-xl">TV Connected!</p>
            <p className="text-white/50 text-sm">Your TV is now paired to this account.</p>
          </div>
        )}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            <button type="button" onClick={() => { setState('loading'); void requestCode(); }} className="px-6 py-2 bg-[#1E5E2F]/60 hover:bg-[#1E5E2F] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Remove Confirmation Modal
// ---------------------------------------------------------------------------

function RemoveConfirmModal({ device, onConfirm, onCancel }: { device: TvDeviceExtended; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D2F17] border border-red-500/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Remove {device.deviceName}?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Only you have access to this TV. Removing it will send the TV back to the welcome screen — it will need to be paired with an account again.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-colors border border-red-500/30"
            >
              Remove TV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Share Modal
// ---------------------------------------------------------------------------

function ShareModal({ device, token, onClose }: { device: TvDeviceExtended; token: string; onClose: () => void }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteResult(null);
    try {
      const res = await fetch(`/api/dashboard/tvs/${device.id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (res.status === 404) {
        setInviteResult({ ok: false, msg: 'TV sharing is coming soon. Stay tuned!' });
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setInviteResult({ ok: false, msg: data.error ?? 'Something went wrong.' });
      } else {
        setInviteResult({ ok: true, msg: `Invite sent to ${inviteEmail.trim()}` });
        setInviteEmail('');
      }
    } catch {
      setInviteResult({ ok: false, msg: 'Could not reach the server.' });
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D2F17] border border-[#79C24C]/30 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">Share {device.deviceName}</h2>
            <p className="text-white/40 text-xs mt-0.5">Control who can manage this TV</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 text-2xl leading-none" aria-label="Close">×</button>
        </div>

        {/* Owner */}
        <div className="mb-5">
          <p className="text-[#C9F27A] text-xs font-semibold uppercase tracking-wide mb-2">Owner</p>
          <div className="flex items-center gap-3 py-2 px-3 bg-[#1E5E2F]/20 rounded-xl border border-[#79C24C]/15">
            <div className="w-8 h-8 rounded-full bg-[#79C24C]/20 border border-[#79C24C]/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#C9F27A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">You</p>
              <p className="text-white/40 text-xs">Full control, cannot be removed</p>
            </div>
            <svg className="w-4 h-4 text-[#C9F27A]/60 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M2 4l3 12h14l3-12-6 4-4-7-4 7-6-4z"/>
            </svg>
          </div>
        </div>

        {/* TV Admins */}
        <div className="mb-5">
          <p className="text-[#C9F27A] text-xs font-semibold uppercase tracking-wide mb-2">TV Admins</p>
          <p className="text-white/35 text-sm py-3 px-3">No one else has access yet.</p>
        </div>

        {/* Invite */}
        <div>
          <p className="text-white/60 text-xs mb-2">Invite by email</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleInvite()}
              placeholder="name@example.com"
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 focus:border-[#79C24C]/50 outline-none"
            />
            <button
              type="button"
              onClick={() => void handleInvite()}
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 py-2.5 bg-[#1E5E2F] hover:bg-[#2a7a3d] disabled:opacity-40 text-[#C9F27A] rounded-xl text-sm font-medium transition-colors border border-[#79C24C]/30 whitespace-nowrap"
            >
              {inviting ? '…' : 'Invite'}
            </button>
          </div>
          {inviteResult && (
            <p className={`text-xs mt-2 ${inviteResult.ok ? 'text-[#C9F27A]' : 'text-red-400'}`}>{inviteResult.msg}</p>
          )}
        </div>

        <button
          type="button"
          className="text-white/25 text-xs mt-5 block hover:text-white/50 transition-colors"
          onClick={() => setInviteResult({ ok: false, msg: 'Ownership transfer coming soon.' })}
        >
          Transfer ownership…
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TV Card
// ---------------------------------------------------------------------------

function TvCard({
  device,
  isRenaming,
  newName,
  onNewNameChange,
  onRename,
  onConfirmRename,
  onShare,
  onRemove,
}: {
  device: TvDeviceExtended;
  isRenaming: boolean;
  newName: string;
  onNewNameChange: (v: string) => void;
  onRename: () => void;
  onConfirmRename: () => void;
  onShare: () => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const lastSeenText = device.isOnline ? 'Online now' : `Last seen ${new Date(device.lastSeen).toLocaleString()}`;
  const locationLabel = device.locationCity
    ? `${device.locationCity}${device.locationCountry ? ', ' + device.locationCountry : ''}`
    : null;
  const displayModeLabel = { home: 'Prayer Times', masjid: 'Masjid Display', ambient: 'Ambient Mode' }[device.currentDisplay] ?? device.currentDisplay;

  return (
    <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl flex flex-col overflow-hidden">
      {/* Clickable main area → detail page (div so nested inputs/buttons stay valid) */}
      <div
        onClick={() => !isRenaming && router.push(`/account/tvs/${device.id}`)}
        className={`flex flex-col gap-4 p-6 text-left transition-colors ${isRenaming ? '' : 'cursor-pointer hover:bg-[#79C24C]/5'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex gap-2" onClick={e => e.stopPropagation()} role="presentation">
                <label htmlFor={`rename-${device.id}`} className="sr-only">New TV name</label>
                <input
                  id={`rename-${device.id}`}
                  className="bg-black/30 border border-[#79C24C]/40 rounded-lg px-3 py-1 text-white text-lg flex-1 min-w-0"
                  value={newName}
                  onChange={e => onNewNameChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onConfirmRename()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onConfirmRename(); }}
                  className="text-[#C9F27A] text-sm px-3 py-1 border border-[#79C24C]/40 rounded-lg hover:bg-[#79C24C]/10"
                >
                  Save
                </button>
              </div>
            ) : (
              <h3 className="text-white font-bold text-xl truncate">{device.deviceName}</h3>
            )}
            <p className="text-white/50 text-sm mt-1 truncate">{device.deviceModel}</p>
          </div>
          <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${device.isOnline ? 'bg-green-400' : 'bg-white/20'}`} title={lastSeenText} />
        </div>

        {/* TV icon preview */}
        <div className="bg-black/30 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 border border-white/5">
          <svg className="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
          {device.isOnline && (
            <span className="text-[#C9F27A] text-xs font-medium">{displayModeLabel}</span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {locationLabel ? (
            <span className="text-white/60 text-sm truncate">{locationLabel}</span>
          ) : (
            <span className="text-amber-400/70 text-sm">No location set</span>
          )}
        </div>

        {/* Status */}
        <p className={`text-sm ${device.isOnline ? 'text-green-400' : 'text-white/40'}`}>{lastSeenText}</p>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[#79C24C]/10">
        <Link
          href={`/account/tvs/${device.id}`}
          className="flex-1 text-center bg-[#1E5E2F]/40 hover:bg-[#1E5E2F]/60 text-[#C9F27A] rounded-xl py-2 text-sm font-medium transition-colors"
        >
          Manage
        </Link>
        {/* Share */}
        <button
          type="button"
          onClick={onShare}
          className="px-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 rounded-xl py-2 text-sm transition-colors"
          aria-label="Share TV"
          title="Share TV"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
        {/* Rename */}
        <button
          type="button"
          onClick={onRename}
          className="px-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 rounded-xl py-2 text-sm transition-colors"
          aria-label="Rename TV"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="px-3 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-xl py-2 text-sm transition-colors"
          aria-label="Remove TV"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AccountTvsPage() {
  const { session, hydrated, isLoggedIn, loginWithResult, logout } = useSession();
  const [devices, setDevices] = useState<TvDeviceExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [tokenRejected, setTokenRejected] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showAddTv, setShowAddTv] = useState(false);
  const [removeConfirmDevice, setRemoveConfirmDevice] = useState<TvDeviceExtended | null>(null);
  const [shareDevice, setShareDevice] = useState<TvDeviceExtended | null>(null);
  const [devLoggingIn, setDevLoggingIn] = useState(false);
  const [devLoginError, setDevLoginError] = useState<string | null>(null);

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
      if (res.status === 401) { setTokenRejected(true); setLoading(false); return; }
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

  useEffect(() => {
    if (!hydrated || !token) return;
    const interval = setInterval(() => void fetchDevices(token), 30_000);
    return () => clearInterval(interval);
  }, [hydrated, token, fetchDevices]);

  async function handleRemove(device: TvDeviceExtended) {
    setRemoveConfirmDevice(null);
    setDevices(d => d.filter(tv => tv.id !== device.id));
    try {
      await fetch(`/api/dashboard/tvs/${device.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      void fetchDevices(token);
    }
  }

  function handleRename(device: TvDeviceExtended) {
    setRenamingId(device.id);
    setNewName(device.deviceName);
  }

  async function confirmRename(id: string) {
    const trimmed = newName.trim();
    if (!trimmed) { setRenamingId(null); return; }
    // Optimistic update
    setDevices(d => d.map(tv => tv.id === id ? { ...tv, deviceName: trimmed } : tv));
    setRenamingId(null);
    // Persist to server
    try {
      await fetch(`/api/dashboard/tvs/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_name: trimmed }),
      });
    } catch {
      // If it fails, re-fetch to restore accurate state
      void fetchDevices(token);
    }
  }

  function handlePaired() {
    setShowAddTv(false);
    void fetchDevices(token);
  }

  const googleUrl = `${process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'}/signin/provider/google?redirectTo=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/account/tvs` : '/account/tvs')}`;

  // Spinner while hydrating
  if (!hydrated || loading) {
    return (
      <main className="account-page account-page--dashboard">
        <div className="w-full max-w-6xl px-4">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/account" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Account</Link>
            <h1 className="text-2xl font-bold text-white">My TVs</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map(i => <div key={i} className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-6 animate-pulse h-64" />)}
          </div>
        </div>
      </main>
    );
  }

  if (isLoggedIn && tokenRejected) {
    return (
      <main className="account-page account-page--dashboard">
        <div className="w-full max-w-6xl px-4">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/account" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Account</Link>
            <h1 className="text-2xl font-bold text-white">My TVs</h1>
          </div>
          <div className="flex flex-col items-center py-24 gap-4 text-white/40">
            <p className="text-lg">Your session has expired.</p>
            <button type="button" onClick={() => void logout().then(() => setTokenRejected(false))} className="px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors border border-[#79C24C]/30">
              Sign out and sign in again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="account-page">
        <div className="w-full max-w-sm px-4">
          <div className="mb-6">
            <Link href="/account" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Account</Link>
          </div>
          <h1 className="text-2xl font-bold text-white mb-8">My TVs</h1>
          <div className="flex flex-col items-center gap-4 text-white/40">
            <p className="text-lg">Sign in to manage your TVs.</p>
            <a href={googleUrl} className="flex items-center gap-3 px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl text-sm font-medium transition-colors border border-[#79C24C]/30">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="currentColor"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="currentColor"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="currentColor"/>
              </svg>
              Sign in with Google
            </a>
            {devLoginError && <p className="text-red-400 text-sm max-w-sm text-center">{devLoginError}</p>}
            {process.env.NODE_ENV === 'development' && (
              <button type="button" onClick={() => void devLogin()} disabled={devLoggingIn} className="px-6 py-2 bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 rounded-xl text-sm font-medium">
                {devLoggingIn ? 'Signing in…' : '⚡ Dev Login (alisalaah@gmail.com)'}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page account-page--dashboard">
      <div className="w-full max-w-6xl px-4">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Account</Link>
            <h1 className="text-2xl font-bold text-white">My TVs</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void fetchDevices(token)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 rounded-xl font-medium text-sm transition-colors" title="Refresh" aria-label="Refresh">↻</button>
            <button type="button" onClick={() => setShowAddTv(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl font-medium text-sm transition-colors whitespace-nowrap border border-[#79C24C]/30">
              <span className="text-lg leading-none">+</span> Add TV
            </button>
          </div>
        </div>

        {listError && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <span>Could not load devices: {listError}</span>
            <button type="button" onClick={() => void fetchDevices(token)} className="ml-auto text-red-300 hover:text-white underline">Retry</button>
          </div>
        )}

        {devices.length === 0 ? (
          <div className="text-center py-24 text-white/40">
            <svg className="w-12 h-12 text-white/20 mb-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            <p className="text-xl">No TVs paired yet.</p>
            <p className="mt-2 mb-6">Open PrayCalc on your TV and enter the code shown here.</p>
            <button type="button" onClick={() => setShowAddTv(true)} className="px-6 py-3 bg-[#1E5E2F] hover:bg-[#2a7a3d] text-[#C9F27A] rounded-xl font-medium transition-colors border border-[#79C24C]/30">
              + Add Your First TV
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(device => (
              <TvCard
                key={device.id}
                device={device}
                isRenaming={renamingId === device.id}
                newName={newName}
                onNewNameChange={setNewName}
                onRename={() => handleRename(device)}
                onConfirmRename={() => void confirmRename(device.id)}
                onShare={() => setShareDevice(device)}
                onRemove={() => setRemoveConfirmDevice(device)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddTv && <AddTvModal onClose={() => setShowAddTv(false)} onPaired={handlePaired} token={token} />}

      {removeConfirmDevice && (
        <RemoveConfirmModal
          device={removeConfirmDevice}
          onConfirm={() => void handleRemove(removeConfirmDevice)}
          onCancel={() => setRemoveConfirmDevice(null)}
        />
      )}

      {shareDevice && (
        <ShareModal
          device={shareDevice}
          token={token}
          onClose={() => setShareDevice(null)}
        />
      )}
    </main>
  );
}
