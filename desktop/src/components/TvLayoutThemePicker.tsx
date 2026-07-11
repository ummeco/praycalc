/**
 * Purpose: "Layout & Theme" picker rendered atop TvDeepSettingsEditor (desktop tray) —
 *   same 5 layouts (classic/flipped/stream-full/times-only/ambient) and 4 themes
 *   (ummat-green/midnight/warm-sand/mono) as web's TvLayoutThemePicker.tsx and mobile's
 *   TvLayoutThemePicker.tsx, immediate-apply via onPatch.
 * Inputs: tv (current TvSettings row, for tv.layout/tv.theme), onPatch(patch) — same
 *   handler TvDeepSettingsEditor already wires to updateTvSettings.
 * Outputs: renders two radiogroups; calls onPatch immediately on each selection (matches
 *   TvRow's accent-color/stream-source immediate-apply pattern).
 * Constraints: no `any`; matches TvManager's dark-green Tailwind conventions. Each layout
 *   thumbnail is a tiny inline SVG sketch of the arrangement — no external assets (same
 *   markup as web's TvLayoutThemePicker.tsx for visual parity).
 * SPORT: praycalc desktop — TV management (layout & theme picker).
 */
import type { TvSettings, TvSettingsPatch, TvLayout } from '../lib/tv-types';
import { LAYOUT_OPTIONS, THEME_OPTIONS } from '../lib/tv-types';

/** Tiny inline SVG sketch of a layout's on-screen arrangement — mirrors web's version. */
function LayoutThumbnail({ variant }: { variant: TvLayout }) {
  const common = { width: 48, height: 30, viewBox: '0 0 48 30', 'aria-hidden': true } as const;
  switch (variant) {
    case 'classic':
      return (
        <svg {...common}>
          <rect x="0" y="0" width="48" height="30" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="2" y="2" width="28" height="26" rx="1" fill="currentColor" opacity="0.35" />
          <rect x="32" y="2" width="14" height="26" rx="1" fill="currentColor" opacity="0.7" />
        </svg>
      );
    case 'flipped':
      return (
        <svg {...common}>
          <rect x="0" y="0" width="48" height="30" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="2" y="2" width="14" height="26" rx="1" fill="currentColor" opacity="0.7" />
          <rect x="18" y="2" width="28" height="26" rx="1" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case 'stream-full':
      return (
        <svg {...common}>
          <rect x="0" y="0" width="48" height="30" rx="2" fill="currentColor" opacity="0.7" />
          <rect x="2" y="22" width="44" height="6" rx="1" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case 'times-only':
      return (
        <svg {...common}>
          <rect x="0" y="0" width="48" height="30" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="2" y="2" width="21" height="12" rx="1" fill="currentColor" opacity="0.35" />
          <rect x="25" y="2" width="21" height="12" rx="1" fill="currentColor" opacity="0.35" />
          <rect x="2" y="16" width="21" height="12" rx="1" fill="currentColor" opacity="0.35" />
          <rect x="25" y="16" width="21" height="12" rx="1" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case 'ambient':
      return (
        <svg {...common}>
          <rect x="0" y="0" width="48" height="30" rx="2" fill="currentColor" opacity="0.15" />
          <circle cx="24" cy="15" r="6" fill="currentColor" opacity="0.7" />
        </svg>
      );
    default:
      return <svg {...common} />;
  }
}

export default function TvLayoutThemePicker({
  tv,
  onPatch,
}: {
  tv: TvSettings;
  onPatch: (patch: TvSettingsPatch) => void;
}) {
  return (
    <div className="space-y-2.5 pb-2 border-b border-brand-dark/40">
      <div>
        <span className="text-[11px] text-green-300/60 block mb-1">Layout</span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Layout">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPatch({ layout: opt.value })}
              role="radio"
              aria-checked={tv.layout === opt.value}
              aria-label={opt.label}
              className={`flex flex-col items-start gap-1 p-2 rounded border text-left text-green-100 transition-colors ${
                tv.layout === opt.value
                  ? 'border-brand-mid bg-brand-mid/10'
                  : 'border-brand-dark hover:border-brand-mid/50'
              }`}
            >
              <LayoutThumbnail variant={opt.value} />
              <span className="text-xs font-medium">{opt.label}</span>
              <span className="text-[10px] text-green-300/60 leading-tight">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] text-green-300/60 block mb-1">Theme</span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPatch({ theme: opt.value })}
              role="radio"
              aria-checked={tv.theme === opt.value}
              aria-label={opt.label}
              className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                tv.theme === opt.value
                  ? 'border-brand-mid bg-brand-mid/10'
                  : 'border-brand-dark hover:border-brand-mid/50'
              }`}
            >
              <span className="flex gap-1 flex-shrink-0">
                {opt.swatches.map((hex) => (
                  <span key={hex} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hex }} />
                ))}
              </span>
              <span className="text-xs font-medium text-green-100">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
