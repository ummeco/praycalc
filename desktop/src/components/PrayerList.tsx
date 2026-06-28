import type { PrayerEntry, PrayerName, DisplayMode, NameFormat } from '../lib/ipc-types';
import { formatTime12, getPrayerDisplay } from '../lib/prayers';

interface Props {
  prayers: PrayerEntry[];
  nextPrayer: PrayerName | null;
  currentPrayer: PrayerName | null;
  nameFormat: NameFormat;
  arabicMode: boolean;
  displayMode: DisplayMode;
}

export default function PrayerList({
  prayers,
  nextPrayer,
  currentPrayer,
  nameFormat,
  arabicMode,
  displayMode: _displayMode,
}: Props) {
  return (
    <ul className="divide-y divide-brand-dark/40">
      {prayers.map((p) => {
        const isNext = p.name === nextPrayer;
        const isCurrent = p.name === currentPrayer;
        const displayName = getPrayerDisplay(p.name, nameFormat, arabicMode);
        return (
          <li
            key={p.name}
            className={`flex items-center justify-between px-4 py-2.5 ${
              isNext ? 'bg-brand-mid/20' : isCurrent ? 'bg-brand-deep/30' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Dot indicator: green = passed/current, dim = upcoming */}
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent || (nextPrayer && prayers.findIndex(x => x.name === nextPrayer) > prayers.findIndex(x => x.name === p.name))
                    ? 'bg-brand-mid'
                    : 'bg-brand-dark/40'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isNext ? 'text-brand-light' : isCurrent ? 'text-brand-mid' : 'text-green-200/70'
                } ${arabicMode ? 'font-arabic text-right' : ''}`}
                dir={arabicMode ? 'rtl' : 'ltr'}
              >
                {displayName}
              </span>
              {isNext && (
                <span className="text-[9px] font-semibold tracking-widest text-brand-mid uppercase bg-brand-mid/10 px-1.5 py-0.5 rounded">
                  Next
                </span>
              )}
            </div>
            <span
              className={`text-sm tabular-nums ${
                isNext ? 'text-brand-light font-semibold' : 'text-green-300/60'
              }`}
            >
              {formatTime12(p.time)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
