/**
 * Purpose: Smoke render test for StatsScreen — the first `.tsx` render test in this
 *   suite (all prior tests exercise pure logic modules only). Asserts the screen
 *   mounts without throwing given a non-empty completions log, exercising the
 *   streak/chart/cross-feature-summary render path in one pass.
 * Inputs: Mocked ../../i18n (key-echo `t`), ../../hooks/useThemeColors (static light
 *   palette), ../../hooks/useResponsiveLayout (phone layout), ../../lib/completions
 *   (fixed completion log), expo-router (no-op useFocusEffect/router), and the
 *   fasting/qada zustand stores (empty state) — every native-module-backed
 *   dependency StatsScreen touches, so the test runs without device/native mocks.
 * Outputs: Pass/fail — no assertions beyond "rendered without throwing".
 * Constraints: Requires @testing-library/react-native (devDependency, not yet
 *   installed as of this commit — see mobile/package.json). This file is syntactically
 *   valid and type-correct against the library's public API, but has not been run
 *   yet; validate with `pnpm test` after the central `pnpm install` picks up the
 *   new devDependency.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import type { PrayerCompletion } from '../../../lib/completions';

// --- i18n: key-echo t(), matching the pattern used by
// PrayerNotificationService.test.ts / analytics-consent-gate.test.ts — avoids
// pulling in expo-localization + react-native-mmkv + 21 bundled locale catalogs.
jest.mock('../../../i18n', () => ({
  __esModule: true,
  default: { language: 'en' },
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (!options) return key;
      return Object.entries(options).reduce(
        (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
        key,
      );
    },
  }),
}));

// --- Theme: static light palette (the real Colors constant — pure data, no
// native deps) instead of exercising useSettingsStore + useColorScheme.
jest.mock('../../../hooks/useThemeColors', () => ({
  useThemeColors: () => require('../../../constants/colors').Colors,
}));

// --- Layout: fixed phone-width layout (isWide: false).
jest.mock('../../../hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: () => ({
    width: 375,
    height: 812,
    isWide: false,
    maxContentWidth: 680,
  }),
}));

// --- expo-router: StatsScreen only needs useFocusEffect (no-op is fine — the
// screen's initial completions come from the useState lazy initializer below)
// and router.push (never invoked during render, only from onPress handlers).
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  router: { push: jest.fn() },
}));

// --- MMKV-backed completions log — fixed fixture, no real storage touched.
const mockCompletions: PrayerCompletion[] = [
  { date: new Date().toISOString().slice(0, 10), prayerName: 'Fajr', completedAt: Date.now() },
  { date: new Date().toISOString().slice(0, 10), prayerName: 'Dhuhr', completedAt: Date.now() },
];
jest.mock('../../../lib/completions', () => ({
  loadCompletions: jest.fn(() => mockCompletions),
}));

// --- Cross-feature summary stores (read-only selectors) — empty state, same
// shape as their real zustand `create()` state.
jest.mock('../../fasting/store/useFastingStore', () => ({
  useFastingStore: (selector: (s: { logs: unknown[] }) => unknown) => selector({ logs: [] }),
}));
jest.mock('../../qada/store/useQadaStore', () => {
  // eslint-disable-next-line global-require
  const { emptyQadaCounts } = require('../../qada/qadaLogic');
  return {
    useQadaStore: (selector: (s: { counts: unknown }) => unknown) =>
      selector({ counts: emptyQadaCounts() }),
  };
});

// eslint-disable-next-line import/first
import StatsScreen from '../StatsScreen';

describe('StatsScreen (render smoke)', () => {
  it('renders without throwing given a non-empty completions log', () => {
    expect(() => render(<StatsScreen />)).not.toThrow();
  });

  it('shows the day-streak stat card', () => {
    const { getByText } = render(<StatsScreen />);
    // key-echo t() returns the raw i18n key — asserts the label slot rendered.
    expect(getByText('screens.stats.dayStreak')).toBeTruthy();
  });
});
