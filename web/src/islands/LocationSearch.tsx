/**
 * LocationSearch.tsx — City/location search island (home + city compact).
 *
 * PURPOSE: Autocomplete location search. Debounced query → /api/search (via
 *   searchLocation). Renders a results dropdown; selecting a result navigates to
 *   the city prayer-times page. Non-compact mode also shows a GPS "use my
 *   location" pill and popular-city shortcuts.
 * INPUTS: compact (bool), autoFocus (bool)
 * OUTPUTS: search input + dropdown; navigates to /<slug> on selection.
 * CONSTRAINTS: Astro island. No next/router — window.location for navigation.
 *   DOM contract (homepage.spec / city-page.spec):
 *     input[data-testid="city-search-input"], compact placeholder "Search city…",
 *     .gps-location-btn, .search-dropdown, .search-dropdown-item,
 *     .search-result-name, .search-result-slug
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      const r = await searchLocation(query.trim());
      setResults(r);
      setOpen(r.length > 0);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = useCallback((r: GeoResult) => {
    setOpen(false);
    navigateToCity(r.slug);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Enter' && results[0]) {
        e.preventDefault();
        handleSelect(results[0]);
      }
    },
    [results, handleSelect],
  );

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
        if (geo) navigateToCity(geo.slug);
        else setGeoError('Could not determine your city. Try searching by name.');
      },
      () => {
        setGeoLoading(false);
        setGeoError('Location access denied. Search by city name instead.');
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const visible = results.slice(0, 8);

  return (
    <div className={`location-search${compact ? ' location-search--compact' : ''}`} ref={rootRef}>
      <div className="location-search-field">
        <input
          ref={inputRef}
          data-testid="city-search-input"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-label="Search for a city or location"
          autoComplete="off"
          className="location-search-input"
          placeholder={compact ? 'Search city…' : 'Search cities, airports, zip codes…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
      </div>

      {open && visible.length > 0 && (
        <div className="search-dropdown" role="listbox" aria-label="Search results">
          {visible.map((r, i) => (
            <button
              key={`${r.slug}-${i}`}
              type="button"
              role="option"
              aria-selected={false}
              className="search-dropdown-item"
              onClick={() => handleSelect(r)}
            >
              <span className="search-result-name">{r.displayName}</span>
              <span className="search-result-slug">/{r.slug}</span>
            </button>
          ))}
        </div>
      )}

      {!compact && (
        <div className="location-search-extras">
          <button
            type="button"
            className="gps-location-btn location-gps-pill"
            onClick={handleGeoLocate}
            disabled={geoLoading}
            aria-label="Use my GPS location"
          >
            <span aria-hidden="true">📍</span>
            {geoLoading ? 'Finding location…' : 'Use my location'}
          </button>
          {geoError && (
            <p className="location-search-error" role="alert">{geoError}</p>
          )}
          {query.trim().length === 0 && (
            <div className="location-popular" aria-label="Popular cities">
              {POPULAR.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="location-popular-pill"
                  onClick={() => navigateToCity(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
