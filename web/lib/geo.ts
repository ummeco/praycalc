import { DateTime } from "luxon";

// Shared by client and server. Keep this file free of server-only imports.
export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
  slug: string; // e.g. "us/pa/erie"
  timezone?: string; // IANA timezone from geo data
}

// Approximate timezone per US state abbreviation (fallback when geo data unavailable)
const US_STATE_TZ: Record<string, string> = {
  al: "America/Chicago", ak: "America/Anchorage", az: "America/Phoenix",
  ar: "America/Chicago", ca: "America/Los_Angeles", co: "America/Denver",
  ct: "America/New_York", de: "America/New_York", fl: "America/New_York",
  ga: "America/New_York", hi: "Pacific/Honolulu", id: "America/Boise",
  il: "America/Chicago", in: "America/Indiana/Indianapolis", ia: "America/Chicago",
  ks: "America/Chicago", ky: "America/New_York", la: "America/Chicago",
  me: "America/New_York", md: "America/New_York", ma: "America/New_York",
  mi: "America/Detroit", mn: "America/Chicago", ms: "America/Chicago",
  mo: "America/Chicago", mt: "America/Denver", ne: "America/Chicago",
  nv: "America/Los_Angeles", nh: "America/New_York", nj: "America/New_York",
  nm: "America/Denver", ny: "America/New_York", nc: "America/New_York",
  nd: "America/Chicago", oh: "America/New_York", ok: "America/Chicago",
  or: "America/Los_Angeles", pa: "America/New_York", ri: "America/New_York",
  sc: "America/New_York", sd: "America/Chicago", tn: "America/Chicago",
  tx: "America/Chicago", ut: "America/Denver", vt: "America/New_York",
  va: "America/New_York", wa: "America/Los_Angeles", wv: "America/New_York",
  wi: "America/Chicago", wy: "America/Denver", dc: "America/New_York",
};

// ── Client-side: call local API routes ────────────────────────────────────

export async function searchLocation(query: string): Promise<GeoResult[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeoResult | null> {
  try {
    const res = await fetch(`/api/geo?lat=${lat}&lng=${lng}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Helpers used by the city page (server-side) ───────────────────────────
// geocodeSlug lives in lib/geo-server.ts (server-only) — import from there.

export function getTimezone(country: string, stateAbbrev: string): string {
  if (country === "us") {
    return US_STATE_TZ[stateAbbrev.toLowerCase()] ?? "America/New_York";
  }
  return "UTC";
}

export function getUtcOffset(timezone: string, date: Date = new Date()): number {
  return DateTime.fromJSDate(date, { zone: timezone }).offset / 60;
}
