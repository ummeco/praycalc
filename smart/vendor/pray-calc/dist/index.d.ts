/**
 * Core types for pray-calc v2.
 */
/** Fractional hours (e.g. 5.5 = 05:30:00). NaN indicates an unreachable event. */
type FractionalHours = number;
/** HH:MM:SS string produced by formatTime, or "N/A" when unreachable. */
type TimeString = string;
/** Asr shadow convention: Shafi'i (shadow = 1x object length) or Hanafi (2x). */
type AsrConvention = 'shafii' | 'hanafi';
/** Shafaq (twilight glow) variant for the MSC Isha model. */
type ShafaqMode$1 = 'general' | 'ahmer' | 'abyad';
/** Computed twilight depression angles for Fajr and Isha. */
interface TwilightAngles {
    /** Solar depression angle for Fajr (positive degrees below horizon). */
    fajrAngle: number;
    /** Solar depression angle for Isha (positive degrees below horizon). */
    ishaAngle: number;
}
/** Raw prayer times as fractional hours. */
interface PrayerTimes {
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
    /** Dynamic twilight angles used for this calculation. */
    angles: TwilightAngles;
}
/** Prayer times formatted as HH:MM:SS strings. */
interface FormattedPrayerTimes {
    Qiyam: TimeString;
    Fajr: TimeString;
    Sunrise: TimeString;
    Noon: TimeString;
    Dhuhr: TimeString;
    Asr: TimeString;
    Maghrib: TimeString;
    Isha: TimeString;
    angles: TwilightAngles;
}
/** Method entry in the Methods map: [fajrTime, ishaTime] as fractional hours. */
type MethodEntry = [FractionalHours, FractionalHours];
/** Prayer times plus all method comparison times as fractional hours. */
interface PrayerTimesAll extends PrayerTimes {
    /** Comparison results from all supported fixed-angle and seasonal methods. */
    Methods: Record<string, MethodEntry>;
}
/** Prayer times plus all method comparison times, fully formatted. */
interface FormattedPrayerTimesAll {
    Qiyam: TimeString;
    Fajr: TimeString;
    Sunrise: TimeString;
    Noon: TimeString;
    Dhuhr: TimeString;
    Asr: TimeString;
    Maghrib: TimeString;
    Isha: TimeString;
    angles: TwilightAngles;
    /** Formatted comparison times for each method: [fajrString, ishaString]. */
    Methods: Record<string, [TimeString, TimeString]>;
}
/** Optional atmospheric and elevation parameters. */
interface AtmosphericParams {
    elevation?: number;
    temperature?: number;
    pressure?: number;
}
/** Internal record for a single traditional method definition. */
interface MethodDefinition {
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

/**
 * Core prayer times computation using the PrayCalc Dynamic Method.
 *
 * Returns all prayer times as fractional hours using the dynamic twilight
 * angle algorithm. Times are in local time as determined by the timezone
 * offset (tz parameter).
 */

/**
 * Compute prayer times for a given date and location.
 *
 * @param date        - Observer's local date (time-of-day is ignored)
 * @param lat         - Latitude in decimal degrees (−90 to 90, south = negative)
 * @param lng         - Longitude in decimal degrees (−180 to 180, west = negative)
 * @param tz          - UTC offset in hours (e.g. −5 for EST). Defaults to the
 *                      system timezone derived from the Date object.
 * @param elevation   - Observer elevation in meters (default: 0)
 * @param temperature - Ambient temperature in °C (default: 15)
 * @param pressure    - Atmospheric pressure in mbar/hPa (default: 1013.25)
 * @param hanafi      - Asr convention: false = Shafi'i/Maliki/Hanbali (default),
 *                      true = Hanafi
 * @returns Prayer times as fractional hours and the dynamic angles used
 */
declare function getTimes(date: Date, lat: number, lng: number, tz?: number, elevation?: number, temperature?: number, pressure?: number, hanafi?: boolean): PrayerTimes;

/**
 * Formatted prayer times using the PrayCalc Dynamic Method.
 */

/**
 * Compute prayer times formatted as HH:MM:SS strings.
 *
 * Uses the dynamic twilight angle algorithm. See getTimes() for full parameter
 * documentation.
 *
 * @returns Prayer times as HH:MM:SS strings. Returns "N/A" for any time that
 *          cannot be computed (polar night, unreachable angle, etc.).
 */
declare function calcTimes(date: Date, lat: number, lng: number, tz?: number, elevation?: number, temperature?: number, pressure?: number, hanafi?: boolean): FormattedPrayerTimes;

/**
 * Prayer times comparison — all methods.
 *
 * Returns the PrayCalc Dynamic times plus comparison times for every
 * supported traditional method, all as fractional hours.
 *
 * Supported methods (14 total):
 *
 * | ID      | Name                                         | Fajr  | Isha            | Region          |
 * |---------|----------------------------------------------|-------|-----------------|-----------------|
 * | UOIF    | Union des Org. Islamiques de France          | 12°   | 12°             | France          |
 * | ISNACA  | IQNA / Islamic Council of North America      | 13°   | 13°             | Canada          |
 * | ISNA    | FCNA / Islamic Society of North America      | 15°   | 15°             | US, UK, AU, NZ  |
 * | SAMR    | Spiritual Admin. of Muslims of Russia        | 16°   | 15°             | Russia          |
 * | IGUT    | Inst. of Geophysics, Univ. of Tehran         | 17.7° | 14°             | Iran, Shia use  |
 * | MWL     | Muslim World League                          | 18°   | 17°             | Global default  |
 * | DIBT    | Diyanet İşleri Başkanlığı, Turkey            | 18°   | 17°             | Turkey          |
 * | Karachi | University of Islamic Sciences, Karachi      | 18°   | 18°             | PK, BD, IN, AF  |
 * | Kuwait  | Kuwait Ministry of Islamic Affairs           | 18°   | 17.5°           | Kuwait          |
 * | UAQ     | Umm Al-Qura University, Makkah               | 18.5° | +90 min sunset  | Saudi / Gulf    |
 * | Qatar   | Qatar / Gulf (standard minutes interval)     | 18°   | +90 min sunset  | Qatar, Gulf     |
 * | Egypt   | Egyptian General Authority of Survey         | 19.5° | 17.5°           | EG, SY, IQ, LB  |
 * | MUIS    | Majlis Ugama Islam Singapura                 | 20°   | 18°             | Singapore       |
 * | MSC     | Moonsighting Committee Worldwide (seasonal)  | —     | —               | Global          |
 */

/** All supported traditional methods. */
declare const METHODS: MethodDefinition[];
/**
 * Compute prayer times plus all traditional method comparisons.
 *
 * @param date        - Observer's local date
 * @param lat         - Latitude in decimal degrees
 * @param lng         - Longitude in decimal degrees
 * @param tz          - UTC offset in hours (defaults to system tz)
 * @param elevation   - Observer elevation in meters (default: 0)
 * @param temperature - Ambient temperature in °C (default: 15)
 * @param pressure    - Atmospheric pressure in mbar (default: 1013.25)
 * @param hanafi      - Asr convention: false = Shafi'i (default), true = Hanafi
 * @returns Prayer times for the dynamic method plus all traditional methods
 */
declare function getTimesAll(date: Date, lat: number, lng: number, tz?: number, elevation?: number, temperature?: number, pressure?: number, hanafi?: boolean): PrayerTimesAll;

/**
 * Formatted prayer times — dynamic method plus all traditional method comparisons.
 */

/**
 * Compute prayer times formatted as HH:MM:SS strings, plus comparison times
 * for every supported traditional method.
 *
 * Uses the dynamic twilight angle algorithm for the primary times. See
 * getTimesAll() for full parameter documentation.
 *
 * @returns All prayer times as HH:MM:SS strings. "N/A" for unreachable events.
 *          Methods map contains [fajrString, ishaString] per method.
 */
declare function calcTimesAll(date: Date, lat: number, lng: number, tz?: number, elevation?: number, temperature?: number, pressure?: number, hanafi?: boolean): FormattedPrayerTimesAll;

/**
 * Dynamic twilight angle algorithm — PrayCalc Dynamic Method v2.
 *
 * Computes adaptive Fajr and Isha solar depression angles that accurately
 * track the observable phenomenon (Subh Sadiq / end of Shafaq) across all
 * latitudes and seasons, replacing a static angle with a physics-informed
 * estimate.
 *
 * ## Algorithm
 *
 * The research literature establishes that "true dawn" and "end of twilight"
 * are not tied to a single universal solar depression angle. The required
 * angle varies with latitude, season, and atmospheric conditions. Field
 * studies show approximately:
 *
 *   - Low latitudes (0–30°):  ~16–19° (dark-sky conditions approach 18–19°)
 *   - Mid-latitudes (30–45°): ~14–17°, with seasonal variation
 *   - High latitudes (45–55°):~11–15°, strongly seasonal (shallow in summer)
 *
 * This implementation uses a three-layer model:
 *
 *   1. **MSC base**: The Moonsighting Committee Worldwide (MCW) piecewise
 *      seasonal function is used as the empirical baseline — the most widely
 *      validated and observation-calibrated model available. The MCW minutes-
 *      before-sunrise value is converted to an equivalent depression angle
 *      via exact spherical trigonometry.
 *
 *   2. **Ephemeris corrections**: Physics-based adjustments derived from
 *      accurate solar position features (ecliptic longitude, Earth-Sun
 *      distance, solar vertical speed). These smooth over the MCW's piecewise
 *      discontinuities and capture the small irradiance variation (~3.3%)
 *      due to Earth's orbital eccentricity (perihelion in January, aphelion
 *      in July).
 *
 *   3. **Environmental corrections**: Observer elevation (horizon dip) and
 *      atmospheric refraction scaled to local pressure and temperature.
 *
 * ## Why this is better than a fixed angle
 *
 * Fixed angles (e.g., 18°, 15°) do not adapt to latitude-season geometry
 * and break outright at higher latitudes in summer when the sun never reaches
 * 15° below the horizon. This algorithm produces smooth, continuous values
 * validated against the MCW observational corpus and enhanced by physical
 * corrections the MCW piecewise model cannot express.
 *
 * ## References
 *
 * - Moonsighting Committee Worldwide (Khalid Shaukat): moonsighting.com
 * - Deep-research reports PCP1–PCP5 (archived in internal docs)
 * - Jean Meeus, Astronomical Algorithms (2nd ed., 1998)
 */

/**
 * Compute dynamic twilight depression angles for Fajr and Isha.
 *
 * @param date        - Observer's local date (time-of-day is ignored)
 * @param lat         - Latitude in decimal degrees
 * @param lng         - Longitude in decimal degrees (currently unused; reserved)
 * @param elevation   - Observer elevation in meters (default: 0)
 * @param temperature - Ambient temperature in °C (default: 15)
 * @param pressure    - Atmospheric pressure in mbar (default: 1013.25)
 * @returns Fajr and Isha depression angles in degrees
 */
declare function getAngles(date: Date, lat: number, lng: number, elevation?: number, temperature?: number, pressure?: number): TwilightAngles;

/**
 * Asr prayer time calculation.
 *
 * Asr begins when the shadow of an object equals (Shafi'i/Maliki/Hanbali)
 * or twice (Hanafi) the object's length plus its shadow at solar noon.
 * This is a pure spherical trigonometry problem once solar declination
 * and solar noon are known.
 */
/**
 * Compute Asr time as fractional hours.
 *
 * @param solarNoon   - Solar noon in fractional hours (from getSpa)
 * @param latitude    - Observer latitude in degrees
 * @param declination - Solar declination in degrees (from solarEphemeris)
 * @param hanafi      - true for Hanafi (shadow factor 2), false for Shafi'i (factor 1)
 * @returns Fractional hours, or NaN if the sun never reaches the required altitude
 */
declare function getAsr(solarNoon: number, latitude: number, declination: number, hanafi?: boolean): number;

/**
 * Qiyam al-Layl (night prayer) time calculation.
 *
 * Returns the start of the last third of the night, which is the recommended
 * time for Tahajjud / Qiyam al-Layl. The night is defined as the period
 * from Isha to Fajr.
 */
/**
 * Compute the start of the last third of the night.
 *
 * @param fajrTime - Fajr time in fractional hours
 * @param ishaTime - Isha time in fractional hours
 * @returns Start of the last third of the night (fractional hours)
 */
declare function getQiyam(fajrTime: number, ishaTime: number): number;

/**
 * Moonsighting Committee Worldwide (MCW) seasonal algorithm.
 *
 * Computes Fajr and Isha as time offsets from sunrise/sunset using the
 * empirical piecewise-linear seasonal functions developed by the Moonsighting
 * Committee Worldwide (Khalid Shaukat). The functions were derived by
 * curve-fitting observations of Subh Sadiq (true dawn) and the end of
 * Shafaq (twilight glow) across multiple latitudes.
 *
 * Reference: moonsighting.com/isha_fajr.html
 *
 * High-latitude handling (|lat| > 55°): falls back to 1/7-night rule.
 */
type ShafaqMode = 'general' | 'ahmer' | 'abyad';
/**
 * Compute Fajr offset in minutes before sunrise using the MCW algorithm.
 *
 * Returns minutes before sunrise. At latitudes above 55°, the 1/7-night
 * approximation is recommended (handled at the calling site).
 */
declare function getMscFajr(date: Date, latitude: number): number;
/**
 * Compute Isha offset in minutes after sunset using the MCW algorithm.
 *
 * Three Shafaq modes:
 * - 'general': blend that reduces hardship at high latitudes (default)
 * - 'ahmer': based on disappearance of redness (shafaq ahmer)
 * - 'abyad': based on disappearance of whiteness (shafaq abyad), later
 */
declare function getMscIsha(date: Date, latitude: number, shafaq?: ShafaqMode): number;

/**
 * High-accuracy solar ephemeris features without a full SPA call.
 *
 * Uses Jean Meeus "Astronomical Algorithms" (2nd ed., Ch. 25) low-precision
 * formulas, accurate to approximately ±0.01° for solar declination and
 * ±0.0001 AU for Earth-Sun distance over the years 1950-2050. This is
 * sufficient for computing twilight angles; exact Sun positioning for
 * prayer time solving still uses the full SPA via nrel-spa.
 */
/** Julian Date from a JavaScript Date (UTC). */
declare function toJulianDate(date: Date): number;
interface SolarEphemeris {
    /** Solar declination in degrees. */
    decl: number;
    /** Earth-Sun distance in AU. */
    r: number;
    /** Apparent solar ecliptic longitude in radians (season phase θ, 0–2π). */
    eclLon: number;
}
/**
 * Compute solar declination, Earth-Sun distance, and ecliptic longitude
 * from a Julian Date. Accuracy: ~0.01° for declination, ~0.0001 AU for r.
 */
declare function solarEphemeris(jd: number): SolarEphemeris;

export { type AsrConvention, type AtmosphericParams, type FormattedPrayerTimes, type FormattedPrayerTimesAll, type FractionalHours, METHODS, type MethodDefinition, type MethodEntry, type PrayerTimes, type PrayerTimesAll, type ShafaqMode$1 as ShafaqMode, type TimeString, type TwilightAngles, calcTimes, calcTimesAll, getAngles, getAsr, getMscFajr, getMscIsha, getQiyam, getTimes, getTimesAll, solarEphemeris, toJulianDate };
