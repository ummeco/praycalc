import type { PrayerEntry, PrayerName } from '../lib/ipc-types';
import { formatTime12 } from '../lib/prayers';

interface Props {
  prayers: PrayerEntry[];
  nextPrayer: PrayerName | null;
  currentPrayer: PrayerName | null;
  nameFormat: string;
  arabicMode: boolean;
  displayMode: string;
}

export default function PrayerList({ prayers, nextPrayer, currentPrayer, arabicMode }: Props) {
  const ARABIC: Record<string, string> = {
    Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
    Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
  };

  return (
    <ul className="divide-y divide-white/5">
      {prayers.map((p) => {
        const isNext = p.name === nextPrayer;
        const isCurrent = p.name === currentPrayer;
        const isPast = !isNext && !isCurrent &&
          nextPrayer &&
          prayers.findIndex(x => x.name === nextPrayer) > prayers.findIndex(x => x.name === p.name);
        const displayName = arabicMode ? ARABIC[p.name] ?? p.name : p.name;

        return (
          <li
            key={p.name}
            className={`flex items-center justify-between px-5 py-3 ${
              isNext ? 'bg-brand-mid/15' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  isPast || isCurrent ? 'bg-brand-mid' : 'bg-white/15'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isNext ? 'text-white' : isCurrent ? 'text-brand-mid' : 'text-white/55'
                } ${arabicMode ? 'font-arabic' : ''}`}
                dir={arabicMode ? 'rtl' : 'ltr'}
              >
                {displayName}
              </span>
              {isNext && (
                <span className="text-[8px] font-bold tracking-widest text-[#0d2015] bg-brand-light px-1.5 py-0.5 rounded">
                  NEXT
                </span>
              )}
            </div>
            <span
              className={`text-sm tabular-nums ${
                isNext ? 'text-white font-semibold' : 'text-white/40'
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
