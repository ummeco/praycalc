/**
 * Purpose: Resolve a CityCoords.timezone string (either a raw numeric UTC offset like
 *   "+3"/"-5.5", or an IANA zone name like "America/New_York") to a numeric UTC-offset
 *   in hours for a given date, honoring DST.
 * Inputs: timezone string, reference date (offset varies by date under DST).
 * Outputs: UTC offset in hours (e.g. -5 for EST, -4 for EDT).
 * Constraints: `parseFloat(ianaString)` silently yields NaN — every prior call site that
 *   did this treated the whole world as UTC+0 for any location whose timezone field
 *   was set via Intl.DateTimeFormat().resolvedOptions().timeZone (GPS-based flows).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-timezone
 */

const NUMERIC_OFFSET = /^[+-]?\d+(\.\d+)?$/;

/** Resolve a CityCoords.timezone value to a numeric UTC offset in hours. */
export function resolveTimezoneOffset(timezone: string | undefined, date: Date = new Date()): number {
  if (!timezone) return 0;
  const trimmed = timezone.trim();
  if (NUMERIC_OFFSET.test(trimmed)) {
    return parseFloat(trimmed);
  }
  return ianaOffsetHours(trimmed, date);
}

/** Numeric UTC offset (hours) for an IANA zone name at the given instant, via Intl. */
function ianaOffsetHours(ianaZone: string, date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    const match = /GMT([+-]\d+)(?::(\d+))?/.exec(tzPart);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours + (hours < 0 ? -1 : 1) * (minutes / 60);
  } catch {
    return 0;
  }
}
