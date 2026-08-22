/**
 * CityClient.tsx — City prayer-times page island (orchestrator).
 *
 * PURPOSE: Owns client state for the city page — settings, session, the settings
 *   panel, live clock, adhan playback, and the Qibla / calendar modals — and
 *   composes the header, compact search, prayer grid, and feature tiles.
 * DOM contract: see child components + .settings-gear-btn (aria-label "Settings").
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect, useRef, useState } from 'react';
import { getSettings, saveSetting, type PrayCalcSettings } from '@/lib/settings';
import { getSession, clearSession, type PrayCalcSession } from '@/lib/session';
import { qiblaAngle, compassDir } from '@/lib/qibla';
import { getNextPrayer, DISPLAY_PRAYERS, type PrayerResult } from '@/lib/prayer-utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAdhanPlayback } from '@/hooks/useAdhanPlayback';
import LocationSearch from '@/islands/LocationSearch';
import PrayerGrid from './PrayerGrid';
import FeatureTiles from './FeatureTiles';
import SettingsPanel from './SettingsPanel';
import QiblaModal from './QiblaModal';
import CalendarModal from './CalendarModal';
import ErrorBoundary from '@/islands/ErrorBoundary';

interface Props {
  shafiPrayers: PrayerResult;
  hanafiPrayers: PrayerResult;
  locationName: string;
  timezone: string;
  slug: string;
  lat: number;
  lng: number;
  locale?: string;
}

type ModalKind = null | 'qibla' | 'monthly' | 'yearly';

/** Timezone-accurate HH:MM:SS string for a given tz identifier. */
function nowHHMMSS(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
    return `${get('hour')}:${get('minute')}:${get('second')}`;
  } catch {
    return new Date().toTimeString().slice(0, 8);
  }
}

/**
 * Today's date as YYYY-MM-DD **in the city being displayed**, for the /api/prayers range.
 *
 * WHY the timezone argument: this used to read the viewer's own device day, so someone in
 * London looking at Auckland's page requested London's date for Auckland's times. The page
 * and the range have to agree on which day "today" is. See P12-E01.
 */
