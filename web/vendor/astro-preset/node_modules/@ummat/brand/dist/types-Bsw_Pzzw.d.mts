/**
 * FILE: packages/brand/src/apps/types.ts
 * PURPOSE: Shared types for per-app brand configurations.
 * INVARIANTS:
 *   - Every per-app config MUST conform to BrandConfig.
 *   - `primaryColor` MUST reference a value from the canonical green scale.
 *   - `dbPrefix` MUST match the value in PPI (pc_, iw_, ci_, ua_, up_, uc_, fl_).
 * DO NOT: add fields without updating ALL eight per-app configs.
 * REF: T-P7-C-S10-01, PPI database prefixes
 */
type DbPrefix = 'pc_' | 'iw_' | 'ci_' | 'ua_' | 'up_' | 'uc_' | 'fl_' | '';
interface BrandConfig {
    /** Internal app key, kebab-case. */
    readonly appKey: string;
    /** Display name shown in stores, headers, and OG cards. */
    readonly appName: string;
    /** Production primary domain (no scheme). */
    readonly domain: string;
    /** Primary brand color hex. Always from the canonical green scale. */
    readonly primaryColor: string;
    /** Background tone used in splash + OG cards. */
    readonly backgroundColor: string;
    /** Foreground/contrast tone for primary text on backgroundColor. */
    readonly foregroundColor: string;
    /** Logo SVG path relative to packages/brand. */
    readonly logo: string;
    /** One-line tagline used on landing pages, store listings, and OG cards. */
    readonly tagline: string;
    /** Public PostgreSQL table prefix per PPI (empty for global apps). */
    readonly dbPrefix: DbPrefix;
}

export type { BrandConfig as B, DbPrefix as D };
