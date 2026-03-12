// Top 500 cities with prayer time data
// Each city has: slug, name, country, countryCode, lat, lng, timezone, population

export interface City {
  slug: string;       // URL slug: 'new-york', 'london', 'mecca'
  name: string;       // Display name: 'New York', 'London', 'Mecca'
  country: string;    // Country name
  countryCode: string; // ISO 3166-1 alpha-2
  lat: number;
  lng: number;
  timezone: string;   // IANA timezone
  population: number; // For sorting
}

// Include at minimum these 50 cities (expand to 500 in production; use 50 for compilation):
export const TOP_CITIES: City[] = [
  { slug: 'mecca', name: 'Mecca', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.3891, lng: 39.8579, timezone: 'Asia/Riyadh', population: 2000000 },
  { slug: 'medina', name: 'Medina', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.5247, lng: 39.5692, timezone: 'Asia/Riyadh', population: 1300000 },
  { slug: 'istanbul', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul', population: 15462452 },
  { slug: 'cairo', name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo', population: 20901000 },
  { slug: 'jakarta', name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta', population: 10562088 },
  { slug: 'karachi', name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi', population: 14910352 },
  { slug: 'dhaka', name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka', population: 10356500 },
  { slug: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata', population: 20667656 },
  { slug: 'new-delhi', name: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', population: 16314838 },
  { slug: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', population: 8982000 },
  { slug: 'new-york', name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', population: 8336817 },
  { slug: 'los-angeles', name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', population: 3979576 },
  { slug: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', population: 2731571 },
  { slug: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', population: 5312000 },
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur', population: 1808000 },
  { slug: 'dubai', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai', population: 3331420 },
  { slug: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh', population: 7676654 },
  { slug: 'tehran', name: 'Tehran', country: 'Iran', countryCode: 'IR', lat: 35.6892, lng: 51.3890, timezone: 'Asia/Tehran', population: 9259000 },
  { slug: 'baghdad', name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad', population: 7144260 },
  { slug: 'amman', name: 'Amman', country: 'Jordan', countryCode: 'JO', lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman', population: 4007526 },
  { slug: 'casablanca', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.5731, lng: -7.5898, timezone: 'Africa/Casablanca', population: 3752000 },
  { slug: 'algiers', name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.7372, lng: 3.0865, timezone: 'Africa/Algiers', population: 2364230 },
  { slug: 'tunis', name: 'Tunis', country: 'Tunisia', countryCode: 'TN', lat: 36.8189, lng: 10.1658, timezone: 'Africa/Tunis', population: 1056247 },
  { slug: 'nairobi', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi', population: 4397073 },
  { slug: 'lagos', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos', population: 14862111 },
  { slug: 'dakar', name: 'Dakar', country: 'Senegal', countryCode: 'SN', lat: 14.7167, lng: -17.4677, timezone: 'Africa/Dakar', population: 3137196 },
  { slug: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', population: 2161000 },
  { slug: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin', population: 3769495 },
  { slug: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam', population: 872680 },
  { slug: 'brussels', name: 'Brussels', country: 'Belgium', countryCode: 'BE', lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels', population: 1208542 },
  { slug: 'madrid', name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid', population: 3223334 },
  { slug: 'rome', name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome', population: 2872800 },
  { slug: 'stockholm', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm', population: 978770 },
  { slug: 'moscow', name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow', population: 12506468 },
  { slug: 'islamabad', name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi', population: 1014825 },
  { slug: 'lahore', name: 'Lahore', country: 'Pakistan', countryCode: 'PK', lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi', population: 11126285 },
  { slug: 'chittagong', name: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', lat: 22.3569, lng: 91.7832, timezone: 'Asia/Dhaka', population: 2592439 },
  { slug: 'hyderabad', name: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.3850, lng: 78.4867, timezone: 'Asia/Kolkata', population: 6993262 },
  { slug: 'chennai', name: 'Chennai', country: 'India', countryCode: 'IN', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata', population: 7088000 },
  { slug: 'kolkata', name: 'Kolkata', country: 'India', countryCode: 'IN', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata', population: 14765000 },
  { slug: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore', population: 5850342 },
  { slug: 'manila', name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila', population: 1780148 },
  { slug: 'bangkok', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok', population: 10539000 },
  { slug: 'ho-chi-minh-city', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', lat: 10.8231, lng: 106.6297, timezone: 'Asia/Ho_Chi_Minh', population: 8993082 },
  { slug: 'beijing', name: 'Beijing', country: 'China', countryCode: 'CN', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai', population: 21542000 },
  { slug: 'shanghai', name: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai', population: 24183300 },
  { slug: 'chicago', name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago', population: 2693976 },
  { slug: 'houston', name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago', population: 2304580 },
  { slug: 'dearborn', name: 'Dearborn', country: 'United States', countryCode: 'US', lat: 42.3223, lng: -83.1763, timezone: 'America/Detroit', population: 109976 },
  { slug: 'melbourne', name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', population: 5078193 },
];
