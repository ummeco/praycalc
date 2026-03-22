/**
 * Core types for pray-calc v2.
 */

/** Fractional hours (e.g. 5.5 = 05:30:00). NaN indicates an unreachable event. */
export type FractionalHours = number;

/** HH:MM:SS string produced by formatTime, or "N/A" when unreachable. */
export type TimeString = string;

/** Asr shadow convention: Shafi'i (shadow = 1x object length) or Hanafi (2x). */
export type AsrConvention = 'shafii' | 'hanafi';

/** Shafaq (twilight glow) variant for the MSC Isha model. */
export type ShafaqMode = 'general' | 'ahmer' | 'abyad';

/** Computed twilight depression angles for Fajr and Isha. */
export interface TwilightAngles {
  /** Solar depression angle for Fajr (positive degrees below horizon). */
  fajrAngle: number;
  /** Solar depression angle for Isha (positive degrees below horizon). */
  ishaAngle: number;
}

/** Raw prayer times as fractional hours. */
export interface PrayerTimes {
  /** Start of the last third of the night (Qiyam al-Layl). */
  Qiyam: FractionalHours;
  /** True dawn (Subh Sadiq). */
  Fajr: FractionalHours;
  /** Astronomical sunrise. */
  Sunrise: FractionalHours;
  /** Solar noon (exact geometric transit). */
  Noon: FractionalHours;
  /** Dhuhr (2.5 minutes after solar noon). */
  Dhuhr: FractionalHours;
  /** Asr (Shafi'i or Hanafi shadow convention). */
  Asr: FractionalHours;
  /** Maghrib (sunset). */
  Maghrib: FractionalHours;
  /** Isha (nightfall, end of shafaq). */
  Isha: FractionalHours;
  /** Midnight: midpoint between Maghrib and Fajr. */
  Midnight: FractionalHours;
  /** Dynamic twilight angles used for this calculation. */
  angles: TwilightAngles;
}

/** Prayer times formatted as HH:MM:SS strings. */
export interface FormattedPrayerTimes {
  Qiyam: TimeString;
  Fajr: TimeString;
  Sunrise: TimeString;
  Noon: TimeString;
  Dhuhr: TimeString;
  Asr: TimeString;
  Maghrib: TimeString;
  Isha: TimeString;
  Midnight: TimeString;
  angles: TwilightAngles;
}

/**
 * Method entry in the Methods map: `[fajrTime, ishaTime]` as fractional hours.
 *
 * - Index 0 (`fajr`): Fajr time for this method (fractional hours, or `NaN`)
 * - Index 1 (`isha`): Isha time for this method (fractional hours, or `NaN`)
 *
 * A value of `NaN` indicates the event is unreachable at this location/date
 * (e.g. the sun never dips to 18° below the horizon at high latitudes in summer).
 */
export type MethodEntry = [fajr: FractionalHours, isha: FractionalHours];

/** Prayer times plus all method comparison times as fractional hours. */
export interface PrayerTimesAll extends PrayerTimes {
  /** Comparison results from all supported fixed-angle and seasonal methods. */
  Methods: Record<string, MethodEntry>;
}

/** Prayer times plus all method comparison times, fully formatted. */
export interface FormattedPrayerTimesAll {
  Qiyam: TimeString;
  Fajr: TimeString;
  Sunrise: TimeString;
  Noon: TimeString;
  Dhuhr: TimeString;
  Asr: TimeString;
  Maghrib: TimeString;
  Isha: TimeString;
  Midnight: TimeString;
  angles: TwilightAngles;
  /** Formatted comparison times for each method: [fajrString, ishaString]. */
  Methods: Record<string, [TimeString, TimeString]>;
}

/** Optional atmospheric and elevation parameters. */
export interface AtmosphericParams {
  elevation?: number;
  temperature?: number;
  pressure?: number;
}

/** Internal record for a single traditional method definition. */
export interface MethodDefinition {
  /** Short identifier used as the Methods map key. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Geographic region of primary use. */
  region: string;
  /**
   * Fajr depression angle in degrees. Null means the method uses a
   * seasonal calculation (MSC) rather than a fixed angle.
   */
  fajrAngle: number | null;
  /**
   * Isha depression angle in degrees. Null means the method uses a
   * fixed-minute offset or seasonal calculation instead.
   */
  ishaAngle: number | null;
  /**
   * Fixed minutes after sunset for Isha. Overrides ishaAngle when set.
   * UAQ uses 90 year-round; Qatar uses 90 as well.
   */
  ishaMinutes?: number;
  /**
   * When true, the method uses the MSC seasonal algorithm for both
   * Fajr and Isha.
   */
  useMSC?: boolean;
}
