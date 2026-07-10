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
 *     .location-gps-pill, .location-search-dropdown, .location-search-item,
 *     .location-search-name, .location-search-slug
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchLocation, reverseGeocode, type GeoResult } from '@/lib/geo';
import ErrorBoundary from '@/islands/ErrorBoundary';

interface Props {
  compact?: boolean;
  autoFocus?: boolean;
}

const POPULAR: { name: string; slug: string }[] = [
  { name: 'Mecca', slug: 'sa/makkah/mecca' },
  { name: 'Medina', slug: 'sa/madinah/medina' },
  { name: 'Istanbul', slug: 'tr/istanbul/istanbul' },
];

function navigateToCity(slug: string) {
  window.location.href = `/${slug}`;
}

/** Public entry point — wraps the island body in an error boundary. */
export default function LocationSearch(props: Props) {
  return (
    <ErrorBoundary>
      <LocationSearchInner {...props} />
    </ErrorBoundary>
  );
}

function LocationSearchInner({ compact = false, autoFocus = false }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    // RESP-09: autofocus is a real desktop win (search is the homepage's one
    // job) but on touch devices it pops the soft keyboard over the hero/logo
    // on every visit. Gate on the same signal used to detect a touch device:
    // a coarse primary pointer, or no hover capability (covers touch laptops
    // and tablets a bare pointer-check would miss).
    const isTouchLike =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || !window.matchMedia?.('(hover: hover)').matches);
    if (!isTouchLike) inputRef.current?.focus();
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

  /**
   * IP-based geolocation fallback. When the browser can't give a precise fix
   * (permission denied, unavailable, timeout, or unsupported), ask the server
   * to geolocate by IP (Vercel edge geo headers, then ipapi). Returns true if
   * it navigated. This is what makes "Use my location" actually work on
   * desktops where OS location services are off.
   */
  const tryIpFallback = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/geo?ip=1');
      if (!res.ok) return false;
      const geo = (await res.json()) as GeoResult | null;
      if (geo && geo.slug) {
        navigateToCity(geo.slug);
        return true;
      }
    } catch {
      /* fall through to error message */
    }
    return false;
  }, []);

  const handleGeoLocate = useCallback(() => {
    setGeoLoading(true);
    setGeoError('');

    const failWith = async (msg: string) => {
      // Try IP geolocation before giving up so the button still resolves.
      const navigated = await tryIpFallback();
      if (!navigated) {
        setGeoLoading(false);
        setGeoError(msg);
      }
    };

    if (!navigator.geolocation) {
      void failWith('Could not detect your location. Search by city name instead.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (geo) {
            navigateToCity(geo.slug);
            return;
          }
        } catch {
          /* fall through to IP fallback */
        }
        await failWith('Could not determine your city. Try searching by name.');
      },
      (err) => {
        // Only PERMISSION_DENIED (1) is an actual denial. For any error we still
        // attempt the IP fallback first; the message only shows if that fails.
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Search by city name instead.'
            : err.code === err.TIMEOUT
              ? 'Locating timed out. Try again or search by name.'
              : 'Your location is unavailable right now. Try searching by name.';
        void failWith(msg);
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
    );
  }, [tryIpFallback]);

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
        <div className="location-search-dropdown" role="listbox" aria-label="Search results">
          {visible.map((r, i) => (
            <button
              key={`${r.slug}-${i}`}
              type="button"
              role="option"
              aria-selected={false}
              className="location-search-item"
              onClick={() => handleSelect(r)}
            >
              <span className="location-search-name">{r.displayName}</span>
              <span className="location-search-slug">/{r.slug}</span>
            </button>
          ))}
        </div>
      )}

      {!compact && (
        <div className="location-search-extras">
          <button
            type="button"
            className="location-gps-pill"
            onClick={handleGeoLocate}
            disabled={geoLoading}
            aria-label="Use my location (GPS)"
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
