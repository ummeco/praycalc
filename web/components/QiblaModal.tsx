"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  qiblaAngle,
  compassDir,
  compassName,
  distanceKm,
} from "@/lib/qibla";

// Leaflet can only run in the browser — no SSR
const QiblaMap = dynamic(() => import("./QiblaMap"), {
  ssr: false,
});

interface Props {
  cityLat: number;
  cityLng: number;
  cityName: string;
  onClose: () => void;
}

type GeoStatus = "pending" | "found" | "denied" | "far";

export default function QiblaModal({
  cityLat,
  cityLng,
  cityName,
  onClose,
}: Props) {
  const t = useTranslations("ui");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("pending");
  const needleWrapRef = useRef<HTMLDivElement>(null);

  // City-center bearing (used until/unless we have a user location)
  const cityBearing = qiblaAngle(cityLat, cityLng);

  // Recalculate from user's exact position if they're nearby
  const activeLat = geoStatus === "found" && userLat !== null ? userLat : cityLat;
  const activeLng = geoStatus === "found" && userLng !== null ? userLng : cityLng;
  const bearing = geoStatus === "found" && userLat !== null
    ? qiblaAngle(userLat, userLng!)
    : cityBearing;

  const bearingDisplay = bearing.toFixed(1);
  const dir = compassDir(bearing);
  const dirFull = compassName(bearing);

  // Request geolocation — use user position if within 50 km of city
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = distanceKm(
          pos.coords.latitude,
          pos.coords.longitude,
          cityLat,
          cityLng,
        );
        if (dist < 20) {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setGeoStatus("found");
        } else {
          setGeoStatus("far");
        }
      },
      () => setGeoStatus("denied"),
      { timeout: 6000, maximumAge: 60000 },
    );
  }, [cityLat, cityLng]);

  // Keep CSS custom property in sync with bearing
  useEffect(() => {
    needleWrapRef.current?.style.setProperty("--qibla-deg", `${bearing}deg`);
  }, [bearing]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="qibla-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="qibla-modal" role="dialog" aria-modal="true" aria-label={t("qiblaDirection")}>
        {/* Header */}
        <div className="qibla-header">
          <div>
            <h2 className="qibla-title">{t("qiblaDirection")}</h2>
            <p className="qibla-subtitle">{cityName}</p>
          </div>
          <button
            type="button"
            className="qibla-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Bearing display */}
        <div className="qibla-bearing">
          {/* Compass needle */}
          <div
            ref={needleWrapRef}
            className="qibla-needle-wrap"
            role="img"
            aria-label={`Compass needle pointing ${bearingDisplay}° ${dir} toward the Kaabah`}
          >
            <svg className="qibla-needle" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              {/* North (green) */}
              <polygon points="20,4 23,20 17,20" fill="#79C24C" />
              {/* South (dim) */}
              <polygon points="20,36 23,20 17,20" fill="rgba(255,255,255,0.18)" />
              <circle cx="20" cy="20" r="3" fill="#fff" />
            </svg>
          </div>

          <div className="qibla-bearing-info">
            <span className="qibla-degrees">{bearingDisplay}°</span>
            <span className="qibla-dir">{dir} &mdash; {dirFull}</span>
            {geoStatus === "found" && (
              <span className="qibla-geo-note">{t("fromYourLocation")}</span>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="qibla-map-wrap">
          <QiblaMap
            cityLat={cityLat}
            cityLng={cityLng}
            userLat={geoStatus === "found" ? userLat : null}
            userLng={geoStatus === "found" ? userLng : null}
            cityName={cityName}
            loadingLabel={t("loadingMap")}
          />
        </div>

        <p className="qibla-map-caption">{t("qiblaMapCaption")}</p>
      </div>
    </div>
  );
}
