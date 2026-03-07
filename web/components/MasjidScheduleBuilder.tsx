"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { searchLocation, type GeoResult } from "@/lib/geo";
import { getHijriDate } from "@/lib/hijri";
import type { PrayerResult } from "@/lib/prayer-utils";

type CalendarMethod = "fcna" | "local";
type Language = "en" | "ar" | "both";

interface ScheduleDay {
  date: string;
  hijriDay: number;
  weekday: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  isLast10: boolean;
}

interface EidInfo {
  date: string;
  weekday: string;
  maghribBefore: string; // sunset the evening before
  eidSalatTime: string;
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AR_LABELS: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
  suhoor: "السحور",
  iftar: "الإفتار",
  taraweeh: "التراويح",
  eidSalat: "صلاة العيد",
};

export default function MasjidScheduleBuilder() {
  const [location, setLocation] = useState<GeoResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [calendarMethod, setCalendarMethod] = useState<CalendarMethod>("fcna");
  const [language, setLanguage] = useState<Language>("en");
  const [eidFitrSalatTime, setEidFitrSalatTime] = useState("08:30");
  const [eidAdhaSalatTime, setEidAdhaSalatTime] = useState("08:30");
  const [schedule, setSchedule] = useState<ScheduleDay[] | null>(null);
  const [eidFitrInfo, setEidFitrInfo] = useState<EidInfo | null>(null);
  const [eidAdhaInfo, setEidAdhaInfo] = useState<EidInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchLocation(q);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  }, []);

  const selectLocation = (geo: GeoResult) => {
    setLocation(geo);
    setSearchQuery(geo.displayName);
    setSearchResults([]);
  };

  const generateSchedule = async () => {
    if (!location) {
      setError("Please select a location first.");
      return;
    }
    setLoading(true);
    setError("");
    setSchedule(null);
    setEidFitrInfo(null);

    try {
      // Find current or next Ramadan
      const now = new Date();
      const hijri = getHijriDate(now);
      let targetYear = hijri.year;
      // If we're past Ramadan this year, look at next year
      if (hijri.month > 9) targetYear += 1;

      // Import prayer-calendar dynamically to get Ramadan dates
      const { getHijriMonthDates } = await import("@/lib/prayer-calendar");
      const ramadanDays = getHijriMonthDates(targetYear, 9);
      const shawwalDays = getHijriMonthDates(targetYear, 10);
      const dhulHijjahDays = getHijriMonthDates(targetYear, 12);

      if (ramadanDays.length === 0) {
        setError("Could not compute Ramadan dates. Please try again.");
        setLoading(false);
        return;
      }

      const fromStr = ramadanDays[0].toISOString().slice(0, 10);
      const toStr = ramadanDays[ramadanDays.length - 1].toISOString().slice(0, 10);
      const tz = location.timezone ?? "UTC";

      // Fetch prayer times for the entire month
      const res = await fetch(
        `/api/prayers?lat=${location.lat}&lng=${location.lng}&tz=${encodeURIComponent(tz)}&from=${fromStr}&to=${toStr}&hanafi=0`,
      );
      if (!res.ok) throw new Error("Failed to fetch prayer times");
      const data: { days: { date: string; prayers: PrayerResult }[] } = await res.json();

      const days: ScheduleDay[] = data.days.map((d, i) => {
        const dt = new Date(d.date + "T12:00:00Z");
        return {
          date: d.date,
          hijriDay: i + 1,
          weekday: WEEKDAY_SHORT[dt.getUTCDay()],
          fajr: d.prayers.Fajr,
          sunrise: d.prayers.Sunrise,
          dhuhr: d.prayers.Dhuhr,
          asr: d.prayers.Asr,
          maghrib: d.prayers.Maghrib,
          isha: d.prayers.Isha,
          isLast10: i + 1 >= 21,
        };
      });
      setSchedule(days);

      // Get Eid al-Fitr info
      if (shawwalDays.length > 0) {
        const eidDate = shawwalDays[0];
        const eidStr = eidDate.toISOString().slice(0, 10);
        const dayBefore = new Date(eidDate.getTime() - 86_400_000);
        const dayBeforeStr = dayBefore.toISOString().slice(0, 10);
        const eidRes = await fetch(
          `/api/prayers?lat=${location.lat}&lng=${location.lng}&tz=${encodeURIComponent(tz)}&from=${dayBeforeStr}&to=${eidStr}&hanafi=0`,
        );
        if (eidRes.ok) {
          const eidData: { days: { date: string; prayers: PrayerResult }[] } = await eidRes.json();
          const eveDay = eidData.days.find((d) => d.date === dayBeforeStr);
          setEidFitrInfo({
            date: eidStr,
            weekday: WEEKDAY_NAMES[eidDate.getUTCDay()],
            maghribBefore: eveDay?.prayers.Maghrib ?? "N/A",
            eidSalatTime: eidFitrSalatTime,
          });
        }
      }

      // Get Eid al-Adha info
      if (dhulHijjahDays.length >= 10) {
        const eidDate = dhulHijjahDays[9]; // 10th of Dhul Hijjah
        const eidStr = eidDate.toISOString().slice(0, 10);
        const dayBefore = new Date(eidDate.getTime() - 86_400_000);
        const dayBeforeStr = dayBefore.toISOString().slice(0, 10);
        const eidRes = await fetch(
          `/api/prayers?lat=${location.lat}&lng=${location.lng}&tz=${encodeURIComponent(tz)}&from=${dayBeforeStr}&to=${eidStr}&hanafi=0`,
        );
        if (eidRes.ok) {
          const eidData: { days: { date: string; prayers: PrayerResult }[] } = await eidRes.json();
          const eveDay = eidData.days.find((d) => d.date === dayBeforeStr);
          setEidAdhaInfo({
            date: eidStr,
            weekday: WEEKDAY_NAMES[eidDate.getUTCDay()],
            maghribBefore: eveDay?.prayers.Maghrib ?? "N/A",
            eidSalatTime: eidAdhaSalatTime,
          });
        }
      }

      // Scroll to schedule
      setTimeout(() => {
        scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso + "T12:00:00Z");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const showAr = language === "ar" || language === "both";
  const showEn = language === "en" || language === "both";

  return (
    <>
      {/* Header */}
      <div className="info-page-header">
        <Link href="/" className="info-page-back">
          &larr; PrayCalc
        </Link>
        <h1 className="info-page-title">Masjid Schedule Builder</h1>
        <p className="info-page-subtitle">
          Generate a complete Ramadan schedule for your masjid with accurate
          Fajr, Maghrib/Iftar, Isha/Taraweeh times, and Eid Salat details.
        </p>
      </div>

      {/* Configuration */}
      <section className="info-section">
        <h2 className="info-h2">Configure Your Schedule</h2>

        {/* Location */}
        <div className="masjid-field">
          <label className="masjid-label">Masjid Location</label>
          <div className="masjid-search-wrap">
            <input
              type="text"
              className="masjid-input"
              placeholder="Search city or address..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searching && <span className="masjid-searching">Searching...</span>}
            {searchResults.length > 0 && (
              <div className="masjid-results">
                {searchResults.map((r) => (
                  <button
                    type="button"
                    key={r.slug}
                    className="masjid-result-item"
                    onClick={() => selectLocation(r)}
                  >
                    {r.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
          {location && (
            <p className="masjid-selected">
              Selected: {location.displayName} ({location.lat.toFixed(4)},{" "}
              {location.lng.toFixed(4)})
            </p>
          )}
        </div>

        {/* Calendar method */}
        <div className="masjid-field">
          <label className="masjid-label">Calendar Method</label>
          <div className="masjid-toggle-group">
            <button
              type="button"
              className={`masjid-toggle ${calendarMethod === "fcna" ? "masjid-toggle--active" : ""}`}
              onClick={() => setCalendarMethod("fcna")}
            >
              FCNA (Calculated)
            </button>
            <button
              type="button"
              className={`masjid-toggle ${calendarMethod === "local" ? "masjid-toggle--active" : ""}`}
              onClick={() => setCalendarMethod("local")}
            >
              Local Moon Sighting
            </button>
          </div>
          {calendarMethod === "local" && (
            <p className="masjid-hint">
              Dates shown are FCNA projections. If your community follows local
              moon sighting, the actual start may differ by 1 day. Adjust
              accordingly once the moon is sighted.
            </p>
          )}
        </div>

        {/* Language */}
        <div className="masjid-field">
          <label className="masjid-label">Language</label>
          <div className="masjid-toggle-group">
            <button
              type="button"
              className={`masjid-toggle ${language === "en" ? "masjid-toggle--active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
            <button
              type="button"
              className={`masjid-toggle ${language === "ar" ? "masjid-toggle--active" : ""}`}
              onClick={() => setLanguage("ar")}
            >
              العربية
            </button>
            <button
              type="button"
              className={`masjid-toggle ${language === "both" ? "masjid-toggle--active" : ""}`}
              onClick={() => setLanguage("both")}
            >
              Both
            </button>
          </div>
        </div>

        {/* Eid times */}
        <div className="masjid-field-row">
          <div className="masjid-field">
            <label className="masjid-label">
              {showEn && "Eid al-Fitr Salat Time"}
              {showAr && <span className="masjid-ar-label">{AR_LABELS.eidSalat}</span>}
            </label>
            <input
              type="time"
              className="masjid-input masjid-input--time"
              title="Eid al-Fitr Salat time"
              value={eidFitrSalatTime}
              onChange={(e) => setEidFitrSalatTime(e.target.value)}
            />
          </div>
          <div className="masjid-field">
            <label className="masjid-label">
              {showEn && "Eid al-Adha Salat Time"}
              {showAr && <span className="masjid-ar-label">{AR_LABELS.eidSalat}</span>}
            </label>
            <input
              type="time"
              className="masjid-input masjid-input--time"
              title="Eid al-Adha Salat time"
              value={eidAdhaSalatTime}
              onChange={(e) => setEidAdhaSalatTime(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="masjid-error">{error}</p>}

        <button
          type="button"
          className="info-cta-btn"
          onClick={generateSchedule}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Ramadan Schedule"}
        </button>
      </section>

      {/* Generated Schedule */}
      {schedule && (
        <div ref={scheduleRef}>
          <section className="info-section">
            <div className="masjid-schedule-header">
              <h2 className="info-h2">
                {showEn && "Ramadan Schedule"}
                {showAr && <span className="masjid-ar-title">جدول رمضان</span>}
              </h2>
              {location && (
                <p className="masjid-schedule-location">{location.displayName}</p>
              )}
              <p className="masjid-schedule-range">
                {fmtDate(schedule[0].date)} &ndash; {fmtDate(schedule[schedule.length - 1].date)}
              </p>
              <button
                type="button"
                className="masjid-print-btn"
                onClick={() => window.print()}
              >
                Print Schedule
              </button>
            </div>

            <div className="info-table-wrap">
              <table className="info-table masjid-schedule-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{showEn ? "Day" : "يوم"}</th>
                    <th>{showEn ? "Date" : "تاريخ"}</th>
                    <th>
                      {showEn && "Suhoor Ends"}
                      {showAr && <span className="masjid-ar-col">{AR_LABELS.suhoor}</span>}
                    </th>
                    <th>
                      {showEn && "Fajr"}
                      {showAr && <span className="masjid-ar-col">{AR_LABELS.fajr}</span>}
                    </th>
                    <th>
                      {showEn && "Dhuhr"}
                      {showAr && <span className="masjid-ar-col">{AR_LABELS.dhuhr}</span>}
                    </th>
                    <th>
                      {showEn && "Asr"}
                      {showAr && <span className="masjid-ar-col">{AR_LABELS.asr}</span>}
                    </th>
                    <th>
                      {showEn && "Iftar / Maghrib"}
                      {showAr && <span className="masjid-ar-col">{AR_LABELS.iftar}</span>}
                    </th>
                    <th>
                      {showEn && "Isha / Taraweeh"}
                      {showAr && <span className="masjid-ar-col">{AR_LABELS.taraweeh}</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day) => (
                    <tr
                      key={day.date}
                      className={day.isLast10 ? "info-table-highlight" : ""}
                    >
                      <td className="masjid-day-num">{day.hijriDay}</td>
                      <td>{day.weekday}</td>
                      <td className="masjid-date-col">{fmtDate(day.date)}</td>
                      <td>{day.fajr}</td>
                      <td>{day.fajr}</td>
                      <td>{day.dhuhr}</td>
                      <td>{day.asr}</td>
                      <td className="masjid-iftar">{day.maghrib}</td>
                      <td>{day.isha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {schedule.some((d) => d.isLast10) && (
              <p className="masjid-last10-note">
                Highlighted rows indicate the last 10 nights of Ramadan,
                which include the blessed Night of Power (Laylatul Qadr).
              </p>
            )}
          </section>

          {/* Eid al-Fitr details */}
          {eidFitrInfo && (
            <section className="info-section">
              <h2 className="info-h2">
                {showEn && "Eid al-Fitr"}
                {showAr && <span className="masjid-ar-title">عيد الفطر</span>}
              </h2>
              <div className="masjid-eid-card">
                <div className="masjid-eid-row">
                  <span className="masjid-eid-label">Date</span>
                  <span>{eidFitrInfo.weekday}, {fmtDate(eidFitrInfo.date)}</span>
                </div>
                <div className="masjid-eid-row">
                  <span className="masjid-eid-label">
                    {showEn && "Ramadan Ends (Maghrib before Eid)"}
                    {showAr && <span className="masjid-ar-col">{AR_LABELS.maghrib}</span>}
                  </span>
                  <span>{eidFitrInfo.maghribBefore}</span>
                </div>
                <div className="masjid-eid-row">
                  <span className="masjid-eid-label">
                    {showEn && "Eid Salat"}
                    {showAr && <span className="masjid-ar-col">{AR_LABELS.eidSalat}</span>}
                  </span>
                  <span>{eidFitrInfo.eidSalatTime}</span>
                </div>
              </div>
            </section>
          )}

          {/* Eid al-Adha details */}
          {eidAdhaInfo && (
            <section className="info-section">
              <h2 className="info-h2">
                {showEn && "Eid al-Adha"}
                {showAr && <span className="masjid-ar-title">عيد الأضحى</span>}
              </h2>
              <div className="masjid-eid-card">
                <div className="masjid-eid-row">
                  <span className="masjid-eid-label">Date</span>
                  <span>{eidAdhaInfo.weekday}, {fmtDate(eidAdhaInfo.date)}</span>
                </div>
                <div className="masjid-eid-row">
                  <span className="masjid-eid-label">
                    {showEn && "Evening Before (Maghrib)"}
                    {showAr && <span className="masjid-ar-col">{AR_LABELS.maghrib}</span>}
                  </span>
                  <span>{eidAdhaInfo.maghribBefore}</span>
                </div>
                <div className="masjid-eid-row">
                  <span className="masjid-eid-label">
                    {showEn && "Eid Salat"}
                    {showAr && <span className="masjid-ar-col">{AR_LABELS.eidSalat}</span>}
                  </span>
                  <span>{eidAdhaInfo.eidSalatTime}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Info section about the tool */}
      {!schedule && (
        <section className="info-section">
          <h2 className="info-h2">About This Tool</h2>
          <div className="info-grid info-grid--2">
            <div className="info-card">
              <h3 className="info-h3">Accurate Prayer Times</h3>
              <p>
                Prayer times are calculated using your exact GPS coordinates
                with the ISNA calculation method (Fajr 15&deg;, Isha 15&deg;).
                Suhoor ends at Fajr, and Iftar begins at Maghrib (sunset).
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Print-Ready</h3>
              <p>
                The generated schedule is designed for printing. Use the Print
                button to create a clean, printer-friendly version that can be
                posted in your masjid or distributed to community members.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Bilingual Support</h3>
              <p>
                Choose English, Arabic, or both for column headers to serve
                your community&apos;s needs. Arabic labels use standard Islamic
                prayer terminology.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Custom Eid Times</h3>
              <p>
                Set your masjid&apos;s Eid Salat time so the schedule includes
                complete Eid day information with sunset times for the night
                before.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
