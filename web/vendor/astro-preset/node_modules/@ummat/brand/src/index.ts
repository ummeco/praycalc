/**
 * FILE: packages/brand/src/index.ts
 * PURPOSE: Public entry for @ummat/brand. Re-exports tokens, themes, seasonal logic, apps,
 *   Tailwind preset.
 * INVARIANTS: this file MUST stay shallow — only re-exports. No logic.
 * REF: T-P7-C-S10-01
 */

export * from './tokens'
export * from './themes'
export * from './seasonal'
export * from './apps'
export { default as ummatBrandPreset } from './tailwind-preset'
