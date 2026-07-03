/**
 * Purpose: Screen 15 — Screensaver: prayer times clock display, dims after 5 min inactivity
 * Inputs: Prayer times from store; inactivity timer (setInterval-based)
 * Outputs: Ambient prayer times display; auto-dims; any D-pad press exits screensaver
 * Constraints: setInterval-based dim timer; useTVEventHandler to detect remote press and exit
 * SPORT: praycalc/tv screens
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback, useTVEventHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PrayerName } from '../types';
import { usePrayerStore } from '../stores/prayerStore';
import { useSettingsStore } from '../stores/settingsStore';

type ScreensaverNavProp = StackNavigationProp<RootStackParamList, 'Screensaver'>;

const PRAYER_LABELS: Record<PrayerName, { en: string; ar: string }> = {
  fajr:    { en: 'Fajr',    ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr:   { en: 'Dhuhr',   ar: 'الظهر' },
  asr:     { en: 'Asr',     ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha:    { en: 'Isha',    ar: 'العشاء' },
};

export default function ScreensaverScreen(): React.JSX.Element {
  const navigation = useNavigation<ScreensaverNavProp>();
  const { prayerTimes, nextPrayer } = usePrayerStore();
  const { settings } = useSettingsStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const opacity = useRef(new Animated.Value(1)).current;
  const dimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDimmedRef = useRef(false);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dim after screensaver timeout (default 5 min)
  const timeoutMs = settings.screensaverTimeoutMinutes * 60 * 1000;

  const resetDimTimer = (): void => {
    if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
    if (isDimmedRef.current) {
      // Restore brightness
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      isDimmedRef.current = false;
    }
    dimTimerRef.current = setTimeout(() => {
      isDimmedRef.current = true;
      Animated.timing(opacity, { toValue: 0.2, duration: 2000, useNativeDriver: true }).start();
    }, timeoutMs);
  };

  useEffect(() => {
    resetDimTimer();
    return () => {
      if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
    };
  }, [timeoutMs]);

  // Any remote button press exits screensaver
  // Use a ref so the handler always sees the latest resetDimTimer without stale closure
  const resetDimTimerRef = useRef(resetDimTimer);
  resetDimTimerRef.current = resetDimTimer;

  useTVEventHandler(() => {
    if (isDimmedRef.current) {
      resetDimTimerRef.current();
    } else {
      navigation.navigate('Home');
    }
  });

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('Home')}>
      <Animated.View style={[styles.root, { opacity }]}>
        {/* Large clock */}
        <View style={styles.clockContainer}>
          <Text style={styles.clockTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
          <Text style={styles.cityName}>{settings.cityName}</Text>
        </View>

        {/* Prayer times strip at bottom */}
        <View style={styles.prayerStrip}>
          {prayerTimes.map((prayer) => (
            <View
              key={prayer.name}
              style={[styles.prayerItem, prayer.name === nextPrayer && styles.prayerItemNext]}
            >
              <Text style={styles.prayerItemAr}>{PRAYER_LABELS[prayer.name].ar}</Text>
              <Text style={styles.prayerItemEn}>{PRAYER_LABELS[prayer.name].en}</Text>
              <Text style={[styles.prayerItemTime, prayer.name === nextPrayer && styles.prayerItemTimeNext]}>
                {prayer.time}
              </Text>
            </View>
          ))}
        </View>

        {/* Hint */}
        <Text style={styles.hint}>Press any button to return</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center',
  },
  clockContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  clockTime: {
    color: '#C9F27A', fontSize: 144, fontWeight: '200', letterSpacing: 8,
  },
  clockDate: { color: '#79C24C', fontSize: 40, marginTop: 8 },
  cityName: { color: '#1E5E2F', fontSize: 32, marginTop: 4 },
  prayerStrip: {
    flexDirection: 'row', justifyContent: 'space-around',
    width: '100%', paddingHorizontal: 60, paddingBottom: 40,
  },
  prayerItem: {
    alignItems: 'center', padding: 16,
  },
  prayerItemNext: {
    borderTopWidth: 2, borderTopColor: '#C9F27A',
  },
  prayerItemAr: { color: '#1E5E2F', fontSize: 22, writingDirection: 'rtl' },
  prayerItemEn: { color: '#79C24C', fontSize: 18 },
  prayerItemTime: { color: '#79C24C', fontSize: 28, fontWeight: '600', marginTop: 4 },
  prayerItemTimeNext: { color: '#C9F27A' },
  hint: { color: '#1a1a1a', fontSize: 18, marginBottom: 20 },
});
