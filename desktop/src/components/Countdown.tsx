import type { PrayerEntry, DisplayMode, NameFormat, PrayerName } from '../lib/ipc-types';
import { formatTime12, PRAYER_ARABIC } from '../lib/prayers';

interface Props {
  next: PrayerEntry | null;
  seconds: number;
  displayMode: DisplayMode;
  nameFormat: NameFormat;
  arabicMode: boolean;
}

export default function Countdown({ next, seconds, displayMode, arabicMode }: Props) {
  if (!next) return null;

  const prayerName = arabicMode
    ? PRAYER_ARABIC[next.name as PrayerName]
    : next.name;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  // Main countdown display (H:MM or M) + seconds as superscript
  const mainStr = displayMode !== 'countdown'
    ? formatTime12(next.time)
    : h > 0
      ? `${h}:${String(m).padStart(2, '0')}`
      : `${m}`;
  const secStr = `:${String(s).padStart(2, '0')}`;

  return (
    <div className="px-5 pt-5 pb-4 border-b border-white/5">
      <div className="text-[10px] uppercase tracking-widest text-green-400/50 mb-1.5">
        {displayMode === 'countdown' ? `${prayerName} in` : prayerName}
      </div>

      {displayMode === 'countdown' ? (
        <div className="flex items-start mb-2">
          {/* Main time */}
          <span className="text-5xl font-bold text-white tabular-nums leading-none">
            {mainStr}
          </span>
          {/* Seconds — half-size, slightly raised */}
          <span
            className="text-2xl font-bold tabular-nums leading-none ml-0.5"
            style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}
          >
            {secStr}
          </span>
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
