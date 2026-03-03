/**
 * GET /api/calendar/pdf
 *
 * Generates and streams a prayer calendar PDF using jsPDF.
 *
 * Query params:
 *   lat         — latitude (required)
 *   lng         — longitude (required)
 *   tz          — IANA timezone string (required, e.g. "America/New_York")
 *   city        — city name for header (required)
 *   country     — country name for header (optional, defaults to "")
 *   year        — 4-digit Gregorian year (required)
 *   month       — 1-12 Gregorian month (required for monthly/ramadan, ignored for yearly)
 *   type        — "monthly" | "yearly" | "ramadan" (required)
 *   madhab      — "hanafi" | any other value → Shafi'i/standard Asr (optional)
 *   timeFormat  — "12h" | "24h" (optional, default "12h")
 */

import { type NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getPrayerTimes } from "@/lib/prayers";
import { getUtcOffset } from "@/lib/geo";
import { getHijriDate } from "@/lib/hijri";
import {
  getGregorianMonthDates,
  getGregorianYearMonths,
  getHijriMonthDates,
  HIJRI_MONTHS,
  GREG_MONTHS,
  toDateStr,
  weekdayShort,
} from "@/lib/prayer-calendar";
import { fmtTime, type PrayerResult } from "@/lib/prayer-utils";

// ── Brand palette (matches PrayerCalendarModal) ───────────────────────────────

const GREEN: [number, number, number] = [30, 94, 47];
const GREEND: [number, number, number] = [13, 47, 23];
const GREENMID: [number, number, number] = [38, 107, 56];
const GREENLT: [number, number, number] = [201, 242, 122];
const WHITE: [number, number, number] = [255, 255, 255];
const INK: [number, number, number] = [22, 22, 22];
const DIM: [number, number, number] = [148, 148, 148];
const BORDER: [number, number, number] = [210, 224, 210];
const ROW_ALT: [number, number, number] = [247, 250, 247];
const RAMADAN_GOLD: [number, number, number] = [180, 120, 20];
const RAMADAN_LIGHT: [number, number, number] = [255, 248, 230];
const RAMADAN_SUHOOR: [number, number, number] = [60, 100, 160];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(raw: string, use24h: boolean): string {
  if (!raw || raw === "N/A") return "—";
  const { time, period } = fmtTime(raw, use24h);
  if (use24h) return time;
  return `${time} ${period}`;
}

/** Subtract `minutes` from a "HH:MM:SS" string. Returns "N/A" if input is invalid. */
function subtractMinutes(timeStr: string, minutes: number): string {
  if (!timeStr || timeStr === "N/A") return "N/A";
  const parts = timeStr.split(":");
  if (parts.length < 2) return "N/A";
  const totalMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) - minutes;
  if (isNaN(totalMins)) return "N/A";
  const h = Math.floor(((totalMins % 1440) + 1440) % 1440 / 60);
  const m = ((totalMins % 1440) + 1440) % 1440 % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
}

/** Find the first Gregorian date (in a given year) where the Hijri month is Ramadan (9). */
function findRamadanStartGregorian(gYear: number): Date | null {
  // Ramadan typically falls somewhere in the year. Scan all months.
  for (let m = 1; m <= 12; m++) {
    const dates = getGregorianMonthDates(gYear, m);
    for (const d of dates) {
      const h = getHijriDate(d);
      if (h.month === 9) return d;
    }
  }
  return null;
}

/** Collect all Gregorian dates that fall within Hijri Ramadan for a given Gregorian year. */
function getRamadanDates(gYear: number): Date[] {
  const start = findRamadanStartGregorian(gYear);
  if (!start) return [];

  const h = getHijriDate(start);
  return getHijriMonthDates(h.year, 9);
}

/** Fetch prayer times for an array of dates. */
function calcPrayerMap(
  dates: Date[],
  lat: number,
  lng: number,
  tz: string,
  hanafi: boolean,
): Map<string, PrayerResult> {
  const map = new Map<string, PrayerResult>();
  for (const d of dates) {
    const offset = getUtcOffset(tz, d);
    const prayers = getPrayerTimes(d, lat, lng, offset, hanafi);
    map.set(toDateStr(d), prayers);
  }
  return map;
}

