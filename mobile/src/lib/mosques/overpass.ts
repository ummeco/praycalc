/**
 * Purpose: Query the free OpenStreetMap Overpass API for mosques near a given
 *   lat/lng, parse the response into a flat list sorted by distance.
 * Inputs: Search center (latitude, longitude in decimal degrees).
 * Outputs: Mosque[] — id, name, lat, lng, distanceKm — sorted nearest-first, capped at 40.
 * Constraints: Overpass (overpass-api.de) is a free, keyless public API run by
 *   volunteers — this module MUST stay a good citizen: exactly one HTTP request
 *   per search (no retries/pagination loops), a 15s query timeout matching the
 *   Overpass QL `[timeout:15]` clause, and a hard 40-result cap via `out center 40`
 *   so we never pull an unbounded response. Per the Overpass/OSM license (ODbL),
 *   any UI that renders this data MUST display "Data © OpenStreetMap contributors"
 *   attribution (enforced in MosqueFinderScreen, not here). Distance is computed
 *   locally with an independent haversine implementation — deliberately NOT
 *   importing the qibla feature's great-circle bearing math, to keep this module
 *   free of a dependency on an unrelated feature.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-mosque-finder-overpass
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS_METERS = 10_000;
const RESULT_CAP = 40;
const QUERY_TIMEOUT_SECONDS = 15;
/** Client-side abort fires a hair after the server-side `[timeout:15]`, so a slow
 *  Overpass instance gets to respond with its own timeout error first. */
const FETCH_TIMEOUT_MS = (QUERY_TIMEOUT_SECONDS + 3) * 1000;

const EARTH_RADIUS_KM = 6371;

/** A mosque returned by the Overpass search, ready for display. */
export interface Mosque {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
}

/** Typed error so callers (UI) can branch on network vs. parse failures if needed. */
export class MosqueSearchError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MosqueSearchError';
  }
}

interface OverpassCenter {
  lat: number;
  lon: number;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: OverpassCenter;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Great-circle distance between two lat/lng points in kilometers (haversine).
 * Implemented locally (not imported from the qibla feature) so this data layer
 * has no coupling to an unrelated feature's math.
 */
function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/** Build the Overpass QL query string for mosques within SEARCH_RADIUS_METERS of a point. */
function buildQuery(lat: number, lng: number): string {
  return (
    `[out:json][timeout:${QUERY_TIMEOUT_SECONDS}];` +
    `(node["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${lat},${lng});` +
    `way["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${lat},${lng}););` +
    `out center ${RESULT_CAP};`
  );
}

/** Extract usable coordinates from an Overpass element — nodes have lat/lon directly, ways/relations need `.center`. */
function elementCoords(el: OverpassElement): { lat: number; lng: number } | null {
  if (typeof el.lat === 'number' && typeof el.lon === 'number') {
    return { lat: el.lat, lng: el.lon };
  }
  if (el.center && typeof el.center.lat === 'number' && typeof el.center.lon === 'number') {
    return { lat: el.center.lat, lng: el.center.lon };
  }
  return null;
}

/**
 * Search for mosques within 10km of the given coordinates via the Overpass API.
 * Makes exactly one HTTP request. Throws MosqueSearchError on network failure,
 * non-OK response, or unparseable JSON.
 */
export async function searchNearbyMosques(lat: number, lng: number): Promise<Mosque[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(buildQuery(lat, lng))}`,
      signal: controller.signal,
    });
  } catch (err) {
    throw new MosqueSearchError('Could not reach the mosque search service. Check your connection.', err);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new MosqueSearchError(`Mosque search failed (HTTP ${response.status}).`);
  }

  let data: OverpassResponse;
  try {
    data = (await response.json()) as OverpassResponse;
  } catch (err) {
    throw new MosqueSearchError('Mosque search returned an unreadable response.', err);
  }

  const mosques: Mosque[] = [];
  for (const el of data.elements ?? []) {
    const coords = elementCoords(el);
    if (!coords) continue;
    mosques.push({
      id: `${el.type}/${el.id}`,
      name: el.tags?.name ?? 'Mosque',
      lat: coords.lat,
      lng: coords.lng,
      distanceKm: haversineDistanceKm(lat, lng, coords.lat, coords.lng),
    });
  }

  mosques.sort((a, b) => a.distanceKm - b.distanceKm);
  return mosques.slice(0, RESULT_CAP);
}
