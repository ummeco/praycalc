import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

interface GeoRecord {
  n: string;
  p?: number;
  e?: number;
  y: number;
  x: number;
  t: string;
  i?: string | number;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function recordToUrl(record: GeoRecord): string | null {
  const iStr = record.i != null ? String(record.i) : "";

  // Airport IATA code — single segment slug e.g. /ABQ
  if (/^[A-Za-z]{3}$/.test(iStr)) {
    return `/${iStr.toUpperCase()}`;
  }

  // US Zip code — /us/44030
  if (/^\d{5}$/.test(iStr)) {
    return `/us/${iStr}`;
  }

  const parts = record.n.split(", ");

  if (parts.length >= 3 && parts[parts.length - 1] === "US") {
    // US city — /us/{state}/{city} (three-segment structured route)
    const city = parts[0];
    const state = parts[1].toLowerCase();
    return `/us/${state}/${slugify(city)}`;
  }

  if (parts.length === 2) {
    // Non-US city — /{country}/{city}
    const city = parts[0];
    const countryCode = parts[1].toLowerCase();
    return `/${countryCode}/${slugify(city)}`;
  }

  return null;
}

/**
 * Dynamic sitemap covering the top cities by population.
 *
 * The full geo.json has ~235,000 records (airports, US zips, US cities, global
 * cities). We include:
 *   - Top 5,000 global cities by population (non-US, non-zip, non-airport)
 *   - Top 2,000 US cities by population
 *   - All 623 IATA airport codes (high search value)
 *
 * US zip codes (~41,483) are excluded — they have very low search volume
 * relative to their count and would bloat the sitemap index. They remain
 * accessible via the app but are not submitted to search engines.
 *
 * To include more cities, raise the limits below. Google's sitemap limit
 * is 50,000 URLs per file; consider splitting into multiple sitemaps
 * (via generateSitemaps) if you exceed that threshold.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://praycalc.com";

  const filePath = path.join(process.cwd(), "data", "geo.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as GeoRecord[];

  const airports: GeoRecord[] = [];
  const usCities: GeoRecord[] = [];
  const globalCities: GeoRecord[] = [];

  for (const record of data) {
    const iStr = record.i != null ? String(record.i) : "";

    if (/^[A-Za-z]{3}$/.test(iStr)) {
      airports.push(record);
      continue;
    }

    // Skip US zip codes
    if (/^\d{5}$/.test(iStr)) {
      continue;
    }

    const parts = record.n.split(", ");

    if (parts.length >= 3 && parts[parts.length - 1] === "US") {
      usCities.push(record);
    } else if (parts.length === 2) {
      globalCities.push(record);
    }
  }

  // Sort by population descending; take top N
  const byPop = (a: GeoRecord, b: GeoRecord) => (b.p ?? 0) - (a.p ?? 0);

  const selected = [
    ...airports, // all ~623
    ...usCities.sort(byPop).slice(0, 2000),
    ...globalCities.sort(byPop).slice(0, 5000),
  ];

  const cityEntries: MetadataRoute.Sitemap = [];

  for (const record of selected) {
    const url = recordToUrl(record);
    if (!url) continue;

    cityEntries.push({
      url: `${baseUrl}${url}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/institutions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/masjids`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  return [...staticPages, ...cityEntries];
}
