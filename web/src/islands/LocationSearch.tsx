/**
 * LocationSearch.tsx — City/location search React island.
 *
 * PURPOSE: Autocomplete location search used on home page and calculator.
 *   Navigates to prayer times page on city selection.
 *   Supports GPS geolocation with permission-denied fallback.
 *   WCAG 2.1 AA compliant ARIA combobox pattern (role=combobox, listbox, option).
 * INPUTS: compact (bool), autoFocus (bool)
 * OUTPUTS: Input with dropdown, navigates to /times/<slug> or /<slug>
 * CONSTRAINTS:
 *   - No next/router — uses window.location.href for navigation
 *   - No server-only imports — safe in client islands
 *   - Geolocation: always show permission-denied state if refused
 *   - ARIA: full combobox pattern per WCAG 2.1 AA (1.3.1, 4.1.2)
 *     aria-controls, aria-activedescendant, arrow-key navigation, role=option with aria-selected
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON
 */

'use client';

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { searchLocation, reverseGeocode, type GeoResult } from '@/lib/geo';

interface Props {
  compact?: boolean;
  autoFocus?: boolean;
}

const POPULAR: { name: string; slug: string }[] = [
  { name: 'Mecca', slug: 'sa/makkah/mecca' },
  { name: 'Medina', slug: 'sa/madinah/medina' },
  { name: 'Istanbul', slug: 'tr/istanbul/istanbul' },
  { name: 'Cairo', slug: 'eg/cairo/cairo' },
  { name: 'New York', slug: 'us/ny/new-york' },
  { name: 'London', slug: 'gb/england/london' },
];

function navigateToCity(slug: string) {
  window.location.href = `/${slug}`;
}

export default function LocationSearch({ compact = false, autoFocus = false }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Stable IDs for ARIA relationships
  const uid = useId();
  const listboxId = `location-listbox-${uid}`;
  const getOptionId = (i: number) => `location-option-${uid}-${i}`;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); setActiveIndex(-1); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      const r = await searchLocation(query);
      setResults(r);
      setLoading(false);
      setOpen(r.length > 0);
      setActiveIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        listboxRef.current &&
        !listboxRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleGeoLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
        if (geo) {
          navigateToCity(geo.slug);
        } else {
          setGeoError('Could not determine your city. Try searching by name.');
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError('Location access denied. Allow location access or search by city name.');
        } else {
          setGeoError('Could not get your location. Please search by city name.');
        }
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const handleSelect = useCallback((result: GeoResult) => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery('');
    navigateToCity(result.slug);
  }, []);

  const visibleResults = results.slice(0, 8);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev < visibleResults.length - 1 ? prev + 1 : 0;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : visibleResults.length - 1;
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && visibleResults[activeIndex]) {
          handleSelect(visibleResults[activeIndex]!);
        } else if (visibleResults.length > 0 && visibleResults[0]) {
          handleSelect(visibleResults[0]!);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
        setActiveIndex(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(visibleResults.length - 1);
      }
    },
    [open, visibleResults, activeIndex, handleSelect],
  );

  const activeOptionId = activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

  return (
    <div className={`location-search ${compact ? '' : 'w-full max-w-[480px]'}`}>
      <div className="relative">
        <input
          ref={inputRef}
          id={`location-input-${uid}`}
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
          placeholder="Search cities, airports, zip codes…"
          className="location-search-input"
          aria-label="Search for a city or location"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-haspopup="listbox"
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs" aria-hidden="true">
            …
          </span>
        )}
      </div>

      {/* Dropdown results — always rendered so aria-controls target exists in DOM */}
      <div
        id={listboxId}
        ref={listboxRef}
        role="listbox"
        aria-label="Search results"
        className={open && visibleResults.length > 0 ? 'location-search-dropdown' : 'sr-only'}
        aria-hidden={!open || visibleResults.length === 0}
      >
        {visibleResults.map((r, i) => (
          <button
            key={`${r.slug}-${i}`}
            id={getOptionId(i)}
            className={`location-search-item w-full text-left ${i === activeIndex ? 'location-search-item--active' : ''}`}
            role="option"
            onClick={() => handleSelect(r)}
            aria-selected={i === activeIndex}
            tabIndex={-1}
          >
            {r.displayName}
          </button>
        ))}
      </div>

      {/* GPS locate button + error */}
      {!compact && (
        <div className="mt-2 space-y-1">
          <button
            onClick={handleGeoLocate}
            disabled={geoLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs transition-colors disabled:opacity-50"
            aria-label="Use my GPS location"
          >
            <span aria-hidden="true">📍</span>
            {geoLoading ? 'Finding location…' : 'Use my location'}
          </button>
          {geoError && (
            <p className="text-red-400 text-xs px-1" role="alert">
              {geoError}
            </p>
          )}
        </div>
      )}

      {/* Popular cities (homepage only) */}
      {!compact && query.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Popular cities">
          {POPULAR.map((city) => (
            <button
              key={city.slug}
              onClick={() => navigateToCity(city.slug)}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition-colors"
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
