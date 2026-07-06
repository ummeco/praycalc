/**
 * Purpose: Unit tests for the Overpass mosque-search data layer — response parsing
 *   (node vs. way/.center), distance-sort ordering, the 40-result cap, and the
 *   network-error path.
 * Constraints: fetch is mocked per-test; no real network calls in unit tests
 *   (the live Overpass API is verified separately, out of band).
 */

import { searchNearbyMosques, MosqueSearchError } from '../overpass';

const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe('searchNearbyMosques — parsing', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses a node element using its direct lat/lon and defaults an unnamed way to "Mosque"', async () => {
    mockFetchOnce({
      elements: [
        {
          type: 'node',
          id: 1,
          lat: MECCA_LAT + 0.01,
          lon: MECCA_LNG + 0.01,
          tags: { name: 'Al-Haram Node Mosque', amenity: 'place_of_worship', religion: 'muslim' },
        },
        {
          type: 'way',
          id: 2,
          center: { lat: MECCA_LAT + 0.02, lon: MECCA_LNG + 0.02 },
          tags: { amenity: 'place_of_worship', religion: 'muslim' }, // no name tag
        },
      ],
    });

    const results = await searchNearbyMosques(MECCA_LAT, MECCA_LNG);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('node/1');
    expect(results[0].name).toBe('Al-Haram Node Mosque');
    expect(results[1].id).toBe('way/2');
    expect(results[1].name).toBe('Mosque'); // fallback name
    expect(results[1].lat).toBe(MECCA_LAT + 0.02);
    expect(results[1].lng).toBe(MECCA_LNG + 0.02);
  });

  it('sorts results by great-circle distance, nearest first', async () => {
    mockFetchOnce({
      elements: [
        // Farther node listed first in the raw response
        { type: 'node', id: 10, lat: MECCA_LAT + 0.5, lon: MECCA_LNG + 0.5, tags: { name: 'Far Mosque' } },
        { type: 'node', id: 11, lat: MECCA_LAT + 0.001, lon: MECCA_LNG + 0.001, tags: { name: 'Near Mosque' } },
        { type: 'way', id: 12, center: { lat: MECCA_LAT + 0.1, lon: MECCA_LNG + 0.1 }, tags: { name: 'Mid Mosque' } },
      ],
    });

    const results = await searchNearbyMosques(MECCA_LAT, MECCA_LNG);

    expect(results.map((m) => m.name)).toEqual(['Near Mosque', 'Mid Mosque', 'Far Mosque']);
    expect(results[0].distanceKm).toBeLessThan(results[1].distanceKm);
    expect(results[1].distanceKm).toBeLessThan(results[2].distanceKm);
  });

  it('skips elements with no usable coordinates (no lat/lon and no center)', async () => {
    mockFetchOnce({
      elements: [
        { type: 'relation', id: 20, tags: { name: 'Uncoordinated Relation' } },
        { type: 'node', id: 21, lat: MECCA_LAT, lon: MECCA_LNG, tags: { name: 'Valid Node' } },
      ],
    });

    const results = await searchNearbyMosques(MECCA_LAT, MECCA_LNG);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Valid Node');
  });

  it('caps results at 40 even if more are returned', async () => {
    const elements = Array.from({ length: 55 }, (_, i) => ({
      type: 'node' as const,
      id: i,
      lat: MECCA_LAT + i * 0.001,
      lon: MECCA_LNG + i * 0.001,
      tags: { name: `Mosque ${i}` },
    }));
    mockFetchOnce({ elements });

    const results = await searchNearbyMosques(MECCA_LAT, MECCA_LNG);

    expect(results).toHaveLength(40);
  });
});

describe('searchNearbyMosques — error path', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws a typed MosqueSearchError when the network request fails', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    await expect(searchNearbyMosques(MECCA_LAT, MECCA_LNG)).rejects.toBeInstanceOf(MosqueSearchError);
  });

  it('throws a typed MosqueSearchError on a non-OK HTTP response', async () => {
    mockFetchOnce({}, false, 504);

    await expect(searchNearbyMosques(MECCA_LAT, MECCA_LNG)).rejects.toBeInstanceOf(MosqueSearchError);
  });

  it('throws a typed MosqueSearchError when the response body is not valid JSON', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('unexpected token');
      },
    }) as unknown as typeof fetch;

    await expect(searchNearbyMosques(MECCA_LAT, MECCA_LNG)).rejects.toBeInstanceOf(MosqueSearchError);
  });
});
