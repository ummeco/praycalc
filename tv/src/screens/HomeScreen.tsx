/**
 * Purpose: Screen 1 — Home Dashboard: city, current time, all 6 prayer times, next-prayer highlight
 * Inputs: Prayer times from @acamarata/pray-calc; city from settings store
 * Outputs: Full-screen prayer grid with countdown; D-pad navigable prayer badges
 * Constraints: hasTVPreferredFocus on first prayer badge; useTVEventHandler for remote
 * SPORT: praycalc/tv screens
 */

import React, { useEffect, useState } from 'react';
import { useFocusDestination } from '../hooks/useFocusDestination';
import {
  View,
  Text,
  StyleSheet,
  TVFocusGuideView,
  TouchableHighlight,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PrayerName, PrayerTime } from '../types';
import { usePrayerStore } from '../stores/prayerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { calculatePrayerTimes } from '../lib/prayerCalc';

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const PRAYER_LABELS: Record<PrayerName, { en: string; ar: string }> = {
  fajr:    { en: 'Fajr',    ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr:   { en: 'Dhuhr',   ar: 'الظهر' },
  asr:     { en: 'Asr',     ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha:    { en: 'Isha',    ar: 'العشاء' },
};

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavProp>();
  const { prayerTimes, nextPrayer, markCompleted, setPrayerDay, setNextPrayer } = usePrayerStore();
  const { settings } = useSettingsStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [firstBadgeNode, firstBadgeRef] = useFocusDestination<TouchableHighlight>();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate prayer times on mount and when settings change
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
    // Determine next prayer
    const nowMs = today.getHours() * 3600000 + today.getMinutes() * 60000 + today.getSeconds() * 1000;
    const names: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const next = names.find((name) => {
      const [h, m] = day[name].split(':').map(Number);
      return (h * 3600000 + m * 60000) > nowMs;
    });
    if (next) setNextPrayer(next);
  }, [settings.latitude, settings.longitude, settings.calculationMethodId, settings.madhab]);

  // D-pad remote handler
  useTVEventHandler((evt) => {
    if (evt.eventType === 'left') navigation.navigate('Pairing');
    if (evt.eventType === 'right') navigation.navigate('Settings');
    if (evt.eventType === 'menu') navigation.navigate('Settings');
    if (evt.eventType === 'up') navigation.navigate('HadithOfDay');
    if (evt.eventType === 'down') navigation.navigate('Calendar');
  });

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <View style={styles.root}>
      {/* Header: City + Date/Time */}
      <View style={styles.header}>
        <Text style={styles.cityName}>{settings.cityName}</Text>
        <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
        <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
      </View>

      {/* Prayer Times Grid */}
      <TVFocusGuideView style={styles.grid} destinations={firstBadgeNode ? [firstBadgeNode] : []}>
        {prayerTimes.map((prayer, index) => (
          <TouchableHighlight
            key={prayer.name}
            ref={index === 0 ? firstBadgeRef : null}
            hasTVPreferredFocus={index === 0}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${PRAYER_LABELS[prayer.name].en} at ${prayer.time}`}
            onPress={() => markCompleted(prayer.name)}
            underlayColor="#1E5E2F"
            style={[
              styles.prayerBadge,
              prayer.isNext && styles.prayerBadgeNext,
              prayer.isCompleted && styles.prayerBadgeCompleted,
            ]}
          >
            <View style={styles.prayerBadgeInner}>
              <Text style={styles.prayerNameAr}>{PRAYER_LABELS[prayer.name].ar}</Text>
              <Text style={styles.prayerName}>{PRAYER_LABELS[prayer.name].en}</Text>
              <Text style={[styles.prayerTime, prayer.isNext && styles.prayerTimeNext]}>
                {prayer.time}
              </Text>
              {prayer.isNext && <View style={styles.nextIndicator} />}
              {prayer.isCompleted && <Text style={styles.completedCheck}>✓</Text>}
            </View>
          </TouchableHighlight>
        ))}
      </TVFocusGuideView>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <View style={styles.countdownBar}>
          <Text style={styles.countdownLabel}>Next: {PRAYER_LABELS[nextPrayer].en}</Text>
          <NextPrayerCountdown nextPrayer={nextPrayer} prayerTimes={prayerTimes} />
        </View>
      )}

      {/* Navigation hints */}
      <View style={styles.navHints}>
        <Text style={styles.navHint}>◀ Pair  ▲ Hadith  ▼ Calendar  ▶ Settings</Text>
      </View>
    </View>
  );
}

function NextPrayerCountdown({
  nextPrayer,
  prayerTimes,
}: {
  nextPrayer: PrayerName;
  prayerTimes: PrayerTime[];
}): React.JSX.Element {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const update = (): void => {
      const next = prayerTimes.find((p) => p.name === nextPrayer);
      if (!next) return;
      const now = new Date();
      const [h, m] = next.time.split(':').map(Number);
      const prayerMs = new Date().setHours(h, m, 0, 0);
      const diffMs = prayerMs - now.getTime();
      if (diffMs <= 0) {
        setCountdown('Now');
        return;
      }
      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      setCountdown(
        hours > 0
          ? `${hours}h ${minutes}m ${secs}s`
          : `${minutes}m ${secs}s`
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [nextPrayer, prayerTimes]);

  return <Text style={styles.countdownValue}>{countdown}</Text>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D2F17',
    padding: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cityName: {
    color: '#C9F27A',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 2,
  },
  currentTime: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: 4,
    marginTop: 8,
  },
  currentDate: {
    color: '#79C24C',
    fontSize: 28,
    marginTop: 4,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  prayerBadge: {
    width: 200,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#1E5E2F',
    margin: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  prayerBadgeNext: {
    borderColor: '#C9F27A',
    backgroundColor: '#2a7a3d',
  },
  prayerBadgeCompleted: {
    opacity: 0.5,
  },
  prayerBadgeInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  prayerNameAr: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  prayerName: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 4,
  },
  prayerTime: {
    color: '#79C24C',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  prayerTimeNext: {
    color: '#C9F27A',
  },
  nextIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9F27A',
    marginTop: 8,
  },
  completedCheck: {
    color: '#79C24C',
    fontSize: 24,
    marginTop: 4,
  },
  countdownBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  countdownLabel: {
    color: '#79C24C',
    fontSize: 28,
  },
  countdownValue: {
    color: '#C9F27A',
    fontSize: 36,
    fontWeight: '700',
  },
  navHints: {
    alignItems: 'center',
    paddingTop: 12,
  },
  navHint: {
    color: '#1E5E2F',
    fontSize: 20,
  },
});
