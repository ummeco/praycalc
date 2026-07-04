/**
 * geo.server.ts — Server-side geo utilities for Astro endpoints/pages.
 *
 * PURPOSE: Slug resolution and GeoRecord → GeoResult conversion.
 *   Reads from data/ JSON files via Node.js fs (server-side only).
 * INPUTS: URL slug parts, GeoRecord objects
 * OUTPUTS: GeoResult objects
 * CONSTRAINTS: Only import from Astro .astro pages or API endpoints
 * REF: P2-E3-W02-S02-T03
 */

import {
  lookupGeoBySlug,
  lookupGeoByIata,
  lookupGeoByName,
  lookupGeoByZip,
  type GeoRecord,
} from './data-lookup.server';
import type { GeoResult } from './geo';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Convert a raw GeoRecord into a GeoResult with slug + display name */
export function geoRecordToResult(record: GeoRecord): GeoResult {
  const iStr = record.i != null ? String(record.i) : '';

  if (/^[A-Za-z]{3}$/.test(iStr)) {
    const iata = iStr.toUpperCase();
    const parts = record.n.split(', ');
    const countryCode = (parts[parts.length - 1] ?? '').toLowerCase();
    return {
      lat: record.y, lng: record.x,
      displayName: record.n,
      city: parts[0] ?? '', state: countryCode, country: countryCode,
      slug: iata, timezone: record.t,
    };
  }

  if (/^\d{5}$/.test(iStr)) {
    const parts = record.n.split(', ');
    const city = parts[0] ?? '';
    const state = (parts[1] ?? '').toLowerCase();
    return {
      lat: record.y, lng: record.x,
      displayName: `${city}, ${parts[1] ?? ''} (${iStr})`,
      city, state, country: 'us',
      slug: `us/${iStr}`, timezone: record.t,
    };
  }

  const parts = record.n.split(', ');
  if (parts.length >= 3) {
    const city = parts[0] ?? '';
    const state = (parts[1] ?? '').toLowerCase();
    return {
      lat: record.y, lng: record.x,
      displayName: `${city}, ${parts[1] ?? ''}`,
      city, state, country: 'us',
      slug: `us/${state}/${slugify(city)}`, timezone: record.t,
    };
  }

  const city = parts[0] ?? '';
  const countryCode = (parts[parts.length - 1] ?? '').toLowerCase();
  return {
    lat: record.y, lng: record.x,
    displayName: record.n,
    city, state: countryCode, country: countryCode,
    slug: `${countryCode}/${slugify(city)}`, timezone: record.t,
  };
}

/** Resolve slug parts array from the catch-all route */
export function geocodeSlugParts(parts: string[]): GeoResult | null {
  if (parts.length === 1) {
    const seg = parts[0] ?? '';
    if (!seg) return null;
    // 3-letter IATA airport codes (e.g. /JFK) resolve to their metro area.
    if (/^[A-Za-z]{3}$/.test(seg)) {
      const record = lookupGeoByIata(seg);
      if (record) return geoRecordToResult(record);
    }
    // Bare city slugs (e.g. /mecca, /new-york, /london) are the primary
    // shareable URLs emitted by /times and the search box. De-slugify the
    // hyphens back to spaces so the name lookup matches (data uses "new york",
    // the slug uses "new-york"), highest-population match wins.
    const record = lookupGeoByName(seg.replace(/-/g, ' '));
    return record ? geoRecordToResult(record) : null;
  }

  if (parts.length === 2) {
    const [seg1, seg2] = parts;
    if (!seg1 || !seg2) return null;

    if (seg1.toLowerCase() === 'us' && /^\d{5}$/.test(seg2)) {
      const record = lookupGeoByZip(seg2);
      return record ? geoRecordToResult(record) : null;
    }

    const record = lookupGeoBySlug(seg1, seg1, seg2);
    return record ? geoRecordToResult(record) : null;
  }

  if (parts.length === 3) {
    const [country, state, city] = parts;
    if (!country || !state || !city) return null;
    const record = lookupGeoBySlug(country, state, city);
    return record ? geoRecordToResult(record) : null;
  }

  return null;
}
