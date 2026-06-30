import type { PrayerEntry, DisplayMode, NameFormat, PrayerName, CountdownPrefix } from '../lib/ipc-types';
import { formatTime12, PRAYER_ARABIC } from '../lib/prayers';

interface Props {
  next: PrayerEntry | null;
  seconds: number;
  displayMode: DisplayMode;
  nameFormat: NameFormat;
  arabicMode: boolean;
  showSeconds: boolean;
  countdownPrefix: CountdownPrefix;
}

export default function Countdown({ next, seconds, displayMode, arabicMode, showSeconds, countdownPrefix }: Props) {
  if (!next) return null;

  const prayerName = arabicMode
    ? PRAYER_ARABIC[next.name as PrayerName]
    : next.name;

  // Prayer time has arrived — show "Now" state for up to 60s
  if (seconds <= 0) {
    return (
      <div className="px-5 pt-5 pb-4 border-b border-white/5">
        <div className="text-[10px] uppercase tracking-widest text-green-400/50 mb-1.5">
          {prayerName}
        </div>
        <div
          className="text-5xl font-bold tabular-nums leading-none mb-2"
          style={{ color: '#C9F27A', textShadow: '0 0 24px rgba(121,194,76,0.55)' }}
        >
          Now
        </div>
        <div className="text-green-400/55 text-sm">
          Prayer time · {formatTime12(next.time)}
        </div>
      </div>
    );
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  // Label above the number
  const labelSuffix = displayMode === 'countdown'
    ? countdownPrefix === 'in' ? ` in` : ''
    : '';

  // Prefix sign shown before the number (only in countdown mode)
  const signStr = displayMode === 'countdown' && countdownPrefix === 'minus' ? '−' : '';

  const mainStr = displayMode !== 'countdown'
    ? formatTime12(next.time)
    : h > 0
      ? `${h}:${String(m).padStart(2, '0')}`
      : `${m}`;

  const secStr = showSeconds ? `:${String(s).padStart(2, '0')}` : '';

  return (
    <div className="px-5 pt-5 pb-4 border-b border-white/5">
      <div className="text-[10px] uppercase tracking-widest text-green-400/50 mb-1.5">
        {`${prayerName}${labelSuffix}`}
      </div>

      {displayMode === 'countdown' ? (
        <div className="flex items-start mb-2">
          {signStr && (
            <span
              className="text-3xl font-bold tabular-nums leading-none mr-0.5"
              style={{ color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}
            >
              {signStr}
            </span>
          )}
          <span className="text-5xl font-bold text-white tabular-nums leading-none">
            {mainStr}
          </span>
          {secStr && (
            <span
              className="text-2xl font-bold tabular-nums leading-none ml-0.5"
              style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}
            >
              {secStr}
            </span>
          )}
        </div>
      ) : (
        <div className="text-5xl font-bold text-white tabular-nums leading-none mb-2">
          {mainStr}
        </div>
      )}

      <div className="text-green-400/55 text-sm">
        at {formatTime12(next.time)}
      </div>
    </div>
  );
}
