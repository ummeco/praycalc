'use client';
import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PrayerTimes {
  fajr: string;    // "HH:MM"
  maghrib: string; // "HH:MM"
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCountdown(timeStr: string): string {
  if (!timeStr || timeStr === '--:--' || timeStr === 'N/A') return '';
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) return 'passed';
  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Fetch times from the Next.js API route (server-side, no CORS issues). */
async function fetchPrayerTimes(lat: number, lng: number): Promise<PrayerTimes | null> {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date().toISOString().slice(0, 10);
    const url = `/api/ramadan/times?lat=${lat}&lng=${lng}&tz=${encodeURIComponent(tz)}&date=${date}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json() as { fajr: string; maghrib: string };
    if (!data.fajr || !data.maghrib) throw new Error('missing fields');
    return { fajr: data.fajr, maghrib: data.maghrib };
  } catch {
    // Fallback: try smart server directly
    return fetchPrayerTimesFromSmart(lat, lng);
  }
}

/** Fallback: fetch from the smart server public API. */
async function fetchPrayerTimesFromSmart(lat: number, lng: number): Promise<PrayerTimes | null> {
  try {
    const base = process.env.NODE_ENV === 'development'
      ? 'http://localhost:4010'
      : 'https://smart.praycalc.com';
    const url = `${base}/api/v1/public/times?lat=${lat}&lng=${lng}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    // Smart server returns { prayers: { fajr, sunrise, dhuhr, asr, maghrib, isha }, ... }
    const data = await res.json() as { prayers?: { fajr?: string; maghrib?: string } };
    const fajr = data?.prayers?.fajr;
    const maghrib = data?.prayers?.maghrib;
    if (!fajr || !maghrib) return null;
    return { fajr, maghrib };
  } catch {
    return null;
  }
}

/** Read lat/lng from localStorage (set by the main PrayCalc app). */
function getStoredLocation(): { lat: number; lng: number } | null {
  try {
    const lat = localStorage.getItem('city_lat') ?? localStorage.getItem('pc_lat');
    const lng = localStorage.getItem('city_lng') ?? localStorage.getItem('pc_lng');
    if (lat && lng) {
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      if (!isNaN(latN) && !isNaN(lngN)) return { lat: latN, lng: lngN };
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

// ── Ramadan date helpers ──────────────────────────────────────────────────────

/** Known Ramadan start dates (Gregorian) for upcoming years. */
const RAMADAN_STARTS: Record<number, Date> = {
  1445: new Date('2024-03-11'),
  1446: new Date('2025-03-01'),
  1447: new Date('2026-02-18'),
  1448: new Date('2027-02-07'),
  1449: new Date('2028-01-27'),
};

interface RamadanInfo {
  year: number;
  day: number;       // 0 = not currently Ramadan
  daysToEid: number;
}

function getRamadanInfo(): RamadanInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const [yearStr, start] of Object.entries(RAMADAN_STARTS).sort((a, b) => Number(b[0]) - Number(a[0]))) {
    const year = Number(yearStr);
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 29);

    if (today >= startDate && today <= endDate) {
      const day = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1;
      const eid = new Date(startDate);
      eid.setDate(startDate.getDate() + 30);
      const daysToEid = Math.ceil((eid.getTime() - today.getTime()) / 86400000);
      return { year, day, daysToEid: Math.max(0, daysToEid) };
    }
  }

  // Not currently Ramadan — find next upcoming
  const upcoming = Object.entries(RAMADAN_STARTS)
    .map(([y, d]) => ({ year: Number(y), start: new Date(d) }))
    .filter(e => e.start > today)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const eid = new Date(next.start);
    eid.setDate(next.start.getDate() + 30);
    const daysToEid = Math.ceil((eid.getTime() - today.getTime()) / 86400000);
    return { year: next.year, day: 0, daysToEid };
  }

  // No known Ramadan dates found — derive Hijri year from today's date
  const hijri = getHijriDate(today);
  return { year: hijri.year, day: 0, daysToEid: 0 };
}

