/**
 * @praycalc/ui-utils — shared clamp/format helpers.
 *
 * Purpose: Single home for small pure UI helpers that were being
 *          re-implemented verbatim across web/desktop/mobile/tv surfaces.
 * Outputs: All public helpers.
 * Constraints: zero runtime dependencies; ESM + CJS + types.
 */

export { clamp, clampRotateMinutes, clampMinutes1to60 } from "./clamp.js";
