/**
 * Purpose: LEFT-BOTTOM strip under the Display pane. Priority, highest first:
 *   1. Special-day banner (STRICT allowlist — Ramadan start / Eid / Arafah / Arafah-eve)
 *   2. Ramadan "Day X of Y" progress bar (during Ramadan)
 *   3. Weather (open-meteo) when show_weather is on
 *   Hidden entirely when none apply (or show_weather off + not Ramadan + no banner).
 * Inputs: showWeather, latitude, longitude, hijriDayAdjustment.
 * Outputs: the bottom strip view (or an empty view when nothing to show).
 * Constraints: min 28pt text; allowlist decides banners (see lib/events/specialDays.ts).
 *   Weather fetches on mount + refreshes every 30 min; failures hide the weather line.
 * SPORT: praycalc/tv components/dashboard
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  getSpecialDay,
  getRamadanProgress,
  SpecialDay,
  RamadanProgress,
} from '../../lib/events/specialDays';
import { fetchCurrentWeather, CurrentWeather } from '../../lib/weather/openMeteo';

const WEATHER_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

interface BottomBarProps {
  showWeather: boolean;
  latitude: number;
  longitude: number;
  hijriDayAdjustment?: number;
}

export default function BottomBar({
  showWeather,
  latitude,
  longitude,
  hijriDayAdjustment = 0,
}: BottomBarProps): React.JSX.Element | null {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  const now = new Date();
  const special: SpecialDay | null = getSpecialDay(now, hijriDayAdjustment);
  const ramadan: RamadanProgress | null = getRamadanProgress(now, hijriDayAdjustment);

  useEffect(() => {
    if (!showWeather) return;
    let active = true;
    const load = async (): Promise<void> => {
      const w = await fetchCurrentWeather(latitude, longitude);
      if (active) setWeather(w);
    };
    void load();
    const timer = setInterval(() => void load(), WEATHER_REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [showWeather, latitude, longitude]);

  // 1. Special-day banner (allowlist) — highest priority.
  if (special) {
    return (
      <View style={[styles.root, styles.banner]}>
        <Text style={styles.bannerEmoji}>{special.emoji}</Text>
        <View>
          <Text style={styles.bannerTitle}>{special.title}</Text>
          <Text style={styles.bannerSubtitle}>{special.subtitle}</Text>
        </View>
      </View>
    );
  }

  // 2. Ramadan progress bar.
  if (ramadan) {
    const pct = Math.min(1, Math.max(0, ramadan.day / ramadan.total));
    return (
      <View style={styles.root}>
        <Text style={styles.ramadanLabel}>
          🌙 Ramadan — Day {ramadan.day} of {ramadan.total}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
        </View>
      </View>
    );
  }

  // 3. Weather.
  if (showWeather && weather) {
    return (
      <View style={styles.root}>
        <Text style={styles.weather}>
          {weather.emoji}  {Math.round(weather.temperatureC)}°C  ·  {weather.label}
        </Text>
      </View>
    );
  }

  // Nothing to show.
  return null;
}

const styles = StyleSheet.create({
  root: {
    minHeight: 72,
    backgroundColor: '#123d1f',
    borderTopWidth: 2,
    borderTopColor: '#1E5E2F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#1E5E2F',
  },
  bannerEmoji: { fontSize: 44 },
  bannerTitle: {
    color: '#C9F27A',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerSubtitle: {
    color: '#79C24C',
    fontSize: 26,
  },
  ramadanLabel: {
    color: '#C9F27A',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0D2F17',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#79C24C',
    borderRadius: 7,
  },
  weather: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '600',
  },
});
