/**
 * CityClient.tsx — City prayer-times page island (orchestrator).
 *
 * PURPOSE: Owns client state for the city page — settings, session, the settings
 *   panel (gear + outside-click close), and the Qibla / calendar modals — and
 *   composes the header, compact search, prayer grid, and feature tiles.
 * DOM contract: see child components (PrayerGrid, SettingsPanel, FeatureTiles,
 *   QiblaModal, CalendarModal) + .settings-gear-btn (aria-label "Settings").
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect, useRef, useState } from 'react';
import { getSettings, saveSetting, type PrayCalcSettings } from '@/lib/settings';
import { getSession, clearSession, type PrayCalcSession } from '@/lib/session';
import { qiblaAngle, compassDir } from '@/lib/qibla';
import type { PrayerResult } from '@/lib/prayer-utils';
import LocationSearch from '@/islands/LocationSearch';
import PrayerGrid from './PrayerGrid';
import FeatureTiles from './FeatureTiles';
import SettingsPanel from './SettingsPanel';
import QiblaModal from './QiblaModal';
import CalendarModal from './CalendarModal';

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

export default function CityClient({
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

  const prayers = settings.hanafi ? hanafiPrayers : shafiPrayers;
  const qDeg = qiblaAngle(lat, lng);
  const qCompass = compassDir(qDeg);

  return (
    <div className="city-client">
      <header className="city-header">
        <h1 className="city-name">{locationName}</h1>
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
          panelRef={panelRef}
        />
      )}

      {modal === 'qibla' && (
        <QiblaModal
          locationName={locationName}
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