// ── PDF generators ────────────────────────────────────────────────────────────

/**
 * Monthly — portrait A4 timetable.
 * One page with a header and an autoTable listing all days in the month.
 */
function buildMonthlyPDF(
  dates: Date[],
  dayMap: Map<string, PrayerResult>,
  cityLabel: string,
  periodLabel: string,
  use24h: boolean,
  hanafi: boolean,
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ML = 16;
  const MR = 16;
  const PW = 210;

  // Header
  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.rect(ML, 11, 2.5, 15, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(cityLabel, ML + 7, 18.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(DIM[0], DIM[1], DIM[2]);
  doc.text(periodLabel, ML + 7, 24.5);
  if (hanafi) {
    doc.setFontSize(6.5);
    doc.text("Hanafi Asr", PW - MR, 24.5, { align: "right" });
  }
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setLineWidth(0.35);
  doc.line(ML, 29, PW - MR, 29);

  // Table
  const head = ["Date", "Day", "Hijri", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const body = dates.map((d) => {
    const ds = toDateStr(d);
    const p = dayMap.get(ds);
    const h = getHijriDate(d);
    const gregDate = `${GREG_MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`;
    const hijriDate = `${h.day} ${HIJRI_MONTHS[h.month - 1] ?? ""}`;
    const prayers: Array<keyof PrayerResult> = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    return [
      gregDate,
      weekdayShort(d),
      hijriDate,
      ...prayers.map((k) => (p ? formatTime(p[k], use24h) : "—")),
    ];
  });

  autoTable(doc, {
    head: [head],
    body,
    margin: { left: ML, right: MR },
    startY: 32,
    styles: {
      fontSize: 7,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 },
      font: "helvetica",
      textColor: INK,
      lineColor: BORDER,
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: GREEN,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
    },
    columnStyles: {
      0: { cellWidth: 18, halign: "left" },
      1: { cellWidth: 12, halign: "center", textColor: DIM },
      2: { cellWidth: 28, halign: "left", textColor: DIM, fontSize: 6.5 },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "right", textColor: DIM },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
      7: { cellWidth: 22, halign: "right" },
      8: { cellWidth: 22, halign: "right" },
    },
    alternateRowStyles: { fillColor: ROW_ALT },
  });

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(DIM[0], DIM[1], DIM[2]);
    doc.text(
      "Prayer times are calculated estimates \u2014 verify with your local Islamic authority.",
      ML,
      287,
    );
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text("praycalc.com", PW - MR, 287, { align: "right" });
  }

  return doc;
}

/**
 * Yearly — landscape A4, one page per month.
 * Each page is a 7-column calendar grid with prayer times in each cell.
 */
