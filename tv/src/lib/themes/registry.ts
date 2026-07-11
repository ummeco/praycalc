/**
 * Purpose: Dashboard color theme token registry. Each theme is a fixed set of 7 semantic
 *   color tokens consumed by the layout/rail/pane components via useTheme(). 'ummat-green'
 *   is byte-identical to the pre-T4-3 hardcoded hex values used across DashboardScreen's
 *   pane/rail components (grep-verified), so switching those components to token-driven
 *   styling is a zero-visual-diff refactor when the theme is left at its default.
 * Inputs: a TvThemeId (from settings.theme, synced via pc_tv_settings.theme).
 * Outputs: a TvThemeTokens object.
 * Constraints: accent_color (per-TV, user-set) is NOT part of the theme — it stays the
 *   next-prayer highlight override on top of whichever theme is active, unchanged. Pure
 *   white text/labels (e.g. clock digits) are intentionally left out of the token set and
 *   stay hardcoded '#FFFFFF' in components — they are neutral high-contrast readouts, not
 *   theme-differentiating brand colors.
 * SPORT: praycalc/tv lib/themes
 */

import { TvThemeId } from '../../types';

export interface TvThemeTokens {
  /** Root/deepest background — screen backdrop, takeover overlays. */
  bg: string;
  /** One step lighter than bg — pane/rail/bar backgrounds. */
  surface: string;
  /** Card/row backgrounds and the shared border/divider color source. */
  surfaceAlt: string;
  /** Divider/border color (may equal surfaceAlt). */
  border: string;
  /** Bright headline text (city name, prayer times, titles). */
  textPrimary: string;
  /** Muted/secondary text (labels, captions, clock subtext). */
  textSecondary: string;
  /** Brand wordmark / hero accent text. */
  brandText: string;
}

/** 'ummat-green' values are the exact pre-existing hex constants (#0D2F17/#123d1f/#1E5E2F/#C9F27A/#79C24C). */
export const THEMES: Record<TvThemeId, TvThemeTokens> = {
  'ummat-green': {
    bg: '#0D2F17',
    surface: '#123d1f',
    surfaceAlt: '#1E5E2F',
    border: '#1E5E2F',
    textPrimary: '#C9F27A',
    textSecondary: '#79C24C',
    brandText: '#C9F27A',
  },
  midnight: {
    bg: '#05070F',
    surface: '#0D1220',
    surfaceAlt: '#1A2338',
    border: '#2A3550',
    textPrimary: '#E5EAFF',
    textSecondary: '#8FA3D9',
    brandText: '#7FA8FF',
  },
  'warm-sand': {
    bg: '#2B1E12',
    surface: '#3A2A18',
    surfaceAlt: '#513C22',
    border: '#6B4F2C',
    textPrimary: '#FCEBC8',
    textSecondary: '#D9A85C',
    brandText: '#F2C572',
  },
  mono: {
    bg: '#0A0A0A',
    surface: '#161616',
    surfaceAlt: '#262626',
    border: '#3A3A3A',
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    brandText: '#FFFFFF',
  },
};

/** Resolves theme tokens for `id`, falling back to 'ummat-green' when unknown. */
export function getTheme(id: TvThemeId): TvThemeTokens {
  return THEMES[id] ?? THEMES['ummat-green'];
}
