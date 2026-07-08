/**
 * Purpose: One paired-TV card in the My TVs tab — name/accent-color/stream-source/
 *   rotation/weather fields plus an inline two-step delete confirm. Deep-settings fields
 *   are rendered via `children` (TvManager passes <TvDeepSettingsEditor/>) so this file
 *   and TvManager.tsx both stay under the 300-line cap.
 * Inputs: tv (current TvSettings row), saving/confirmingDelete flags, onPatch/
 *   onDeleteRequest/onDeleteCancel/onDeleteConfirm handlers (all owned by TvManager),
 *   children (deep-settings editor block, rendered after the basic fields).
 * Outputs: renders the row; calls the parent-supplied handlers on interaction.
 * Constraints: no `any`; matches TvManager's dark-green Tailwind conventions; delete uses
 *   an inline two-step confirm (no modal component exists in this app) instead of
 *   window.confirm, which does not render inside the tray webview shell.
 * SPORT: praycalc desktop — TV management (row UI).
 */
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TvSettings, TvSettingsPatch, TvStreamSource } from '../lib/tv-types';
import { ACCENT_COLOR_PRESETS, ACCENT_COLOR_NAMES, STREAM_SOURCE_OPTIONS, MIN_ROTATE_MINUTES, MAX_ROTATE_MINUTES } from '../lib/tv-types';

export default function TvRow({
  tv,
  saving,
  confirmingDelete,
  onPatch,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
  children,
}: {
  tv: TvSettings;
  saving: boolean;
  confirmingDelete: boolean;
  onPatch: (patch: TvSettingsPatch) => void;
  onDeleteRequest: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  children?: ReactNode;
}) {
  const [name, setName] = useState(tv.name);

  useEffect(() => {
    setName(tv.name);
  }, [tv.name]);

  return (
    <div className="bg-brand-deep border border-brand-dark rounded px-3 py-2.5 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() && name !== tv.name) onPatch({ name: name.trim() });
          }}
          className="flex-1 min-w-0 bg-transparent border-b border-brand-dark text-sm text-green-100 font-medium focus:outline-none focus:border-brand-mid px-0.5 py-0.5"
          placeholder="TV name"
        />
        {saving && <span className="text-[10px] text-green-300/60 flex-shrink-0">Saving…</span>}
      </div>

      <div>
        <span className="text-[11px] text-green-300/60 block mb-1">Accent color</span>
        <div className="flex gap-1.5">
          {ACCENT_COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => onPatch({ accent_color: color })}
              className={`w-5 h-5 rounded-full transition-transform ${
                tv.accent_color === color ? 'ring-2 ring-offset-1 ring-offset-brand-deep ring-brand-light scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={ACCENT_COLOR_NAMES[color] ?? color}
              aria-pressed={tv.accent_color === color}
            />
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Stream source</span>
        <select
          value={tv.stream_source}
          onChange={(e) => onPatch({ stream_source: e.target.value as TvStreamSource })}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
        >
          {STREAM_SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Rotate every (minutes)</span>
        <input
          type="number"
          min={MIN_ROTATE_MINUTES}
          max={MAX_ROTATE_MINUTES}
          value={tv.rotate_minutes}
          onChange={(e) => {
            const v = Math.min(MAX_ROTATE_MINUTES, Math.max(MIN_ROTATE_MINUTES, parseInt(e.target.value, 10) || MIN_ROTATE_MINUTES));
            onPatch({ rotate_minutes: v });
          }}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
        />
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={tv.show_weather}
          onChange={(e) => onPatch({ show_weather: e.target.checked })}
          className="accent-brand-mid w-4 h-4"
        />
        <span className="text-sm text-green-200/90">Show weather</span>
      </label>

      {children}

      <div className="pt-1 border-t border-brand-dark/40">
        {confirmingDelete ? (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-red-400">Remove this TV?</span>
            <div className="flex gap-2">
              <button
                onClick={onDeleteCancel}
                className="text-white/55 hover:text-white/70 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirm}
                className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onDeleteRequest}
            className="text-white/55 hover:text-red-400 text-xs transition-colors"
          >
            Remove TV
          </button>
        )}
      </div>
    </div>
  );
}
