/**
 * Purpose: Single canonical Date -> localized clock-string formatter, respecting the
 *   user's 12h/24h `timeFormat` setting and the active i18n locale. Every user-facing
 *   surface that renders a prayer/alarm time (prayer list, share text, notifications,
 *   home-screen widget, per-prayer alert rows) goes through this one function instead
 *   of a hardcoded 'en-US'/hour12 literal (see W5 finding MOB-6).
 * Inputs: Date, TimeFormat ('12h' | '24h'), BCP-47 locale string.
 * Outputs: Locale-correct time string (e.g. "5:03 PM" / "17:03").
 * Constraints: Pure function, no React/i18next import — callers pass locale explicitly
 *   (usually i18next.language or useSettingsStore's locale) so this stays unit-testable
 *   without mocking i18next.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-format-time
 */

import type { TimeFormat } from '../types/prayer';

export function formatTime(date: Date, format: TimeFormat, locale: string): string {
  if (format === '24h') {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
}
