import type { PrayerEntry, PrayerName } from '../lib/ipc-types';
import { formatTime12 } from '../lib/prayers';

interface Props {
  prayers: PrayerEntry[];
  nextPrayer: PrayerName | null;
}

export default function PrayerList({ prayers, nextPrayer }: Props) {
  return (
    <ul className="divide-y divide-brand-dark/40">
      {prayers.map((p) => {
        const isNext = p.name === nextPrayer;
        return (
          <li
            key={p.name}
            className={`flex items-center justify-between px-4 py-2.5 ${
              isNext ? 'bg-brand-deep/60' : ''
            }`}
          >
            <span
              className={`text-sm font-medium ${isNext ? 'text-brand-light' : 'text-green-200/80'}`}
            >
              {p.name}
              {isNext && (
                <span className="ml-2 text-[10px] font-semibold tracking-widest text-brand-mid uppercase">
                  Next
                </span>
              )}
            </span>
            <span className={`text-sm tabular-nums ${isNext ? 'text-brand-light font-semibold' : 'text-green-300/70'}`}>
              {formatTime12(p.time)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
