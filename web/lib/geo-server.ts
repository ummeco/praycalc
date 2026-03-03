import "server-only";
import {
  lookupGeoBySlug,
  lookupGeoByIata,
  lookupGeoByZip,
  type GeoRecord,
} from "./data-lookup";
import type { GeoResult } from "./geo";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Convert a raw GeoRecord into a client-safe GeoResult with slug + display name.
 *
 * Slug formats (matching the old praycalc site):
 *   Airport  → "ABQ"           (single 3-letter IATA code)
 *   US zip   → "us/44030"      (two segments)
 *   Non-US   → "dk/aalborg"    (two segments: country/city)
 *   US city  → "us/pa/conneaut" (three segments: us/state/city)
 */
export function geoRecordToResult(record: GeoRecord): GeoResult {
  const iStr = record.i != null ? String(record.i) : "";

  // ── Airport: 3-letter IATA code ───────────────────────────────────────────
  if (/^[A-Za-z]{3}$/.test(iStr)) {
    const iata = iStr.toUpperCase();
    const parts = record.n.split(", ");
    const countryCode = (parts[parts.length - 1] ?? "").toLowerCase();
    return {
      lat: record.y,
      lng: record.x,
      displayName: record.n,
      city: parts[0],
      state: countryCode,
      country: countryCode,
      slug: iata,
      timezone: record.t,
    };
  }

  // ── US Zipcode: 5-digit numeric ───────────────────────────────────────────
  if (/^\d{5}$/.test(iStr)) {
    // Name format: "City, ST, US (zipcode)"
    const parts = record.n.split(", ");
    const city = parts[0];
    const state = (parts[1] ?? "").toLowerCase();
    return {
      lat: record.y,
      lng: record.x,
      displayName: `${city}, ${parts[1] ?? ""} (${iStr})`,
      city,
      state,
      country: "us",
      slug: `us/${iStr}`,
      timezone: record.t,
    };
  }

  // ── Regular city ──────────────────────────────────────────────────────────
  const parts = record.n.split(", ");

  if (parts.length >= 3) {
    // US city: "City, State, US"
    const city = parts[0];
    const state = parts[1].toLowerCase();
    return {
      lat: record.y,
      lng: record.x,
      displayName: `${city}, ${parts[1]}`,
      city,
      state,
      country: "us",
      slug: `us/${state}/${slugify(city)}`,
      timezone: record.t,
    };
  }

  // Non-US city: "City, CC"
  const city = parts[0];
  const countryCode = (parts[parts.length - 1] ?? "").toLowerCase();
  return {
    lat: record.y,
    lng: record.x,
    displayName: record.n,
    city,
    state: countryCode,
    country: countryCode,
    slug: `${countryCode}/${slugify(city)}`,
    timezone: record.t,
  };
}

/** Resolve the old-style (country, state, city) URL params — used by the US city page. */
export function geocodeSlug(
  country: string,
  state: string,
  city: string,
): GeoResult | null {
  const record = lookupGeoBySlug(country, state, city);
  return record ? geoRecordToResult(record) : null;
}

/**
 * Resolve a slug parts array from the catch-all route.
 *
 *   ["ABQ"]            → airport
 *   ["us", "44030"]    → US zipcode
 *   ["dk", "aalborg"]  → non-US city
 */
export function geocodeSlugParts(parts: string[]): GeoResult | null {
  if (parts.length === 1) {
    // Airport: single 3-letter IATA code
    if (/^[A-Za-z]{3}$/.test(parts[0])) {
      const record = lookupGeoByIata(parts[0]);
      return record ? geoRecordToResult(record) : null;
    }
    return null;
  }

  if (parts.length === 2) {
    const [seg1, seg2] = parts;

    // US zipcode: /us/44030
    if (seg1.toLowerCase() === "us" && /^\d{5}$/.test(seg2)) {
      const record = lookupGeoByZip(seg2);
      return record ? geoRecordToResult(record) : null;
    }

    // Non-US city: /dk/aalborg  (country used as both country and state in lookup)
    const record = lookupGeoBySlug(seg1, seg1, seg2);
    return record ? geoRecordToResult(record) : null;
  }

  return null;
}
