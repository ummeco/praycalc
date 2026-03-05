"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { searchLocation, reverseGeocode, type GeoResult } from "@/lib/geo";

interface Props {
  /** Compact mode: smaller input, no pre-query dropdown. Used in city page header. */
  compact?: boolean;
  /** Auto-focus the input on mount. Use on home page. */
  autoFocus?: boolean;
  /**
   * When set, pre-fills the search input (e.g. from IP geolocation).
   * The input will update whenever this value changes.
   */
  prefillValue?: string;
}

const RECENT_CITIES_KEY = "pc_recent_cities";

interface RecentCity {
  slug: string;
  name: string;
}

const POPULAR_CITIES: RecentCity[] = [
  { name: "Mecca", slug: "sa/makkah/mecca" },
  { name: "Medina", slug: "sa/madinah/medina" },
  { name: "Istanbul", slug: "tr/istanbul/istanbul" },
  { name: "Cairo", slug: "eg/cairo/cairo" },
  { name: "New York", slug: "us/ny/new-york" },
  { name: "London", slug: "gb/england/london" },
];

function getRecentCities(): RecentCity[] {
  try {
    const raw = localStorage.getItem(RECENT_CITIES_KEY);
    return raw ? (JSON.parse(raw) as RecentCity[]) : [];
  } catch {
    return [];
  }
}

function saveRecentCity(slug: string, name: string): void {
  try {
    const existing = getRecentCities().filter((c) => c.slug !== slug);
    localStorage.setItem(
      RECENT_CITIES_KEY,
      JSON.stringify([{ slug, name }, ...existing].slice(0, 5)),
    );
  } catch {
    // localStorage unavailable
  }
}

export default function LocationSearch({
  compact = false,
  autoFocus = false,
  prefillValue = "",
}: Props) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentCities, setRecentCities] = useState<RecentCity[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-query dropdown: shown when focused, empty query, not compact
  const showPreQuery = !compact && focused && query.trim().length === 0;

  // Sync external prefill (e.g. IP geolocation result) into the input
  useEffect(() => {
    if (prefillValue && prefillValue !== query) {
      setQuery(prefillValue);
      inputRef.current?.focus();
    }
    // Only react when prefillValue changes, not on every query change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillValue]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setSelectedIndex(-1);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchLocation(query);
        setResults(found);
        setOpen(found.length > 0);
        setSelectedIndex(-1);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [query]);

  function handleFocus() {
    setFocused(true);
    if (!compact) {
      setRecentCities(getRecentCities());
    }
    if (results.length > 0) setOpen(true);
  }

  function navigate(geo: GeoResult) {
    setOpen(false);
    setFocused(false);
    setQuery(geo.displayName);
    saveRecentCity(geo.slug, geo.displayName);
    router.push(`/${geo.slug}`);
  }

  function navigateToSlug(slug: string, name: string) {
    setFocused(false);
    saveRecentCity(slug, name);
    router.push(`/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      if (target) navigate(target);
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocused(false);
      setSelectedIndex(-1);
    }
  }

  async function useGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    setFocused(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          if (geo) router.push(`/${geo.slug}`);
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
    );
  }

  return (
    <div ref={wrapperRef} className={compact ? "w-full" : "w-full max-w-[480px]"}>
      {/* Search input — relative wrapper so dropdowns position flush below */}
      <div className="relative">
        <div className={`search-input-wrap${compact ? " search-input-wrap--compact" : ""}`}>
          <svg
            className={`search-icon shrink-0 ${compact ? "w-4 h-4" : "w-5 h-5"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={compact ? t("searchCompact") : t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            className={`flex-1 bg-transparent text-white placeholder:text-white/40 outline-none ${compact ? "text-sm" : "text-base"}`}
          />
          {loading && (
            <div className="search-spinner w-4 h-4 rounded-full border-2 animate-spin shrink-0" />
          )}
        </div>

        {/* Search results dropdown */}
        {open && results.length > 0 && (
          <div className="search-dropdown absolute top-full w-full rounded-b-xl overflow-hidden z-50">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(r)}
                className={`search-dropdown-item w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b last:border-b-0 ${
                  i === selectedIndex
                    ? "bg-[rgba(121,194,76,0.18)]"
                    : "hover:bg-[rgba(121,194,76,0.12)]"
                }`}
              >
                <span className="search-result-name font-medium text-[#C9F27A]">{r.displayName}</span>
                <span className="search-result-slug text-white/35 text-xs ml-3 shrink-0">/{r.slug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Pre-query dropdown — GPS + recent searches + popular fallback */}
        {showPreQuery && !open && (
          <div className="search-dropdown absolute top-full w-full rounded-b-xl overflow-hidden z-50">
            {/* Use My Location */}
            <button
              type="button"
              onClick={useGPS}
              disabled={gpsLoading}
              className="search-dropdown-item search-dropdown-gps w-full flex items-center gap-3 px-4 py-3.5 text-sm border-b hover:bg-[rgba(121,194,76,0.12)] transition-colors disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#79C24C] border-t-transparent animate-spin shrink-0" />
                  <span className="text-[#C9F27A] font-medium">{t("locating")}</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 shrink-0 text-[#79C24C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2" />
                  </svg>
                  <span className="text-[#C9F27A] font-medium">{t("detectLocation")}</span>
                </>
              )}
            </button>

            {/* Recent searches */}
            {recentCities.length > 0 && (
              <>
                <div className="search-dropdown-section-header">Recent</div>
                {recentCities.map((city) => (
                  <button
                    key={city.slug}
                    type="button"
                    onClick={() => navigateToSlug(city.slug, city.name)}
                    className="search-dropdown-item w-full flex items-center gap-3 px-4 py-3 text-sm border-b last:border-b-0 hover:bg-[rgba(121,194,76,0.12)] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/75">{city.name}</span>
                  </button>
                ))}
              </>
            )}

            {/* Popular cities — only when no recent history */}
            {recentCities.length === 0 && (
              <>
                <div className="search-dropdown-section-header">Popular</div>
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.slug}
                    type="button"
                    onClick={() => navigateToSlug(city.slug, city.name)}
                    className="search-dropdown-item w-full flex items-center px-4 py-3 text-sm border-b last:border-b-0 hover:bg-[rgba(121,194,76,0.12)] transition-colors"
                  >
                    <span className="text-white/65">{city.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
