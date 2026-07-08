/**
 * Purpose: Static visual data for the full-screen AdhanOverlay — per-prayer
 *   color themes, the star field, and the two reused SVG silhouette paths
 *   (mosque, rolling hills). Pure data — no JSX — so it can be imported by
 *   both the overlay shell and its Celestial/Landscape sub-components without
 *   pulling React into a data-only module.
 * Inputs: n/a.
 * Outputs: `THEMES`, `FALLBACK`, `STARS`, `MOSQUE_PATH`, `HILLS_PATH`, `PRAYER_ARABIC`.
 * Constraints: no `any`.
 * SPORT: praycalc desktop — adhan overlay (theme data).
 */

export const PRAYER_ARABIC: Record<string, string> = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
  Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

export const STARS: [number, number, number][] = [
  [28,38,1.5],[70,22,1],[110,48,2],[155,18,1],[198,35,1.5],[240,12,1],
  [285,42,2],[320,25,1],[345,55,1.5],[18,80,1],[65,72,2],[130,65,1],
  [175,88,1.5],[225,60,1],[270,75,2],[310,68,1],[340,85,1.5],[50,110,1],
  [95,100,2],[145,115,1],[195,105,1.5],[250,118,1],[295,92,2],[330,108,1],
];

// Mosque silhouette path — reused by Maghrib and Isha
export const MOSQUE_PATH = `
  M 0 180 L 0 130 L 22 130 L 22 118 L 27 118
  L 27 90 Q 28 78 35 70 Q 42 62 49 58 Q 56 62 63 70 Q 70 78 71 90
  L 71 118 L 76 118 L 76 130
  L 108 130 L 108 120 Q 136 78 180 70 Q 224 78 252 120
  L 252 130 L 284 130 L 284 118 L 289 118
  L 289 90 Q 290 78 297 70 Q 304 62 311 58 Q 318 62 325 70 Q 332 78 333 90
  L 333 118 L 338 118 L 338 130
  L 360 130 L 360 180 Z
`;

// Rolling hills path
export const HILLS_PATH = `M 0 180 L 0 150 Q 60 130 130 138 Q 200 146 260 132 Q 310 122 360 134 L 360 180 Z`;

export interface AdhanTheme {
  bg: string;           // full background gradient
  horizonGlow: string;  // radial at bottom for atmospheric color
  textGlow: string;     // color for Arabic text shadow
  accentColor: string;  // الله أكبر color
  stars: number;        // how many stars to show (0 = none)
}

// Each prayer = same dark-green base + a different horizon tint + simple celestial element
export const THEMES: Record<string, AdhanTheme> = {
  Fajr: {
    bg: 'linear-gradient(180deg, #030810 0%, #07121e 30%, #0d1f10 60%, #0f2010 100%)',
    horizonGlow: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(120,50,10,0.5) 0%, rgba(80,30,5,0.2) 50%, transparent 100%)',
    textGlow: 'rgba(200,120,60,0.4)',
    accentColor: 'rgba(210,130,70,0.85)',
    stars: 14,
  },
  Sunrise: {
    bg: 'linear-gradient(180deg, #030810 0%, #0a1420 35%, #0d1e10 65%, #0f2010 100%)',
    horizonGlow: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(200,100,20,0.6) 0%, rgba(140,60,10,0.25) 55%, transparent 100%)',
    textGlow: 'rgba(220,150,50,0.45)',
    accentColor: 'rgba(220,160,60,0.85)',
    stars: 5,
  },
  Dhuhr: {
    bg: 'linear-gradient(180deg, #040e08 0%, #081808 30%, #0d2210 65%, #0a1e0c 100%)',
    horizonGlow: 'radial-gradient(ellipse 90% 35% at 50% 100%, rgba(180,220,100,0.12) 0%, transparent 100%)',
    textGlow: 'rgba(180,240,100,0.4)',
    accentColor: 'rgba(190,235,110,0.8)',
    stars: 0,
  },
  Asr: {
    bg: 'linear-gradient(180deg, #030a06 0%, #07150a 30%, #0d1e0c 60%, #0f2010 100%)',
    horizonGlow: 'radial-gradient(ellipse 80% 45% at 50% 100%, rgba(180,100,10,0.45) 0%, rgba(120,60,5,0.2) 55%, transparent 100%)',
    textGlow: 'rgba(200,140,50,0.4)',
    accentColor: 'rgba(200,150,60,0.85)',
    stars: 0,
  },
  Maghrib: {
    bg: 'linear-gradient(180deg, #030810 0%, #080f0d 30%, #0e1c0e 60%, #0f1f0f 100%)',
    horizonGlow: 'radial-gradient(ellipse 75% 55% at 50% 100%, rgba(210,60,10,0.55) 0%, rgba(160,40,5,0.25) 50%, transparent 100%)',
    textGlow: 'rgba(220,100,50,0.45)',
    accentColor: 'rgba(210,110,60,0.85)',
    stars: 6,
  },
  Isha: {
    bg: 'linear-gradient(180deg, #030810 0%, #060f1e 35%, #0a1a10 70%, #071209 100%)',
    horizonGlow: 'radial-gradient(ellipse 60% 30% at 50% 100%, rgba(30,80,30,0.3) 0%, transparent 100%)',
    textGlow: 'rgba(150,230,80,0.35)',
    accentColor: 'rgba(212,168,50,0.75)',
    stars: 24,
  },
};

export const FALLBACK: AdhanTheme = THEMES.Isha;
