'use client';

import { useState } from 'react';

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  name: string;
  distKm: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearby(lat: number, lng: number): Promise<Mosque[]> {
  const radius = 8000; // 8 km
  const query = `[out:json][timeout:10];
node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
out body 25;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' },
  });
  if (!res.ok) throw new Error('Overpass error');
  const data = await res.json() as { elements: Array<{ id: number; lat: number; lon: number; tags?: Record<string, string> }> };
  return data.elements
    .map(el => ({
      id: el.id,
      lat: el.lat,
      lon: el.lon,
      name: el.tags?.['name:en'] ?? el.tags?.['name'] ?? 'Mosque',
      distKm: haversineKm(lat, lng, el.lat, el.lon),
    }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 10);
}

export default function MosquesNearby() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const find = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setState('error');
      return;
    }
    setState('loading');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const list = await fetchNearby(pos.coords.latitude, pos.coords.longitude);
          setMosques(list);
          setState('done');
        } catch {
          setErrorMsg('Could not load mosque data. Try again later.');
          setState('error');
        }
      },
      () => {
        setErrorMsg('Location access was denied. Enable it in your browser settings.');
        setState('error');
      },
      { timeout: 10000 }
    );
  };

  return (
    <section className="info-section">
      <h2 className="info-h2">🕌 Mosques Near You</h2>
      <p className="info-p">
        Find prayer spaces within 8 km of your current location using OpenStreetMap data.
      </p>

      {state === 'idle' && (
        <button
          type="button"
          onClick={find}
          className="inline-block mt-2 bg-[#1E5E2F] border border-[#79C24C]/30 text-[#C9F27A] font-semibold rounded-xl px-6 py-3 text-sm hover:bg-[#79C24C]/20 transition-colors"
        >
          Find mosques near me
        </button>
      )}

      {state === 'loading' && (
        <p className="text-white/40 text-sm mt-3">Locating nearby mosques…</p>
      )}

      {state === 'error' && (
        <p className="text-red-400 text-sm mt-3">{errorMsg}</p>
      )}

      {state === 'done' && (
        <>
          {mosques.length === 0 ? (
            <p className="text-white/40 text-sm mt-3">No mosques found within 8 km.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {mosques.map(m => {
                const dist = m.distKm < 1
                  ? `${Math.round(m.distKm * 1000)} m`
                  : `${m.distKm.toFixed(1)} km`;
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{m.name}</p>
                      <p className="text-white/40 text-xs">{dist} away</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5A9438] text-xs hover:underline flex-shrink-0 ml-4"
                    >
                      Directions ↗
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            aria-label="Refresh"
            type="button"
            onClick={find}
            className="text-white/30 text-xs mt-3 hover:text-white/50 transition-colors"
          >
            Refresh
          </button>
        </>
      )}

      {/* Add your masjid CTA */}
      <div className="mt-6 bg-[#1E5E2F]/20 border border-[#79C24C]/15 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-1 text-sm">Is your masjid missing?</h3>
        <p className="text-white/50 text-xs mb-3">
          Add it to OpenStreetMap and it will appear here for your community.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.openstreetmap.org/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#C9F27A] border border-[#79C24C]/30 rounded-lg px-3 py-1.5 hover:bg-[#79C24C]/10 transition-colors"
          >
            Add on OpenStreetMap ↗
          </a>
          <a
            href="https://ummat.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 border border-white/10 rounded-lg px-3 py-1.5 hover:text-white/60 transition-colors"
          >
            Ummat Pro for masjids ↗
          </a>
        </div>
      </div>
    </section>
  );
}
