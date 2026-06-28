import type { PrayerEntry, DisplayMode, NameFormat } from '../lib/ipc-types';
import { formatCountdown, formatTime12, getPrayerDisplay } from '../lib/prayers';

interface Props {
  next: PrayerEntry | null;
  seconds: number;
  displayMode: DisplayMode;
  nameFormat: NameFormat;
  arabicMode: boolean;
}

export default function Countdown({ next, seconds, displayMode, nameFormat, arabicMode }: Props) {
  if (!next) return null;

  const label = getPrayerDisplay(next.name, nameFormat, arabicMode);

  return (
    <div className="px-4 py-3 bg-brand-deep/40 border-b border-brand-dark/40">
      <div className="text-[10px] uppercase tracking-widest text-brand-mid/70 mb-0.5">
        {arabicMode ? label : next.name} in
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-xl font-bold text-brand-light tabular-nums">
          {displayMode === 'countdown' ? formatCountdown(seconds) : formatTime12(next.time)}
        </div>
        {!arabicMode && nameFormat === 'abbrev' && (
          <div className="text-xs text-brand-mid/60 font-medium">{label}</div>
        )}
      </div>
    </div>
  );
}
