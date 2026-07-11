/**
 * Purpose: Full-bleed stream/content layout — DisplayPane fills the entire screen with a
 *   translucent TimesStrip pinned along the bottom instead of a dedicated rail pane.
 *   Maximizes video real estate for rooms where the stream is the primary draw.
 * Inputs: DashboardLayoutProps.
 * Outputs: full-screen DisplayPane + bottom TimesStrip overlay.
 * Constraints: 16:9 1080p; TimesStrip is absolutely positioned over DisplayPane so the
 *   video keeps its full aspect ratio underneath it.
 * SPORT: praycalc/tv components/layouts
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import DisplayPane from '../dashboard/DisplayPane';
import TimesStrip from '../dashboard/TimesStrip';
import { useTheme } from '../../hooks/useTheme';
import { DashboardLayoutProps } from '../../lib/layouts/types';

export default function StreamFullLayout({
  settings,
  prayerTimes,
  nextPrayer,
}: DashboardLayoutProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <DisplayPane streamSource={settings.streamSource} rotateMinutes={settings.rotateMinutes} />
      <View style={styles.stripOverlay}>
        <TimesStrip
          prayerTimes={prayerTimes}
          nextPrayer={nextPrayer}
          accentColor={settings.accentColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stripOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
