/**
 * Purpose: Prayer Times screen — displays 6 daily prayer times, next-prayer countdown,
 *   Hanafi/Shafi Asr toggle, and method selector. All 7 UI states implemented.
 * Inputs: Settings from useSettingsStore (method, madhab, location), GPS coords
 * Outputs: Prayer card fan with live next-prayer countdown (1s tick)
 * Constraints: Tehran/Jafari absent from method list (D-P3-19). RTL layout prepared.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-prayer-times-screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../../../constants/colors';
import { CALC_METHODS } from '../../../constants/methods';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import type { SettingsState } from '../../settings/store/useSettingsStore';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import type { PrayerName, Madhab } from '../../../types/prayer';
import type { CalcMethodKey } from '../../../constants/methods';
import {
  LoadingState,
  SkeletonCard,
  EmptyState,
  ErrorState,
  OfflineState,
  PermissionDeniedState,
} from '../../../components/shared/UIStates';

const PRAYER_LABELS: Record<PrayerName, string> = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
};

const PRAYER_ORDER: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function formatTime(date: Date, format: '12h' | '24h'): string {
  if (format === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getTimezoneOffset(): number {
  return -(new Date().getTimezoneOffset() / 60);
}

export default function PrayerTimesScreen() {
  const settings = useSettingsStore();
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // RTL layout preparation (actual RTL enforcement happens in T-03 i18n ticket)
    // I18nManager.forceRTL(false) — wired here, controlled by locale in T-03
  }, []);

  useEffect(() => {
    if (settings.location) {
      setCurrentCoords({ lat: settings.location.latitude, lng: settings.location.longitude });
      setLocationPermission('granted');
      return;
    }

    // Request GPS location
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        setLocationPermission('denied');
        return;
      }
      setLocationPermission('granted');
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(
        (loc) => {
          setCurrentCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        },
      );
    });
  }, [settings.location]);

  const timezone = getTimezoneOffset();

  const { times, nextPrayer, secondsToNextPrayer, status, error, refresh } = usePrayerTimes({
    date: new Date(),
    latitude: currentCoords?.lat ?? null,
    longitude: currentCoords?.lng ?? null,
    timezone,
    method: settings.method as CalcMethodKey,
    madhab: settings.madhab,
    isOffline,
    isPermissionDenied: locationPermission === 'denied',
  });

  // ── 7 UI States ──────────────────────────────────────────────────────────────

  if (status === 'skeleton' || (status === 'loading' && !times)) {
    return (
      <View style={styles.container}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (status === 'permission-denied') {
    return (
      <PermissionDeniedState
        permission="location"
        onOpenSettings={() => Location.requestForegroundPermissionsAsync()}
      />
    );
  }

  if (status === 'empty') {
    return (
      <EmptyState
        title="Set Your City"
        subtitle="Enable location or manually select a city to see prayer times."
        action="Set Location"
        onAction={() => {/* Navigate to city search — wired via Expo Router in T-03 */}}
      />
    );
  }

  if (status === 'error') {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  if (status === 'offline' || isOffline) {
    return (
      <OfflineState message="Showing last-known prayer times (offline)">
        {times ? <PrayerList times={times} nextPrayer={nextPrayer} secondsToNextPrayer={secondsToNextPrayer} settings={settings} /> : null}
      </OfflineState>
    );
  }

  // success
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Next: {nextPrayer}</Text>
          <Text style={styles.countdownTimer}>{formatCountdown(secondsToNextPrayer)}</Text>
        </View>
      )}

      {/* Prayer Times List */}
      {times && (
        <PrayerList
          times={times}
          nextPrayer={nextPrayer}
          secondsToNextPrayer={secondsToNextPrayer}
          settings={settings}
        />
      )}

      {/* Madhab Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asr Calculation</Text>
        <View style={styles.toggle}>
          {(['Shafi', 'Hanafi'] as Madhab[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleOption, settings.madhab === m && styles.toggleOptionActive]}
              onPress={() => settings.setMadhab(m)}
            >
              <Text style={[styles.toggleText, settings.madhab === m && styles.toggleTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Method Selector (7 methods, no Tehran) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calculation Method</Text>
        {CALC_METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[styles.methodRow, settings.method === method.key && styles.methodRowActive]}
            onPress={() => settings.setMethod(method.key)}
          >
            <Text style={[styles.methodText, settings.method === method.key && styles.methodTextActive]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

interface PrayerListProps {
  times: ReturnType<typeof usePrayerTimes>['times'];
  nextPrayer: PrayerName | null;
  secondsToNextPrayer: number;
  settings: SettingsState;
}

function PrayerList({ times, nextPrayer, settings }: PrayerListProps) {
  if (!times) return null;
  return (
    <View style={styles.prayerList}>
      {PRAYER_ORDER.map((name) => {
        const isNext = name === nextPrayer;
        return (
          <View key={name} style={[styles.prayerRow, isNext && styles.prayerRowNext]}>
            <View style={[styles.prayerDot, { backgroundColor: Colors.prayer[name.toLowerCase() as keyof typeof Colors.prayer] ?? Colors.brand.mid }]} />
            <Text style={[styles.prayerName, isNext && styles.prayerNameNext]}>
              {PRAYER_LABELS[name]}
            </Text>
            <Text style={[styles.prayerTime, isNext && styles.prayerTimeNext]}>
              {formatTime(times[name], settings.timeFormat)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  content: { padding: 16, gap: 16 },
  countdownCard: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  countdownLabel: { color: Colors.brand.light, fontSize: 14, fontWeight: '500' },
  countdownTimer: { color: Colors.text.inverse, fontSize: 36, fontWeight: '700', marginTop: 4 },
  prayerList: { gap: 4 },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    gap: 12,
  },
  prayerRowNext: { backgroundColor: Colors.brand.deep, borderWidth: 2, borderColor: Colors.brand.mid },
  prayerDot: { width: 10, height: 10, borderRadius: 5 },
  prayerName: { flex: 1, fontSize: 16, color: Colors.text.primary, fontWeight: '500' },
  prayerNameNext: { color: Colors.brand.light },
  prayerTime: { fontSize: 16, color: Colors.text.secondary, fontWeight: '600' },
  prayerTimeNext: { color: Colors.brand.light },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, color: Colors.text.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: Colors.background.card },
  toggleOption: { flex: 1, padding: 12, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: Colors.brand.dark },
  toggleText: { fontSize: 14, color: Colors.text.primary },
  toggleTextActive: { color: Colors.text.inverse, fontWeight: '600' },
  methodRow: { padding: 14, borderRadius: 8, backgroundColor: Colors.background.secondary },
  methodRowActive: { backgroundColor: Colors.brand.dark },
  methodText: { fontSize: 14, color: Colors.text.primary },
  methodTextActive: { color: Colors.text.inverse, fontWeight: '600' },
});
