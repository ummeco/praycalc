/**
 * FILE: packages/brand/src/themes/types.ts
 * PURPOSE: Theme contract for @ummat/brand seasonal variants.
 * INVARIANTS:
 *   - cssVars keys MUST be valid CSS custom properties (start with `--`).
 *   - Theme name MUST match one of the union literals in ThemeName.
 * REF: T-P7-C-S10-T06
 */
type ThemeName = 'default' | 'ramadan' | 'eid' | 'muharram' | 'dhul-hijjah';
interface Theme {
    readonly name: ThemeName;
    readonly displayName: string;
    readonly cssVars: Readonly<Record<string, string>>;
    /** Optional decorative motif slug (e.g. 'crescent', 'kaaba'). UI may render or ignore. */
    readonly motif: string | null;
    readonly notes: string;
}

export type { Theme as T, ThemeName as a };
