/**
 * PrayerGrid.tsx — Prayer times grid for the city page.
 *
 * PURPOSE: Render the day's prayer times as rows. Honors madhab (via the prayers
 *   prop), 12/24h format, and the Qiyam toggle. Shows locale-appropriate prayer
 *   names (Arabic for RTL locales) for i18n/RTL support.
 * DOM contract (city-page.spec / settings.spec / rtl.spec):
 *   .prayer-grid > .prayer-row (one per prayer); .prayer-time; .prayer-period
 *   (12h only). 6 rows by default (incl. Sunrise), 7 with Qiyam.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import {
  DISPLAY_PRAYERS,
  PRAYER_META,
  fmtTime,
  getNextPrayer,
  type PrayerResult,
} from '@/lib/prayer-utils';

const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he', 'ckb', 'ps']);

interface Props {
  prayers: PrayerResult;
  use24h: boolean;
  showQiyam: boolean;
  locale?: string;
  nowHHMM?: string;
}

export default function PrayerGrid({ prayers, use24h, showQiyam, locale = 'en', nowHHMM }: Props) {
  const isRTL = RTL_LOCALES.has(locale.split('-')[0] ?? '');
  const list: Array<keyof PrayerResult> = showQiyam
    ? [...DISPLAY_PRAYERS, 'Qiyam']
    : DISPLAY_PRAYERS;
  const next = nowHHMM ? getNextPrayer(prayers, nowHHMM, list) : null;

  return (
    <div className="prayer-grid" role="list" aria-label="Prayer times">
      {list.map((prayer) => {
        const meta = PRAYER_META[prayer];
        const { time, period } = fmtTime(prayers[prayer], use24h);
        const name = isRTL ? meta.ar : meta.en;
        return (
          <div
            key={prayer}
            className={`prayer-row${prayer === next ? ' next-prayer' : ''}`}
            role="listitem"
            aria-label={`${meta.en}: ${time}${period ? ' ' + period : ''}`}
          >
            <span className="prayer-name" lang={isRTL ? 'ar' : 'en'} dir={isRTL ? 'rtl' : 'ltr'}>
              {name}
            </span>
            <span className="prayer-time">{time}</span>
            {!use24h && period && <span className="prayer-period">{period}</span>}
          </div>
        );
      })}
    </div>
  );
}
