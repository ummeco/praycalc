'use client';

import { useState } from 'react';

type PanelType =
  | 'prayer-times'
  | 'live-stream'
  | 'art-slideshow'
  | 'weather'
  | 'qibla'
  | 'moon'
  | 'hadith-ticker'
  | 'announcement'
  | 'quran'
  | 'none';

type LayoutZones = {
  left: PanelType;
  right: PanelType;
  top: PanelType;
  bottom: PanelType;
};

const PANEL_OPTIONS: { value: PanelType; label: string }[] = [
  { value: 'none', label: '— Empty —' },
  { value: 'prayer-times', label: 'Prayer Times' },
  { value: 'live-stream', label: 'Live Stream' },
  { value: 'art-slideshow', label: 'Art Slideshow' },
  { value: 'weather', label: 'Weather' },
  { value: 'qibla', label: 'Qibla' },
  { value: 'moon', label: 'Moon Phase' },
  { value: 'hadith-ticker', label: 'Hadith Ticker' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'quran', label: 'Quran' },
];

type ZoneSelectProps = {
  label: string;
  value: PanelType;
  onChange: (v: PanelType) => void;
};

function ZoneSelect({ label, value, onChange }: ZoneSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-white/50 text-xs">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as PanelType)}
        className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:border-[#79C24C]/50 outline-none"
      >
        {PANEL_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

type TvLayoutEditorProps = {
  deviceId: string;
  onApplied?: () => void;
};

export default function TvLayoutEditor({ deviceId, onApplied }: TvLayoutEditorProps) {
  const [zones, setZones] = useState<LayoutZones>({
    left: 'none',
    right: 'prayer-times',
    top: 'none',
    bottom: 'hadith-ticker',
  });
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  function setZone(zone: keyof LayoutZones) {
    return (value: PanelType) => setZones(z => ({ ...z, [zone]: value }));
  }

  async function handleApply() {
    setIsApplying(true);
    setError(null);
    setApplied(false);
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/layout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zones),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
      onApplied?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply layout');
    } finally {
      setIsApplying(false);
    }
  }

  const panelLabel = (p: PanelType) =>
    PANEL_OPTIONS.find(o => o.value === p)?.label ?? p;

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-4">
      <p className="text-white/50 text-xs">Assign content panels to each screen zone.</p>

      {/* Visual layout preview */}
      <div className="space-y-1.5">
        {/* Top */}
        <div className="h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 text-white/40 text-xs">
          {zones.top !== 'none' ? panelLabel(zones.top) : 'Top (empty)'}
        </div>

        {/* Left + Right */}
        <div className="flex gap-1.5 h-20">
          <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 text-white/40 text-xs text-center px-1">
            {zones.left !== 'none' ? panelLabel(zones.left) : 'Left (empty)'}
          </div>
          <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 text-white/40 text-xs text-center px-1">
            {zones.right !== 'none' ? panelLabel(zones.right) : 'Right (empty)'}
          </div>
        </div>

        {/* Bottom */}
        <div className="h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 text-white/40 text-xs">
          {zones.bottom !== 'none' ? panelLabel(zones.bottom) : 'Bottom (empty)'}
        </div>
      </div>

      {/* Zone selectors */}
      <div className="grid grid-cols-2 gap-3">
        <ZoneSelect label="Top bar" value={zones.top} onChange={setZone('top')} />
        <ZoneSelect label="Bottom bar" value={zones.bottom} onChange={setZone('bottom')} />
        <ZoneSelect label="Left panel" value={zones.left} onChange={setZone('left')} />
        <ZoneSelect label="Right panel" value={zones.right} onChange={setZone('right')} />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {applied && <p className="text-[#C9F27A] text-xs">Layout applied to TV</p>}

      <button
        onClick={handleApply}
        disabled={isApplying}
        className="w-full bg-[#1E5E2F]/60 hover:bg-[#1E5E2F] disabled:opacity-50 text-[#C9F27A] text-xs font-medium rounded-lg py-2 transition-colors border border-[#79C24C]/20"
      >
        {isApplying ? 'Applying...' : 'Apply Layout'}
      </button>
    </div>
  );
}
