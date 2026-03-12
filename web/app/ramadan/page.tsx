'use client';
import { useState, useEffect } from 'react';

function getIftarCountdown(maghribTime: string): string {
  const now = new Date();
  const [hours, minutes] = maghribTime.split(':').map(Number);
  const maghrib = new Date(now);
  maghrib.setHours(hours, minutes, 0, 0);
  if (maghrib < now) return 'Iftar has passed';
  const diff = maghrib.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function RamadanPage() {
  const [fastingDays, setFastingDays] = useState<Record<number, boolean>>({});
  const [, setToday] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem('ramadan_1447_fasting');
    if (stored) setFastingDays(JSON.parse(stored));
    setToday(new Date());
  }, []);

  const toggleDay = (day: number) => {
    const updated = { ...fastingDays, [day]: !fastingDays[day] };
    setFastingDays(updated);
    localStorage.setItem('ramadan_1447_fasting', JSON.stringify(updated));
  };

  const fastedCount = Object.values(fastingDays).filter(Boolean).length;
  const totalDays = 30;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🌙</div>
        <h1 className="text-3xl font-bold text-green-900">Ramadan 1447</h1>
        <p className="text-gray-600">Track your fasting journey</p>
      </div>

      {/* Iftar countdown */}
      <div className="bg-green-900 text-white rounded-2xl p-6 mb-6 text-center">
        <p className="text-green-300 text-sm mb-1">{"Today's Iftar"}</p>
        <p className="text-4xl font-bold">18:32</p>
        <p className="text-green-300 mt-1">Maghrib &middot; {getIftarCountdown('18:32')}</p>
      </div>

      {/* Streak */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-900">Fasting Tracker</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {fastedCount} / {totalDays} days
        </span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-6 gap-2 mb-8">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
          <button key={day}
            onClick={() => toggleDay(day)}
            className={`aspect-square rounded-xl text-sm font-semibold transition-colors ${
              fastingDays[day]
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-green-100'
            }`}>
            {day}
          </button>
        ))}
      </div>

      {/* Juz tracker */}
      <div className="border border-green-200 rounded-2xl p-4 mb-6">
        <h3 className="font-semibold text-green-900 mb-3">Quran Progress (30 Juz)</h3>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="aspect-square bg-green-100 rounded text-xs flex items-center justify-center text-green-800 font-medium">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Share card */}
      <button
        onClick={() => {
          const text = `I've fasted ${fastedCount}/${totalDays} days of Ramadan 1447! 🌙\n\nTrack your Ramadan at praycalc.com/ramadan`;
          if (navigator.share) {
            navigator.share({ text });
          } else {
            navigator.clipboard.writeText(text);
          }
        }}
        className="w-full bg-green-800 text-white py-3 rounded-xl font-semibold hover:bg-green-900 transition-colors">
        Share My Progress
      </button>
    </main>
  );
}
