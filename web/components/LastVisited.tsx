"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const LAST_CITY_KEY = "pc_last_city";

interface LastCity {
  slug: string;
  name: string;
}

/**
 * Call this from city pages to record the current city as the last-visited city.
 * This is a standalone helper (not a component) so it can be called in a useEffect.
 */
export function recordLastCity(slug: string, name: string): void {
  if (typeof window === "undefined") return;
  try {
    const value: LastCity = { slug, name };
    localStorage.setItem(LAST_CITY_KEY, JSON.stringify(value));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Shows the last-visited city as a quick-return button below the search box.
 */
export default function LastVisited() {
  const router = useRouter();
  const [lastCity, setLastCity] = useState<LastCity | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_CITY_KEY);
      if (!raw) return;
      const parsed: LastCity = JSON.parse(raw);
      if (!parsed?.slug || !parsed?.name) return;
      setLastCity(parsed);
    } catch {
      // corrupt or missing
    }
  }, []);

  function clearLastCity() {
    try {
      localStorage.removeItem(LAST_CITY_KEY);
    } catch {
      // ignore
    }
    setLastCity(null);
  }

  if (!lastCity) return null;

  return (
    <div className="last-visited-wrap">
      <button
        type="button"
        onClick={() => router.push(`/${lastCity.slug}`)}
        className="last-visited-btn"
        title={`Return to prayer times for ${lastCity.name}`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {lastCity.name}
      </button>
      <button
        type="button"
        onClick={clearLastCity}
        className="last-visited-delete-btn"
        aria-label={`Remove ${lastCity.name} from history`}
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
