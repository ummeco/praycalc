/**
 * Purpose: Renders the bottom-of-screen landscape silhouette for the
 *   AdhanOverlay — mosque (Maghrib/Isha), palm trees (Fajr), or rolling hills
 *   (Dhuhr/Asr/Sunrise).
 * Inputs: `prayerName` — one of the six prayer names; unknown values fall
 *   through to the rolling-hills rendering.
 * Outputs: absolutely-positioned SVG matching the overlay's per-prayer theme.
 * Constraints: no `any`; pure presentational, no state.
 * SPORT: praycalc desktop — adhan overlay (landscape silhouette).
 */
import { MOSQUE_PATH, HILLS_PATH } from './themes';

export default function Landscape({ prayerName }: { prayerName: string }) {
  if (prayerName === 'Maghrib' || prayerName === 'Isha') {
    const fill = prayerName === 'Isha' ? '#06101a' : '#080c08';
    const capColor = prayerName === 'Isha' ? 'rgba(150,230,80,0.35)' : 'rgba(200,80,30,0.35)';
    return (
      <svg className="absolute bottom-0 left-0 w-full" height="180" viewBox="0 0 360 180">
        <path d={MOSQUE_PATH} fill={fill} />
        <circle cx="49" cy="57" r="2.5" fill={capColor} />
        <circle cx="311" cy="57" r="2.5" fill={capColor} />
        <text x="180" y="74" textAnchor="middle" fontSize="11" fill={capColor}>☽</text>
      </svg>
    );
  }
  if (prayerName === 'Fajr') {
    // Palm silhouettes
    return (
      <svg className="absolute bottom-0 left-0 w-full" height="160" viewBox="0 0 360 160">
        <path d="M 0 160 L 0 130 Q 90 118 180 122 Q 270 126 360 118 L 360 160 Z" fill="#0a1008" />
        {/* Left palm trunk */}
        <path d="M 68 130 Q 66 108 64 88 Q 62 74 66 63 L 70 63 Q 74 74 72 88 Q 70 108 72 130 Z" fill="#08100a" />
        <path d="M 67 64 Q 48 50 37 44 Q 50 58 67 64" fill="#08100a" />
        <path d="M 67 64 Q 83 50 93 44 Q 80 58 67 64" fill="#08100a" />
        <path d="M 67 64 Q 53 50 47 38 Q 58 53 67 64" fill="#08100a" />
        <path d="M 67 64 Q 80 52 87 40 Q 76 55 67 64" fill="#08100a" />
        <path d="M 67 64 Q 52 62 40 64 Q 53 60 67 64" fill="#08100a" />
        {/* Right palm trunk */}
        <path d="M 286 130 Q 283 103 281 80 Q 278 63 282 50 L 287 50 Q 291 63 288 80 Q 286 103 290 130 Z" fill="#08100a" />
        <path d="M 284 51 Q 261 35 248 28 Q 263 42 284 51" fill="#08100a" />
        <path d="M 284 51 Q 305 35 318 30 Q 302 43 284 51" fill="#08100a" />
        <path d="M 284 51 Q 266 35 258 22 Q 270 37 284 51" fill="#08100a" />
        <path d="M 284 51 Q 302 37 312 25 Q 298 39 284 51" fill="#08100a" />
        <path d="M 284 51 Q 264 49 248 52 Q 265 47 284 51" fill="#08100a" />
        {/* Small center palm */}
        <path d="M 178 130 Q 176 112 174 96 Q 172 85 176 76 L 180 76 Q 184 85 182 96 Q 180 112 182 130 Z" fill="#08100a" />
        <path d="M 178 77 Q 162 65 153 60 Q 164 70 178 77" fill="#08100a" />
        <path d="M 178 77 Q 193 65 202 60 Q 191 70 178 77" fill="#08100a" />
        <path d="M 178 77 Q 168 63 163 54 Q 172 65 178 77" fill="#08100a" />
        <path d="M 178 77 Q 188 65 194 56 Q 183 67 178 77" fill="#08100a" />
      </svg>
    );
  }
  // Dhuhr / Asr / Sunrise: simple rolling hills
  const hillColor = prayerName === 'Dhuhr' ? '#071508' : '#090f06';
  return (
    <svg className="absolute bottom-0 left-0 w-full" height="160" viewBox="0 0 360 160">
      <path d={HILLS_PATH.replace('180', '160').replace(/150/g, '130')} fill={hillColor} opacity={0.6} />
      <path d="M 0 160 L 0 140 Q 80 122 160 128 Q 240 134 320 122 Q 348 118 360 124 L 360 160 Z" fill={hillColor} />
    </svg>
  );
}
