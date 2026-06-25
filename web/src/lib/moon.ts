/**
 * moon.ts — Self-contained moon-phase calculation (no external deps).
 *
 * PURPOSE: Compute the current lunar phase for the home page moon card.
 *   Pure astronomy math from a known new-moon epoch + the mean synodic month.
 *   SSR-safe (Date math only) so the card can render server-side.
 * INPUTS: a Date (defaults to now).
 * OUTPUTS: MoonPhase { phaseName, emoji, illumination (0–100), phaseIndex (0–7) }.
 * REF: P2-PRAYCALC-E2E-REBUILD · homepage.spec.ts (.home-moon-card)
 */

export interface MoonPhase {
  phaseName: string;
  emoji: string;
  /** Illuminated fraction as a percentage 0–100. */
  illumination: number;
  /** 0=new … 4=full … 7=waning crescent. */
  phaseIndex: number;
}

const SYNODIC_MONTH = 29.530588853; // days
// Reference new moon: 2000-01-06 18:14 UTC.
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

const PHASE_EMOJI = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const days = (date.getTime() - REF_NEW_MOON) / 86_400_000;
  let frac = (days % SYNODIC_MONTH) / SYNODIC_MONTH;
  if (frac < 0) frac += 1;
  const phaseIndex = Math.floor(frac * 8 + 0.5) % 8;
  const illumination = Math.round(((1 - Math.cos(frac * 2 * Math.PI)) / 2) * 100);
  return {
    phaseName: PHASE_NAMES[phaseIndex]!,
    emoji: PHASE_EMOJI[phaseIndex]!,
    illumination,
    phaseIndex,
  };
}
