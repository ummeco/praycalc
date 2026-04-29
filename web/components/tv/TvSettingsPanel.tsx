'use client';

import { useState, useEffect } from 'react';
import TvLayoutEditor from './TvLayoutEditor';
import TvScreenshotModal from './TvScreenshotModal';
import TvQuranPanel from './TvQuranPanel';
import IqamahTimesEditor from './IqamahTimesEditor';

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
  token: string;
  onClose: () => void;
};

const LAYOUT_PRESETS = [
  {
    id: 'split-stream',
    name: 'Video + Times',
    desc: 'Live stream on left, prayer times on right',
    diagram: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="flex-[2] bg-white/20 rounded-sm" />
        <div className="flex-1 flex flex-col gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/30 rounded-sm" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'prayer-only',
    name: 'Prayer Only',
    desc: 'Full screen prayer times and Qibla',
    diagram: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="flex-1 bg-white/15 rounded-sm" />
        <div className="flex gap-0.5 flex-[3]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/30 rounded-sm" />
          ))}
        </div>
        <div className="flex-1 bg-white/15 rounded-sm" />
      </div>
    ),
  },
  {
    id: 'split-art',
    name: 'Art + Times',
    desc: 'Islamic calligraphy or photo, times alongside',
    diagram: (
      <div className="flex gap-0.5 w-full h-full">
        <div className="flex-[2] bg-white/20 rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/40" />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/30 rounded-sm" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'info-rich',
    name: 'Info Rich',
    desc: 'Prayer times, Hijri calendar, weather and more',
    diagram: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="flex gap-0.5 flex-[2]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/25 rounded-sm" />
          ))}
        </div>
        <div className="flex gap-0.5 flex-[3]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/30 rounded-sm" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'masjid',
    name: 'Masjid',
    desc: 'Large type for congregation viewing at a distance',
    diagram: (
      <div className="flex flex-col gap-0.5 w-full h-full">
        <div className="h-2 bg-white/40 rounded-sm" />
        <div className="flex flex-1 gap-0.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/25 rounded-sm" />
          ))}
        </div>
        <div className="h-2 bg-white/20 rounded-sm" />
      </div>
    ),
  },
] as const;

// Maps layout preset IDs to the layoutSettings object Flutter reads.
const LAYOUT_SETTINGS_MAP: Record<string, { preset: string; leftPanel: string | null; rightPanel: string }> = {
  'split-stream': { preset: 'splitStream',  leftPanel: 'liveStream',   rightPanel: 'prayerTimes' },
  'prayer-only':  { preset: 'prayerOnly',   leftPanel: null,           rightPanel: 'prayerTimes' },
  'split-art':    { preset: 'splitArt',     leftPanel: 'artSlideshow', rightPanel: 'prayerTimes' },
  'info-rich':    { preset: 'infoRich',     leftPanel: 'prayerTimes',  rightPanel: 'weatherFull' },
  'masjid':       { preset: 'masjid',       leftPanel: null,           rightPanel: 'prayerTimes' },
};

const VIDEO_AREA_SOURCE_MAP: Record<string, string> = {
  'split-stream': 'live-stream',
  'prayer-only':  'prayer-only',
  'split-art':    'artwork-cycle',
  'info-rich':    'artwork-cycle',
  'masjid':       'prayer-only',
};

const AUDIO_MODES = [
  { id: 'silent',      label: 'Silent' },
  { id: 'live-stream', label: 'Live Stream' },
  { id: 'quran',       label: 'Quran Recitation' },
] as const;

const PHOTO_SOURCES = [
  { id: 'praycalc',  label: 'PrayCalc Library' },
  { id: 'my-photos', label: 'My Photos' },
  { id: 'mix',       label: 'Mix' },
] as const;

const SLIDESHOW_DURATIONS = [
  { id: 15,  label: '15 seconds' },
  { id: 30,  label: '30 seconds' },
  { id: 60,  label: '1 minute' },
  { id: 180, label: '3 minutes' },
  { id: 300, label: '5 minutes' },
] as const;

const SCREENSAVER_IDLE_TIMES = [
  { id: 60,   label: '1 minute' },
  { id: 120,  label: '2 minutes' },
  { id: 300,  label: '5 minutes' },
  { id: 600,  label: '10 minutes' },
  { id: 900,  label: '15 minutes' },
] as const;