/** Compute approximate Hijri date for a Gregorian date. */
function getHijriDate(date: Date): { day: number; month: number; monthName: string; year: number } {
  const MONTH_NAMES = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
  ];
  // Julian Day Number for the date
  const jd = Math.floor(date.getTime() / 86400000) + 2440588;
  // Hijri epoch: Julian Day 1948440 = 1 Muharram 1 AH
  const HIJRI_EPOCH = 1948440;
  const daysSinceEpoch = jd - HIJRI_EPOCH;
  const LUNAR_MONTH = 29.530588853;
  const LUNAR_YEAR = LUNAR_MONTH * 12;
  const yearFrac = daysSinceEpoch / LUNAR_YEAR;
  const year = Math.floor(yearFrac) + 1;
  const dayInYear = (yearFrac - Math.floor(yearFrac)) * LUNAR_YEAR;
  const month = Math.min(Math.floor(dayInYear / LUNAR_MONTH) + 1, 12);
  const day = Math.floor(dayInYear % LUNAR_MONTH) + 1;
  return { day, month, monthName: MONTH_NAMES[month - 1], year };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RamadanPage() {
  const [fastingDays, setFastingDays] = useState<Record<number, boolean>>({});
  const [completedJuz, setCompletedJuz] = useState<Set<number>>(new Set());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [timesLoading, setTimesLoading] = useState(true);
  const [, setTick] = useState(0);

  const ramadanInfo = getRamadanInfo();
  const hijriDate = getHijriDate(new Date());
  const totalDays = 30;
  const fastedCount = Object.values(fastingDays).filter(Boolean).length;
  const juzCount = completedJuz.size;

  // Year-scoped localStorage keys so data resets each Ramadan automatically
  const fastingKey = `ramadan_${ramadanInfo.year}_fasting`;
  const juzKey = `ramadan_juz_${ramadanInfo.year}`;

  // Load persisted data + fetch prayer times on mount
  useEffect(() => {
    const stored = localStorage.getItem(fastingKey);
    if (stored) {
      try { setFastingDays(JSON.parse(stored) as Record<number, boolean>); } catch { /* ignore */ }
    }

    const storedJuz = localStorage.getItem(juzKey);
    if (storedJuz) {
      try { setCompletedJuz(new Set(JSON.parse(storedJuz) as number[])); } catch { /* ignore */ }
    }

    const loc = getStoredLocation();
    if (loc) {
      fetchPrayerTimes(loc.lat, loc.lng).then(times => {
        setPrayerTimes(times);
        setTimesLoading(false);
      });
    } else {
      setTimesLoading(false);
    }

    // Refresh countdown every minute
    const timer = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDay = (day: number) => {
    const updated = { ...fastingDays, [day]: !fastingDays[day] };
    setFastingDays(updated);
    localStorage.setItem(fastingKey, JSON.stringify(updated));
  };

  const toggleJuz = (juz: number) => {
    const updated = new Set(completedJuz);
    if (updated.has(juz)) { updated.delete(juz); } else { updated.add(juz); }
    setCompletedJuz(updated);
    localStorage.setItem(juzKey, JSON.stringify([...updated]));
  };

  const fajrTime = prayerTimes?.fajr ?? '--:--';
  const maghribTime = prayerTimes?.maghrib ?? '--:--';
  const iftarCountdown = getCountdown(maghribTime);
  const suhoorCountdown = getCountdown(fajrTime);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* ── Ramadan date header (RAMADAN-3) ── */}
      <div className="bg-green-950 border border-green-800 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl mt-0.5">☽</span>
          <div>
            <h1 className="text-xl font-bold text-white">
              {ramadanInfo.day > 0
                ? `Day ${ramadanInfo.day} of Ramadan`
                : `Ramadan ${ramadanInfo.year}`}
            </h1>
            <p className="text-green-400 text-sm mt-0.5">
              {hijriDate.day} {hijriDate.monthName} {hijriDate.year} AH
            </p>
            {ramadanInfo.daysToEid > 0 && (
              <span className="inline-block mt-2 bg-green-800 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                {ramadanInfo.daysToEid} day{ramadanInfo.daysToEid === 1 ? '' : 's'} to Eid Al-Fitr
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Suhoor / Iftar time cards (RAMADAN-1) ── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-950 border border-yellow-800/40 rounded-xl p-4">
          <p className="text-yellow-500/80 text-xs mb-1 flex items-center gap-1">
            <span>🌙</span> Suhoor (Fajr)
          </p>
          <p className="text-white text-2xl font-bold">
            {timesLoading ? '…' : fajrTime}
          </p>
          {suhoorCountdown && suhoorCountdown !== 'passed' && (
            <p className="text-yellow-500/70 text-xs mt-1">ends in {suhoorCountdown}</p>
          )}
        </div>
        <div className="bg-green-950 border border-yellow-700/60 rounded-xl p-4">
          <p className="text-yellow-500/80 text-xs mb-1 flex items-center gap-1">
            <span>🌅</span> Iftar (Maghrib)
          </p>
          <p className="text-white text-2xl font-bold">
            {timesLoading ? '…' : maghribTime}
          </p>
          {iftarCountdown && iftarCountdown !== 'passed' && (
            <p className="text-yellow-500/70 text-xs mt-1">in {iftarCountdown}</p>
          )}
          {iftarCountdown === 'passed' && (
            <p className="text-green-400 text-xs mt-1">Iftar has passed</p>
          )}
        </div>
      </div>

      {!prayerTimes && !timesLoading && (
        <p className="text-gray-400 text-xs text-center mb-4">
          Open PrayCalc to set your location for accurate prayer times.
        </p>
      )}

      {/* ── Fasting tracker ── */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-900">Fasting Tracker</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {fastedCount} / {totalDays} days
        </span>
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-6 gap-2 mb-8">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
          <button key={day}
            onClick={() => toggleDay(day)}
            className={`aspect-square rounded-xl text-sm font-semibold transition-colors ${
              fastingDays[day]
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-green-100'
            }`}>
            {day}
          </button>
        ))}
      </div>

      {/* ── Juz progress tracker (RAMADAN-2) ── */}
      <div className="border border-green-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-green-900">Quran Progress (30 Juz)</h3>
          <span className="text-green-700 text-sm font-medium">{juzCount} / 30</span>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
            <button
              key={juz}
              type="button"
              onClick={() => toggleJuz(juz)}
              className={`aspect-square rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                completedJuz.has(juz)
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}>
              {juz}
            </button>
          ))}
        </div>
        {/* Progress bar */}
        <progress
          value={juzCount}
          max={30}
          className="w-full h-2 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-green-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-green-600 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-green-600 mb-1"
        />
        <p className="text-green-700 text-xs">{juzCount} / 30 Juz completed</p>
      </div>

      {/* ── Share card ── */}
      <button
        type="button"
        onClick={() => {
          const text = `I've fasted ${fastedCount}/${totalDays} days of Ramadan ${ramadanInfo.year}! 🌙\n\nTrack your Ramadan at praycalc.com/ramadan`;
          if (navigator.share) {
            navigator.share({ text });
          } else {
            navigator.clipboard.writeText(text);
          }
        }}
        className="w-full bg-green-800 text-white py-3 rounded-xl font-semibold hover:bg-green-900 transition-colors">
        Share My Progress
      </button>
    </main>
  );
}
