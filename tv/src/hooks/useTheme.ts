/**
 * Purpose: Reads the active dashboard theme id from settingsStore and resolves it to its
 *   token set for layout/rail/pane components.
 * Inputs: none — subscribes to settingsStore's settings.theme field.
 * Outputs: TvThemeTokens for the currently selected theme (defaults to 'ummat-green').
 * Constraints: Zustand selector — only re-renders consumers when settings.theme changes,
 *   not on every settings patch (e.g. accentColor or location updates).
 * SPORT: praycalc/tv hooks
 */

import { useSettingsStore } from '../stores/settingsStore';
import { getTheme, TvThemeTokens } from '../lib/themes/registry';

export function useTheme(): TvThemeTokens {
  const themeId = useSettingsStore((state) => state.settings.theme);
  return getTheme(themeId);
}
