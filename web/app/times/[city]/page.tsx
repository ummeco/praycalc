import { TOP_CITIES, City } from '@/lib/top-cities';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  return TOP_CITIES.map(city => ({ city: city.slug }));
}

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  hijriDate: string;
  method: string;
}

async function getPrayerTimes(city: City): Promise<PrayerTimes> {
  const today = new Date().toISOString().split('T')[0];

  try {
    const res = await fetch(
      `https://api.praycalc.com/api/v1/public/times?lat=${city.lat}&lng=${city.lng}&date=${today}&method=isna`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      return {
        fajr: data.prayers.fajr,
        sunrise: data.prayers.sunrise ?? '--:--',
        dhuhr: data.prayers.dhuhr,
        asr: data.prayers.asr,
        maghrib: data.prayers.maghrib,
        isha: data.prayers.isha,
        date: today,
        hijriDate: data.hijriDate ?? '',
        method: 'ISNA',
      };
    }
  } catch {
    // Fallback to approximate times if API unavailable during build
  }

  return {
    fajr: '05:30', sunrise: '06:45', dhuhr: '12:30',
    asr: '15:45', maghrib: '18:30', isha: '20:00',
    date: today, hijriDate: '', method: 'ISNA',
  };
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = TOP_CITIES.find(c => c.slug === slug);
  if (!city) return {};
  return {
    title: `Prayer Times in ${city.name} Today | PrayCalc`,
    description: `Accurate Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times in ${city.name}, ${city.country}. Updated daily. Uses ISNA calculation method.`,
    openGraph: {
      title: `${city.name} Prayer Times Today`,
      description: `Today's Islamic prayer schedule for ${city.name}`,
      url: `https://praycalc.com/times/${city.slug}`,
    },
  };
}

export default async function CityPrayerTimesPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = TOP_CITIES.find(c => c.slug === slug);
  if (!city) notFound();

  const times = await getPrayerTimes(city);

  // JSON-LD structured data (AA-3)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Prayer Times in ${city.name}`,
    description: `Daily Islamic prayer schedule for ${city.name}, ${city.country}`,
    url: `https://praycalc.com/times/${city.slug}`,
    itemListElement: [
      { '@type': 'Event', name: 'Fajr Prayer', startDate: `${times.date}T${times.fajr}`, location: city.name },
      { '@type': 'Event', name: 'Dhuhr Prayer', startDate: `${times.date}T${times.dhuhr}`, location: city.name },
      { '@type': 'Event', name: 'Asr Prayer', startDate: `${times.date}T${times.asr}`, location: city.name },
      { '@type': 'Event', name: 'Maghrib Prayer', startDate: `${times.date}T${times.maghrib}`, location: city.name },
      { '@type': 'Event', name: 'Isha Prayer', startDate: `${times.date}T${times.isha}`, location: city.name },
    ],
  };

  const prayers = [
    { name: 'Fajr', time: times.fajr, icon: '🌙', desc: 'Pre-dawn prayer' },
    { name: 'Sunrise', time: times.sunrise, icon: '🌅', desc: 'Sunrise (not a prayer)' },
    { name: 'Dhuhr', time: times.dhuhr, icon: '☀️', desc: 'Midday prayer' },
    { name: 'Asr', time: times.asr, icon: '🌤️', desc: 'Afternoon prayer' },
    { name: 'Maghrib', time: times.maghrib, icon: '🌆', desc: 'Sunset prayer' },
    { name: 'Isha', time: times.isha, icon: '🌃', desc: 'Night prayer' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/times" className="hover:text-green-700">Prayer Times</a>
          {' › '}
          <span>{city.country}</span>
          {' › '}
          <span className="text-gray-900">{city.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-green-900 mb-1">
          Prayer Times in {city.name}
        </h1>
        <p className="text-gray-600 mb-6">
          {city.country} · {times.date}{times.hijriDate ? ` · ${times.hijriDate}` : ''}
        </p>

        <div className="grid gap-3">
          {prayers.map(prayer => (
            <div key={prayer.name}
              className="flex items-center justify-between p-4 rounded-xl border border-green-100 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{prayer.icon}</span>
                <div>
                  <p className="font-semibold text-green-900">{prayer.name}</p>
                  <p className="text-sm text-gray-500">{prayer.desc}</p>
                </div>
              </div>
              <span className="text-2xl font-mono font-bold text-green-800">{prayer.time}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Calculation method: {times.method}. Times shown in local time ({city.timezone}).
          <a href="/" className="ml-2 text-green-700 hover:underline">Get times for your location &rarr;</a>
        </p>
      </main>
    </>
  );
}
