import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('GET /api/v1/times', () => {
  const NYC_LAT = 40.7128;
  const NYC_LNG = -74.006;

  it('returns prayer times for valid NYC coordinates', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('prayers');
    expect(res.body).toHaveProperty('nextPrayer');
    expect(res.body).toHaveProperty('hijriDate');
    expect(res.body).toHaveProperty('qibla');
    expect(res.body).toHaveProperty('meta');
  });

  it('returns correct response shape for prayers', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);

    const { prayers } = res.body;
    expect(prayers).toHaveProperty('fajr');
    expect(prayers).toHaveProperty('sunrise');
    expect(prayers).toHaveProperty('dhuhr');
    expect(prayers).toHaveProperty('asr');
    expect(prayers).toHaveProperty('maghrib');
    expect(prayers).toHaveProperty('isha');

    // All prayer times should be HH:MM format. The hour and minute ranges are
    // asserted explicitly: /^\d{2}:\d{2}$/ also matches "01:60" and "25:00".
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    expect(prayers.fajr).toMatch(timeRegex);
    expect(prayers.sunrise).toMatch(timeRegex);
    expect(prayers.dhuhr).toMatch(timeRegex);
    expect(prayers.asr).toMatch(timeRegex);
    expect(prayers.maghrib).toMatch(timeRegex);
    expect(prayers.isha).toMatch(timeRegex);
  });

  it('returns correct meta fields', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04', method: 'mwl', madhab: 'hanafi' });

    expect(res.status).toBe(200);

    const { meta } = res.body;
    expect(meta.lat).toBeCloseTo(NYC_LAT, 2);
    expect(meta.lng).toBeCloseTo(NYC_LNG, 2);
    expect(meta.date).toBe('2026-03-04');
    expect(meta.method).toBe('mwl');
    expect(meta.madhab).toBe('hanafi');
    expect(meta.timezone).toBe('UTC');
  });

  it('returns qibla bearing as a number', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);
    expect(typeof res.body.qibla.bearing).toBe('number');
    // NYC Qibla is roughly NE (~58 degrees)
    expect(res.body.qibla.bearing).toBeGreaterThan(50);
    expect(res.body.qibla.bearing).toBeLessThan(70);
  });

  it('returns hijriDate as a string', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);
    expect(typeof res.body.hijriDate).toBe('string');
    expect(res.body.hijriDate).toContain('AH');
  });

  it('returns 400 for invalid latitude', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: 91, lng: NYC_LNG });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid coordinates');
  });

  it('returns 400 for invalid longitude', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: 181 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid coordinates');
  });

  it('returns 400 for missing coordinates', async () => {
    const res = await request(app)
      .get('/api/v1/times');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid coordinates');
  });

  it('returns 400 for non-numeric lat/lng', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: 'abc', lng: 'xyz' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid coordinates');
  });

  it('returns 400 for invalid date format', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '03-04-2026' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid date format');
    expect(res.body.message).toContain('YYYY-MM-DD');
  });

  it('returns 400 for date with slashes', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026/03/04' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid date format');
  });

  it('returns 400 for invalid calculation method', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, method: 'invalid_method' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid calculation method');
  });

  it('returns 400 for invalid madhab', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, madhab: 'maliki' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid madhab');
  });

  it('accepts all valid calculation methods', async () => {
    const methods = ['isna', 'mwl', 'egypt', 'umm_al_qura', 'tehran', 'karachi'];

    for (const method of methods) {
      const res = await request(app)
        .get('/api/v1/times')
        .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-06-15', method });

      expect(res.status).toBe(200);
      expect(res.body.meta.method).toBe(method);
    }
  });

  it('accepts both valid madhabs', async () => {
    for (const madhab of ['shafii', 'hanafi']) {
      const res = await request(app)
        .get('/api/v1/times')
        .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-06-15', madhab });

      expect(res.status).toBe(200);
      expect(res.body.meta.madhab).toBe(madhab);
    }
  });

  it('sets Cache-Control header on success', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('max-age=3600');
  });

  it('returns cached result faster on second call with same params', async () => {
    const params = { lat: 35.6762, lng: 139.6503, date: '2026-07-20', method: 'mwl' };

    const start1 = performance.now();
    const res1 = await request(app).get('/api/v1/times').query(params);
    const time1 = performance.now() - start1;

    const start2 = performance.now();
    const res2 = await request(app).get('/api/v1/times').query(params);
    const time2 = performance.now() - start2;

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Both should return identical results
    expect(res1.body.prayers).toEqual(res2.body.prayers);
    expect(res1.body.qibla).toEqual(res2.body.qibla);
    expect(res1.body.meta).toEqual(res2.body.meta);

    // Second call should be faster (or at least not significantly slower)
    // since the result is cached. We use a generous threshold.
    expect(time2).toBeLessThan(time1 + 50);
  });

  it('uses ISNA as default method when none specified', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);
    expect(res.body.meta.method).toBe('isna');
  });

  it('uses shafii as default madhab when none specified', async () => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat: NYC_LAT, lng: NYC_LNG, date: '2026-03-04' });

    expect(res.status).toBe(200);
    expect(res.body.meta.madhab).toBe('shafii');
  });
});

