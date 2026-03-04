import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * k6 Load Test for PrayCalc Smart API
 *
 * Run:   k6 run tests/stress/load-test.js
 * JSON:  k6 run tests/stress/load-test.js --out json=results.json
 *
 * Scenarios:
 *   smoke   - 1 VU,  30 seconds  (baseline sanity check)
 *   load    - 50 VU, 5 minutes   (typical traffic)
 *   stress  - 200 VU, 2 minutes  (peak traffic)
 *   spike   - 1000 VU, 30 seconds (sudden burst)
 */

const BASE_URL = __ENV.BASE_URL || 'https://api.praycalc.com';

// Custom metrics
const errorRate = new Rate('errors');
const prayerTimesLatency = new Trend('prayer_times_latency');
const healthLatency = new Trend('health_latency');

// Sample coordinates for random selection
const LOCATIONS = [
  { lat: 40.7128, lng: -74.006, name: 'New York' },
  { lat: 51.5074, lng: -0.1278, name: 'London' },
  { lat: 21.4225, lng: 39.8262, name: 'Makkah' },
  { lat: 24.7136, lng: 46.6753, name: 'Riyadh' },
  { lat: 41.0082, lng: 28.9784, name: 'Istanbul' },
  { lat: 33.8688, lng: 151.2093, name: 'Sydney' },
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  { lat: 30.0444, lng: 31.2357, name: 'Cairo' },
  { lat: 3.139, lng: 101.6869, name: 'Kuala Lumpur' },
  { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
  { lat: 23.8103, lng: 90.4125, name: 'Dhaka' },
  { lat: 31.5497, lng: 74.3436, name: 'Lahore' },
  { lat: 36.1901, lng: 44.0091, name: 'Erbil' },
  { lat: 48.8566, lng: 2.3522, name: 'Paris' },
  { lat: 52.52, lng: 13.405, name: 'Berlin' },
  { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
  { lat: 19.076, lng: 72.8777, name: 'Mumbai' },
  { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
  { lat: -33.8688, lng: 151.2093, name: 'Melbourne' },
  { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
];

const METHODS = ['isna', 'mwl', 'egypt', 'umm_al_qura', 'tehran', 'karachi'];
const MADHABS = ['shafii', 'hanafi'];

function randomLocation() {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}

function randomMethod() {
  return METHODS[Math.floor(Math.random() * METHODS.length)];
}

function randomMadhab() {
  return MADHABS[Math.floor(Math.random() * MADHABS.length)];
}

function randomDate() {
  const year = 2026;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      startTime: '35s',
      tags: { scenario: 'load' },
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
      ],
      startTime: '6m',
      tags: { scenario: 'stress' },
    },
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 1000 },
        { duration: '20s', target: 1000 },
        { duration: '5s', target: 0 },
      ],
      startTime: '9m',
      tags: { scenario: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    errors: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
    prayer_times_latency: ['p(95)<200', 'p(99)<400'],
    health_latency: ['p(95)<50', 'p(99)<100'],
  },
};

export default function () {
  group('Health Check', () => {
    const healthRes = http.get(`${BASE_URL}/health`);
    healthLatency.add(healthRes.timings.duration);

    const healthOk = check(healthRes, {
      'health: status 200': (r) => r.status === 200,
      'health: body contains ok': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'ok';
        } catch {
          return false;
        }
      },
      'health: response < 50ms': (r) => r.timings.duration < 50,
    });

    errorRate.add(!healthOk);
  });

  group('Prayer Times', () => {
    const loc = randomLocation();
    const method = randomMethod();
    const madhab = randomMadhab();
    const date = randomDate();

    const url = `${BASE_URL}/api/v1/times?lat=${loc.lat}&lng=${loc.lng}&date=${date}&method=${method}&madhab=${madhab}`;
    const res = http.get(url, {
      tags: { name: 'prayer_times' },
    });

    prayerTimesLatency.add(res.timings.duration);

    const prayerOk = check(res, {
      'times: status 200': (r) => r.status === 200,
      'times: has fajr': (r) => {
        try {
          return JSON.parse(r.body).fajr !== undefined;
        } catch {
          return false;
        }
      },
      'times: has maghrib': (r) => {
        try {
          return JSON.parse(r.body).maghrib !== undefined;
        } catch {
          return false;
        }
      },
      'times: has isha': (r) => {
        try {
          return JSON.parse(r.body).isha !== undefined;
        } catch {
          return false;
        }
      },
      'times: response < 200ms': (r) => r.timings.duration < 200,
      'times: cache-control header': (r) => {
        const cc = r.headers['Cache-Control'] || r.headers['cache-control'];
        return cc && cc.includes('max-age');
      },
    });

    errorRate.add(!prayerOk);
  });

  group('Invalid Request Handling', () => {
    // Test that invalid requests return 400, not 500
    const invalidRes = http.get(`${BASE_URL}/api/v1/times?lat=999&lng=0`);

    check(invalidRes, {
      'invalid: returns 400': (r) => r.status === 400,
      'invalid: has error message': (r) => {
        try {
          return JSON.parse(r.body).error !== undefined;
        } catch {
          return false;
        }
      },
    });
  });

  sleep(Math.random() * 2 + 0.5);
}

export function handleSummary(data) {
  return {
    'results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const metrics = data.metrics;
  let summary = '\n=== PrayCalc Load Test Summary ===\n\n';

  if (metrics.http_req_duration) {
    const d = metrics.http_req_duration.values;
    summary += `HTTP Request Duration:\n`;
    summary += `  avg: ${d.avg?.toFixed(1)}ms\n`;
    summary += `  p50: ${d['p(50)']?.toFixed(1)}ms\n`;
    summary += `  p95: ${d['p(95)']?.toFixed(1)}ms\n`;
    summary += `  p99: ${d['p(99)']?.toFixed(1)}ms\n`;
    summary += `  max: ${d.max?.toFixed(1)}ms\n\n`;
  }

  if (metrics.prayer_times_latency) {
    const p = metrics.prayer_times_latency.values;
    summary += `Prayer Times Latency:\n`;
    summary += `  avg: ${p.avg?.toFixed(1)}ms\n`;
    summary += `  p95: ${p['p(95)']?.toFixed(1)}ms\n`;
    summary += `  p99: ${p['p(99)']?.toFixed(1)}ms\n\n`;
  }

  if (metrics.http_reqs) {
    summary += `Total Requests: ${metrics.http_reqs.values.count}\n`;
    summary += `RPS: ${metrics.http_reqs.values.rate?.toFixed(1)}\n`;
  }

  if (metrics.errors) {
    summary += `Error Rate: ${(metrics.errors.values.rate * 100).toFixed(2)}%\n`;
  }

  summary += '\n=================================\n';
  return summary;
}
