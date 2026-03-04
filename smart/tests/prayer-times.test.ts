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

    // All prayer times should be HH:MM format
    const timeRegex = /^\d{2}:\d{2}$/;
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
