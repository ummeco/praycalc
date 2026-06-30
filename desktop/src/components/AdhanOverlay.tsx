import { useEffect, useRef } from 'react';

const PRAYER_ARABIC: Record<string, string> = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
  Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

const STARS = [
  [28,38,1.5],[70,22,1],[110,48,2],[155,18,1],[198,35,1.5],[240,12,1],
  [285,42,2],[320,25,1],[345,55,1.5],[18,80,1],[65,72,2],[130,65,1],
  [175,88,1.5],[225,60,1],[270,75,2],[310,68,1],[340,85,1.5],[50,110,1],
  [95,100,2],[145,115,1],[195,105,1.5],[250,118,1],[295,92,2],[330,108,1],
];

// Mosque silhouette path — reused by Maghrib and Isha
const MOSQUE_PATH = `
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
const HILLS_PATH = `M 0 180 L 0 150 Q 60 130 130 138 Q 200 146 260 132 Q 310 122 360 134 L 360 180 Z`;

interface Props { prayerName: string; adhan: string; onDone: () => void; }

// Each prayer = same dark-green base + a different horizon tint + simple celestial element
const THEMES: Record<string, {
  bg: string;           // full background gradient
  horizonGlow: string;  // radial at bottom for atmospheric color
  textGlow: string;     // color for Arabic text shadow
  accentColor: string;  // الله أكبر color
  stars: number;        // how many stars to show (0 = none)
}> = {
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

const FALLBACK = THEMES.Isha;

export default function AdhanOverlay({ prayerName, adhan, onDone }: Props) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const audio = new Audio(`/adhan/${adhan}.mp3`);
    audio.play().catch(() => {});
    const handleEnd = () => onDoneRef.current();
    audio.addEventListener('ended', handleEnd);
    return () => { audio.removeEventListener('ended', handleEnd); audio.pause(); audio.src = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adhan]);

  const theme = THEMES[prayerName] ?? FALLBACK;
  const arabicName = PRAYER_ARABIC[prayerName] ?? prayerName;
  const starList = STARS.slice(0, theme.stars);

  // Celestial element per prayer
  const renderCelestial = () => {
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
  };

  // Bottom landscape per prayer
  const renderLandscape = () => {
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
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden select-none" style={{ background: theme.bg }}>
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.12;transform:scale(1)} 50%{opacity:.85;transform:scale(1.4)} }
        @keyframes adhan-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Stars */}
      {starList.length > 0 && (
        <svg className="absolute inset-0 w-full" style={{ height: 160 }} viewBox="0 0 360 160">
          {starList.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#d8cc90"
              style={{ animation: `twinkle ${2.2+(i%5)*0.6}s ease-in-out infinite`, animationDelay: `${(i*0.37)%3}s` }} />
          ))}
        </svg>
      )}

      {/* Horizon atmospheric glow */}
      <div className="absolute inset-0" style={{ background: theme.horizonGlow }} />

      {/* Celestial element (sun / moon) */}
      {renderCelestial()}

      {/* Text — centered in the middle third */}
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: 160 }}>
        <div style={{
          fontSize: 62, fontWeight: 700, lineHeight: 1,
          fontFamily: 'Georgia,"Times New Roman",serif',
          direction: 'rtl', color: '#F4F0E8',
          textShadow: `0 0 40px ${theme.textGlow}, 0 2px 20px rgba(0,0,0,0.95)`,
          animation: 'adhan-in 0.7s ease-out forwards',
        }}>
          {arabicName}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 12 }}>
          {prayerName}
        </div>
        <div style={{
          marginTop: 9, fontSize: 19,
          fontFamily: 'Georgia,serif', direction: 'rtl',
          color: theme.accentColor,
          textShadow: `0 0 18px ${theme.textGlow}`,
        }}>
          الله أكبر
        </div>
      </div>

      {/* Bottom landscape */}
      {renderLandscape()}

      {/* Stop */}
      <button onClick={onDone}
        className="absolute bottom-3 right-4 transition-colors"
        style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
        ✕ Stop
      </button>
    </div>
  );
}
