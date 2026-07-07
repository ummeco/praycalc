/**
 * QiblaModal.tsx — Qibla direction modal (city page).
 *
 * PURPOSE: Show the Qibla bearing from the current city with a compass needle,
 *   degrees, cardinal direction, and distance to the Ka'bah in km + miles. On a
 *   mobile device that exposes DeviceOrientation, a live compass rotates the rose
 *   so the needle points at the Qibla relative to the phone's real heading; when
 *   orientation is unavailable, denied, or on desktop, it falls back to the static
 *   bearing (needle fixed at the computed Qibla angle).
 * DOM contract (city-page.spec): role="dialog" containing text /Qibla|Direction/.
 *   Closes via aria-label="Close" and Escape. .qibla-needle (rotation).
 * CONSTRAINTS: DeviceOrientation is feature-detected; iOS 13+ requires an explicit
 *   permission request triggered by a user gesture (the "Enable live compass" button).
 *   The computed bearing math is never mutated — live mode only counter-rotates the
 *   compass rose by the device heading.
 * REF: P2-PRAYCALC-E2E-REBUILD · W1.1 (live-compass Qibla, gap A14)
 */

import { useEffect, useState } from 'react';
import { KAABA_LAT, KAABA_LNG, distanceKm } from '@/lib/qibla';

interface Props {
  locationName: string;
  lat: number;
  lng: number;
  qiblaDeg: number;
  qiblaCompass: string;
  onClose: () => void;
}

/** iOS 13+ exposes a static requestPermission() on DeviceOrientationEvent. */
interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

type CompassState = 'idle' | 'unsupported' | 'live' | 'denied';

/**
 * Read a compass heading (degrees clockwise from true/magnetic north) from a
 * DeviceOrientationEvent. iOS supplies webkitCompassHeading (already north-relative);
 * other browsers give `alpha` (counter-clockwise from north) which we invert.
 */
function headingFromEvent(e: DeviceOrientationEvent): number | null {
  const iosHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof iosHeading === 'number' && Number.isFinite(iosHeading)) {
    return iosHeading;
  }
  if (typeof e.alpha === 'number' && Number.isFinite(e.alpha)) {
    // alpha increases counter-clockwise; convert to clockwise-from-north.
    return (360 - e.alpha) % 360;
  }
  return null;
}

export default function QiblaModal({ locationName, lat, lng, qiblaDeg, qiblaCompass, onClose }: Props) {
  const [compass, setCompass] = useState<CompassState>('idle');
  const [heading, setHeading] = useState<number | null>(null);
  // Feature-detected once on mount so we can show/hide the "Enable live compass" button.
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    // Feature-detect DeviceOrientation. Desktop browsers generally lack it, and it
    // requires a secure context; when absent we stay in static-bearing mode.
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setSupported(true);
    }
  }, []);

  // Attach the orientation listener once live mode is active.
  useEffect(() => {
    if (compass !== 'live') return;
    function onOrient(e: DeviceOrientationEvent) {
      const h = headingFromEvent(e);
      if (h !== null) setHeading(h);
    }
    window.addEventListener('deviceorientation', onOrient, true);
    return () => window.removeEventListener('deviceorientation', onOrient, true);
  }, [compass]);

  async function enableLiveCompass() {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setCompass('unsupported');
      return;
    }
    const doe = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
    // iOS 13+ gate: requestPermission() must be called from a user gesture (this click).
    if (typeof doe.requestPermission === 'function') {
      try {
        const result = await doe.requestPermission();
        setCompass(result === 'granted' ? 'live' : 'denied');
      } catch {
        setCompass('denied');
      }
      return;
    }
    // Non-iOS: no permission prompt needed, go live directly.
    setCompass('live');
  }

  const km = Math.round(distanceKm(lat, lng, KAABA_LAT, KAABA_LNG));
  const miles = Math.round(km * 0.621371);

  // In live mode, counter-rotate the whole rose by the device heading so North on
  // the rose always points at real-world north; the needle then sits at the true
  // Qibla bearing relative to the phone. Static mode keeps the rose fixed and rotates
  // only the needle to the computed bearing (unchanged behavior).
  const live = compass === 'live' && heading !== null;
  const roseRotation = live ? -(heading as number) : 0;
  // Needle always sits at the computed Qibla bearing; in live mode the rose
  // rotates beneath it so the 🕋 ends up at the real-world Qibla heading.
  const needleRotation = qiblaDeg;
  // Relative bearing the user should turn to (only meaningful in live mode).
  const relativeBearing = live ? Math.round(((qiblaDeg - (heading as number)) % 360 + 360) % 360) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="qibla-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Qibla Direction"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Qibla Direction</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Compass with needle pointing toward Ka'bah */}
        <div className="qibla-compass" aria-hidden="true">
          <div
            className="qibla-rose"
            style={{ transform: `rotate(${roseRotation}deg)`, transition: live ? 'transform 0.15s linear' : undefined }}
          >
            <span className="qibla-rose-n">N</span>
            <span className="qibla-rose-e">E</span>
            <span className="qibla-rose-s">S</span>
            <span className="qibla-rose-w">W</span>
            {/* Tick marks */}
            <div className="qibla-rose-circle" />
          </div>
          <div
            className="qibla-needle"
            style={{ transform: `rotate(${needleRotation}deg)` }}
            title={`${Math.round(qiblaDeg)}° ${qiblaCompass}`}
          >
            🕋
          </div>
        </div>

        <p className="qibla-bearing">
          <strong>{Math.round(qiblaDeg)}°</strong> {qiblaCompass}
        </p>
        <p className="qibla-from">from {locationName}</p>
        <p className="qibla-distance">
          {km.toLocaleString()} km &nbsp;/&nbsp; {miles.toLocaleString()} mi to Ka'bah
        </p>

        {/* Live-compass control — only shown where DeviceOrientation exists (mobile). */}
        {supported && compass !== 'live' && (
          <button type="button" className="qibla-live-btn" onClick={enableLiveCompass}>
            Enable live compass
          </button>
        )}
        {compass === 'live' && (
          <p className="qibla-live-status" role="status" aria-live="polite">
            {relativeBearing !== null
              ? `Live: turn to ${relativeBearing}° — align the 🕋 with the top of the compass`
              : 'Live compass active — reading device orientation…'}
          </p>
        )}
        {compass === 'denied' && (
          <p className="qibla-live-status qibla-live-status--denied">
            Compass access denied. Showing the fixed Qibla bearing above.
          </p>
        )}
        {compass === 'unsupported' && (
          <p className="qibla-live-status">
            Live compass isn't available on this device. Showing the fixed Qibla bearing.
          </p>
        )}
      </div>
    </div>
  );
}
