/**
 * Purpose: Resolve the active color palette (light/dark) for the current render —
 *   the single entry point every screen/component uses instead of importing
 *   `Colors` directly, so the whole app reacts to theme changes.
 * Inputs: settings.themeMode ('system' | 'light' | 'dark') from useSettingsStore;
 *   the OS color scheme via react-native's useColorScheme().
 * Outputs: ThemeColors — Colors (light) or DarkColors (dark), resolved per the rule:
 *   'system' follows the OS appearance, 'light'/'dark' force that palette regardless
 *   of the OS setting.
 * Constraints: Must not read AsyncStorage directly — themeMode is already hydrated
 *   by useSettingsStore's persist middleware. Re-renders on OS appearance change
 *   (useColorScheme subscribes to Appearance) and on themeMode change.
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-useThemeColors
 */

import { useColorScheme } from 'react-native';
import { Colors, DarkColors, type ThemeColors } from '../constants/colors';
import { useSettingsStore } from '../features/settings/store/useSettingsStore';

export function useThemeColors(): ThemeColors {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const systemScheme = useColorScheme();

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  return isDark ? DarkColors : Colors;
}