function drawCalendarPage(
  doc: jsPDF,
  dates: Date[],
  dayMap: Map<string, PrayerResult>,
  monthLabel: string,
  cityLabel: string,
  use24h: boolean,
): void {
  const PW = 297;
  const PH = 210;
  const ML = 8;
  const MR = 8;
  const MT = 8;
  const MB = 8;
  const HEADER_H = 18;
  const DOW_H = 7;
  const DOW_ROW_Y = MT + HEADER_H;
  const GRID_Y = DOW_ROW_Y + DOW_H;
  const GRID_H = PH - GRID_Y - MB - 5;
  const COLS = 7;
  const CW = (PW - ML - MR) / COLS;
  const CAL_KEYS: Array<keyof PrayerResult> = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const ABBR: Partial<Record<keyof PrayerResult, string>> = {
    Fajr: "Faj",
    Dhuhr: "Dhr",
    Asr: "Asr",
    Maghrib: "Mgr",
    Isha: "Ish",
  };
  const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Group dates into week rows with leading blank cells
  const firstDow = dates.length > 0 ? dates[0].getUTCDay() : 0;
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null as null),
    ...dates,
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7);
    while (row.length < 7) row.push(null);
    weeks.push(row);
  }
  const CH = weeks.length ? GRID_H / weeks.length : GRID_H;

  // Header bar
  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.rect(ML, MT, PW - ML - MR, HEADER_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text(cityLabel, ML + 4, MT + 8.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  doc.text(monthLabel, ML + 4, MT + 14.5);
  doc.setFontSize(6);
  doc.setTextColor(180, 220, 180);
  doc.text("praycalc.com", PW - MR - 4, MT + HEADER_H - 4, { align: "right" });

  // Day-of-week row
  doc.setFillColor(GREENMID[0], GREENMID[1], GREENMID[2]);
  doc.rect(ML, DOW_ROW_Y, PW - ML - MR, DOW_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  for (let c = 0; c < COLS; c++) {
    doc.text(DOW_FULL[c], ML + c * CW + CW / 2, DOW_ROW_Y + 4.6, { align: "center" });
  }

  // Grid cells
  weeks.forEach((week, ri) => {
    week.forEach((day, ci) => {
      const cx = ML + ci * CW;
      const cy = GRID_Y + ri * CH;
      doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      doc.setLineWidth(0.2);
      doc.rect(cx, cy, CW, CH);
      if (!day) return;

      const ds = toDateStr(day);
      const p = dayMap.get(ds);
      const h = getHijriDate(day);
      const gDay = day.getUTCDate();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      doc.text(String(gDay), cx + 2.5, cy + 6.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5);
      doc.setTextColor(DIM[0], DIM[1], DIM[2]);
      const hijriRef = `${h.day} ${(HIJRI_MONTHS[h.month - 1] ?? "").split(" ")[0]}`;
      doc.text(hijriRef, cx + 2.5, cy + 10.5);

      if (p) {
        const lineH = (CH - 13) / 5;
        CAL_KEYS.forEach((k, ki) => {
          const ty = cy + 13.5 + ki * lineH;
          const { time: tStr } = fmtTime(p[k], use24h);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(4.5);
          doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
          doc.text(ABBR[k] ?? "", cx + 2.5, ty);
          doc.setTextColor(INK[0], INK[1], INK[2]);
          doc.text(tStr, cx + CW - 2, ty, { align: "right" });
        });
      }
    });
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(DIM[0], DIM[1], DIM[2]);
  doc.text(
    "Prayer times are calculated estimates \u2014 verify with your local Islamic authority.",
    ML,
    PH - MB,
  );
}

function buildYearlyPDF(
  lat: number,
  lng: number,
  tz: string,
  hanafi: boolean,
  gYear: number,
  cityLabel: string,
  use24h: boolean,
): jsPDF {
  const groups = getGregorianYearMonths(gYear);
  const yearLabel = `${gYear} CE`;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  let first = true;
  for (const group of groups) {
    const dayMap = calcPrayerMap(group.dates, lat, lng, tz, hanafi);
    if (!first) doc.addPage();
    first = false;

    // Add Hijri month overlay to the label
    const sampleDate = group.dates[Math.floor(group.dates.length / 2)];
    const h = getHijriDate(sampleDate);
    const hijriRef = h.monthName ? ` \u00b7 ${h.monthName} ${h.year} AH` : "";
    const label = `${group.label} ${yearLabel}${hijriRef}`;

    drawCalendarPage(doc, group.dates, dayMap, label, cityLabel, use24h);
  }

  return doc;
}

/**
 * Ramadan — portrait A4 timetable with Suhoor + Iftar prominently displayed.
 * Suhoor = Fajr - 10 min. Iftar = Maghrib.
 */
function buildRamadanPDF(
  dates: Date[],
  dayMap: Map<string, PrayerResult>,
  cityLabel: string,
  ramadanLabel: string,
  use24h: boolean,
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ML = 14;
  const MR = 14;
  const PW = 210;

  // Header — dark green with Ramadan gold accent
  doc.setFillColor(GREEND[0], GREEND[1], GREEND[2]);
  doc.rect(0, 0, PW, 36, "F");
  doc.setFillColor(RAMADAN_GOLD[0], RAMADAN_GOLD[1], RAMADAN_GOLD[2]);
  doc.rect(ML, 9, 3, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text(cityLabel, ML + 9, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  doc.text(ramadanLabel, ML + 9, 25);
  doc.setFontSize(7);
  doc.setTextColor(RAMADAN_GOLD[0], RAMADAN_GOLD[1], RAMADAN_GOLD[2]);
  doc.text("Ramadan Prayer Timetable", ML + 9, 31.5);
  doc.setFontSize(6.5);
  doc.setTextColor(GREENLT[0], GREENLT[1], GREENLT[2]);
  doc.text("praycalc.com", PW - MR, 31.5, { align: "right" });

  // Note about Suhoor
  doc.setFillColor(RAMADAN_LIGHT[0], RAMADAN_LIGHT[1], RAMADAN_LIGHT[2]);
  doc.rect(ML, 38, PW - ML - MR, 7, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(RAMADAN_GOLD[0], RAMADAN_GOLD[1], RAMADAN_GOLD[2]);
  doc.text(
    "Suhoor ends 10 minutes before Fajr. Iftar is at Maghrib. Verify with your local Islamic authority.",
    PW / 2,
    42.5,
    { align: "center" },
  );

  // Table
  const head = ["Day", "Date", "Hijri", "Suhoor Ends", "Fajr", "Sunrise", "Dhuhr", "Asr", "Iftar (Maghrib)", "Isha"];
  const body = dates.map((d) => {
    const ds = toDateStr(d);
    const p = dayMap.get(ds);
    const h = getHijriDate(d);
    const gDate = `${GREG_MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`;
    const hijriDate = `${h.day} Ram.`;
    const suhoorRaw = p ? subtractMinutes(p.Fajr, 10) : "N/A";
    return [
      weekdayShort(d),
      gDate,
      hijriDate,
      formatTime(suhoorRaw, use24h),
      p ? formatTime(p.Fajr, use24h) : "—",
      p ? formatTime(p.Sunrise, use24h) : "—",
      p ? formatTime(p.Dhuhr, use24h) : "—",
      p ? formatTime(p.Asr, use24h) : "—",
      p ? formatTime(p.Maghrib, use24h) : "—",
      p ? formatTime(p.Isha, use24h) : "—",
    ];
  });

  autoTable(doc, {
    head: [head],
    body,
    margin: { left: ML, right: MR },
    startY: 47,
    styles: {
      fontSize: 7,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 },
      font: "helvetica",
      textColor: INK,
      lineColor: BORDER,
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: GREEND,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center", textColor: DIM },
      1: { cellWidth: 18, halign: "left" },
      2: { cellWidth: 16, halign: "center", textColor: DIM, fontSize: 6.5 },
      3: { cellWidth: 22, halign: "right", textColor: [RAMADAN_SUHOOR[0], RAMADAN_SUHOOR[1], RAMADAN_SUHOOR[2]] as [number, number, number], fontStyle: "bold" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 18, halign: "right", textColor: DIM },
      6: { cellWidth: 18, halign: "right" },
      7: { cellWidth: 18, halign: "right" },
      8: { cellWidth: 24, halign: "right", textColor: [RAMADAN_GOLD[0], RAMADAN_GOLD[1], RAMADAN_GOLD[2]] as [number, number, number], fontStyle: "bold" },
      9: { cellWidth: 18, halign: "right" },
    },
    alternateRowStyles: { fillColor: ROW_ALT },
    // Highlight Jumu'ah (Friday) rows with a subtle green tint
    didParseCell: (data) => {
      if (data.section === "body") {
        const day = dates[data.row.index];
        if (day && day.getUTCDay() === 5) {
          data.cell.styles.fillColor = [240, 252, 235] as [number, number, number];
        }
      }
    },
  });

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(DIM[0], DIM[1], DIM[2]);
    doc.text(
      "Fasting hours are from Suhoor ends until Iftar. Prayer times are calculated estimates.",
      ML,
      287,
    );
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text("praycalc.com", PW - MR, 287, { align: "right" });
  }

  return doc;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const lat = parseFloat(p.get("lat") ?? "");
  const lng = parseFloat(p.get("lng") ?? "");
  const tz = p.get("tz") ?? "UTC";
  const city = p.get("city") ?? "Unknown City";
  const country = p.get("country") ?? "";
  const year = parseInt(p.get("year") ?? "", 10);
  const month = parseInt(p.get("month") ?? "1", 10);
  const type = (p.get("type") ?? "monthly") as "monthly" | "yearly" | "ramadan";
  const madhab = p.get("madhab") ?? "";
  const timeFormat = p.get("timeFormat") ?? "12h";

  // Validate required numeric params
  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Missing or invalid lat/lng" }, { status: 400 });
  }
  if (isNaN(year) || year < 1900 || year > 2200) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  if (!["monthly", "yearly", "ramadan"].includes(type)) {
    return NextResponse.json({ error: "Invalid type — must be monthly, yearly, or ramadan" }, { status: 400 });
  }
  if ((type === "monthly" || type === "ramadan") && (isNaN(month) || month < 1 || month > 12)) {
    // For monthly and ramadan, month is used to derive the year context but Ramadan month
    // detection is automatic, so we only hard-fail for monthly.
    if (type === "monthly") {
      return NextResponse.json({ error: "Invalid month — must be 1–12" }, { status: 400 });
    }
  }

  const hanafi = madhab.toLowerCase() === "hanafi";
  const use24h = timeFormat === "24h";
  const cityLabel = country ? `${city}, ${country}` : city;

  // Sanitize city/country for filename
  const safeCity = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  let doc: jsPDF;
  let filename: string;

  try {
    if (type === "monthly") {
      const dates = getGregorianMonthDates(year, month);
      const dayMap = calcPrayerMap(dates, lat, lng, tz, hanafi);
      const monthName = GREG_MONTHS[month - 1] ?? String(month);
      const periodLabel = `${monthName} ${year}`;
      doc = buildMonthlyPDF(dates, dayMap, cityLabel, periodLabel, use24h, hanafi);
      filename = `praycalc-${safeCity}-${year}-${String(month).padStart(2, "0")}.pdf`;

    } else if (type === "yearly") {
      doc = buildYearlyPDF(lat, lng, tz, hanafi, year, cityLabel, use24h);
      filename = `praycalc-${safeCity}-${year}-yearly.pdf`;

    } else {
      // Ramadan
      const ramadanDates = getRamadanDates(year);
      if (ramadanDates.length === 0) {
        return NextResponse.json({ error: "Could not determine Ramadan dates for the given year" }, { status: 500 });
      }

      const dayMap = calcPrayerMap(ramadanDates, lat, lng, tz, hanafi);

      // Determine the Hijri year for Ramadan in this Gregorian year
      const firstDay = ramadanDates[0];
      const h = getHijriDate(firstDay);
      const lastDay = ramadanDates[ramadanDates.length - 1];
      const hLast = getHijriDate(lastDay);

      // Date range label e.g. "Mar 1 – Mar 30, 2025 · Ramadan 1446 AH"
      const gregStart = `${GREG_MONTHS[firstDay.getUTCMonth()].slice(0, 3)} ${firstDay.getUTCDate()}`;
      const gregEnd = `${GREG_MONTHS[lastDay.getUTCMonth()].slice(0, 3)} ${lastDay.getUTCDate()}, ${lastDay.getUTCFullYear()}`;
      const ramadanLabel = `${gregStart} – ${gregEnd} \u00b7 Ramadan ${h.year} AH (${ramadanDates.length} days)`;

      // Hijri year label for the filename — use the year that Ramadan 1 falls in
      const hYear = h.year !== hLast.year ? `${h.year}-${hLast.year}` : String(h.year);

      doc = buildRamadanPDF(ramadanDates, dayMap, cityLabel, ramadanLabel, use24h);
      filename = `praycalc-${safeCity}-ramadan-${hYear}.pdf`;
    }

    // Generate PDF buffer
    const buffer = doc.output("arraybuffer");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });

  } catch (err) {
    console.error("[/api/calendar/pdf] PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
