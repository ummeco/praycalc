import { type NextRequest, NextResponse } from "next/server";
import { getPrayerTimes } from "@/lib/prayers";
import { getUtcOffset } from "@/lib/geo";

/**
 * GET /api/calendar/ics — iCal subscription feed.
 *
 * Returns a webcal-compatible .ics file with prayer times as VEVENT entries.
 * Rolls 30 days from the requested start date (default: today).
 *
 * Query params: lat, lng, tz (IANA timezone), hanafi (0|1), days (1-90, default 30)
 *
 * Subscribe in any calendar app: webcal://praycalc.com/api/calendar/ics?lat=40.7128&lng=-74.006&tz=America/New_York
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const lat = parseFloat(p.get("lat") ?? "");
  const lng = parseFloat(p.get("lng") ?? "");
  const tz = p.get("tz") ?? "UTC";
  const hanafi = p.get("hanafi") === "1";
  const days = Math.min(Math.max(parseInt(p.get("days") ?? "30", 10) || 30, 1), 90);

  if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PrayCalc//Prayer Times//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:PrayCalc Prayer Times",
    "X-WR-TIMEZONE:" + tz,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
  ];

  const prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate.getTime() + d * 86_400_000);
    const dateStr = date.toISOString().slice(0, 10);
    const offset = getUtcOffset(tz, date);
    const prayers = getPrayerTimes(date, lat, lng, offset, hanafi);

    for (let i = 0; i < prayerNames.length; i++) {
      const name = prayerNames[i];
      const key = prayerKeys[i];
      const time = prayers[key];
      if (!time || time === "--:--") continue;

      const [hh, mm] = time.split(":").map(Number);
      if (isNaN(hh) || isNaN(mm)) continue;

      // Build DTSTART in UTC offset form
      const ymd = dateStr.replace(/-/g, "");
      const dtStart = `${ymd}T${String(hh).padStart(2, "0")}${String(mm).padStart(2, "0")}00`;
      // End time = start + 5 minutes (for calendar display)
      const endMin = mm + 5;
      const endHH = hh + Math.floor(endMin / 60);
      const endMM = endMin % 60;
      const dtEnd = `${ymd}T${String(endHH).padStart(2, "0")}${String(endMM).padStart(2, "0")}00`;

      const uid = `praycalc-${dateStr}-${key}@praycalc.com`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTART;TZID=${tz}:${dtStart}`);
      lines.push(`DTEND;TZID=${tz}:${dtEnd}`);
      lines.push(`SUMMARY:${name}`);
      lines.push(`DESCRIPTION:${name} prayer time for ${dateStr}`);

      // Add 10-minute reminder alarm for actual prayers (not sunrise)
      if (key !== "Sunrise") {
        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-PT10M");
        lines.push("ACTION:DISPLAY");
        lines.push(`DESCRIPTION:${name} in 10 minutes`);
        lines.push("END:VALARM");
      }

      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");

  const ical = lines.join("\r\n");

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="praycalc.ics"',
      "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
    },
  });
}
