/**
 * Purpose: Full-screen adhan overlay shown when a prayer time arrives — plays
 *   the chosen recitation and shows a per-prayer themed scene (stars, horizon
 *   glow, celestial element, landscape silhouette) until playback ends.
 * Inputs: `prayerName`, `adhan` (recitation id), `onDone` callback.
 * Outputs: renders the overlay; calls `onDone()` once playback finishes,
 *   errors, or a hard time ceiling elapses.
 * Constraints: theme data lives in `adhan/themes.ts`; celestial + landscape
 *   silhouettes are split into `adhan/Celestial.tsx` / `adhan/Landscape.tsx`
 *   to keep this file under the 300-line cap.
 * SPORT: praycalc desktop — adhan overlay (shell).
 */
import { useEffect, useRef } from 'react';
import { PRAYER_ARABIC, STARS, THEMES, FALLBACK } from './adhan/themes';
import Celestial from './adhan/Celestial';
import Landscape from './adhan/Landscape';

interface Props { prayerName: string; adhan: string; onDone: () => void; }

export default function AdhanOverlay({ prayerName, adhan, onDone }: Props) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const audio = new Audio(`/adhan/${adhan}.mp3`);
    audio.play().catch(() => {});
    const handleEnd = () => onDoneRef.current();
    audio.addEventListener('ended', handleEnd);
    // If the file fails to load/decode (missing asset, unsupported codec, autoplay
    // block that never resolves), 'ended' never fires and the overlay would sit
    // open until the user finds the small "Stop" button. Auto-dismiss on 'error'
    // too, and add a hard ceiling well past the longest adhan recording so a
    // silently-stuck playback still self-closes.
    audio.addEventListener('error', handleEnd);
    const maxDurationId = setTimeout(handleEnd, 6 * 60 * 1000);
    return () => {
      audio.removeEventListener('ended', handleEnd);
      audio.removeEventListener('error', handleEnd);
      clearTimeout(maxDurationId);
      audio.pause();
      audio.src = '';
    };
  }, [adhan]);

  const theme = THEMES[prayerName] ?? FALLBACK;
  const arabicName = PRAYER_ARABIC[prayerName] ?? prayerName;
  const starList = STARS.slice(0, theme.stars);

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
      <Celestial prayerName={prayerName} />

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
      <Landscape prayerName={prayerName} />

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
