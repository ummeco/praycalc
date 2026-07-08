/**
 * Purpose: Renders the per-prayer celestial element (crescent moon, rising/
 *   setting sun, or midday disc) for the AdhanOverlay background.
 * Inputs: `prayerName` — one of the six prayer names; unknown values fall
 *   through to the Isha (crescent moon) rendering.
 * Outputs: absolutely-positioned SVG/div matching the overlay's per-prayer theme.
 * Constraints: no `any`; pure presentational, no state.
 * SPORT: praycalc desktop — adhan overlay (celestial element).
 */
export default function Celestial({ prayerName }: { prayerName: string }) {
  switch (prayerName) {
    case 'Fajr':
      // Thin crescent, low on right
      return (
        <div className="absolute" style={{ top: 115, left: '68%' }}>
          <svg width="30" height="30" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="11" fill="rgba(220,200,140,0.7)" />
            <circle cx="20" cy="12" r="9" fill="#050d1a" />
          </svg>
        </div>
      );
    case 'Sunrise': {
      // Small sun arc rising from bottom horizon
      return (
        <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: 180 }}>
          <svg width="360" height="180" viewBox="0 0 360 180">
            <defs>
              <radialGradient id="sun-sr">
                <stop offset="0%" stopColor="rgba(255,220,80,0.9)" />
                <stop offset="60%" stopColor="rgba(255,140,20,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <clipPath id="clip-sr"><rect x="0" y="88" width="360" height="92" /></clipPath>
            </defs>
            {/* Glow */}
            <circle cx="180" cy="88" r="55" fill="url(#sun-sr)" clipPath="url(#clip-sr)" opacity="0.5" />
            {/* Sun semicircle */}
            <circle cx="180" cy="88" r="22" fill="rgba(255,200,60,0.85)" clipPath="url(#clip-sr)" />
          </svg>
        </div>
      );
    }
    case 'Dhuhr':
      // Small bright disc, high center
      return (
        <div className="absolute" style={{ top: 72, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,255,180,0.95) 0%, rgba(180,240,100,0.6) 55%, transparent 100%)',
            boxShadow: '0 0 24px 10px rgba(180,240,100,0.18)',
          }} />
        </div>
      );
    case 'Asr':
      // Warm sun, lower-right
      return (
        <div className="absolute" style={{ top: 155, right: 55 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,200,80,0.9) 0%, rgba(230,130,20,0.5) 60%, transparent 100%)',
            boxShadow: '0 0 20px 8px rgba(200,110,20,0.18)',
          }} />
        </div>
      );
    case 'Maghrib': {
      // Large sun at horizon — half visible
      return (
        <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: 180 }}>
          <svg width="360" height="180" viewBox="0 0 360 180">
            <defs>
              <radialGradient id="sun-mg">
                <stop offset="0%" stopColor="rgba(255,180,40,0.95)" />
                <stop offset="45%" stopColor="rgba(220,80,10,0.7)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <clipPath id="clip-mg"><rect x="0" y="96" width="360" height="84" /></clipPath>
            </defs>
            <circle cx="180" cy="96" r="70" fill="url(#sun-mg)" opacity="0.4" />
            <circle cx="180" cy="96" r="32" fill="rgba(220,90,20,0.8)" clipPath="url(#clip-mg)" />
            <circle cx="180" cy="96" r="26" fill="rgba(255,160,30,0.7)" clipPath="url(#clip-mg)" />
          </svg>
        </div>
      );
    }
    default: // Isha — crescent moon
      return (
        <div className="absolute" style={{ top: 95, left: '62%' }}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <circle cx="17" cy="17" r="12" fill="rgba(240,220,150,0.85)" />
            <circle cx="22" cy="14" r="10" fill="#060f1e" />
          </svg>
        </div>
      );
  }
}
