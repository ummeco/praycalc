/**
 * Purpose: Prayer time calculation method definitions (D-P3-19 — Tehran/Jafari excluded)
 * Inputs: none
 * Outputs: CALC_METHODS array, CalcMethod type
 * Constraints: Exactly 7 methods. Tehran and Jafari MUST NOT appear (D-P3-19).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-methods
 */

export type CalcMethodKey =
  | 'MWL'
  | 'ISNA'
  | 'Egypt'
  | 'Makkah'
  | 'Karachi'
  | 'UOIF'
  | 'Custom';

export interface CalcMethod {
  key: CalcMethodKey;
  label: string;
  fajrAngle: number;
  ishaAngle?: number;
  ishaMinutes?: number;
}

/** 7 allowed methods — Tehran/Jafari excluded per D-P3-19 */
export const CALC_METHODS: CalcMethod[] = [
  { key: 'MWL', label: 'Muslim World League', fajrAngle: 18, ishaAngle: 17 },
  { key: 'ISNA', label: 'Islamic Society of North America', fajrAngle: 15, ishaAngle: 15 },
  { key: 'Egypt', label: 'Egyptian General Authority of Survey', fajrAngle: 19.5, ishaAngle: 17.5 },
  { key: 'Makkah', label: 'Umm Al-Qura University, Makkah', fajrAngle: 18.5, ishaMinutes: 90 },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi', fajrAngle: 18, ishaAngle: 18 },
  { key: 'UOIF', label: 'Union des Organisations Islamiques de France', fajrAngle: 12, ishaAngle: 12 },
  { key: 'Custom', label: 'Custom', fajrAngle: 15, ishaAngle: 15 },
];

export const DEFAULT_METHOD: CalcMethodKey = 'ISNA';
