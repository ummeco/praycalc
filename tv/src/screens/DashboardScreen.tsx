/**
 * Purpose: DEFAULT screen — thin layout switch over the registered dashboard layouts
 *   (classic/flipped/stream-full/times-only/ambient, see lib/layouts/registry). A
 *   focusable Menu button reaches every legacy screen (navigation kept intact); the
 *   countdown/name-only takeover overlays layer above whichever layout is active.
 * Inputs: settingsStore (location + cosmetic + layout/theme settings), prayerStore.
 * Outputs: the full dashboard view; boots the pc_tv_settings poll (boot + every 5 min).
 * Constraints: 16:9 1080p; D-pad focus starts on the Menu button; prayer times recomputed
 *   on settings/location change and at midnight; TvSettingsSync uses the persisted device
 *   id; PrayerTakeover/DashboardMenu are NOT per-layout — they render once here, above the
 *   active layout, so they behave identically regardless of settings.layout.
 * SPORT: praycalc/tv screens
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PrayerName } from '../types';
import { usePrayerStore } from '../stores/prayerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { calculatePrayerTimes } from '../lib/prayerCalc';
import { graphqlClient } from '../lib/graphql/client';
import { getOrCreateDeviceId } from '../lib/pairing/pairingService';
import { TvSettingsSync } from '../lib/settings/tvSettingsSync';
import { updateAmbientLine1 } from '../lib/native/tvSystem';
import { buildAmbientLine1 } from '../lib/native/ambientLines';
import { getLayoutComponent } from '../lib/layouts/registry';
import PrayerTakeover from '../components/dashboard/PrayerTakeover';
import DashboardMenu from '../components/dashboard/DashboardMenu';
import UpdateToast from '../components/dashboard/UpdateToast';

type DashboardNav = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const PRAYER_ORDER: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export default function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<DashboardNav>();
  const { prayerTimes, prayerDay, nextPrayer, setPrayerDay, setNextPrayer } =
    usePrayerStore();
  const { settings, updateSettings } = useSettingsStore();
  // Recompute prayer times daily (date key changes at midnight) and on settings change.
  const [dateKey, setDateKey] = useState(() => new Date().toDateString());

  // Recompute prayer day + next prayer on mount, on location/method change, at midnight.
  useEffect(() => {
    const today = new Date();
    const day = calculatePrayerTimes({
      date: today,
      latitude: settings.latitude,
      longitude: settings.longitude,
      timezone: settings.timezone,
      methodId: settings.calculationMethodId,
      madhab: settings.madhab,
      highLatitudeRule: settings.highLatitudeRule,
    });
    setPrayerDay(day);
    const nowMs =
      today.getHours() * 3600000 +
      today.getMinutes() * 60000 +
      today.getSeconds() * 1000;
    const next = PRAYER_ORDER.find((name) => {
      const [h, m] = day[name].split(':').map(Number);
      return h * 3600000 + m * 60000 > nowMs;
    });
    // Before Fajr the next prayer is Fajr; after Isha, wrap to Fajr for the highlight.
    // (Ambient line1 is refreshed by the minute-tick effect below off the store's day/next.)
    setNextPrayer(next ?? 'fajr');
  }, [
    dateKey,
    settings.latitude,
    settings.longitude,
    settings.timezone,
    settings.calculationMethodId,
    settings.madhab,
    setPrayerDay,
    setNextPrayer,
  ]);

  // Midnight roll-over: check each minute whether the date changed.
  useEffect(() => {
    const timer = setInterval(() => {
      const key = new Date().toDateString();
      setDateKey((prev) => (prev === key ? prev : key));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh ambient line1 each minute so the screensaver countdown stays current even when
  // the app is idle (the recompute effect only fires on settings/date change).
  useEffect(() => {
    const push = (): void =>
      updateAmbientLine1(buildAmbientLine1(prayerDay, nextPrayer, new Date()));
    push();
    const timer = setInterval(push, 60 * 1000);
    return () => clearInterval(timer);
  }, [prayerDay, nextPrayer]);

  // pc_tv_settings poll — boot + every 5 min. Uses the persisted TV device id.
  useEffect(() => {
    let sync: TvSettingsSync | null = null;
    let cancelled = false;
    const boot = async (): Promise<void> => {
      const deviceId = await getOrCreateDeviceId();
      if (cancelled) return;
      sync = new TvSettingsSync(graphqlClient, deviceId, updateSettings);
      void sync.start();
    };
    void boot();
    return () => {
      cancelled = true;
      sync?.stop();
    };
  }, [updateSettings]);

  // Thin switch — resolve the active layout component from the registry (T4-2). Each
  // layout owns its own composition/colors; DashboardScreen only supplies shared data.
  const Layout = getLayoutComponent(settings.layout);

  return (
    <View style={styles.root}>
      {/* Focusable menu affordance (initial D-pad focus) — reaches all legacy screens. */}
      <DashboardMenu navigation={navigation} hasTVPreferredFocus />

      <Layout
        settings={settings}
        prayerTimes={prayerTimes}
        prayerDay={prayerDay}
        nextPrayer={nextPrayer}
      />

      {/* Full-screen takeover overlay (countdown / name-only) — renders null when inactive.
          Not per-layout: it must cover whichever layout is active, unchanged. */}
      <PrayerTakeover settings={settings} prayerDay={prayerDay} nextPrayer={nextPrayer} />

      {/* Dismissible corner update-available toast — renders null until a newer release exists. */}
      <UpdateToast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
