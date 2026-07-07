/**
 * Purpose: Pure country/timezone → fixed calculation-method fallback mapping,
 *   used by onboarding's Method step to pre-select/highlight the smart-default
 *   FIXED method in case the user opts out of DPC (which remains the recommended
 *   default everywhere else in the app).
 * Inputs: { countryCode?: string; timezone?: string } — ISO 3166-1 alpha-2 country
 *   code (case-insensitive) and/or IANA timezone string.
 * Outputs: CalcMethodKey — one of the fixed methods from constants/methods.ts
 *   (never 'DPC', never 'Custom' — this only picks a fixed fallback).
 * Constraints: No side effects, no I/O — trivially testable. Country code takes
 *   priority; timezone is a fallback signal only when no country code is given
 *   (or it is unrecognized). Unmatched input defaults to MWL (Muslim World League),
 *   the most globally-neutral fixed method. Tehran/Jafari MUST NOT appear (D-P3-19).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-method-autodetect
 */

import type { CalcMethodKey } from '../constants/methods';

/** Fixed (non-DPC, non-Custom) methods this module may return. */
export type FixedMethodKey = Exclude<CalcMethodKey, 'DPC' | 'Custom'>;

/** ISO 3166-1 alpha-2 country code → recommended fixed method. */
const COUNTRY_METHOD_MAP: Record<string, FixedMethodKey> = {
  // North America → ISNA
  US: 'ISNA',
  CA: 'ISNA',
  // Egypt → Egypt
  EG: 'Egypt',
  // Pakistan / India / Bangladesh → Karachi
  PK: 'Karachi',
  IN: 'Karachi',
  BD: 'Karachi',
  // France → UOIF
  FR: 'UOIF',
  // Saudi Arabia / Gulf → Makkah
  SA: 'Makkah',
  AE: 'Makkah',
  QA: 'Makkah',
  KW: 'Makkah',
  BH: 'Makkah',
  OM: 'Makkah',
};

/** IANA timezone prefix/exact-match → recommended fixed method (fallback signal). */
const TIMEZONE_METHOD_MAP: Record<string, FixedMethodKey> = {
  'America/': 'ISNA',
  'Africa/Cairo': 'Egypt',
  'Asia/Karachi': 'Karachi',
  'Asia/Kolkata': 'Karachi',
  'Asia/Calcutta': 'Karachi',
  'Asia/Dhaka': 'Karachi',
  'Europe/Paris': 'UOIF',
  'Asia/Riyadh': 'Makkah',
  'Asia/Dubai': 'Makkah',
  'Asia/Qatar': 'Makkah',
  'Asia/Kuwait': 'Makkah',
  'Asia/Bahrain': 'Makkah',
  'Asia/Muscat': 'Makkah',
};

/** Default fixed method when no country/timezone signal matches. */
export const DEFAULT_FALLBACK_METHOD: FixedMethodKey = 'MWL';

export interface MethodAutodetectInput {
  /** ISO 3166-1 alpha-2 country code, e.g. 'US', 'eg' (case-insensitive). */
  countryCode?: string;
  /** IANA timezone string, e.g. 'America/New_York'. */
  timezone?: string;
}

/**
 * Detect the recommended FIXED calculation method fallback for a given
 * country code and/or timezone. DPC remains the recommended default
 * everywhere — this only affects the pre-selected fixed-method option
 * shown if the user opts out of DPC during onboarding.
 */
export function detectFallbackMethod(input: MethodAutodetectInput): FixedMethodKey {
  const { countryCode, timezone } = input;

  if (countryCode) {
    const normalized = countryCode.trim().toUpperCase();
    const byCountry = COUNTRY_METHOD_MAP[normalized];
    if (byCountry) return byCountry;
  }

  if (timezone) {
    if (TIMEZONE_METHOD_MAP[timezone]) return TIMEZONE_METHOD_MAP[timezone];
    const region = timezone.split('/')[0];
    if (region && TIMEZONE_METHOD_MAP[`${region}/`]) return TIMEZONE_METHOD_MAP[`${region}/`];
  }

  return DEFAULT_FALLBACK_METHOD;
}
