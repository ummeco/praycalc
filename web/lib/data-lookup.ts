import "server-only";
import fs from "fs";
import path from "path";

interface AutoRecord {
  n: string;
  p?: number;
  i?: string | number;
}

export interface GeoRecord {
  n: string;
  p?: number;
  e?: number;
  y: number;  // latitude
  x: number;  // longitude
  t: string;  // IANA timezone
  i?: string | number;
}

// Module-level cache — loaded once per serverless function instance
let autoData: AutoRecord[] | null = null;
let geoData: GeoRecord[] | null = null;
let geoByName: Map<string, GeoRecord> | null = null;
let geoByIata: Map<string, GeoRecord> | null = null;
let geoByZip: Map<string, GeoRecord> | null = null;

function getAutoData(): AutoRecord[] {
  if (!autoData) {
    const filePath = path.join(process.cwd(), "data", "auto.json");
    autoData = JSON.parse(fs.readFileSync(filePath, "utf-8")) as AutoRecord[];
  }
  return autoData;
}

function getGeoData(): GeoRecord[] {
  if (!geoData) {
    const filePath = path.join(process.cwd(), "data", "geo.json");
    geoData = JSON.parse(fs.readFileSync(filePath, "utf-8")) as GeoRecord[];
  }
  return geoData;
}

function getGeoByNameMap(): Map<string, GeoRecord> {
  if (!geoByName) {
    const data = getGeoData();
    geoByName = new Map(data.map((r) => [r.n.toLowerCase(), r]));
  }
  return geoByName;
}

function getGeoByIataMap(): Map<string, GeoRecord> {
  if (!geoByIata) {
    const data = getGeoData();
    geoByIata = new Map(
      data
        .filter((r) => r.i != null && /^[A-Za-z]{3}$/.test(String(r.i)))
        .map((r) => [String(r.i).toUpperCase(), r]),
    );
  }
  return geoByIata;
}

function getGeoByZipMap(): Map<string, GeoRecord> {
  if (!geoByZip) {
    const data = getGeoData();
    geoByZip = new Map(
      data
        .filter((r) => r.i != null && /^\d{5}$/.test(String(r.i)))
        .map((r) => [String(r.i), r]),
    );
  }
  return geoByZip;
}

export function searchAutoComplete(query: string): AutoRecord[] {
  const data = getAutoData();
  const term = query.toLowerCase();
  return data
    .filter((r) => {
      const name = r.n.toLowerCase();
      const code = (r.i ?? "").toString().toLowerCase();
      return name.startsWith(term) || code.startsWith(term);
    })
    .sort((a, b) => (b.p ?? 0) - (a.p ?? 0))
    .slice(0, 10);
}

export function lookupGeoByName(name: string): GeoRecord | null {
  const term = name.toLowerCase();

  // O(1) exact match via map
  const exact = getGeoByNameMap().get(term);
  if (exact) return exact;

  // Fall back to startsWith scan (for partial prefix queries)
  const data = getGeoData();
  const matches = data
    .filter((r) => {
      const n = r.n.toLowerCase();
      const i = (r.i ?? "").toString().toLowerCase();
      return n.startsWith(term) || i.startsWith(term);
    })
    .sort((a, b) => (b.p ?? 0) - (a.p ?? 0));

  return matches[0] ?? null;
}

export function lookupGeoByCoords(lat: number, lng: number): GeoRecord | null {
  const data = getGeoData();
  let closest: GeoRecord | null = null;
  let minDist = Infinity;
  for (const record of data) {
    const dist = (record.y - lat) ** 2 + (record.x - lng) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = record;
    }
  }
  return closest;
}

export function lookupGeoByIata(iata: string): GeoRecord | null {
  return getGeoByIataMap().get(iata.toUpperCase()) ?? null;
}

export function lookupGeoByZip(zip: string): GeoRecord | null {
  return getGeoByZipMap().get(zip) ?? null;
}

export function lookupGeoBySlug(
  country: string,
  state: string,
  city: string,
): GeoRecord | null {
  const cityName = city.replace(/-/g, " ");
  const cc = country.toUpperCase();

  if (country === "us") {
    return lookupGeoByName(`${cityName}, ${state.toUpperCase()}, US`);
  }

  if (state.toLowerCase() === country.toLowerCase()) {
    // No real state — format is "City, CC"
    return lookupGeoByName(`${cityName}, ${cc}`);
  }

  // Has state — format is "City, ST, CC"
  return (
    lookupGeoByName(`${cityName}, ${state.toUpperCase()}, ${cc}`) ??
    lookupGeoByName(`${cityName}, ${cc}`)
  );
}
