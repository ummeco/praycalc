/**
 * Purpose: Mirror of ClassicLayout — prayer rail on the LEFT (~1/3), stream/content pane
 *   on the RIGHT (~2/3). Same components and data, opposite reading order (for rooms
 *   where the screen sits to the congregation's left).
 * Inputs: DashboardLayoutProps.
 * Outputs: the flipped two-pane dashboard view.
 * Constraints: 16:9 1080p; theme-token driven colors (useTheme). PrayerRail keeps its own
 *   left border — on this layout that border visually sits between rail and stream, same
 *   as ClassicLayout's divider, just mirrored.
 * SPORT: praycalc/tv components/layouts
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import DisplayPane from '../dashboard/DisplayPane';
import PrayerRail from '../dashboard/PrayerRail';
import BottomBar from '../dashboard/BottomBar';
import { useTheme } from '../../hooks/useTheme';
import { DashboardLayoutProps } from '../../lib/layouts/types';

export default function FlippedLayout({
  settings,
  prayerTimes,
  nextPrayer,
}: DashboardLayoutProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* LEFT pane (~1/3): prayer rail. */}
      <View style={styles.leftPane}>
        <PrayerRail
          cityName={settings.cityName}
          prayerTimes={prayerTimes}
          nextPrayer={nextPrayer}
          accentColor={settings.accentColor}
          iqamaEnabled={settings.iqamaEnabled}
          iqamaOffsets={settings.iqamaOffsets}
        />
      </View>

      {/* RIGHT pane (~2/3): display + bottom strip. */}
      <View style={styles.rightPane}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    flex: 1, // ~1/3
  },
  rightPane: {
    flex: 2, // ~2/3
    flexDirection: 'column',
  },
  displayArea: {
    flex: 1,
  },
});