function todayISODate(tz: string): string {
  try {
    // en-CA formats as YYYY-MM-DD, which is exactly the form /api/prayers expects.
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    // An unusable zone falls back to the device day rather than failing the whole island.
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

/** Public entry point — wraps the island body in an error boundary. */
export default function CityClient(props: Props) {
  return (
    <ErrorBoundary>
      <CityClientInner {...props} />
    </ErrorBoundary>
  );
}

function CityClientInner({
  shafiPrayers,
  hanafiPrayers,
  locationName,
  timezone,
  lat,
  lng,
  locale = 'en',
}: Props) {
  const [settings, setSettings] = useState<PrayCalcSettings>(() => getSettings());
  const [session, setSession] = useState<PrayCalcSession | null>(() => getSession());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [clockHHMMSS, setClockHHMMSS] = useState('');
  // Fixed-method Fajr/Isha overlay. Null while DPC (server-rendered dynamic
  // default) is selected; populated from /api/prayers for any fixed preset.
  const [methodOverlay, setMethodOverlay] = useState<{ Fajr: string; Isha: string } | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);

  // Hydrate settings + session from localStorage on mount
  useEffect(() => {
    setSettings(getSettings());
    setSession(getSession());
  }, []);

  // Apply light-mode class
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('light-mode', settings.lightMode);
  }, [settings.lightMode]);

  // Per-second clock in city timezone
  useEffect(() => {
    setClockHHMMSS(nowHHMMSS(timezone));
    const id = setInterval(() => setClockHHMMSS(nowHHMMSS(timezone)), 1000);
    return () => clearInterval(id);
  }, [timezone]);

  // Fixed-method Fajr/Isha overlay. DPC (default) uses the server-rendered
  // dynamic times as-is; any fixed preset re-fetches today's Fajr/Isha for the
  // chosen method + madhab. Only Fajr/Isha differ by method — the rest are shared.
  useEffect(() => {
    if (settings.calcMethod === 'DPC') {
      setMethodOverlay(null);
      return;
    }
    let cancelled = false;
    const iso = todayISODate(timezone);
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      tz: timezone,
      from: iso,
      to: iso,
      hanafi: settings.hanafi ? '1' : '0',
      method: settings.calcMethod,
    });
    fetch(`/api/prayers?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((rows: { prayers: { Fajr: string; Isha: string } }[] | null) => {
        if (cancelled || !rows || !rows[0]) return;
        setMethodOverlay({ Fajr: rows[0].prayers.Fajr, Isha: rows[0].prayers.Isha });
      })
      .catch(() => { if (!cancelled) setMethodOverlay(null); });
    return () => { cancelled = true; };
  }, [settings.calcMethod, settings.hanafi, lat, lng, timezone]);

  // Adhan playback — fires when clock crosses a prayer time (extracted hook).
  useAdhanPlayback(clockHHMMSS, settings, shafiPrayers, hanafiPrayers, methodOverlay);

  // RESP-05: lock page scroll while an overlay is open (no scroll-chaining).
  useBodyScrollLock(settingsOpen || modal !== null);

  // Outside-click closes the settings panel (but not when clicking the gear)
  useEffect(() => {
    if (!settingsOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (gearRef.current?.contains(t)) return;
      setSettingsOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [settingsOpen]);

  function handleChange<K extends keyof PrayCalcSettings>(key: K, value: PrayCalcSettings[K]) {
    saveSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSignOut() {
    clearSession();
    setSession(null);
  }

  const basePrayers = settings.hanafi ? hanafiPrayers : shafiPrayers;
  // Overlay the selected fixed method's Fajr/Isha; DPC leaves the dynamic default.
  const prayers = methodOverlay
    ? { ...basePrayers, Fajr: methodOverlay.Fajr, Isha: methodOverlay.Isha }
    : basePrayers;
  const qDeg = qiblaAngle(lat, lng);
  const qCompass = compassDir(qDeg);

  const nowHHMM = clockHHMMSS ? clockHHMMSS.slice(0, 5) : undefined;
  const list = settings.showQiyam ? ([...DISPLAY_PRAYERS, 'Qiyam'] as Array<keyof PrayerResult>) : DISPLAY_PRAYERS;
  const nextPrayer = nowHHMM ? getNextPrayer(prayers, nowHHMM, list) : null;

  return (
    <div className="city-client">
      <header className="city-header">
        <h2 className="city-name">{locationName}</h2>
        <button
          type="button"
          ref={gearRef}
          className="settings-gear-btn"
          aria-label="Settings"
          onClick={() => setSettingsOpen((v) => !v)}
        >
          ⚙️
        </button>
      </header>

      <div className="city-search">
        <LocationSearch compact />
      </div>

      <PrayerGrid
        prayers={prayers}
        use24h={settings.use24h}
        showQiyam={settings.showQiyam}
        locale={locale}
        nowHHMMSS={clockHHMMSS}
        nextPrayer={nextPrayer}
        showCountdown={settings.countdown}
      />

      <FeatureTiles
        qiblaDeg={qDeg}
        qiblaCompass={qCompass}
        onOpenQibla={() => setModal('qibla')}
        onOpenMonthly={() => setModal('monthly')}
        onOpenYearly={() => setModal('yearly')}
      />

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={handleChange}
          session={session}
          onSignOut={handleSignOut}
          onClose={() => setSettingsOpen(false)}
          panelRef={panelRef}
        />
      )}

      {modal === 'qibla' && (
        <QiblaModal
          locationName={locationName}
          lat={lat}
          lng={lng}
          qiblaDeg={qDeg}
          qiblaCompass={qCompass}
          onClose={() => setModal(null)}
        />
      )}

      {(modal === 'monthly' || modal === 'yearly') && (
        <CalendarModal
          lat={lat}
          lng={lng}
          timezone={timezone}
          hanafi={settings.hanafi}
          locationName={locationName}
          initialView={modal === 'yearly' ? 'year' : 'month'}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
