/**
 * Purpose: Display a single prayer's name and time, highlighted if it's next.
 * Inputs: Prayer object, isNext flag, use24h preference
 * Outputs: Styled card row with prayer name and formatted time
 * Constraints: Pure presentational — no hooks, no side effects.
 * SPORT: components/PrayerCard.tsx
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Prayer } from '../types';

interface PrayerCardProps {
  prayer: Prayer;
  isNext: boolean;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤',
  Maghrib: '🌇',
  Isha: '🌃',
  Qiyam: '✨',
};

export const PrayerCard: React.FC<PrayerCardProps> = ({ prayer, isNext }) => {
  return (
    <View style={[styles.card, isNext && styles.cardNext]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{PRAYER_ICONS[prayer.name] ?? '🕌'}</Text>
        <Text style={[styles.name, isNext && styles.nameNext]}>{prayer.name}</Text>
        {isNext && <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>NEXT</Text></View>}
      </View>
      <Text style={[styles.time, isNext && styles.timeNext]}>{prayer.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  cardNext: {
    backgroundColor: 'rgba(52, 168, 83, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(52, 168, 83, 0.6)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  nameNext: {
    color: '#ffffff',
    fontWeight: '700',
  },
  nextBadge: {
    backgroundColor: '#34a853',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  nextBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    fontVariant: ['tabular-nums'],
    fontWeight: '400',
  },
  timeNext: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
