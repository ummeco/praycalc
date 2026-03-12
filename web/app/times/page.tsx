// /times — Prayer times hub page listing all 500 cities
import { TOP_CITIES } from '@/lib/top-cities';
import Link from 'next/link';

export const metadata = {
  title: 'Prayer Times by City | PrayCalc',
  description: 'Accurate Islamic prayer times for 500+ cities worldwide. Find Fajr, Dhuhr, Asr, Maghrib, and Isha times for your city.',
};

export default function TimesPage() {
  const byCountry = TOP_CITIES.reduce((acc, city) => {
    if (!acc[city.country]) acc[city.country] = [];
    acc[city.country].push(city);
    return acc;
  }, {} as Record<string, typeof TOP_CITIES>);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-900 mb-2">Prayer Times by City</h1>
      <p className="text-gray-600 mb-8">Accurate Fajr, Dhuhr, Asr, Maghrib &amp; Isha prayer times for cities worldwide.</p>

      {Object.entries(byCountry).sort(([a],[b]) => a.localeCompare(b)).map(([country, cities]) => (
        <div key={country} className="mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">{country}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {cities.map(city => (
              <Link key={city.slug} href={`/times/${city.slug}`}
                className="px-3 py-2 rounded-lg border border-green-200 hover:bg-green-50 text-sm text-green-900 transition-colors">
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
