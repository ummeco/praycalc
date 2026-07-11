/**
 * Numeric clamp helpers shared across the web, desktop, mobile, and tv surfaces.
 *
 * Purpose: Constrain a number into an inclusive [min, max] range. `clamp` is the
 *   generic form (no rounding, no NaN handling — caller supplies a pre-validated
 *   number). `clampRotateMinutes` and `clampMinutes1to60` are the TV-settings
 *   domain variants that additionally round to the nearest integer and fall back
 *   to a default when the input is not finite (e.g. NaN from a bad DB row or
 *   empty input field).
 * Inputs: value (number), min/max (number) or a fallback (number) for the
 *   domain variants.
 * Outputs: a number guaranteed to lie within the documented range.
 * Constraints: pure functions, zero dependencies. Do not add surface-specific
 *   behavior here (e.g. locale formatting, i18n) — this file is for numeric
 *   clamping only.
 * SPORT: praycalc packages/ui-utils clamp
 */
/** Generic inclusive clamp — no rounding, no NaN handling. */
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
/**
 * rotate_minutes is clamped to the supported 1-30 range. Non-finite input
 * (e.g. NaN) falls back to 10. Rounds to the nearest integer.
 */
export function clampRotateMinutes(value) {
    if (!Number.isFinite(value))
        return 10;
    return Math.min(30, Math.max(1, Math.round(value)));
}
/**
 * countdown_minutes / name_only_minutes are clamped to the supported 1-60
 * range. Non-finite input (e.g. NaN) falls back to the caller-supplied
 * default. Rounds to the nearest integer.
 */
export function clampMinutes1to60(value, fallback) {
    if (!Number.isFinite(value))
        return fallback;
    return Math.min(60, Math.max(1, Math.round(value)));
}
