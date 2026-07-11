/**
 * TvLayoutThemePicker.tsx — Layout & Theme picker rendered atop TvDeepSettingsEditor.
 *
 * PURPOSE: Lets the signed-in user pick the TV's on-screen layout (classic/flipped/
 *   stream-full/times-only/ambient) and color theme (ummat-green/midnight/warm-sand/
 *   mono) for one paired TV. Mirrors desktop/src/components/TvLayoutThemePicker.tsx and
 *   mobile/src/features/tv-manager/TvLayoutThemePicker.tsx field-for-field (same 5
 *   layouts, same 4 themes, same swatch hexes) so all three "My TVs" surfaces present
 *   identical choices.
 * INPUTS: tv (current TvSetting row, for tv.layout/tv.theme) · onPatch(patch) — the same
 *   immediate-apply handler TvDeepSettingsEditor already wires to updateTv().
 * OUTPUTS: none — calls onPatch immediately on each radio selection (no local draft
 *   state, matching the madhab/time-format/calc-method select pattern).
 * CONSTRAINTS: Astro island subcomponent. No next/* imports. Each layout thumbnail is a
 *   tiny inline SVG sketch of the arrangement (2/3+1/3 split, mirrored split, full-bleed
 *   + bottom strip, 2x2 grid, centered ambient dot) — no external image assets.
 * REF: src/islands/account/TvDeepSettingsEditor.tsx (renders this first) ·
 *   src/lib/tv/client.ts (TvLayout/TvTheme types) ·
 *   desktop/src/components/TvLayoutThemePicker.tsx · mobile counterpart (field parity)
 */

import type { TvSetting, TvSettingPatch, TvLayout, TvTheme } from '@/lib/tv/client';

const LAYOUT_OPTIONS: { value: TvLayout; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Times + live stream side-by-side' },
  { value: 'flipped', label: 'Flipped', description: 'Same split, mirrored' },
  { value: 'stream-full', label: 'Stream Full', description: 'Full-screen stream with a times strip' },
  { value: 'times-only', label: 'Times Only', description: 'Prayer times only, no live stream' },
  { value: 'ambient', label: 'Ambient', description: 'Minimal ambient clock display' },
];

const THEME_OPTIONS: { value: TvTheme; label: string; swatches: string[] }[] = [
  { value: 'ummat-green', label: 'Ummat Green', swatches: ['#0D2F17', '#1E5E2F', '#79C24C', '#C9F27A'] },
  { value: 'midnight', label: 'Midnight', swatches: ['#05070a', '#0d1117', '#3fb950', '#aff5b4'] },
  { value: 'warm-sand', label: 'Warm Sand', swatches: ['#14100b', '#241c12', '#d4a24c', '#f2dcb3'] },
  { value: 'mono', label: 'Mono', swatches: ['#0a0a0a', '#181818', '#bdbdbd', '#f5f5f5'] },
];

/** Tiny inline SVG sketch of a layout's on-screen arrangement — no external assets. */
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
  tv: TvSetting;
  onPatch: (patch: TvSettingPatch) => void;
}) {
  return (
    <div className="dashboard-tv-layout-theme">
      <div className="dashboard-tv-field">
        <span className="dashboard-tv-label">Layout</span>
        <div className="dashboard-tv-layout-grid" role="radiogroup" aria-label="Layout">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={tv.layout === opt.value}
              aria-label={opt.label}
              className={`dashboard-tv-layout-card${
                tv.layout === opt.value ? ' dashboard-tv-layout-card--active' : ''
              }`}
              onClick={() => onPatch({ layout: opt.value })}
            >
              <LayoutThumbnail variant={opt.value} />
              <span className="dashboard-tv-layout-card-title">{opt.label}</span>
              <span className="dashboard-tv-layout-card-desc">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-tv-field">
        <span className="dashboard-tv-label">Theme</span>
        <div className="dashboard-tv-theme-grid" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={tv.theme === opt.value}
              aria-label={opt.label}
              className={`dashboard-tv-theme-card${
                tv.theme === opt.value ? ' dashboard-tv-theme-card--active' : ''
              }`}
              onClick={() => onPatch({ theme: opt.value })}
            >
              <span className="dashboard-tv-theme-swatches">
                {opt.swatches.map((hex) => (
                  <span key={hex} className="dashboard-tv-theme-swatch" style={{ backgroundColor: hex }} />
                ))}
              </span>
              <span className="dashboard-tv-theme-card-title">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
