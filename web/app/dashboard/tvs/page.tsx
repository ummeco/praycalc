'use client';

import { useState, useEffect, useCallback } from 'react';
import TvSettingsPanel, { type TvDevice } from '../../../components/tv/TvSettingsPanel';
import TvScreenshotModal from '../../../components/tv/TvScreenshotModal';
import { getSession } from '../../../lib/session';

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

function rawToDevice(d: RawDevice): TvDevice {
  const settings = d.settings_json ?? {};
  return {
    id: d.id,
    deviceName: d.device_name,
    deviceModel: [d.manufacturer, d.model].filter(Boolean).join(' ') || 'Android TV',
    isOnline: d.is_online,
    lastSeen: d.last_seen ?? new Date().toISOString(),
    currentDisplay: (settings['currentDisplay'] as string) ?? 'home',
    locationCitySlug: d.location_city_slug ?? '',
  };
}

export default function PairedTvsPage() {
  const [devices, setDevices] = useState<TvDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<TvDevice | null>(null);
  const [screenshotDevice, setScreenshotDevice] = useState<TvDevice | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const fetchDevices = useCallback(async () => {
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) {
      setError('Not signed in');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/dashboard/tvs', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { devices: RawDevice[] };
      setDevices((json.devices ?? []).map(rawToDevice));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDevices();
  }, [fetchDevices]);

  function handleRemove(id: string) {
    setDevices(d => d.filter(tv => tv.id !== id));
  }

  function handleRename(device: TvDevice) {
    setRenamingId(device.id);
    setNewName(device.deviceName);
  }

  function confirmRename(id: string) {
    setDevices(d => d.map(tv => tv.id === id ? { ...tv, deviceName: newName } : tv));
    setRenamingId(null);
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paired TVs</h1>
          <p className="text-white/60">Manage your connected TV displays from here.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-6 animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paired TVs</h1>
        </div>
        <div className="text-center py-24 text-white/40">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg">{error}</p>
          <button
            type="button"
            onClick={() => { setLoading(true); setError(null); void fetchDevices(); }}
            className="mt-4 px-4 py-2 bg-[#1E5E2F]/40 hover:bg-[#1E5E2F]/60 text-[#C9F27A] rounded-xl text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Paired TVs</h1>
        <p className="text-white/60">Manage your connected TV displays from here.</p>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-24 text-white/40">
          <div className="text-6xl mb-4">📺</div>
          <p className="text-xl">No TVs paired yet.</p>
          <p className="mt-2">Open PrayCalc on your Android TV to pair it.</p>
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
              onConfirmRename={() => confirmRename(device.id)}
              onSettings={() => setSelectedDevice(device)}
              onScreenshot={() => setScreenshotDevice(device)}
              onRemove={() => handleRemove(device.id)}
            />
          ))}
        </div>
      )}

      {selectedDevice && (
        <TvSettingsPanel
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}

      {screenshotDevice && (
        <TvScreenshotModal
          device={screenshotDevice}
          onClose={() => setScreenshotDevice(null)}
        />
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
}: {
  device: TvDevice;
  isRenaming: boolean;
  newName: string;
  onNewNameChange: (v: string) => void;
  onRename: () => void;
  onConfirmRename: () => void;
  onSettings: () => void;
  onScreenshot: () => void;
  onRemove: () => void;
}) {
  const displayModeLabel = { home: 'Prayer Times', masjid: 'Masjid Display', ambient: 'Ambient Mode' }[device.currentDisplay] ?? device.currentDisplay;
  const lastSeenText = device.isOnline ? 'Online now' : `Last seen ${new Date(device.lastSeen).toLocaleString()}`;

  return (
    <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex gap-2">
              <label htmlFor={`rename-${device.id}`} className="sr-only">New TV name</label>
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
          <p className="text-white/50 text-sm mt-1 truncate">{device.deviceModel}</p>
        </div>
        {/* Status dot */}
        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${device.isOnline ? 'bg-green-400' : 'bg-white/20'}`} title={lastSeenText} />
      </div>

      {/* Screenshot placeholder */}
      <div className="bg-black/30 rounded-xl aspect-video flex items-center justify-center text-white/20 text-4xl border border-white/5">
        📺
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
            title="View current screen"
            aria-label="View current screen"
          >
            🖥️
          </button>
        )}
        <button
          type="button"
          onClick={onRename}
          className="px-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl py-2 text-sm transition-colors"
          aria-label="Rename TV"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-xl py-2 text-sm transition-colors"
          aria-label="Remove TV"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
