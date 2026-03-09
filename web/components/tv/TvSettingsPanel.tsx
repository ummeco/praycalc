'use client';

import { useState, useEffect } from 'react';
import TvLayoutEditor from './TvLayoutEditor';
import TvScreenshotModal from './TvScreenshotModal';

export type TvDevice = {
  id: string;
  deviceName: string;
  deviceModel: string;
  isOnline: boolean;
  lastSeen: string;
  currentDisplay: string;
  locationCitySlug: string;
};

type TvSettingsPanelProps = {
  device: TvDevice;
  onClose: () => void;
};

const LAYOUT_PRESETS = [
  { id: 'prayer-only', name: 'Prayer Only' },
  { id: 'split-stream', name: 'Split Stream' },
  { id: 'split-art', name: 'Split Art' },
  { id: 'info-rich', name: 'Info Rich' },
  { id: 'masjid', name: 'Masjid' },
] as const;

const AUDIO_MODES = [
  { id: 'silent', label: 'Silent' },
  { id: 'live-stream', label: 'Live Stream' },
  { id: 'quran', label: 'Quran Recitation' },
] as const;

const SCREENSAVER_SOURCES = [
  { id: 'praycalc', label: 'PrayCalc Library' },
  { id: 'my-photos', label: 'My Photos' },
  { id: 'mix', label: 'Mix' },
] as const;

const SCREENSAVER_INTERVALS = [
  { id: '15', label: '15 seconds' },
  { id: '30', label: '30 seconds' },
  { id: '60', label: '1 minute' },
  { id: '180', label: '3 minutes' },
  { id: '300', label: '5 minutes' },
] as const;

export default function TvSettingsPanel({ device, onClose }: TvSettingsPanelProps) {
  const [layout, setLayout] = useState('prayer-only');
  const [audioMode, setAudioMode] = useState('silent');
  const [screensaverSource, setScreensaverSource] = useState('praycalc');
  const [screensaverInterval, setScreensaverInterval] = useState('60');
  const [cityOverride, setCityOverride] = useState(device.locationCitySlug || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  // Reset city slug when device changes
  useEffect(() => {
    setCityOverride(device.locationCitySlug || '');
  }, [device.id, device.locationCitySlug]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSavedOk(false);
    try {
      const res = await fetch(`/api/dashboard/tvs/${device.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout,
          audioMode,
          screensaverSource,
          screensaverInterval: parseInt(screensaverInterval, 10),
          citySlugOverride: cityOverride.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-96 bg-[#0D2F17] border-l border-[#79C24C]/20 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#79C24C]/10">
          <div>
            <h2 className="text-white font-bold text-xl">{device.deviceName}</h2>
            <p className="text-white/50 text-sm mt-0.5">{device.deviceModel}</p>
          </div>
          <div className="flex items-center gap-2">
            {device.isOnline && (
              <button
                onClick={() => setShowScreenshot(true)}
                className="text-white/40 hover:text-[#C9F27A] text-sm px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                title="View current screen"
              >
                📺
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close settings"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Layout Preset */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide">Layout Preset</h3>
              <button
                onClick={() => setShowLayoutEditor(v => !v)}
                className="text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                {showLayoutEditor ? 'Hide editor' : 'Custom layout'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {LAYOUT_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setLayout(p.id)}
                  className={`px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-colors ${
                    layout === p.id
                      ? 'border-[#79C24C] bg-[#1E5E2F]/40 text-[#C9F27A]'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {showLayoutEditor && (
              <div className="mt-4">
                <TvLayoutEditor deviceId={device.id} />
              </div>
            )}
          </section>

          {/* Audio Mode */}
          <section>
            <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">Audio Mode</h3>
            <div className="space-y-2">
              {AUDIO_MODES.map(m => (
                <label key={m.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`audio-${device.id}`}
                    value={m.id}
                    checked={audioMode === m.id}
                    onChange={() => setAudioMode(m.id)}
                    className="accent-[#79C24C]"
                  />
                  <span className="text-white text-sm">{m.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Screensaver */}
          <section>
            <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">Screensaver</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Photo Source</label>
                <select
                  value={screensaverSource}
                  onChange={e => setScreensaverSource(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none"
                >
                  {SCREENSAVER_SOURCES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Change Interval</label>
                <select
                  value={screensaverInterval}
                  onChange={e => setScreensaverInterval(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none"
                >
                  {SCREENSAVER_INTERVALS.map(i => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* City Override */}
          <section>
            <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">City Override</h3>
            <input
              type="text"
              value={cityOverride}
              onChange={e => setCityOverride(e.target.value)}
              placeholder="e.g. new-york-ny-us (uses account default if blank)"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:border-[#79C24C]/50 outline-none"
            />
            <p className="text-white/30 text-xs mt-1.5">City slug — leave blank to use your account location</p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#79C24C]/10 space-y-3">
          {saveError && (
            <p className="text-red-400 text-xs text-center">{saveError}</p>
          )}
          {savedOk && (
            <p className="text-[#C9F27A] text-xs text-center">Settings saved — applying to TV...</p>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#1E5E2F] hover:bg-[#79C24C]/20 disabled:opacity-50 text-[#C9F27A] font-semibold rounded-xl py-3.5 transition-colors border border-[#79C24C]/30 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <p className="text-white/25 text-xs text-center">Settings apply within 3 seconds</p>
        </div>
      </div>

      {showScreenshot && (
        <TvScreenshotModal
          device={device}
          onClose={() => setShowScreenshot(false)}
        />
      )}
    </>
  );
}
