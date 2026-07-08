/**
 * Purpose: DEFAULT screen — two-pane masjid dashboard. LEFT (~2/3): live stream + rotating
 *   Islamic content + bottom weather/special-day/Ramadan strip. RIGHT (~1/3): prayer rail.
 *   A focusable Menu button reaches every legacy screen (navigation kept intact).
 * Inputs: settingsStore (location + cosmetic settings), prayerStore.
 * Outputs: the full dashboard view; boots the pc_tv_settings poll (boot + every 5 min).
 * Constraints: 16:9 1080p; D-pad focus starts on the Menu button; prayer times recomputed
 *   on settings/location change and at midnight; TvSettingsSync uses the persisted device id.
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
import DisplayPane from '../components/dashboard/DisplayPane';
import PrayerRail from '../components/dashboard/PrayerRail';
import PrayerTakeover from '../components/dashboard/PrayerTakeover';
import BottomBar from '../components/dashboard/BottomBar';
import DashboardMenu from '../components/dashboard/DashboardMenu';

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

  return (
    <View style={styles.root}>
      {/* Focusable menu affordance (initial D-pad focus) — reaches all legacy screens. */}
      <DashboardMenu navigation={navigation} hasTVPreferredFocus />

      {/* LEFT pane (~2/3): display + bottom strip. */}
      <View style={styles.leftPane}>
        <View style={styles.displayArea}>
          <DisplayPane
            streamSource={settings.streamSource}
            rotateMinutes={settings.rotateMinutes}
          />
        </View>
        <BottomBar
          showWeather={settings.showWeather}
          latitude={settings.latitude}
          longitude={settings.longitude}
        />
      </View>

      {/* RIGHT pane (~1/3): prayer rail. */}
      <View style={styles.rightPane}>
        <PrayerRail
          cityName={settings.cityName}
          prayerTimes={prayerTimes}
          nextPrayer={nextPrayer}
          accentColor={settings.accentColor}
          iqamaEnabled={settings.iqamaEnabled}
          iqamaOffsets={settings.iqamaOffsets}
        />
      </View>

      {/* Full-screen takeover overlay (countdown / name-only) — renders null when inactive. */}
      <PrayerTakeover settings={settings} prayerDay={prayerDay} nextPrayer={nextPrayer} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0D2F17',
  },
  leftPane: {
    flex: 2, // ~2/3
    flexDirection: 'column',
  },
  displayArea: {
    flex: 1,
  },
  rightPane: {
    flex: 1, // ~1/3
  },
});
