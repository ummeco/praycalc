/**
 * Purpose: Prayer time calculation method definitions (D-P3-19 — Tehran/Jafari excluded)
 * Inputs: none
 * Outputs: CALC_METHODS array, CalcMethod type
 * Constraints: DPC (Dynamic Prayer Calculation) is the flagship default — the
 *   pray-calc engine's dynamic twilight-angle model (getTimesAll's raw output),
 *   a physics-based improvement over fixed-angle methods and the Moonsighting
 *   Committee seasonal model. Fixed methods remain user-selectable. Tehran/Jafari
 *   MUST NOT appear (D-P3-19).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-methods
 */

export type CalcMethodKey =
  | 'DPC'
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

/** DPC (flagship, default) + 6 fixed methods + Custom — Tehran/Jafari excluded per D-P3-19.
 *  DPC has no METHOD_ID mapping in the engine wrapper, so it uses the engine's dynamic
 *  raw.Fajr/raw.Isha (the PrayCalc Dynamic Method); its angles vary by date/latitude. */
export const CALC_METHODS: CalcMethod[] = [
  { key: 'DPC', label: 'Dynamic (PrayCalc DPC) — Recommended', fajrAngle: 18, ishaAngle: 17 },
  { key: 'MWL', label: 'Muslim World League', fajrAngle: 18, ishaAngle: 17 },
  { key: 'ISNA', label: 'Islamic Society of North America', fajrAngle: 15, ishaAngle: 15 },
  { key: 'Egypt', label: 'Egyptian General Authority of Survey', fajrAngle: 19.5, ishaAngle: 17.5 },
  { key: 'Makkah', label: 'Umm Al-Qura University, Makkah', fajrAngle: 18.5, ishaMinutes: 90 },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi', fajrAngle: 18, ishaAngle: 18 },
  { key: 'UOIF', label: 'Union des Organisations Islamiques de France', fajrAngle: 12, ishaAngle: 12 },
  { key: 'Custom', label: 'Custom', fajrAngle: 15, ishaAngle: 15 },
];

export const DEFAULT_METHOD: CalcMethodKey = 'DPC';
