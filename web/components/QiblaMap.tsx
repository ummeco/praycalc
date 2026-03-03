"use client";

import { useEffect, useRef, useState } from "react";
import { qiblaGreatCircle, KAABA_LAT, KAABA_LNG } from "@/lib/qibla";
import "leaflet/dist/leaflet.css";

interface Props {
  cityLat: number;
  cityLng: number;
  userLat: number | null;
  userLng: number | null;
  cityName: string;
  loadingLabel?: string;
}

export default function QiblaMap({
  cityLat,
  cityLng,
  userLat,
  userLng,
  cityName,
  loadingLabel = "Loading map…",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const pointLat = userLat ?? cityLat;
    const pointLng = userLng ?? cityLng;

    let mapInstance: import("leaflet").Map | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // User's exact GPS → street level so they can physically orient for prayer.
      // City center only → city-level overview to show general direction.
      const zoom = userLat !== null ? 17 : 12;

      mapInstance = L.map(containerRef.current, {
        center: [pointLat, pointLng],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(mapInstance);

      // City / user marker — green circle
      const cityIcon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;background:#79C24C;border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -10],
      });

      // Kaaba marker — rotated square (diamond) in brand green
      const kaabaIcon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;background:#C9F27A;border:2.5px solid #1E5E2F;transform:rotate(45deg);box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -10],
      });

      L.marker([pointLat, pointLng], { icon: cityIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>${cityName}</b>`);

      L.marker([KAABA_LAT, KAABA_LNG], { icon: kaabaIcon })
        .addTo(mapInstance)
        .bindPopup("<b>Al-Ka'bah</b><br>Masjid al-Haram, Mecca");

      // Great circle geodesic line
      const pts = qiblaGreatCircle(pointLat, pointLng, 150);
      L.polyline(pts, {
        color: "#79C24C",
        weight: 2.5,
        opacity: 0.85,
        dashArray: "8 5",
      }).addTo(mapInstance);

      if (!cancelled) setMapReady(true);
    });

    return () => {
      cancelled = true;
      mapInstance?.remove();
    };
  // Re-render if coordinates change (e.g. geolocation resolved)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityLat, cityLng, userLat, userLng]);

  return (
    <div className="qibla-map-container">
      {!mapReady && (
        <div className="qibla-map-loading">{loadingLabel}</div>
      )}
      <div ref={containerRef} className="qibla-map-fill" />
    </div>
  );
}
