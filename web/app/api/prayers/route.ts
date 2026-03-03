import { type NextRequest, NextResponse } from "next/server";
import { getPrayerTimes } from "@/lib/prayers";
import { getUtcOffset } from "@/lib/geo";
import { type PrayerResult } from "@/lib/prayer-utils";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const lat    = parseFloat(p.get("lat") ?? "");
  const lng    = parseFloat(p.get("lng") ?? "");
  const tz     = p.get("tz") ?? "UTC";
  const from   = p.get("from") ?? "";
  const to     = p.get("to")   ?? "";
  const hanafi = p.get("hanafi") === "1";

  if (isNaN(lat) || isNaN(lng) || !from || !to) {
    return NextResponse.json({ error: "Missing or invalid params" }, { status: 400 });
  }

  const fromDate = new Date(from + "T12:00:00Z");
  const toDate   = new Date(to   + "T12:00:00Z");

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const diffDays = Math.round(
    (toDate.getTime() - fromDate.getTime()) / 86_400_000,
  );
  if (diffDays < 0 || diffDays > 400) {
    return NextResponse.json({ error: "Date range out of bounds" }, { status: 400 });
  }

  const days: { date: string; prayers: PrayerResult }[] = [];
  let cur = new Date(fromDate);
  while (cur <= toDate) {
    const offset   = getUtcOffset(tz, cur);
    const prayers  = getPrayerTimes(cur, lat, lng, offset, hanafi);
    days.push({ date: cur.toISOString().slice(0, 10), prayers });
    cur = new Date(cur.getTime() + 86_400_000);
  }

  return NextResponse.json(
    { days },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
