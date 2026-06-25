/**
 * GeoPrompt.tsx — Delayed geolocation permission prompt (home page).
 *
 * PURPOSE: After a short delay, invites the user to find prayer times for their
 *   current location. Dismissible; the dismissal is remembered in localStorage
 *   so the prompt never reappears.
 * CONSTRAINTS: Astro island (client:load). SSR-safe.
 *   DOM contract (homepage.spec): role="dialog" aria-label="Location permission
 *   prompt"; .geo-prompt-btn; .geo-prompt-close; copy "Find prayer times for
 *   your location?"; localStorage key 'pc_geo_prompt_dismissed'.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect, useState } from 'react';

const DELAY_MS = 1500;
const DISMISS_KEY = 'pc_geo_prompt_dismissed';

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
          const { reverseGeocode } = await import('@/lib/geo');
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (geo) window.location.href = `/${geo.slug}`;
        },
        () => {
          /* denied — already dismissed */
        },
      );
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
