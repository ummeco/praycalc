// FILE: src/components/islands/LocationPicker.tsx
// PURPOSE: Astro island — interactive location picker for prayer time preview.
//   Lets users enter city/coordinates to preview prayer times.
//   Uses browser Geolocation API for "use my location" option.
// INPUTS: none (self-contained island)
// OUTPUTS: Location state + coordinates passed to PrayerTimePreview
// CONSTRAINTS:
//   - client:load — hydrates immediately (above the fold, interactive on load)
//   - Hijri dates via @ummat/shared/hijri only — never Intl with Islamic calendar (T-01 AC)
//   - Accessible: labeled inputs, live region for results
// REF: T-01 (P2-E3-W01-S01) · D-P2-REACT19

'use client';

import { useState, useCallback } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  onLocationChange?: (coords: Coordinates) => void;
}

const PRESET_LOCATIONS: Coordinates[] = [
  { lat: 21.3891, lng: 39.8579, label: 'Mecca, Saudi Arabia' },
  { lat: 24.4672, lng: 39.6111, label: 'Medina, Saudi Arabia' },
  { lat: 40.7128, lng: -74.006, label: 'New York, USA' },
  { lat: 51.5074, lng: -0.1278, label: 'London, UK' },
  { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  { lat: 30.0444, lng: 31.2357, label: 'Cairo, Egypt' },
  { lat: 41.0082, lng: 28.9784, label: 'Istanbul, Turkey' },
];

export default function LocationPicker({ onLocationChange }: Props) {
  const [selected, setSelected] = useState<Coordinates | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleSelect = useCallback(
    (coords: Coordinates) => {
      setSelected(coords);
      setGeoError(null);
      onLocationChange?.(coords);
    },
    [onLocationChange],
  );

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: Math.round(pos.coords.latitude * 1000) / 1000,
          lng: Math.round(pos.coords.longitude * 1000) / 1000,
          label: 'Your location',
        };
        setGeoLoading(false);
        handleSelect(coords);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.message ?? 'Unable to retrieve your location.');
      },
    );
  }, [handleSelect]);

  return (
    <div
      className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="Location picker"
    >
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Select a location to preview prayer times
      </h3>

      {/* Preset cities */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Preset locations">
        {PRESET_LOCATIONS.map((loc) => (
          <button
            key={loc.label}
            type="button"
            onClick={() => handleSelect(loc)}
            aria-pressed={selected?.label === loc.label}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              selected?.label === loc.label
                ? 'bg-green-700 text-white dark:bg-green-600'
                : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700',
            ].join(' ')}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {/* Geolocation button */}
      <button
        type="button"
        onClick={handleGeolocate}
        disabled={geoLoading}
        className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-800 ring-1 ring-green-200 hover:bg-green-100 disabled:cursor-wait disabled:opacity-60 dark:bg-green-950 dark:text-green-300 dark:ring-green-900 dark:hover:bg-green-900"
        aria-label="Use my current location"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        {geoLoading ? 'Detecting location…' : 'Use my location'}
      </button>

      {/* Error */}
      {geoError && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {geoError}
        </p>
      )}

      {/* Selected display */}
      {selected && (
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
          Showing prayer times for{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">{selected.label}</strong>
          {' '}({selected.lat.toFixed(3)}, {selected.lng.toFixed(3)})
        </p>
      )}
    </div>
  );
}
