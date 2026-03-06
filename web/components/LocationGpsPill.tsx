"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reverseGeocode } from "@/lib/geo";
import LocationPermissionModal from "@/components/LocationPermissionModal";

/**
 * Persistent pill below the search box showing the user's GPS/location status.
 * - granted  → bright green "Use Location" — clicks directly trigger GPS lookup
 * - denied   → muted red "Enable location" — clicks explain how to unblock
 * - prompt   → neutral "Use Location" — clicks show permission modal
 * Hidden until the Permissions API responds so there's no flash.
 */
export default function LocationGpsPill() {
  const router = useRouter();
  const [permState, setPermState] = useState<PermissionState | "unknown">("unknown");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"prompt" | "denied" | null>(null);

  useEffect(() => {
    if (!navigator.permissions) { setPermState("prompt"); return; }
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        setPermState(result.state);
        result.onchange = () => setPermState(result.state);
      })
      .catch(() => setPermState("prompt"));
  }, []);

  function doLookup() {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (geo) router.push(`/${geo.slug}`);
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false),
    );
  }

  function handleClick() {
    if (permState === "denied") { setModal("denied"); return; }
    if (permState === "granted") { doLookup(); return; }
    setModal("prompt");
  }

  // Don't render until we know permission state (avoids layout shift)
  if (permState === "unknown") return null;

  const isGranted = permState === "granted";
  const isDenied = permState === "denied";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`gps-location-btn gps-pill ${isGranted ? "gps-pill--granted" : isDenied ? "gps-pill--denied" : "gps-pill--prompt"}`}
      >
        {loading ? (
          <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
        ) : isDenied ? (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4M4 12H2m20 0h-2" />
          </svg>
        )}
        <span>{isDenied ? "Enable location" : "Use my location"}</span>
      </button>

      {modal && (
        <LocationPermissionModal
          state={modal}
          onAllow={() => { setModal(null); doLookup(); }}
          onDismiss={() => setModal(null)}
        />
      )}
    </>
  );
}
