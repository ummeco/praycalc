/**
 * Purpose: TV calculation-method definitions. DPC (Dynamic Prayer Calculation) is the
 *   flagship default — the pray-calc engine's dynamic twilight-angle model. Fixed
 *   methods stay selectable. Tehran/Jafari excluded (D-P3-19).
 * Inputs: none
 * Outputs: CALC_METHODS list, DEFAULT_CALC_METHOD_ID, PRAY_CALC_METHOD_ID map.
 * Constraints: method ids are lowercase (settings.calculationMethodId). DPC has NO
 *   entry in PRAY_CALC_METHOD_ID, so the engine wrapper uses the dynamic raw times.
 * SPORT: praycalc/tv constants
 */

export interface TvCalcMethod {
  id: string;
  label: string;
}

/** DPC first (default) + 6 fixed methods. */
export const CALC_METHODS: TvCalcMethod[] = [
  { id: 'dpc', label: 'Dynamic (PrayCalc DPC) — Recommended' },
  { id: 'mwl', label: 'Muslim World League' },
  { id: 'isna', label: 'Islamic Society of North America' },
  { id: 'egypt', label: 'Egyptian General Authority of Survey' },
  { id: 'makkah', label: 'Umm Al-Qura University, Makkah' },
  { id: 'karachi', label: 'University of Islamic Sciences, Karachi' },
  { id: 'uoif', label: 'Union des Organisations Islamiques de France' },
];

export const DEFAULT_CALC_METHOD_ID = 'dpc';

/** Map a TV method id to pray-calc's METHODS map key. DPC (and any unknown id) has no
 *  entry — the wrapper then uses the engine's dynamic raw.Fajr/raw.Isha (PrayCalc
 *  Dynamic Method), which is exactly the DPC behavior. */
export const PRAY_CALC_METHOD_ID: Record<string, string> = {
  mwl: 'MWL',
  isna: 'ISNA',
  egypt: 'Egypt',
  makkah: 'UAQ',
  karachi: 'Karachi',
  uoif: 'UOIF',
};
