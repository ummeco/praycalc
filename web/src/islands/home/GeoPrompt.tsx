/**
 * GeoPrompt.tsx — Delayed geolocation permission prompt (home page).
 *
 * PURPOSE: After a short delay, invites the user to find prayer times for their
 *   current location. Dismissible; the dismissal is remembered in localStorage
 *   so the prompt never reappears. On geolocation denial/failure, falls back to
 *   IP-based geolocation (mirrors LocationSearch.tsx's tryIpFallback) so the
 *   prompt still resolves a location instead of just closing silently.
 * CONSTRAINTS: Astro island (client:load). SSR-safe.
 *   DOM contract (homepage.spec): role="dialog" aria-label="Location permission
 *   prompt"; .geo-prompt-btn; .geo-prompt-close; copy "Find prayer times for
 *   your location?"; localStorage key 'pc_geo_prompt_dismissed'.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect, useState } from 'react';
import type { GeoResult } from '@/lib/geo';

const DELAY_MS = 1500;
const DISMISS_KEY = 'pc_geo_prompt_dismissed';

/**
 * IP-based geolocation fallback. Mirrors LocationSearch.tsx's tryIpFallback:
 * when the browser denies/can't resolve a precise fix, ask the server to
 * geolocate by IP (Vercel edge geo headers, then ipapi) so "Use my location"
 * still resolves somewhere instead of just closing.
 */
async function tryIpFallback(): Promise<boolean> {
  try {
    const res = await fetch('/api/geo?ip=1');
    if (!res.ok) return false;
    const geo = (await res.json()) as GeoResult | null;
    if (geo && geo.slug) {
      window.location.href = `/${geo.slug}`;
      return true;
    }
  } catch {
    /* no fallback available — stay dismissed */
  }
  return false;
}

export default function GeoPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setShow(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function persistDismissed() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  }

  function dismiss() {
    persistDismissed();
    setShow(false);
  }

  function allow() {
    persistDismissed();
    setShow(false);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { reverseGeocode } = await import('@/lib/geo');
            const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            if (geo) {
              window.location.href = `/${geo.slug}`;
              return;
            }
          } catch {
            /* fall through to IP fallback */
          }
          void tryIpFallback();
        },
        () => {
          // Denied/unavailable — try IP geolocation before giving up so the
          // prompt still resolves a location (same pattern as LocationSearch).
          void tryIpFallback();
        },
      );
    } else {
      void tryIpFallback();
    }
  }

  if (!show) return null;

  return (
    <div className="geo-prompt" role="dialog" aria-label="Location permission prompt">
      <button
        type="button"
        className="geo-prompt-close"
        aria-label="Dismiss location prompt"
        onClick={dismiss}
      >
        ✕
      </button>
      <p className="geo-prompt-text">Find prayer times for your location?</p>
      <button type="button" className="geo-prompt-btn" onClick={allow}>
        Use my location
      </button>
    </div>
  );
}
