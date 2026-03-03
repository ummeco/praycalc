"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { fmtTime, type PrayerResult } from "@/lib/prayer-utils";
import { getHijriDate } from "@/lib/hijri";
import {
  HIJRI_MONTHS,
  GREG_MONTHS,
  getHijriMonthDates,
  getGregorianMonthDates,
  getHijriYearMonths,
  getGregorianYearMonths,
  prevHijriMonth,
  nextHijriMonth,
  toDateStr,
  weekdayShort,
} from "@/lib/prayer-calendar";

// ── Types ────────────────────────────────────────────────────────────────────

interface DayData {
  date: string;
  prayers: PrayerResult;
}

type CalMode = "hijri" | "greg";
type ModalView = "table" | "year-overview" | "month-cal";

interface Props {
  mode: "monthly" | "yearly";
  lat: number;
  lng: number;
  tz: string;
  locationName: string;
  hanafi: boolean;
  use24h: boolean;
  onClose: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const COL_KEYS: Array<keyof PrayerResult> = [
  "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha",
];
const COL_LABELS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const CAL_KEYS: Array<keyof PrayerResult> = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const ABBR: Record<string, string> = {
  Fajr: "Faj", Dhuhr: "Dhr", Asr: "Asr", Maghrib: "Mgr", Isha: "Ish",
};

const HIJRI_SLUGS = [
  "muharram", "safar", "rabi-awwal", "rabi-thani",
  "jumada-awwal", "jumada-thani", "rajab", "shaban",
  "ramadan", "shawwal", "dhul-qidah", "dhul-hijjah",
];

// Shared PDF palette
const GREEN: [number, number, number] = [30, 94, 47];
const GREEND: [number, number, number] = [13, 47, 23];
const GREENMID: [number, number, number] = [38, 107, 56];
const GREENLT: [number, number, number] = [201, 242, 122];
const WHITE: [number, number, number] = [255, 255, 255];
const INK: [number, number, number] = [22, 22, 22];
const DIM: [number, number, number] = [148, 148, 148];
const BORDER: [number, number, number] = [210, 224, 210];
const ROW_ALT: [number, number, number] = [247, 250, 247];

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseUTCNoon(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00Z");
}

function buildDayMap(days: DayData[]): Map<string, PrayerResult> {
  return new Map(days.map((d) => [d.date, d.prayers]));
}

function formatPrayer(time: string, use24h: boolean, secondary = false): string {
  if (time === "N/A") return "—";
  const { time: t, period } = fmtTime(time, use24h);
  if (secondary) return t;
  return use24h ? t : `${t} ${period}`;
}

function getDateInfo(dateStr: string, calMode: CalMode): { primary: string; secondary: string } {
  const d = parseUTCNoon(dateStr);
  const h = getHijriDate(d);
  if (calMode === "hijri") {
    const gregMon = GREG_MONTHS[d.getUTCMonth()].slice(0, 3);
    return { primary: String(h.day), secondary: `${gregMon} ${d.getUTCDate()}` };
  }
  return {
    primary: String(d.getUTCDate()),
    secondary: `${h.day} ${HIJRI_MONTHS[h.month - 1]?.split(" ")[0] ?? ""}`,
  };
}

/** Group dates into 7-column week rows, with leading null blanks for offset */
function groupIntoWeeks(dates: Date[]): (Date | null)[][] {
  if (!dates.length) return [];
  const firstDow = dates[0].getUTCDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...dates,
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7);
    while (row.length < 7) row.push(null);
    weeks.push(row);
  }
  return weeks;
}

/** Returns the most common Hijri month number (1–12) across a set of dates */
function detectDominantHijriMonth(dates: Date[]): number {
  const counts: Record<number, number> = {};
  for (const d of dates) {
    const h = getHijriDate(d);
    counts[h.month] = (counts[h.month] ?? 0) + 1;
  }
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return entries.length > 0 ? parseInt(entries[0][0]) : 0;
}

