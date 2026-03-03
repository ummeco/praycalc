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
 * Shows a "Resume: [City]" suggestion button on the homepage when the user
 * previously visited a city that is not their current home city.
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

  if (!lastCity) return null;

  return (
    <button
      type="button"
      onClick={() => router.push(`/${lastCity.slug}`)}
      className="last-visited-btn"
      title={`Resume prayer times for ${lastCity.name}`}
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
      Resume: {lastCity.name}
    </button>
  );
}
