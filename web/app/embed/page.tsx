// Embeddable widget — rendered inside iframe
// Shows prayer times for browser's location
'use client';
import { useState, useEffect } from 'react';

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
}

export default function EmbedPage() {
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined" && !navigator.geolocation) return false;
    return true;
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const today = new Date().toISOString().split('T')[0];
      try {
        const res = await fetch(`/api/v1/public/times?lat=${lat}&lng=${lng}&date=${today}`);
        const data = await res.json();
        setPrayers([
          { name: 'Fajr', time: data.prayers.fajr, isNext: data.nextPrayer === 'fajr' },
          { name: 'Dhuhr', time: data.prayers.dhuhr, isNext: data.nextPrayer === 'dhuhr' },
          { name: 'Asr', time: data.prayers.asr, isNext: data.nextPrayer === 'asr' },
          { name: 'Maghrib', time: data.prayers.maghrib, isNext: data.nextPrayer === 'maghrib' },
          { name: 'Isha', time: data.prayers.isha, isNext: data.nextPrayer === 'isha' },
        ]);
        setCity(data.meta?.city ?? '');
      } catch {
        // Geolocation or API unavailable — widget shows empty state
      }
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-green-800">Loading...</div>;

  return (
    <div className="bg-white border border-green-200 rounded-xl p-4 font-sans h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-green-900 text-sm">Prayer Times</h3>
        {city && <span className="text-xs text-gray-500">{city}</span>}
      </div>
      <div className="space-y-2">
        {prayers.map(p => (
          <div key={p.name} className={`flex justify-between items-center px-2 py-1 rounded ${p.isNext ? 'bg-green-100' : ''}`}>
            <span className={`text-sm ${p.isNext ? 'font-bold text-green-900' : 'text-gray-700'}`}>{p.name}</span>
            <span className={`text-sm font-mono ${p.isNext ? 'font-bold text-green-900' : 'text-gray-600'}`}>{p.time}</span>
          </div>
        ))}
      </div>
      <a href="https://praycalc.com" target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-gray-400 mt-3 hover:text-green-700">
        PrayCalc
      </a>
    </div>
  );
}