describe('GET /api/v1/times — global coverage', () => {
  // Regression suite for two formatter bugs that shipped because the original
  // format assertion only ran against NYC and used /^\d{2}:\d{2}$/, which
  // happily matches an invalid "01:60".
  //
  //   1. `h < 0` returned "--:--", losing Fajr and Sunrise everywhere east of
  //      Greenwich where they fall before 00:00 UTC (Jakarta, Tokyo, Auckland).
  //   2. Math.round on the fractional part could yield minute 60 ("01:60",
  //      observed for Mecca).
  //
  // Anything asserting on time strings must use STRICT_TIME, never \d{2}.
  const STRICT_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
  const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

  // Spread across every awkward UTC offset, including UTC+13 and UTC+14.
  const CITIES = [
    { name: 'Detroit', lat: 42.3314, lng: -83.0458, utcOffset: -4 },
    { name: 'London', lat: 51.5072, lng: -0.1276, utcOffset: 1 },
    { name: 'Mecca', lat: 21.4225, lng: 39.8262, utcOffset: 3 },
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456, utcOffset: 7 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, utcOffset: 9 },
    { name: 'Auckland', lat: -36.8485, lng: 174.7633, utcOffset: 12 },
    { name: 'Anchorage', lat: 61.2181, lng: -149.9003, utcOffset: -8 },
    { name: 'Kiritimati', lat: 1.8721, lng: -157.4278, utcOffset: 14 },
  ];

  it.each(CITIES)(
    'returns a valid time for every prayer in $name',
    async ({ lat, lng }) => {
      const res = await request(app)
        .get('/api/v1/times')
        .query({ lat, lng, date: '2026-08-28' });

      expect(res.status).toBe(200);
      for (const prayer of PRAYERS) {
        expect(res.body.prayers[prayer]).toMatch(STRICT_TIME);
      }
    },
  );

  it.each(CITIES)('returns a non-null nextPrayer for $name', async ({ lat, lng }) => {
    const res = await request(app)
      .get('/api/v1/times')
      .query({ lat, lng, date: '2026-08-28' });

    expect(res.status).toBe(200);
    expect(res.body.nextPrayer).not.toBeNull();
    expect(res.body.nextPrayer.time).toMatch(STRICT_TIME);
    expect(res.body.nextPrayer.minutesUntil).toBeGreaterThanOrEqual(0);
    expect(res.body.nextPrayer.minutesUntil).toBeLessThanOrEqual(24 * 60);
  });

  it.each(CITIES)(
    'places solar noon near local midday in $name',
    async ({ lat, lng, utcOffset }) => {
      const res = await request(app)
        .get('/api/v1/times')
        .query({ lat, lng, date: '2026-08-28' });

      expect(res.status).toBe(200);

      // Dhuhr is solar noon, so converting from UTC to the city's offset must
      // land near midday. This catches whole-day and whole-hour anchoring slips
      // that a format check alone would miss.
      const [h, m] = (res.body.prayers.dhuhr as string).split(':').map(Number);
      const localHour = (((h! + utcOffset) % 24) + 24) % 24 + m! / 60;
      expect(localHour).toBeGreaterThan(10.5);
      expect(localHour).toBeLessThan(14.5);
    },
  );

  it('never emits a 60 in the minutes field across a full year at Mecca', async () => {
    // Mecca's Fajr rounded to "01:60" on 2026-08-28. Sweep the year so a
    // reintroduced rounding bug cannot hide on an untested date.
    for (let day = 1; day <= 365; day += 7) {
      const date = new Date(Date.UTC(2026, 0, day)).toISOString().split('T')[0];
      const res = await request(app)
        .get('/api/v1/times')
        .query({ lat: 21.4225, lng: 39.8262, date });

      expect(res.status).toBe(200);
      for (const prayer of PRAYERS) {
        expect(res.body.prayers[prayer]).toMatch(STRICT_TIME);
      }
    }
  });
});
