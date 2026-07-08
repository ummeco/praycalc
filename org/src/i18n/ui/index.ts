/**
 * FILE:        praycalc/org/src/i18n/ui/index.ts
 * PURPOSE:     UI string translations for praycalc.org docs site.
 *              Covers layout labels, aria strings, nav, and site chrome.
 *              Consumed by Base.astro, Docs.astro, SidebarNav.astro.
 *              Per-locale strings live in sibling files (./en.ts, ./ar.ts, etc.)
 *              and are re-exported here so `@/i18n/ui` keeps its public shape.
 * CONSTRAINTS:
 *   - Required locales: en, ar, ur, fa, id (100% coverage gate — AC-01)
 *   - RTL locales: ar, ur, fa (dir="rtl" applied in Base.astro)
 *   - Islamic/prayer terms sourced from theology-standards.md §4
 * REF:         P2-E6-W01-S01-T01 AC-01
 */

import { en } from './en'
import { ar } from './ar'
import { ur } from './ur'
import { fa } from './fa'
import { id } from './id'

export const LOCALES = ['en', 'ar', 'ur', 'fa', 'id'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const RTL_LOCALES: Locale[] = ['ar', 'ur', 'fa']

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  fa: 'فارسی',
  id: 'Bahasa Indonesia',
}

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale)
}

/**
 * UI string translations for all supported locales.
 * Keys mirror the islamwiki pattern for cross-project consistency.
 */
export const ui = { en, ar, ur, fa, id } as const

/**
 * Get a UI string for a locale by dot-path key.
 * Falls back to English if key is missing.
 */
export function t(locale: string, key: string): string {
  const safeLocale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE
  const parts = key.split('.')
  let value: unknown = ui[safeLocale]
  for (const part of parts) {
    if (value == null || typeof value !== 'object') break
    value = (value as Record<string, unknown>)[part]
  }
  if (typeof value === 'string') return value
  // Fallback to English
  let fallback: unknown = ui.en
  for (const part of parts) {
    if (fallback == null || typeof fallback !== 'object') break
    fallback = (fallback as Record<string, unknown>)[part]
  }
  return typeof fallback === 'string' ? fallback : key
}
