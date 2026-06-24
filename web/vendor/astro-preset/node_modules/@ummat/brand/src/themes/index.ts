/**
 * FILE: packages/brand/src/themes/index.ts
 * PURPOSE: Aggregated theme exports + lookup table.
 * INVARIANTS: themes map keys MUST match ThemeName union exactly.
 * REF: T-P7-C-S10-T06
 */

export type { Theme, ThemeName } from './types'
export { defaultTheme } from './default'
export { ramadanTheme } from './ramadan'
export { eidTheme } from './eid'
export { muharramTheme } from './muharram'
export { dhulHijjahTheme } from './dhul-hijjah'

import { defaultTheme } from './default'
import { ramadanTheme } from './ramadan'
import { eidTheme } from './eid'
import { muharramTheme } from './muharram'
import { dhulHijjahTheme } from './dhul-hijjah'
import type { Theme, ThemeName } from './types'

export const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
  ramadan: ramadanTheme,
  eid: eidTheme,
  muharram: muharramTheme,
  'dhul-hijjah': dhulHijjahTheme,
} as const

/**
 * Resolve a ThemeName to a Theme. Falls back to default on unknown input.
 */
export function getTheme(name: ThemeName | string | null | undefined): Theme {
  if (!name) return defaultTheme
  const t = themes[name as ThemeName]
  return t ?? defaultTheme
}
