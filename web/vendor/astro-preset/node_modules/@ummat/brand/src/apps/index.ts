/**
 * FILE: packages/brand/src/apps/index.ts
 * PURPOSE: Aggregated per-app brand configs. Use as `brands[appKey]` lookup.
 * INVARIANTS: every app key here MUST match the entry in package.json exports.
 * REF: T-P7-C-S10-01
 */

export type { BrandConfig, DbPrefix } from './types'
export { praycalc } from './praycalc'
export { islamwiki } from './islamwiki'
export { chatislam } from './chatislam'
export { flock } from './flock'
export { ummatApp } from './ummatApp'
export { ummatPro } from './ummatPro'
export { ummatChat } from './ummatChat'

import { praycalc } from './praycalc'
import { islamwiki } from './islamwiki'
import { chatislam } from './chatislam'
import { flock } from './flock'
import { ummatApp } from './ummatApp'
import { ummatPro } from './ummatPro'
import { ummatChat } from './ummatChat'

export const brands = {
  praycalc,
  islamwiki,
  chatislam,
  flock,
  ummatApp,
  ummatPro,
  ummatChat,
} as const

export type Brands = typeof brands
export type BrandKey = keyof Brands
