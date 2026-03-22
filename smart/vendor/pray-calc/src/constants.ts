/**
 * Shared constants for pray-calc.
 */

/** Degrees-to-radians conversion factor. */
export const DEG = Math.PI / 180;

/**
 * Minutes added to solar noon to obtain Dhuhr time.
 *
 * Standard practice adds a small buffer after geometric solar transit to
 * ensure the sun has clearly passed the meridian before Dhuhr begins.
 * The 2.5-minute convention is widely used across Islamic timekeeping
 * authorities and accounts for the sun's angular diameter (~0.5°) plus
 * a small safety margin.
 */
export const DHUHR_OFFSET_MINUTES = 2.5;

/**
 * Minimum allowed dynamic twilight depression angle (degrees).
 *
 * At very high latitudes in summer the MCW base angle can drop below
 * physically meaningful values. 10° is the lower clamp — below this
 * the sky is too bright for any twilight definition.
 */
export const ANGLE_MIN = 10;

/**
 * Maximum allowed dynamic twilight depression angle (degrees).
 *
 * 22° is the upper clamp. Values above ~20° correspond to deep
 * astronomical twilight where the sky is indistinguishable from full
 * night. No standard method exceeds 20° for Fajr.
 */
export const ANGLE_MAX = 22;
