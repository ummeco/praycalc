/**
 * Purpose: Animated compass rose that rotates to point toward the Qibla.
 * Inputs: QiblaData (kaabaDeg for Kaaba angle, compassHeading for current heading)
 * Outputs: Rotating compass SVG with Kaaba indicator and distance label
 * Constraints: Uses react-native-svg for the compass rose and Kaaba arrow.
 *   Reanimated interpolates the rotation for smooth tracking at 4 Hz.
 *   Falls back to static bearing display if sensor unavailable (heading = -1).
 * SPORT: components/QiblaCompass.tsx
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Circle, Line, Text as SvgText, Polygon } from 'react-native-svg';
import type { QiblaData } from '../types';

interface QiblaCompassProps {
  qibla: QiblaData;
}

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 16;

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ qibla }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (qibla.compassHeading < 0) return;
    const target = qibla.kaabaDeg;
    rotation.value = withTiming(target, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [qibla.kaabaDeg, qibla.compassHeading]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cardinals = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.compassWrap}>
        {/* Static compass rose */}
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="rgba(255,255,255,0.2)" strokeWidth={1} fill="transparent" />
          {cardinals.map(({ label, angle }) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x = CENTER + (RADIUS - 20) * Math.cos(rad);
            const y = CENTER + (RADIUS - 20) * Math.sin(rad);
            return (
              <SvgText key={label} x={x} y={y + 5} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={14} fontWeight="600">
                {label}
              </SvgText>
            );
          })}
        </Svg>

        {/* Rotating Kaaba pointer */}
        <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
          <Svg width={SIZE} height={SIZE}>
            {/* Kaaba arrow */}
            <Line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - RADIUS + 24}
              stroke="#34a853"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Polygon
              points={`${CENTER},${CENTER - RADIUS + 10} ${CENTER - 8},${CENTER - RADIUS + 26} ${CENTER + 8},${CENTER - RADIUS + 26}`}
              fill="#34a853"
            />
            {/* Kaaba icon text */}
            <SvgText x={CENTER} y={CENTER - RADIUS + 8} textAnchor="middle" fill="#34a853" fontSize={12}>
              🕋
            </SvgText>
          </Svg>
        </Animated.View>

        {/* Center dot */}
        <View style={styles.centerDot} />
      </View>

      <View style={styles.info}>
        <Text style={styles.bearingText}>
          {qibla.compassHeading < 0
            ? `${Math.round(qibla.bearingDeg)}° ${qibla.directionLabel} (static)`
            : `${Math.round(qibla.bearingDeg)}° ${qibla.directionLabel}`}
        </Text>
        <Text style={styles.distanceText}>{Math.round(qibla.distanceKm).toLocaleString()} km to Mecca</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  compassWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  info: {
    alignItems: 'center',
    gap: 4,
  },
  bearingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
});