/** Fetch a calendar photo and return as a base64 data URL, or null if unavailable */
async function loadPhotoAsBase64(slug: string): Promise<string | null> {
  try {
    const r = await fetch(`/calendar-photos/${slug}.jpg`);
    if (!r.ok) return null;
    const blob = await r.blob();
    return new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ── PDF draw helpers (module-level, no React deps) ───────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawCalendarPage(doc: any, dates: Date[], dayMap: Map<string, PrayerResult>, monthLabel: string, cityLabel: string, mode: CalMode, u24: boolean) {
  const PW = 297; const PH = 210;
  const ML = 8; const MR = 8; const MT = 8; const MB = 8;
  const HEADER_H = 18; const DOW_H = 7;
  const DOW_ROW_Y = MT + HEADER_H;
  const GRID_Y = DOW_ROW_Y + DOW_H;
  const GRID_H = PH - GRID_Y - MB - 5;
  const COLS = 7;
  const CW = (PW - ML - MR) / COLS;
  const weeks = groupIntoWeeks(dates);
  const CH = weeks.length ? GRID_H / weeks.length : GRID_H;
  const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Header bar
  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.rect(ML, MT, PW - ML - MR, HEADER_H, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text(cityLabel, ML + 4, MT + 8.5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  doc.text(monthLabel, ML + 4, MT + 14.5);
  doc.setFontSize(6); doc.setTextColor(180, 220, 180);
  doc.text("praycalc.com", PW - MR - 4, MT + HEADER_H - 4, { align: "right" });

  // DOW row
  doc.setFillColor(GREENMID[0], GREENMID[1], GREENMID[2]);
  doc.rect(ML, DOW_ROW_Y, PW - ML - MR, DOW_H, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(5.5);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  for (let c = 0; c < COLS; c++) {
    doc.text(DOW_FULL[c], ML + c * CW + CW / 2, DOW_ROW_Y + 4.6, { align: "center" });
  }

  // Grid cells
  weeks.forEach((week, ri) => {
    week.forEach((day, ci) => {
      const cx = ML + ci * CW; const cy = GRID_Y + ri * CH;
      doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      doc.setLineWidth(0.2);
      doc.rect(cx, cy, CW, CH);
      if (!day) return;

      const ds = toDateStr(day);
      const p = dayMap.get(ds);
      const h = getHijriDate(day);
      const gDay = day.getUTCDate();
      const dayNum = mode === "hijri" ? String(h.day) : String(gDay);
      const crossRef = mode === "hijri"
        ? `${GREG_MONTHS[day.getUTCMonth()].slice(0, 3)} ${gDay}`
        : `${h.day} ${(HIJRI_MONTHS[h.month - 1] ?? "").split(" ")[0]}`;

      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      doc.text(dayNum, cx + 2.5, cy + 6.5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(5);
      doc.setTextColor(DIM[0], DIM[1], DIM[2]);
      doc.text(crossRef, cx + 2.5, cy + 10.5);

      if (p) {
        const lineH = (CH - 13) / 5;
        CAL_KEYS.forEach((k, ki) => {
          const ty = cy + 13.5 + ki * lineH;
          doc.setFont("helvetica", "normal"); doc.setFontSize(4.5);
          doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
          doc.text(ABBR[k as string] ?? "", cx + 2.5, ty);
          const { time: tStr } = fmtTime(p[k], u24);
          doc.setTextColor(INK[0], INK[1], INK[2]);
          doc.text(tStr, cx + CW - 2, ty, { align: "right" });
        });
      }
    });
  });

  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5);
  doc.setTextColor(DIM[0], DIM[1], DIM[2]);
  doc.text("Prayer times are calculated estimates — verify with your local Islamic authority.", ML, PH - MB);
}

/**
 * Draw a full-page landscape photo spread for the booklet.
 * Uses the provided photo (base64) if available; falls back to gradient artwork.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawPhotoPage(doc: any, photoB64: string | null, monthName: string, yearLabel: string, GStateClass?: unknown) {
  const PW = 297; const PH = 210;

  if (photoB64) {
    doc.addImage(photoB64, "JPEG", 0, 0, PW, PH);
    // Dark overlay at bottom for text legibility
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gs = new (GStateClass as any)({ opacity: 0.72 });
      doc.saveGraphicsState();
      doc.setGState(gs);
      doc.setFillColor(0, 0, 0);
      doc.rect(0, PH * 0.50, PW, PH * 0.50, "F");
      doc.restoreGraphicsState();
    } catch {
      doc.setFillColor(10, 30, 15);
      doc.rect(0, PH * 0.56, PW, PH * 0.44, "F");
    }
  } else {
    // Gradient artwork fallback — deep green with Islamic geometric circles
    doc.setFillColor(GREEND[0], GREEND[1], GREEND[2]);
    doc.rect(0, 0, PW, PH, "F");
    doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setLineWidth(10); doc.circle(PW / 2, PH * 0.36, 52, "S");
    doc.setLineWidth(4);  doc.circle(PW / 2, PH * 0.36, 65, "S");
    doc.setLineWidth(2);  doc.circle(PW / 2, PH * 0.36, 75, "S");
    // Bottom band for text
    doc.setFillColor(GREEND[0], GREEND[1], GREEND[2]);
    doc.rect(0, PH * 0.60, PW, PH * 0.40, "F");
  }

  // Month name
  doc.setFont("helvetica", "bold"); doc.setFontSize(40);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text(monthName, PW / 2, PH * 0.775, { align: "center" });
  // Year label
  doc.setFont("helvetica", "normal"); doc.setFontSize(17);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  doc.text(yearLabel, PW / 2, PH * 0.875, { align: "center" });
  // Watermark
  doc.setFontSize(7); doc.setTextColor(180, 220, 180);
  doc.text("praycalc.com", PW - 7, PH - 5, { align: "right" });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CalTable({ dates, dayMap, todayStr, calMode, use24h }: {
  dates: Date[]; dayMap: Map<string, PrayerResult>;
  todayStr: string; calMode: CalMode; use24h: boolean;
}) {
  return (
    <table className="cal-table">
      <thead>
        <tr>
          <th className="cal-th cal-th--day">Day</th>
          <th className="cal-th cal-th--date">Date</th>
          {COL_LABELS.map((label, i) => (
            <th key={label} className={`cal-th${i === 1 ? " cal-th--secondary" : ""}`}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dates.map((d) => {
          const ds = toDateStr(d);
          const prayers = dayMap.get(ds);
          const isToday = ds === todayStr;
          const { primary, secondary } = getDateInfo(ds, calMode);
          return (
            <tr key={ds} className={`cal-tr${isToday ? " cal-tr--today" : ""}`}>
              <td className="cal-td cal-td--day">{weekdayShort(d)}</td>
              <td className="cal-td cal-td--date">
                <span className="cal-date-primary">{primary}</span>
                <span className="cal-date-secondary">{secondary}</span>
              </td>
              {COL_KEYS.map((key, i) => (
                <td key={key} className={`cal-td cal-td--time${i === 1 ? " cal-td--secondary" : ""}`}>
                  {prayers ? formatPrayer(prayers[key], use24h, i === 1) : "—"}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function MonthCalGrid({ dates, dayMap, todayStr, calMode, use24h }: {
  dates: Date[]; dayMap: Map<string, PrayerResult>;
  todayStr: string; calMode: CalMode; use24h: boolean;
}) {
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeks = groupIntoWeeks(dates);
  return (
    <div className="month-cal-grid">
      <div className="month-cal-header-row">
        {DOW.map((d) => <div key={d} className="month-cal-dow">{d}</div>)}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="month-cal-week">
          {week.map((day, di) => {
            if (!day) return <div key={di} className="month-cal-cell month-cal-cell--empty" />;
            const ds = toDateStr(day);
            const prayers = dayMap.get(ds);
            const isToday = ds === todayStr;
            const { primary, secondary } = getDateInfo(ds, calMode);
            return (
              <div key={ds} className={`month-cal-cell${isToday ? " month-cal-cell--today" : ""}`}>
                <div className="month-cal-day-num">{primary}</div>
                <div className="month-cal-hijri-ref">{secondary}</div>
                {prayers && (
                  <div className="month-cal-prayers">
                    {CAL_KEYS.map((k) => {
                      const { time: t } = fmtTime(prayers[k], use24h);
                      return (
                        <div key={k as string} className="month-cal-prayer">
                          <span className="month-cal-prayer-name">{ABBR[k as string]}</span>
                          <span className="month-cal-prayer-time">{t}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function YearOverview({ calMode, hYear, gYear, currentHijri, today, onSelectMonth }: {
  calMode: CalMode; hYear: number; gYear: number;
  currentHijri: ReturnType<typeof getHijriDate>;
  today: Date; onSelectMonth: (idx: number) => void;
}) {
  const months = calMode === "hijri" ? HIJRI_MONTHS : GREG_MONTHS;
  const currentMonthIdx = calMode === "hijri" ? currentHijri.month - 1 : today.getMonth();
  const isCurrentYear = calMode === "hijri" ? hYear === currentHijri.year : gYear === today.getFullYear();
  return (
    <div className="cal-year-overview">
      <div className="cal-year-months-grid">
        {months.map((name, i) => (
          <button
            key={name}
            type="button"
            className={`cal-year-month-card${isCurrentYear && i === currentMonthIdx ? " cal-year-month-card--current" : ""}`}
            onClick={() => onSelectMonth(i + 1)}
          >
            <span className="cal-year-month-card-name">{name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Down icon (reused) ────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
    </svg>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

export default function PrayerCalendarModal({
  mode,
  lat,
  lng,
  tz,
  locationName,
  hanafi,
  use24h,
  onClose,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toDateStr(today), [today]);
  const currentHijri = useMemo(() => getHijriDate(today), [today]);

  const [calMode, setCalMode] = useState<CalMode>("hijri");
  const [modalView, setModalView] = useState<ModalView>(
    mode === "yearly" ? "year-overview" : "table",
  );

  // Monthly table nav
  const [hMonth, setHMonth] = useState({ year: currentHijri.year, month: currentHijri.month });
  const [gMonth, setGMonth] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  // Yearly nav (year overview + PDF)
  const [hYear, setHYear] = useState(currentHijri.year);
  const [gYear, setGYear] = useState(today.getFullYear());

  // Month-cal nav (opened from year overview)
  const [calHMonth, setCalHMonth] = useState({ year: currentHijri.year, month: currentHijri.month });
  const [calGMonth, setCalGMonth] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [yearPdfLoading, setYearPdfLoading] = useState(false);
  const [bookletPdfLoading, setBookletPdfLoading] = useState(false);
  const [monthCalPdfLoading, setMonthCalPdfLoading] = useState(false);

  // ── Compute date range ─────────────────────────────────────────────────────

  const { fromStr, toStr, periodLabel, calDates } = useMemo(() => {
    if (modalView === "table") {
      const dates = calMode === "hijri"
        ? getHijriMonthDates(hMonth.year, hMonth.month)
        : getGregorianMonthDates(gMonth.year, gMonth.month);
      const label = calMode === "hijri"
        ? `${HIJRI_MONTHS[hMonth.month - 1]} ${hMonth.year} AH`
        : `${GREG_MONTHS[gMonth.month - 1]} ${gMonth.year}`;
      return { fromStr: toDateStr(dates[0]), toStr: toDateStr(dates[dates.length - 1]), periodLabel: label, calDates: undefined as Date[] | undefined };
    }
    if (modalView === "month-cal") {
      const dates = calMode === "hijri"
        ? getHijriMonthDates(calHMonth.year, calHMonth.month)
        : getGregorianMonthDates(calGMonth.year, calGMonth.month);
      const label = calMode === "hijri"
        ? `${HIJRI_MONTHS[calHMonth.month - 1]} ${calHMonth.year} AH`
        : `${GREG_MONTHS[calGMonth.month - 1]} ${calGMonth.year}`;
      return { fromStr: toDateStr(dates[0]), toStr: toDateStr(dates[dates.length - 1]), periodLabel: label, calDates: dates };
    }
    // year-overview — no API call needed
    const label = calMode === "hijri" ? `${hYear} AH` : `${gYear}`;
    return { fromStr: "", toStr: "", periodLabel: label, calDates: undefined as Date[] | undefined };
  }, [modalView, calMode, hMonth, gMonth, hYear, gYear, calHMonth, calGMonth]);

  // ── Fetch prayer data ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!fromStr || !toStr) { setDays([]); return; }
    setLoading(true); setError(null);
    const url = `/api/prayers?lat=${lat}&lng=${lng}&tz=${encodeURIComponent(tz)}&from=${fromStr}&to=${toStr}&hanafi=${hanafi ? 1 : 0}`;
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setDays(data.days ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError("Failed to load prayer times."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [lat, lng, tz, hanafi, fromStr, toStr]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handlePrev = () => {
    if (modalView === "table") {
      if (calMode === "hijri") setHMonth((m) => prevHijriMonth(m.year, m.month));
      else setGMonth((m) => m.month === 1 ? { year: m.year - 1, month: 12 } : { year: m.year, month: m.month - 1 });
    } else if (modalView === "year-overview") {
      if (calMode === "hijri") setHYear((y) => y - 1);
      else setGYear((y) => y - 1);
    } else {
      if (calMode === "hijri") setCalHMonth((m) => prevHijriMonth(m.year, m.month));
      else setCalGMonth((m) => m.month === 1 ? { year: m.year - 1, month: 12 } : { year: m.year, month: m.month - 1 });
    }
  };

  const handleNext = () => {
    if (modalView === "table") {
      if (calMode === "hijri") setHMonth((m) => nextHijriMonth(m.year, m.month));
      else setGMonth((m) => m.month === 12 ? { year: m.year + 1, month: 1 } : { year: m.year, month: m.month + 1 });
    } else if (modalView === "year-overview") {
      if (calMode === "hijri") setHYear((y) => y + 1);
      else setGYear((y) => y + 1);
    } else {
      if (calMode === "hijri") setCalHMonth((m) => nextHijriMonth(m.year, m.month));
      else setCalGMonth((m) => m.month === 12 ? { year: m.year + 1, month: 1 } : { year: m.year, month: m.month + 1 });
    }
  };

  const handleSelectMonth = (monthIdx: number) => {
    if (calMode === "hijri") setCalHMonth({ year: hYear, month: monthIdx });
    else setCalGMonth({ year: gYear, month: monthIdx });
    setModalView("month-cal");
  };

  // ── PDF: Monthly Table (portrait A4) ─────────────────────────────────────

  const handleMonthTablePDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const dayMap = buildDayMap(days);
      const ML = 16; const MR = 16; const PW = 210;
      const asrLabel = hanafi ? "Hanafi Asr" : "";

      const drawHeader = (city: string, period: string) => {
        doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
        doc.rect(ML, 11, 2.5, 15, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(15);
        doc.setTextColor(INK[0], INK[1], INK[2]);
        doc.text(city, ML + 7, 18.5);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        doc.setTextColor(DIM[0], DIM[1], DIM[2]);
        doc.text(period, ML + 7, 24.5);
        doc.setFontSize(6.5);
        if (asrLabel) doc.text(asrLabel, PW - MR, 24.5, { align: "right" });
        doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
        doc.setLineWidth(0.35);
        doc.line(ML, 29, PW - MR, 29);
      };

      const drawFooter = () => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
        doc.setTextColor(DIM[0], DIM[1], DIM[2]);
        doc.text("Prayer times are calculated estimates \u2014 verify with your local Islamic authority.", ML, 287);
        doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
        doc.text("praycalc.com", PW - MR, 287, { align: "right" });
      };

      const headRow = ["Date", "Day", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
      const buildBody = (dates: Date[]) => dates.map((d) => {
        const ds = toDateStr(d);
        const p = dayMap.get(ds);
        const h = getHijriDate(d);
        const dateNum = calMode === "hijri" ? String(h.day) : String(d.getUTCDate());
        return [dateNum, weekdayShort(d), ...COL_KEYS.map((k, i) => (p ? formatPrayer(p[k], use24h, i === 1) : "\u2014"))];
      });

      const colW = {
        0: { cellWidth: 16, halign: "center" as const, textColor: DIM },
        1: { cellWidth: 14, halign: "center" as const, textColor: DIM },
        2: { cellWidth: 24, halign: "right" as const },
        3: { cellWidth: 24, halign: "right" as const, textColor: DIM },
        4: { cellWidth: 24, halign: "right" as const },
        5: { cellWidth: 24, halign: "right" as const },
        6: { cellWidth: 26, halign: "right" as const },
        7: { cellWidth: 26, halign: "right" as const },
      };
      const tblBase = {
        margin: { left: ML, right: MR },
        styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 }, font: "helvetica" as const, textColor: INK, lineColor: BORDER, lineWidth: 0.15, valign: "middle" as const },
        headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: "bold" as const, fontSize: 7.5, cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 } },
        columnStyles: colW,
        alternateRowStyles: { fillColor: ROW_ALT },
        startY: 32 as number,
      };

      const dates = calMode === "hijri" ? getHijriMonthDates(hMonth.year, hMonth.month) : getGregorianMonthDates(gMonth.year, gMonth.month);
      drawHeader(locationName, periodLabel);
      autoTable(doc, { head: [headRow], body: buildBody(dates), ...tblBase });
      drawFooter();

      const slug = `${locationName}-${periodLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      doc.save(`prayer-times-${slug}.pdf`);
    } catch (e) { console.error("PDF failed", e); }
    finally { setPdfLoading(false); }
  }, [days, calMode, use24h, locationName, periodLabel, hMonth, gMonth, hanafi]);

  // ── PDF: Month Calendar (landscape A4, single month) ─────────────────────

  const handleMonthCalPDF = useCallback(async () => {
    setMonthCalPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      drawCalendarPage(doc, calDates ?? [], buildDayMap(days), periodLabel, locationName, calMode, use24h);
      const slug = `${locationName}-${periodLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      doc.save(`prayer-calendar-${slug}.pdf`);
    } catch (e) { console.error("Month cal PDF failed", e); }
    finally { setMonthCalPdfLoading(false); }
  }, [days, calDates, periodLabel, locationName, calMode, use24h]);

  // ── Helper: fetch full year data for PDF ──────────────────────────────────

  const fetchYearData = useCallback(async (mode: CalMode, hy: number, gy: number) => {
    const groups = mode === "hijri" ? getHijriYearMonths(hy) : getGregorianYearMonths(gy);
    const all = groups.flatMap((g) => g.dates);
    const fromDate = toDateStr(all[0]);
    const toDate = toDateStr(all[all.length - 1]);
    const url = `/api/prayers?lat=${lat}&lng=${lng}&tz=${encodeURIComponent(tz)}&from=${fromDate}&to=${toDate}&hanafi=${hanafi ? 1 : 0}`;
    const res = await fetch(url);
    const data = await res.json();
    return { groups, yearDayMap: buildDayMap(data.days ?? []) };
  }, [lat, lng, tz, hanafi]);

  // ── PDF: Year Calendar (12 landscape A4 pages) ────────────────────────────

  const handleYearCalPDF = useCallback(async () => {
    setYearPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { groups, yearDayMap } = await fetchYearData(calMode, hYear, gYear);
      const yearLabel = calMode === "hijri" ? `${hYear} AH` : `${gYear} CE`;
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      let first = true;
      for (const group of groups) {
        if (!first) doc.addPage();
        first = false;
        drawCalendarPage(doc, group.dates, yearDayMap, `${group.label} \u00b7 ${yearLabel}`, locationName, calMode, use24h);
      }
      const slug = `${locationName}-${yearLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      doc.save(`prayer-calendar-${slug}.pdf`);
    } catch (e) { console.error("Year PDF failed", e); }
    finally { setYearPdfLoading(false); }
  }, [fetchYearData, calMode, hYear, gYear, locationName, use24h]);

  // ── PDF: Booklet (landscape A4 — photo spread + calendar per month) ─────────

  const handleBookletPDF = useCallback(async () => {
    setBookletPdfLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsPDFMod = await import("jspdf") as any;
      const jsPDF = jsPDFMod.default;
      const GState = jsPDFMod.GState;

      const { groups, yearDayMap } = await fetchYearData(calMode, hYear, gYear);
      const yearLabel = calMode === "hijri" ? `${hYear} AH` : `${gYear} CE`;
      const calTypeLabel = calMode === "hijri" ? "Hijri Prayer Calendar" : "Prayer Times Calendar";

      // Pre-load photos for all months in parallel (null = graceful fallback)
      const photos = await Promise.all(
        groups.map((g: { dates: Date[] }, i: number) => {
          let slug: string | null;
          if (calMode === "hijri") {
            slug = HIJRI_SLUGS[i] ?? null;
          } else {
            // For Gregorian: Dhul Hijjah check first, then dominant Hijri month
            const hasDhulHijjah = g.dates.some((d) => getHijriDate(d).month === 12);
            if (hasDhulHijjah) {
              slug = "dhul-hijjah";
            } else {
              const m = detectDominantHijriMonth(g.dates);
              slug = m > 0 ? (HIJRI_SLUGS[m - 1] ?? null) : null;
            }
          }
          return slug ? loadPhotoAsBase64(slug) : Promise.resolve(null);
        }),
      );

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const PW = 297; const PH = 210;

      // ── Front cover ───────────────────────────────────────────────────────
      doc.setFillColor(GREEND[0], GREEND[1], GREEND[2]);
      doc.rect(0, 0, PW, PH, "F");
      doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.setLineWidth(9);  doc.circle(PW / 2, PH / 2, 75, "S");
      doc.setLineWidth(4);  doc.circle(PW / 2, PH / 2, 92, "S");
      doc.setLineWidth(2);  doc.circle(PW / 2, PH / 2, 102, "S");
      doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.rect(0, PH * 0.37, PW, 5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(34);
      doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.text(locationName, PW / 2, PH * 0.31, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(22);
      doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
      doc.text(yearLabel, PW / 2, PH * 0.52, { align: "center" });
      doc.setFontSize(14); doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
      doc.text(calTypeLabel, PW / 2, PH * 0.63, { align: "center" });
      doc.setFontSize(9); doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
      doc.text("praycalc.com", PW / 2, PH - 11, { align: "center" });

      // ── 12 months: photo spread + calendar grid ───────────────────────────
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        // Photo spread page
        doc.addPage();
        drawPhotoPage(doc, photos[i], group.label, yearLabel, GState);
        // Calendar grid page (landscape — drawCalendarPage already uses 297×210)
        doc.addPage();
        drawCalendarPage(doc, group.dates, yearDayMap, `${group.label} \u00b7 ${yearLabel}`, locationName, calMode, use24h);
      }

      // ── Back cover ────────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(247, 250, 247);
      doc.rect(0, 0, PW, PH, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(20);
      doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.text("praycalc.com", PW / 2, PH * 0.37, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      doc.text("Prayer times are calculated estimates.", PW / 2, PH * 0.50, { align: "center" });
      doc.text("Verify with your local Islamic authority.", PW / 2, PH * 0.57, { align: "center" });
      doc.setFontSize(8); doc.setTextColor(DIM[0], DIM[1], DIM[2]);
      doc.text("Print double-sided \u00b7 fold in half \u00b7 staple at center fold", PW / 2, PH * 0.68, { align: "center" });

      const slug = `${locationName}-${yearLabel}-booklet`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      doc.save(`prayer-calendar-${slug}.pdf`);
    } catch (e) { console.error("Booklet PDF failed", e); }
    finally { setBookletPdfLoading(false); }
  }, [fetchYearData, calMode, hYear, gYear, locationName, use24h]);

  // ── Keyboard close ─────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const dayMap = useMemo(() => buildDayMap(days), [days]);
  const modalTitle = mode === "monthly" ? "Monthly Prayer Times" : "Yearly Prayer Calendar";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="cal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cal-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="cal-header">
          <div className="cal-header-left">
            {modalView === "month-cal" && (
              <button type="button" className="cal-back-btn" onClick={() => setModalView("year-overview")} aria-label="Back to year overview">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Year
              </button>
            )}
            <div>
              <h2 className="cal-title">{modalTitle}</h2>
              <p className="cal-subtitle">{locationName}</p>
            </div>
          </div>
          <button type="button" className="cal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="cal-controls">
          <div className="cal-nav">
            <button type="button" className="cal-nav-btn" onClick={handlePrev} aria-label="Previous">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="cal-period">{periodLabel}</span>
            <button type="button" className="cal-nav-btn" onClick={handleNext} aria-label="Next">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="cal-mode-toggle">
            <button type="button" className={`cal-mode-btn${calMode === "hijri" ? " cal-mode-btn--on" : ""}`} onClick={() => setCalMode("hijri")}>Hijri</button>
            <button type="button" className={`cal-mode-btn${calMode === "greg" ? " cal-mode-btn--on" : ""}`} onClick={() => setCalMode("greg")}>Standard</button>
          </div>
        </div>

        {/* Body */}
        <div className="cal-body">
          {modalView === "year-overview" ? (
            <YearOverview
              calMode={calMode} hYear={hYear} gYear={gYear}
              currentHijri={currentHijri} today={today}
              onSelectMonth={handleSelectMonth}
            />
          ) : loading ? (
            <div className="cal-loading">
              <svg className="cal-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
              </svg>
              Loading…
            </div>
          ) : error ? (
            <div className="cal-error">{error}</div>
          ) : modalView === "month-cal" ? (
            <div className="cal-table-wrap">
              <MonthCalGrid
                dates={calDates ?? []} dayMap={dayMap}
                todayStr={todayStr} calMode={calMode} use24h={use24h}
              />
            </div>
          ) : (
            <div className="cal-table-wrap">
              <CalTable
                dates={calMode === "hijri" ? getHijriMonthDates(hMonth.year, hMonth.month) : getGregorianMonthDates(gMonth.year, gMonth.month)}
                dayMap={dayMap} todayStr={todayStr} calMode={calMode} use24h={use24h}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cal-footer">
          {modalView === "year-overview" ? (
            <>
              <button type="button" className="cal-pdf-btn cal-pdf-btn--secondary" onClick={handleYearCalPDF} disabled={yearPdfLoading}>
                {yearPdfLoading ? "Generating…" : <><DownloadIcon /> Year Calendar PDF</>}
              </button>
              <button type="button" className="cal-pdf-btn" onClick={handleBookletPDF} disabled={bookletPdfLoading}>
                {bookletPdfLoading ? "Generating…" : <><DownloadIcon /> Booklet PDF</>}
              </button>
            </>
          ) : modalView === "month-cal" ? (
            <button type="button" className="cal-pdf-btn" onClick={handleMonthCalPDF} disabled={monthCalPdfLoading || loading || days.length === 0}>
              {monthCalPdfLoading ? "Generating…" : <><DownloadIcon /> Month Calendar PDF</>}
            </button>
          ) : (
            <button type="button" className="cal-pdf-btn" onClick={handleMonthTablePDF} disabled={pdfLoading || loading || days.length === 0}>
              {pdfLoading ? "Generating…" : <><DownloadIcon /> Download PDF</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
