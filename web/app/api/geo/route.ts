import { NextRequest, NextResponse } from "next/server";
import { lookupGeoByCoords, lookupGeoByName } from "@/lib/data-lookup";
import { geoRecordToResult } from "@/lib/geo-server";

/** Extract the best client IP from request headers. Returns null for private/loopback IPs. */
function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const raw = forwarded ? forwarded.split(",")[0].trim() : (realIp ?? null);
  if (!raw) return null;

  // Reject private / loopback ranges
  if (
    raw === "::1" ||
    raw.startsWith("127.") ||
    raw.startsWith("10.") ||
    raw.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(raw)
  ) {
    return null;
  }

  return raw;
}

interface IpapiResponse {
  city?: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  error?: boolean;
}

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const q = request.nextUrl.searchParams.get("q");
  const ip = request.nextUrl.searchParams.get("ip");

  if (lat && lng) {
    const record = lookupGeoByCoords(parseFloat(lat), parseFloat(lng));
    if (!record) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(geoRecordToResult(record));
  }

  if (q) {
    const record = lookupGeoByName(q.trim());
    if (!record) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(geoRecordToResult(record));
  }

  if (ip === "1" || ip === "true") {
    const clientIp = getClientIp(request);
    if (!clientIp) return new NextResponse(null, { status: 204 });

    try {
      const res = await fetch(`https://ipapi.co/${clientIp}/json/`, {
        headers: { Accept: "application/json" },
        // 3-second timeout — don't block the page load
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return new NextResponse(null, { status: 204 });

      const data: IpapiResponse = await res.json();
      if (data.error || !data.latitude || !data.longitude) {
        return new NextResponse(null, { status: 204 });
      }

      const record = lookupGeoByCoords(data.latitude, data.longitude);
      if (!record) return new NextResponse(null, { status: 204 });

      return NextResponse.json(geoRecordToResult(record));
    } catch {
      return new NextResponse(null, { status: 204 });
    }
  }

  return NextResponse.json({ error: "Provide lat+lng, q, or ip=1" }, { status: 400 });
}
