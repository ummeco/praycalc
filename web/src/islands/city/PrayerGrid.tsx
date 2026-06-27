/**
 * PrayerGrid.tsx — Prayer times grid for the city page.
 *
 * PURPOSE: Render the day's prayer times as rows. Honors madhab (via the prayers
 *   prop), 12/24h format, and the Qiyam toggle. Highlights the next prayer and
 *   shows a live countdown when showCountdown+nowHHMMSS are provided.
 * DOM contract (city-page.spec / settings.spec / rtl.spec):
 *   .prayer-grid > .prayer-row (one per prayer); .prayer-time; .prayer-period
 *   (12h only); .prayer-row.next-prayer for current next; .prayer-countdown.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import {
  DISPLAY_PRAYERS,
  PRAYER_META,
  fmtTime,
  getNextPrayer,
  secondsUntilPrayer,
  fmtCountdown,
  type PrayerResult,
} from '@/lib/prayer-utils';

const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he', 'ckb', 'ps']);

interface Props {
  prayers: PrayerResult;
  use24h: boolean;
  showQiyam: boolean;
  locale?: string;
  nowHHMMSS?: string;
  nextPrayer?: keyof PrayerResult | null;
  showCountdown?: boolean;
}

export default function PrayerGrid({
  prayers,
  use24h,
  showQiyam,
  locale = 'en',
  nowHHMMSS,
  nextPrayer,
  showCountdown,
}: Props) {
  const isRTL = RTL_LOCALES.has(locale.split('-')[0] ?? '');
  const list: Array<keyof PrayerResult> = showQiyam
    ? [...DISPLAY_PRAYERS, 'Qiyam']
    : DISPLAY_PRAYERS;

  // Derive next prayer from clock if not passed explicitly
  const nowHHMM = nowHHMMSS ? nowHHMMSS.slice(0, 5) : undefined;
  const next = nextPrayer ?? (nowHHMM ? getNextPrayer(prayers, nowHHMM, list) : null);

  return (
    <div className="prayer-grid" role="list" aria-label="Prayer times">
      {list.map((prayer) => {
        const meta = PRAYER_META[prayer];
        const { time, period } = fmtTime(prayers[prayer], use24h);
        const name = isRTL ? meta.ar : meta.en;
        const isNext = prayer === next;

        const countdownSec =
          showCountdown && isNext && nowHHMMSS
            ? secondsUntilPrayer(prayers[prayer], nowHHMMSS)
            : 0;
        const countdownStr = countdownSec > 0 ? fmtCountdown(countdownSec) : '';

        return (
          <div
            key={prayer}
            className={`prayer-row${isNext ? ' next-prayer' : ''}`}
            role="listitem"
            aria-label={`${meta.en}: ${time}${period ? ' ' + period : ''}`}
          >
            <span className="prayer-name" lang={isRTL ? 'ar' : 'en'} dir={isRTL ? 'rtl' : 'ltr'}>
              {name}
            </span>
            <div className="prayer-time-col">
              <span className="prayer-time">{time}</span>
              {!use24h && period && <span className="prayer-period">{period}</span>}
              {isNext && countdownStr && (
                <span className="prayer-countdown" aria-label={`${countdownStr} until ${meta.en}`}>
                  {countdownStr}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
