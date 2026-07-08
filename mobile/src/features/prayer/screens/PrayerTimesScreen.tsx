/**
 * Purpose: Prayer Times screen — displays 6 daily prayer times, next-prayer countdown,
 *   Hanafi/Shafi Asr toggle, and method selector. All 7 UI states implemented.
 *   Also the natural "success moment" that drives the rate-us gate (a few prayers
 *   logged) and hosts the "Share today's times" action.
 * Inputs: Settings from useSettingsStore (method, madhab, location), GPS coords
 * Outputs: Prayer card fan with live next-prayer countdown (1s tick)
 * Constraints: Tehran/Jafari absent from method list (D-P3-19). RTL layout prepared.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-prayer-times-screen
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { router } from 'expo-router';
import i18next, { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { CALC_METHODS } from '../../../constants/methods';
import { useSettingsStore, useActiveLocation } from '../../settings/store/useSettingsStore';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import type { Madhab } from '../../../types/prayer';
import type { CalcMethodKey } from '../../../constants/methods';
import { gregorianToHijri } from '../../../lib/hijri';
import { resolveTimezoneOffset } from '../../../lib/timezone';
import { PRAYER_LABEL_KEYS } from '../../../constants/prayers';
import { buildPrayerTimesShareText } from '../../../lib/share';
import {
  SkeletonCard,
  EmptyState,
  ErrorState,
  OfflineState,
  PermissionDeniedState,
} from '../../../components/states';
import { PrayerList } from './components/PrayerList';
import { formatCountdown, getTimezoneOffset } from './prayerTimesScreen.helpers';
import { createStyles } from './PrayerTimesScreen.styles';

export default function PrayerTimesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const settings = useSettingsStore();
  const activeLocation = useActiveLocation();
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Real connectivity: drives the 'offline' UI state (shows last-known times).
  // Was dead code — setIsOffline was never called anywhere.
  useEffect(() => {
    let mounted = true;
    const apply = (state: Network.NetworkState) => {
      if (mounted) setIsOffline(!(state.isInternetReachable ?? state.isConnected ?? true));
    };
    Network.getNetworkStateAsync().then(apply).catch(() => undefined);
    const sub = Network.addNetworkStateListener(apply);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    // RTL layout preparation (actual RTL enforcement happens in T-03 i18n ticket)
    // I18nManager.forceRTL(false) — wired here, controlled by locale in T-03
  }, []);

  useEffect(() => {
    if (activeLocation) {
      setCurrentCoords({ lat: activeLocation.latitude, lng: activeLocation.longitude });
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
  }, [activeLocation]);

  const today = new Date();
  // Live GPS fix present → device offset is authoritative (matches the coords just read).
  // Otherwise we're rendering a STORED city (home or travel) with no live fix — resolve
  // its own IANA/offset timezone field instead of assuming the device's current zone.
  const timezone = currentCoords
    ? getTimezoneOffset()
    : resolveTimezoneOffset(activeLocation?.timezone, today);
  const hijriDate = gregorianToHijri(today, settings.hijriDayAdjustment);

  const { times, nextPrayer, secondsToNextPrayer, status, error, refresh } = usePrayerTimes({
    date: today,
    latitude: currentCoords?.lat ?? null,
    longitude: currentCoords?.lng ?? null,
    timezone,
    method: settings.method as CalcMethodKey,
    madhab: settings.madhab,
    highLatRule: settings.highLatRule,
    customAngles: settings.method === 'Custom'
      ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
      : undefined,
    minuteAdjustments: settings.prayerMinuteAdjustments,
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
        title={t('screens.prayerTimes.setCityTitle')}
        subtitle={t('screens.prayerTimes.setCitySubtitle')}
        action={t('screens.prayerTimes.setLocationAction')}
        onAction={() => router.push('/city-search')}
      />
    );
  }

  if (status === 'error') {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  if (status === 'offline' || isOffline) {
    return (
      <OfflineState message={t('screens.prayerTimes.offlineMessage')}>
        {times ? <PrayerList times={times} nextPrayer={nextPrayer} secondsToNextPrayer={secondsToNextPrayer} settings={settings} colors={colors} styles={styles} t={t} /> : null}
      </OfflineState>
    );
  }

  // success
  function handleShareTimes() {
    if (!times || !activeLocation) return;
    const message = buildPrayerTimesShareText({
      times,
      city: activeLocation.city,
      country: activeLocation.country,
      timeFormat: settings.timeFormat,
      locale: i18next.language,
      translatePrayerLabel: (name) => t(PRAYER_LABEL_KEYS[name]),
    });
    void Share.share({ message }).catch(() => undefined);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}
    >
      {/* Date header — Hijri + Gregorian, active location name */}
      <View style={styles.dateHeader} accessibilityRole="header">
        <Text style={styles.hijriDate} minimumFontScale={0.8}>
          {hijriDate.day} {hijriDate.monthName} {hijriDate.year} AH
        </Text>
        <Text style={styles.gregorianDate} minimumFontScale={0.8}>
          {today.toLocaleDateString(i18next.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        {activeLocation && (
          <Text style={styles.locationName}>
            {settings.musafirMode && settings.travelLocation ? '✈️ ' : '📍 '}
            {activeLocation.city}, {activeLocation.country}
          </Text>
        )}
        {activeLocation && times && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareTimes}
            accessibilityRole="button"
            accessibilityLabel={t('screens.prayerTimes.shareAccessibilityLabel')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.shareButtonText}>{t('screens.prayerTimes.shareTimes')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <View
          style={styles.countdownCard}
          accessible
          accessibilityLabel={`${t('screens.prayerTimes.next', { prayer: t(PRAYER_LABEL_KEYS[nextPrayer]) })}, ${formatCountdown(secondsToNextPrayer)}`}
        >
          <Text style={styles.countdownLabel} minimumFontScale={0.8}>{t('screens.prayerTimes.next', { prayer: t(PRAYER_LABEL_KEYS[nextPrayer]) })}</Text>
          <Text style={styles.countdownTimer} minimumFontScale={0.6} numberOfLines={1}>{formatCountdown(secondsToNextPrayer)}</Text>
        </View>
      )}

      {/* Prayer Times List */}
      {times && (
        <PrayerList
          times={times}
          nextPrayer={nextPrayer}
          secondsToNextPrayer={secondsToNextPrayer}
          settings={settings}
          colors={colors}
          styles={styles}
          t={t}
        />
      )}

      {/* Madhab Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.prayerTimes.asrCalculation')}</Text>
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {(['Shafi', 'Hanafi'] as Madhab[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleOption, settings.madhab === m && styles.toggleOptionActive]}
              onPress={() => settings.setMadhab(m)}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.madhab === m }}
              accessibilityLabel={m}
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
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('settings.calculation.title')}</Text>
        <View accessibilityRole="radiogroup">
          {CALC_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[styles.methodRow, settings.method === method.key && styles.methodRowActive]}
              onPress={() => settings.setMethod(method.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.method === method.key }}
              accessibilityLabel={method.label}
            >
              <Text style={[styles.methodText, settings.method === method.key && styles.methodTextActive]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
