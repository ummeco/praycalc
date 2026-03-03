"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const DISMISSED_KEY = "pc_geo_prompt_dismissed";
const DELAY_MS = 1500;

interface Props {
  /** Called with the detected city name when IP geolocation succeeds. */
  onIpCity: (cityName: string) => void;
}

export default function GeoPrompt({ onIpCity }: Props) {
  const t = useTranslations("ui");
  const [visible, setVisible] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [ipTooltip, setIpTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't show if already dismissed
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      // localStorage unavailable — just show it
    }

    timerRef.current = setTimeout(() => setVisible(true), DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function fallbackToIp() {
    try {
      // Call /api/geo with no params — server reads CF-IPCountry or similar.
      // The endpoint returns a GeoResult with displayName.
      const res = await fetch("/api/geo?ip=1");
      if (!res.ok) throw new Error("ip-geo failed");
      const data = (await res.json()) as { displayName?: string; city?: string };
      const cityName = data?.displayName ?? data?.city ?? "";
      if (cityName) {
        onIpCity(cityName);
        setIpTooltip(true);
        // Hide the tooltip after 4s
        setTimeout(() => setIpTooltip(false), 4000);
      }
    } catch {
      // IP geo failed silently
    }
    dismiss();
  }

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      await fallbackToIp();
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geo?lat=${latitude}&lng=${longitude}`);
          if (!res.ok) throw new Error("geo failed");
          const data = (await res.json()) as { slug?: string };
          if (data?.slug) {
            // GPS success — navigate directly (full accuracy)
            window.location.href = `/${data.slug}`;
            return;
          }
        } catch {
          // fall through to IP
        }
        setGpsLoading(false);
        await fallbackToIp();
      },
      async () => {
        // GPS denied or error — fall back to IP
        setGpsLoading(false);
        await fallbackToIp();
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  if (!visible) {
    // Render tooltip even when prompt is hidden (after IP pre-fill)
    if (!ipTooltip) return null;
    return (
      <div
        role="status"
        aria-live="polite"
        className="geo-prompt-tooltip motion-safe:animate-fade-in"
      >
        {t("geoIpDetected")}
      </div>
    );
  }

  return (
    <>
      <div
        role="dialog"
        aria-label={t("geoPromptAriaLabel")}
        className="geo-prompt-card motion-safe:animate-slide-up"
      >
        <button
          type="button"
          onClick={dismiss}
          className="geo-prompt-close"
          aria-label={t("dismiss")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <p className="geo-prompt-text">{t("geoPromptTitle")}</p>

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={gpsLoading}
          className="geo-prompt-btn"
        >
          {gpsLoading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#1E5E2F] border-t-transparent animate-spin shrink-0" />
              {t("locating")}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2"
                />
              </svg>
              {t("geoUseLocation")}
            </>
          )}
        </button>
      </div>

      {ipTooltip && (
        <div
          role="status"
          aria-live="polite"
          className="geo-prompt-tooltip motion-safe:animate-fade-in"
        >
          {t("geoIpDetected")}
        </div>
      )}
    </>
  );
}
