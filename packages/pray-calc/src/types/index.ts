/**
 * Core types for @acamarata/pray-calc.
 *
 * Purpose: Shared TypeScript interfaces and enums for prayer time calculation.
 * Inputs: N/A (type definitions only)
 * Outputs: Exported types consumed by all algorithm modules.
 * Constraints: Zero runtime dependencies; strict TypeScript.
 */

/**
 * Asr shadow convention: Shafi'i/Maliki/Hanbali (1x) or Hanafi (2x).
 */
export enum AsrConvention {
  shafii = "shafii",
  hanafi = "hanafi",
}

/**
 * Shafaq variant for MSC Isha model.
 * - general: combines ahmer + abyad criteria
 * - ahmer: red twilight (shafaq ahmar)
 * - abyad: white twilight (shafaq abyad)
 */
export enum ShafaqMode {
  general = "general",
  ahmer = "ahmer",
  abyad = "abyad",
}

/**
 * High-latitude rule for locations where twilight may be unreachable.
 * - angleBased: use fraction of night scaled by twilight angle
 * - oneSeventh: Fajr/Isha = 1/7 of the night
 * - middleOfNight: Fajr/Isha split at midnight
 * - twilight: dynamic method — no override needed (default when defined angles work)
 */
export enum HighLatitudeRule {
  /** No rule applied — use computed times directly. */
  none = "none",
  /** Fajr/Isha = angle / 60 * night length from midnight. */
  angleBased = "angleBased",
  /** Fajr/Isha offset = 1/7 of the night. */
  oneSeventh = "oneSeventh",
  /** Fajr = midnight - nightHalf, Isha = midnight + nightHalf. */
  middleOfNight = "middleOfNight",
}

/**
 * Computed twilight depression angles for Fajr and Isha.
 * Positive degrees = sun is below the horizon.
 */
export interface TwilightAngles {
  /** Solar depression angle for Fajr (positive degrees below horizon). */
  readonly fajrAngle: number;
  /** Solar depression angle for Isha (positive degrees below horizon). */
  readonly ishaAngle: number;
}

/**
 * Prayer times as fractional hours (local time, based on UTC offset).
 * NaN = event unreachable (polar day/night).
 */
export interface PrayerTimes {
  /** Start of the last third of the night (Qiyam al-Layl). */
  readonly qiyam: number;
  /** True dawn (Subh Sadiq). */
  readonly fajr: number;
  /** Astronomical sunrise. */
  readonly sunrise: number;
  /** Solar noon (exact geometric transit). */
  readonly noon: number;
  /** Dhuhr (2.5 minutes after solar noon). */
  readonly dhuhr: number;
  /** Asr (Shafi'i or Hanafi shadow convention). */
  readonly asr: number;
  /** Maghrib (sunset). */
  readonly maghrib: number;
  /** Isha (nightfall, end of shafaq). */
  readonly isha: number;
  /** Dynamic twilight angles used for this calculation. */
  readonly angles: TwilightAngles;
}

/**
 * Prayer times formatted as HH:MM:SS strings. "N/A" if unreachable.
 */
export interface FormattedPrayerTimes {
  readonly qiyam: string;
  readonly fajr: string;
  readonly sunrise: string;
  readonly noon: string;
  readonly dhuhr: string;
  readonly asr: string;
  readonly maghrib: string;
  readonly isha: string;
  readonly angles: TwilightAngles;
}

/**
 * Solar ephemeris result (Meeus low-precision formulas).
 */
export interface SolarEphemeris {
  /** Solar declination in degrees. */
  readonly decl: number;
  /** Earth-Sun distance in AU. */
  readonly r: number;
  /** Apparent solar ecliptic longitude in radians [0, 2π). */
  readonly eclLon: number;
}

/**
 * NREL SPA result.
 */
export interface SpaResult {
  /** Topocentric zenith angle in degrees. */
  readonly zenith: number;
  /** Topocentric azimuth angle, eastward from north, in degrees. */
  readonly azimuth: number;
  /** Local sunrise time as fractional hours (NaN if polar). */
  readonly sunrise: number;
  /** Local sun transit time (solar noon) as fractional hours. */
  readonly solarNoon: number;
  /** Local sunset time as fractional hours (NaN if polar). */
  readonly sunset: number;
  /** Custom zenith angle results (one per angle in the input list). */
  readonly angles: ReadonlyArray<SpaAnglesResult>;
}

/**
 * Sunrise/sunset pair for a custom zenith angle.
 */
export interface SpaAnglesResult {
  readonly sunrise: number;
  readonly sunset: number;
}

/**
 * Parameters for getTimes().
 */
export interface GetTimesParams {
  /** Observer's local date (time-of-day is ignored). */
  date: Date;
  /** Latitude in decimal degrees (−90 to 90, south = negative). */
  lat: number;
  /** Longitude in decimal degrees (−180 to 180, west = negative). */
  lng: number;
  /** UTC offset in hours (e.g., −5 for EST). */
  tz: number;
  /** Observer elevation in meters (default: 0). */
  elevation?: number;
  /** Ambient temperature in °C (default: 15). */
  temperature?: number;
  /** Atmospheric pressure in mbar/hPa (default: 1013.25). */
  pressure?: number;
  /**
   * Asr convention: shafii (default) or hanafi.
   */
  asrConvention?: AsrConvention;
  /**
   * When true (and asrConvention=hanafi), overrides dynamic angles with
   * fixed Hanafi Fajr=18° / Isha=17°. Ignored for shafii.
   */
  hanafiAngles?: boolean;
  /**
   * High-latitude rule to apply when computed times are unreachable.
   * Default: none.
   */
  highLatitudeRule?: HighLatitudeRule;
  /**
   * Shafaq mode for MSC Isha (default: general).
   */
  shafaqMode?: ShafaqMode;
}
