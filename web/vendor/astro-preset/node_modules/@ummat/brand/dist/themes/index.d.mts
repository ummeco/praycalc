import { T as Theme, a as ThemeName } from '../types-BL6p6X42.mjs';

declare const defaultTheme: Theme;

declare const ramadanTheme: Theme;

declare const eidTheme: Theme;

declare const muharramTheme: Theme;

declare const dhulHijjahTheme: Theme;

/**
 * FILE: packages/brand/src/themes/index.ts
 * PURPOSE: Aggregated theme exports + lookup table.
 * INVARIANTS: themes map keys MUST match ThemeName union exactly.
 * REF: T-P7-C-S10-T06
 */

declare const themes: Record<ThemeName, Theme>;
/**
 * Resolve a ThemeName to a Theme. Falls back to default on unknown input.
 */
declare function getTheme(name: ThemeName | string | null | undefined): Theme;

export { Theme, ThemeName, defaultTheme, dhulHijjahTheme, eidTheme, getTheme, muharramTheme, ramadanTheme, themes };