const GEOMETRIC_STYLES = [
  { id: 'stars',    label: 'Geometric Stars' },
  { id: 'arabesque', label: 'Arabesque' },
  { id: 'lattice',  label: 'Lattice' },
] as const;

const GOOD_NIGHT_DELAYS = [
  { id: 30,  label: '30 minutes' },
  { id: 60,  label: '1 hour' },
  { id: 90,  label: '90 minutes' },
  { id: 120, label: '2 hours' },
] as const;

const COLOR_PALETTES = [
  { id: 'classic',   label: 'Classic',   bg: 'bg-[#1E5E2F]' },
  { id: 'midnight',  label: 'Midnight',  bg: 'bg-[#1a1a2e]' },
  { id: 'dusk',      label: 'Dusk',      bg: 'bg-[#2d1b4e]' },
  { id: 'ocean',     label: 'Ocean',     bg: 'bg-[#0f3460]' },
  { id: 'sandstone', label: 'Sandstone', bg: 'bg-[#4a3728]' },
] as const;

type PanelTab = 'settings' | 'quran';

// Inline SVG icons — no emojis
const ICONS = {
  tv: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  settings: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  quran: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
} as const;

function ToggleRow({
  label,
  desc,
  enabled,
  onToggle,
}: {
  label: string;
  desc?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-2 group"
    >
      <div className="text-left">
        <span className="text-white text-sm font-medium">{label}</span>
        {desc && <p className="text-white/35 text-xs mt-0.5">{desc}</p>}
      </div>
      <div
        className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ml-4 ${
          enabled ? 'bg-[#79C24C]' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export default function TvSettingsPanel({ device, token, onClose }: TvSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('settings');

  // Layout
  const [layout, setLayout] = useState('split-stream');

  // Audio
  const [tvAudioMode, setTvAudioMode] = useState('silent');
  const [mediaPause, setMediaPause] = useState(true);
  const [showAyahBar, setShowAyahBar] = useState(true);
  const [showRamadanCard, setShowRamadanCard] = useState(true);

  // Background & Effects
  const [skyBackground, setSkyBackground] = useState(true);
  const [geometricPattern, setGeometricPattern] = useState(false);
  const [geometricStyle, setGeometricStyle] = useState('stars');
  const [goodNight, setGoodNight] = useState(false);
  const [goodNightDelay, setGoodNightDelay] = useState(60);

  // Appearance
  const [colorPalette, setColorPalette] = useState('classic');
  const [fontScale, setFontScale] = useState(1.0);

  // Screensaver
  const [screensaverEnabled, setScreensaverEnabled] = useState(false);
  const [photoSource, setPhotoSource] = useState('praycalc');
  const [slideshowDuration, setSlideshowDuration] = useState(60);
  const [screensaverIdleSeconds, setScreensaverIdleSeconds] = useState(300);

  // Iqama
  const [iqamahEnabled, setIqamahEnabled] = useState(false);

  // Location
  const [cityOverride, setCityOverride] = useState(device.locationCitySlug || '');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings from device on mount / when device changes
  useEffect(() => {
    setSettingsLoaded(false);
    setCityOverride(device.locationCitySlug || '');

    async function loadSettings() {
      try {
        const res = await fetch(`/api/dashboard/tvs/${device.id}/settings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const s = data.settings ?? data;

        // Layout — support both flat `layout` string and nested `layoutSettings`
        if (s.layoutSettings?.preset) {
          const match = Object.entries(LAYOUT_SETTINGS_MAP).find(
            ([, v]) => v.preset === s.layoutSettings.preset
          );
          if (match) setLayout(match[0]);
        } else if (typeof s.layout === 'string' && s.layout in LAYOUT_SETTINGS_MAP) {
          setLayout(s.layout);
        }

        if (s.tvAudioMode)       setTvAudioMode(s.tvAudioMode);
        if (typeof s.mediaPauseEnabled === 'boolean') setMediaPause(s.mediaPauseEnabled);
        if (typeof s.showStreamAyahBar === 'boolean') setShowAyahBar(s.showStreamAyahBar);
        if (typeof s.showStreamRamadanOverlay === 'boolean') setShowRamadanCard(s.showStreamRamadanOverlay);

        if (typeof s.skyBackgroundEnabled === 'boolean') setSkyBackground(s.skyBackgroundEnabled);
        if (typeof s.geometricPatternEnabled === 'boolean') setGeometricPattern(s.geometricPatternEnabled);
        if (s.geometricPatternStyle) setGeometricStyle(s.geometricPatternStyle);
        if (typeof s.goodNightEnabled === 'boolean') setGoodNight(s.goodNightEnabled);
        if (typeof s.goodNightDelayMinutes === 'number') setGoodNightDelay(s.goodNightDelayMinutes);

        if (s.colorPalette) setColorPalette(s.colorPalette);
        if (typeof s.tvFontScale === 'number') setFontScale(s.tvFontScale);

        if (typeof s.screensaverIdleSeconds === 'number') {
          const idle = s.screensaverIdleSeconds;
          setScreensaverEnabled(idle > 0);
          if (idle > 0) setScreensaverIdleSeconds(idle);
        }
        if (s.photoSource)                               setPhotoSource(s.photoSource);
        if (typeof s.slideshowDurationSeconds === 'number') setSlideshowDuration(s.slideshowDurationSeconds);

        if (typeof s.iqamahEnabled === 'boolean') setIqamahEnabled(s.iqamahEnabled);

        if (s.citySlugOverride) setCityOverride(s.citySlugOverride);
      } catch {
        // Non-fatal — fall back to defaults
      } finally {
        setSettingsLoaded(true);
      }
    }

    loadSettings();
  }, [device.id, device.locationCitySlug, token]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    setSavedOk(false);
    try {
      const res = await fetch(`/api/dashboard/tvs/${device.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          layout,
          layoutSettings: LAYOUT_SETTINGS_MAP[layout] ?? LAYOUT_SETTINGS_MAP['split-stream'],
          videoAreaSource: VIDEO_AREA_SOURCE_MAP[layout] ?? 'live-stream',

          tvAudioMode,
          mediaPauseEnabled: mediaPause,
          showStreamAyahBar: showAyahBar,
          showStreamRamadanOverlay: showRamadanCard,

          skyBackgroundEnabled: skyBackground,
          geometricPatternEnabled: geometricPattern,
          geometricPatternStyle: geometricStyle,
          goodNightEnabled: goodNight,
          goodNightDelayMinutes: goodNightDelay,

          colorPalette,
          tvFontScale: fontScale,

          screensaverIdleSeconds: screensaverEnabled ? screensaverIdleSeconds : 0,
          photoSource: screensaverEnabled ? photoSource : null,
          slideshowDurationSeconds: screensaverEnabled ? slideshowDuration : null,

          iqamahEnabled,
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

  const FONT_SIZE_OPTIONS = [
    { scale: 0.85, label: 'S' },
    { scale: 1.0,  label: 'M' },
    { scale: 1.15, label: 'L' },
    { scale: 1.3,  label: 'XL' },
  ];

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
                type="button"
                onClick={() => setShowScreenshot(true)}
                className="text-white/40 hover:text-[#C9F27A] px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="View current screen"
              >
                {ICONS.tv}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-white/40 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close settings"
            >
              {ICONS.close}
            </button>
          </div>
        </div>

        {/* Online status strip */}
        <div className={`px-6 py-2 text-xs font-medium flex items-center gap-1.5 ${
          device.isOnline ? 'bg-[#79C24C]/10 text-[#C9F27A]' : 'bg-white/5 text-white/35'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            device.isOnline ? 'bg-[#79C24C]' : 'bg-white/20'
          }`} />
          {device.isOnline ? 'Online — settings apply instantly' : 'Offline — settings saved for next connection'}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-[#79C24C]/10 pb-0">
          {(['settings', 'quran'] as PanelTab[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                activeTab === tab
                  ? 'text-[#C9F27A] border-[#79C24C]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab === 'settings' ? ICONS.settings : ICONS.quran}
              {tab === 'settings' ? 'Settings' : 'Quran'}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 space-y-8">
          {activeTab === 'quran' && (
            <TvQuranPanel deviceId={device.id} isOnline={device.isOnline} />
          )}

          {activeTab === 'settings' && !settingsLoaded && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-[#79C24C]/40 border-t-[#79C24C] rounded-full animate-spin" />
            </div>
          )}

          {activeTab === 'settings' && settingsLoaded && (
            <>
              {/* Layout */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide">Layout</h3>
                  <button
                    type="button"
                    onClick={() => setShowLayoutEditor(v => !v)}
                    className="text-white/35 hover:text-white/60 text-xs transition-colors"
                  >
                    {showLayoutEditor ? 'Hide editor' : 'Custom…'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setLayout(p.id)}
                      className={`relative rounded-xl border p-3 text-left transition-colors ${
                        layout === p.id
                          ? 'border-[#79C24C] bg-[#1E5E2F]/50'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="h-12 mb-2.5 flex">
                        {p.diagram}
                      </div>
                      <p className={`text-xs font-semibold leading-tight ${layout === p.id ? 'text-[#C9F27A]' : 'text-white/70'}`}>
                        {p.name}
                      </p>
                      <p className="text-white/35 text-[10px] leading-tight mt-0.5 line-clamp-2">{p.desc}</p>
                      {p.id === 'split-stream' && layout !== p.id && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] bg-white/10 text-white/40 rounded px-1 py-0.5">default</span>
                      )}
                    </button>
                  ))}
                </div>

                {showLayoutEditor && (
                  <div className="mt-4">
                    <TvLayoutEditor deviceId={device.id} />
                  </div>
                )}
              </section>

              {/* Audio */}
              <section>
                <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">Audio</h3>
                <div className="space-y-1 mb-4">
                  {AUDIO_MODES.map(m => (
                    <label key={m.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`audio-${device.id}`}
                        value={m.id}
                        checked={tvAudioMode === m.id}
                        onChange={() => setTvAudioMode(m.id)}
                        className="accent-[#79C24C]"
                      />
                      <span className="text-white/80 text-sm">{m.label}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-0 border-t border-white/5 pt-3">
                  <ToggleRow
                    label="Pause media during adhan"
                    desc="Mutes stream when adhan plays"
                    enabled={mediaPause}
                    onToggle={() => setMediaPause(v => !v)}
                  />
                  {(tvAudioMode === 'live-stream' || tvAudioMode === 'quran') && (
                    <ToggleRow
                      label="Show Quran verse bar"
                      desc="Overlay ayah text during audio"
                      enabled={showAyahBar}
                      onToggle={() => setShowAyahBar(v => !v)}
                    />
                  )}
                  <ToggleRow
                    label="Show Ramadan card"
                    desc="Suhoor / Iftar countdown in Ramadan"
                    enabled={showRamadanCard}
                    onToggle={() => setShowRamadanCard(v => !v)}
                  />
                </div>
              </section>

              {/* Background & Effects */}
              <section>
                <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-2">Background & Effects</h3>
                <div className="space-y-0">
                  <ToggleRow
                    label="Sky gradient"
                    desc="Sunrise-to-night sky behind prayer times"
                    enabled={skyBackground}
                    onToggle={() => setSkyBackground(v => !v)}
                  />
                  <ToggleRow
                    label="Geometric pattern"
                    desc="Animated Islamic geometric overlay"
                    enabled={geometricPattern}
                    onToggle={() => setGeometricPattern(v => !v)}
                  />
                  {geometricPattern && (
                    <div className="pl-1 border-l-2 border-[#79C24C]/20 ml-1 mt-2 mb-1">
                      <label htmlFor={`geo-style-${device.id}`} className="text-white/50 text-xs mb-1.5 block">Pattern style</label>
                      <select
                        id={`geo-style-${device.id}`}
                        value={geometricStyle}
                        onChange={e => setGeometricStyle(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                      >
                        {GEOMETRIC_STYLES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <ToggleRow
                    label="Good Night mode"
                    desc="Dim screen late at night after Isha"
                    enabled={goodNight}
                    onToggle={() => setGoodNight(v => !v)}
                  />
                  {goodNight && (
                    <div className="pl-1 border-l-2 border-[#79C24C]/20 ml-1 mt-2 mb-1">
                      <label htmlFor={`gn-delay-${device.id}`} className="text-white/50 text-xs mb-1.5 block">Dim after</label>
                      <select
                        id={`gn-delay-${device.id}`}
                        value={goodNightDelay}
                        onChange={e => setGoodNightDelay(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                      >
                        {GOOD_NIGHT_DELAYS.map(d => (
                          <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </section>

              {/* Appearance */}
              <section>
                <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">Appearance</h3>
                <div className="mb-4">
                  <p className="text-white/50 text-xs mb-2">Color palette</p>
                  <div className="flex gap-2">
                    {COLOR_PALETTES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setColorPalette(p.id)}
                        title={p.label}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${p.bg} ${
                          colorPalette === p.id ? 'border-[#C9F27A] scale-110' : 'border-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/25 text-xs mt-1.5">
                    {COLOR_PALETTES.find(p => p.id === colorPalette)?.label ?? ''}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-2">Text size</p>
                  <div className="flex gap-1.5">
                    {FONT_SIZE_OPTIONS.map(f => (
                      <button
                        key={f.scale}
                        type="button"
                        onClick={() => setFontScale(f.scale)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          Math.abs(fontScale - f.scale) < 0.01
                            ? 'bg-[#1E5E2F]/60 border-[#79C24C] text-[#C9F27A]'
                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Screensaver */}
              <section>
                <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-2">Screensaver</h3>
                <ToggleRow
                  label="Enable screensaver"
                  desc="Show ambient photos when idle"
                  enabled={screensaverEnabled}
                  onToggle={() => setScreensaverEnabled(v => !v)}
                />
                {screensaverEnabled && (
                  <div className="mt-3 space-y-3 pl-1 border-l-2 border-[#79C24C]/20 ml-1">
                    <div>
                      <label htmlFor={`ss-idle-${device.id}`} className="text-white/50 text-xs mb-1.5 block">Start after</label>
                      <select
                        id={`ss-idle-${device.id}`}
                        value={screensaverIdleSeconds}
                        onChange={e => setScreensaverIdleSeconds(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                      >
                        {SCREENSAVER_IDLE_TIMES.map(i => (
                          <option key={i.id} value={i.id}>{i.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`ss-source-${device.id}`} className="text-white/50 text-xs mb-1.5 block">Photo source</label>
                      <select
                        id={`ss-source-${device.id}`}
                        value={photoSource}
                        onChange={e => setPhotoSource(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                      >
                        {PHOTO_SOURCES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`ss-duration-${device.id}`} className="text-white/50 text-xs mb-1.5 block">Change interval</label>
                      <select
                        id={`ss-duration-${device.id}`}
                        value={slideshowDuration}
                        onChange={e => setSlideshowDuration(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                      >
                        {SLIDESHOW_DURATIONS.map(d => (
                          <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </section>

              {/* Iqama Times */}
              <section>
                <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-2">Iqama Times</h3>
                <ToggleRow
                  label="Show iqama times"
                  desc="Display iqama countdown after adhan"
                  enabled={iqamahEnabled}
                  onToggle={() => setIqamahEnabled(v => !v)}
                />
                {iqamahEnabled && (
                  <div className="mt-4">
                    <IqamahTimesEditor deviceId={device.id} />
                  </div>
                )}
              </section>

              {/* City Override */}
              <section>
                <h3 className="text-[#C9F27A] font-semibold text-sm uppercase tracking-wide mb-3">City Override</h3>
                <input
                  type="text"
                  value={cityOverride}
                  onChange={e => setCityOverride(e.target.value)}
                  placeholder="e.g. new-york-ny-us"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
                />
                <p className="text-white/30 text-xs mt-1.5">Leave blank to use your account location</p>
              </section>
            </>
          )}
        </div>

        {/* Footer — only for settings tab */}
        {activeTab === 'settings' && settingsLoaded && (
          <div className="p-6 border-t border-[#79C24C]/10 space-y-3">
            {saveError && (
              <p className="text-red-400 text-xs text-center">{saveError}</p>
            )}
            {savedOk && (
              <p className="text-[#C9F27A] text-xs text-center">
                {device.isOnline ? 'Settings saved — applying to TV now' : 'Settings saved — will apply when TV reconnects'}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#1E5E2F] hover:bg-[#79C24C]/20 disabled:opacity-50 text-[#C9F27A] font-semibold rounded-xl py-3.5 transition-colors border border-[#79C24C]/30 text-sm"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <p className="text-white/25 text-xs text-center">
              {device.isOnline ? 'Changes apply within 3 seconds' : 'TV is offline'}
            </p>
          </div>
        )}
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
