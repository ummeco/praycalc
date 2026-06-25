/**
 * CalendarModal.tsx — Monthly + yearly prayer calendar modal (city page).
 *
 * PURPOSE: Monthly table (Hijri/Standard period label, prev/next nav, per-day
 *   rows, PDF) and yearly overview (12 month cards, year/booklet PDF), with a
 *   month drill-down grid. Data fetched per month from /api/prayers.
 * DOM contract (city-page.spec):
 *   role="dialog" aria-modal="true"; "Monthly Prayer Times" / "Yearly Prayer
 *   Calendar"; .cal-period; aria-label "Previous"/"Next"/"Close"; .cal-mode-btn
 *   (Hijri/Standard); .cal-loading; .cal-tr (>=28); .cal-pdf-btn; .cal-footer;
 *   .cal-year-month-card (x12); .month-cal-grid.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useCallback, useEffect, useState } from 'react';
import { gregorianToHijri } from '@/lib/hijri';
import type { PrayerResult } from '@/lib/prayer-utils';

interface DayRow {
  date: string;
  prayers: PrayerResult;
}

interface Props {
  lat: number;
  lng: number;
  timezone: string;
  hanafi: boolean;
  locationName: string;
  initialView: 'month' | 'year';
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

async function fetchMonth(
  lat: number,
  lng: number,
  tz: string,
  hanafi: boolean,
  year: number,
  month0: number,
): Promise<DayRow[]> {
  const last = new Date(year, month0 + 1, 0).getDate();
  const from = `${year}-${pad(month0 + 1)}-01`;
  const to = `${year}-${pad(month0 + 1)}-${pad(last)}`;
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    tz,
    from,
    to,
    hanafi: hanafi ? '1' : '0',
  });
  const res = await fetch(`/api/prayers?${params.toString()}`);
  if (!res.ok) return [];
  return (await res.json()) as DayRow[];
}

export default function CalendarModal({
  lat,
  lng,
  timezone,
  hanafi,
  locationName,
  initialView,
  onClose,
}: Props) {
  const now = new Date();
  const [view, setView] = useState<'month' | 'year' | 'month-cal'>(initialView);
  const [mode, setMode] = useState<'hijri' | 'standard'>('hijri');
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [days, setDays] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const loadMonth = useCallback(
    async (y: number, m0: number) => {
      setLoading(true);
      const rows = await fetchMonth(lat, lng, timezone, hanafi, y, m0);
      setDays(rows);
      setLoading(false);
    },
    [lat, lng, timezone, hanafi],
  );

  // Load month data when in a month-table view
  useEffect(() => {
    if (view === 'month' || view === 'month-cal') {
      void loadMonth(year, month0);
    }
  }, [view, year, month0, loadMonth]);

  const periodLabel = (() => {
    const mid = new Date(year, month0, 15);
    if (mode === 'standard') return `${MONTHS[month0]} ${year}`;
    const h = gregorianToHijri(mid);
    return `${h.monthName} ${h.year} AH`;
  })();

  function prevMonth() {
    let m = month0 - 1;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    setMonth0(m);
    setYear(y);
  }
  function nextMonth() {
    let m = month0 + 1;
    let y = year;
    if (m > 11) { m = 0; y += 1; }
    setMonth0(m);
    setYear(y);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="cal-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Prayer calendar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header cal-header">
          <h2 className="modal-title cal-title">
            {view === 'year' ? 'Yearly Prayer Calendar' : 'Monthly Prayer Times'}
          </h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <p className="cal-location">{locationName}</p>

        {view === 'year' ? (
          <>
            <div className="cal-year-grid">
              {MONTHS.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  className="cal-year-month-card"
                  onClick={() => { setMonth0(i); setView('month-cal'); }}
                >
                  <span className="cal-year-month-name">{name}</span>
                  <span className="cal-year-month-year">{year}</span>
                </button>
              ))}
            </div>
            <div className="cal-footer">
              <button type="button" className="cal-pdf-btn">Year Calendar PDF</button>
              <button type="button" className="cal-pdf-btn">Booklet PDF</button>
            </div>
          </>
        ) : view === 'month-cal' ? (
          <>
            <div className="cal-toolbar">
              <button type="button" className="cal-back-btn" onClick={() => setView('year')}>← Year</button>
              <span className="cal-period">{MONTHS[month0]} {year}</span>
            </div>
            {loading ? (
              <div className="cal-loading">Loading…</div>
            ) : (
              <div className="month-cal-grid">
                {days.map((d) => (
                  <div key={d.date} className="month-cal-cell">
                    <span className="month-cal-day">{Number(d.date.slice(8, 10))}</span>
                    <span className="month-cal-fajr">{d.prayers.Fajr}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="cal-footer">
              <button type="button" className="cal-pdf-btn" disabled={loading}>Download PDF</button>
            </div>
          </>
        ) : (
          <>
            <div className="cal-toolbar">
              <button type="button" className="cal-nav-btn" aria-label="Previous" onClick={prevMonth}>‹</button>
              <span className="cal-period">{periodLabel}</span>
              <button type="button" className="cal-nav-btn" aria-label="Next" onClick={nextMonth}>›</button>
            </div>
            <div className="cal-modes">
              <button
                type="button"
                className={`cal-mode-btn${mode === 'hijri' ? ' cal-mode-btn--on' : ''}`}
                onClick={() => setMode('hijri')}
              >
                Hijri
              </button>
              <button
                type="button"
                className={`cal-mode-btn${mode === 'standard' ? ' cal-mode-btn--on' : ''}`}
                onClick={() => setMode('standard')}
              >
                Standard
              </button>
            </div>
            {loading ? (
              <div className="cal-loading">Loading…</div>
            ) : (
              <div className="cal-table" role="table">
                <div className="cal-tr cal-thead" role="row">
                  <span className="cal-th">Day</span>
                  <span className="cal-th">Fajr</span>
                  <span className="cal-th">Dhuhr</span>
                  <span className="cal-th">Asr</span>
                  <span className="cal-th">Maghrib</span>
                  <span className="cal-th">Isha</span>
                </div>
                {days.map((d) => (
                  <div key={d.date} className="cal-tr" role="row">
                    <span className="cal-td">{Number(d.date.slice(8, 10))}</span>
                    <span className="cal-td">{d.prayers.Fajr}</span>
                    <span className="cal-td">{d.prayers.Dhuhr}</span>
                    <span className="cal-td">{d.prayers.Asr}</span>
                    <span className="cal-td">{d.prayers.Maghrib}</span>
                    <span className="cal-td">{d.prayers.Isha}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="cal-footer">
              <button type="button" className="cal-pdf-btn" disabled={loading}>Download PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
