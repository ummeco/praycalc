"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { searchLocation, reverseGeocode, type GeoResult } from "@/lib/geo";

interface Props {
  /** Compact mode: smaller input, no GPS button. Used in city page header. */
  compact?: boolean;
  /** Auto-focus the input on mount. Use on home page. */
  autoFocus?: boolean;
  /**
   * When set, pre-fills the search input (e.g. from IP geolocation).
   * The input will update whenever this value changes.
   */
  prefillValue?: string;
}

export default function LocationSearch({ compact = false, autoFocus = false, prefillValue = "" }: Props) {
  const router = useRouter();
  const t = useTranslations("ui");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function navigate(geo: GeoResult) {
    setOpen(false);
    setQuery(geo.displayName);
    router.push(`/${geo.slug}`);
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
      setSelectedIndex(-1);
    }
  }

  async function useGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
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
      {/* Search input + dropdown — relative wrapper scoped to just the input
          so top-full positions the dropdown flush below it, not below the GPS btn */}
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
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            className={`flex-1 bg-transparent text-white placeholder:text-white/40 outline-none ${compact ? "text-sm" : "text-base"}`}
          />
          {loading && (
            <div className="search-spinner w-4 h-4 rounded-full border-2 animate-spin shrink-0" />
          )}
        </div>

        {/* Dropdown — flush against input (no margin-top) */}
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
      </div>

      {/* GPS button — full-width mode only */}
      {!compact && (
        <button
          type="button"
          onClick={useGPS}
          disabled={gpsLoading}
          className="gps-location-btn mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm text-white/50 hover:text-[#C9F27A] transition-colors disabled:opacity-50"
        >
          {gpsLoading ? (
            <>
              <div className="gps-spinner w-3.5 h-3.5 rounded-full border-2 animate-spin" />
              {t("locating")}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2"
                />
              </svg>
              {t("detectLocation")}
            </>
          )}
        </button>
      )}
    </div>
  );
}
