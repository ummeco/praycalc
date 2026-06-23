/**
 * 50 cities spanning all continents and latitudes for parity testing.
 * Selected to cover: low/mid/high latitude, all seasons, various timezones.
 */

export interface City {
  name: string;
  lat: number;
  lng: number;
  tz: number;
}

export const CITIES: City[] = [
  // ─── Americas ───────────────────────────────────────────────────────────
  { name: "New York", lat: 40.7128, lng: -74.006, tz: -5 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, tz: -6 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, tz: -8 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, tz: -5 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, tz: -6 },
  { name: "Bogota", lat: 4.711, lng: -74.0721, tz: -5 },
  { name: "Sao Paulo", lat: -23.5505, lng: -46.6333, tz: -3 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, tz: -3 },
  { name: "Lima", lat: -12.0464, lng: -77.0428, tz: -5 },

  // ─── Europe ─────────────────────────────────────────────────────────────
  { name: "London", lat: 51.5074, lng: -0.1278, tz: 0 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, tz: 1 },
  { name: "Berlin", lat: 52.52, lng: 13.405, tz: 1 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, tz: 1 },
  { name: "Rome", lat: 41.9028, lng: 12.4964, tz: 1 },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, tz: 1 },
  { name: "Helsinki", lat: 60.1699, lng: 24.9384, tz: 2 },
  { name: "Oslo", lat: 59.9139, lng: 10.7522, tz: 1 },

  // ─── Middle East ─────────────────────────────────────────────────────────
  { name: "Makkah", lat: 21.3891, lng: 39.8579, tz: 3 },
  { name: "Madinah", lat: 24.5247, lng: 39.5692, tz: 3 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, tz: 3 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, tz: 2 },
  { name: "Riyadh", lat: 24.7136, lng: 46.6753, tz: 3 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, tz: 4 },
  { name: "Baghdad", lat: 33.3152, lng: 44.3661, tz: 3 },
  { name: "Amman", lat: 31.9454, lng: 35.9284, tz: 2 },
  { name: "Beirut", lat: 33.8938, lng: 35.5018, tz: 2 },

  // ─── South/SE Asia ────────────────────────────────────────────────────────
  { name: "Karachi", lat: 24.8607, lng: 67.0011, tz: 5 },
  { name: "Lahore", lat: 31.5204, lng: 74.3587, tz: 5 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, tz: 5.5 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777, tz: 5.5 },
  { name: "Dhaka", lat: 23.8103, lng: 90.4125, tz: 6 },
  { name: "Colombo", lat: 6.9271, lng: 79.8612, tz: 5.5 },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, tz: 7 },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456, tz: 7 },
  { name: "Kuala Lumpur", lat: 3.139, lng: 101.6869, tz: 8 },

  // ─── East Asia & Pacific ──────────────────────────────────────────────────
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, tz: 9 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, tz: 8 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, tz: 10 },
  { name: "Auckland", lat: -36.8509, lng: 174.7645, tz: 12 },

  // ─── Africa ───────────────────────────────────────────────────────────────
  { name: "Lagos", lat: 6.5244, lng: 3.3792, tz: 1 },
  { name: "Nairobi", lat: -1.2921, lng: 36.8219, tz: 3 },
  { name: "Johannesburg", lat: -26.2041, lng: 28.0473, tz: 2 },
  { name: "Casablanca", lat: 33.5731, lng: -7.5898, tz: 1 },
  { name: "Tunis", lat: 36.8065, lng: 10.1815, tz: 1 },
  { name: "Algiers", lat: 36.7538, lng: 3.0588, tz: 1 },
  { name: "Accra", lat: 5.6037, lng: -0.187, tz: 0 },

  // ─── Central Asia ─────────────────────────────────────────────────────────
  { name: "Tashkent", lat: 41.2995, lng: 69.2401, tz: 5 },

  // ─── High latitude (edge cases) ───────────────────────────────────────────
  { name: "Reykjavik", lat: 64.1355, lng: -21.8954, tz: 0 },
  { name: "Anchorage", lat: 61.2181, lng: -149.9003, tz: -9 },
  { name: "Murmansk", lat: 68.9585, lng: 33.0828, tz: 3 },
];
