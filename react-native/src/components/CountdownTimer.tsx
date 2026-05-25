/**
 * Purpose: Live countdown to the next prayer, ticking every second.
 * Inputs: nextPrayer Prayer object with timeMs
 * Outputs: Formatted HH:MM:SS countdown string, auto-hides when 0
 * Constraints: Sets up a 1-second interval via setInterval. Cleaned up on unmount.
 *   Shows "Prayer time!" for 30s after adhan then resets.
 * SPORT: components/CountdownTimer.tsx
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Prayer } from '../types';

interface CountdownTimerProps {
  nextPrayer: Prayer | null;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ nextPrayer }) => {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!nextPrayer) return;

    const tick = () => {
      const diff = nextPrayer.timeMs - Date.now();
      setRemainingMs(Math.max(0, diff));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  if (!nextPrayer) return null;

  const isNow = remainingMs === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isNow ? 'Prayer time!' : `${nextPrayer.name} in`}
      </Text>
      {!isNow && (
        <Text style={styles.countdown}>{formatCountdown(remainingMs)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countdown: {
    fontSize: 40,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
});
