/**
 * Purpose: Canonical (default) dashboard layout — LEFT pane (~2/3): live stream/content
 *   rotation + bottom weather/special-day/Ramadan strip. RIGHT pane (~1/3): prayer rail.
 *   Extracted unchanged from the original DashboardScreen pane arrangement (T4-2).
 * Inputs: DashboardLayoutProps (settings, prayerTimes, nextPrayer — prayerDay unused here).
 * Outputs: the two-pane dashboard view.
 * Constraints: 16:9 1080p; zero visual change from the pre-T4-2 DashboardScreen — colors
 *   are theme-token driven (useTheme), and 'ummat-green' is byte-identical to the old
 *   hardcoded hex, so the default render is unchanged.
 * SPORT: praycalc/tv components/layouts
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import DisplayPane from '../dashboard/DisplayPane';
import PrayerRail from '../dashboard/PrayerRail';
import BottomBar from '../dashboard/BottomBar';
import { useTheme } from '../../hooks/useTheme';
import { DashboardLayoutProps } from '../../lib/layouts/types';

export default function ClassicLayout({
  settings,
  prayerTimes,
  nextPrayer,
}: DashboardLayoutProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* LEFT pane (~2/3): display + bottom strip. */}
      <View style={styles.leftPane}>
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

      {/* RIGHT pane (~1/3): prayer rail. */}
      <View style={styles.rightPane}>
        <PrayerRail
          cityName={settings.cityName}
          prayerTimes={prayerTimes}
          nextPrayer={nextPrayer}
          accentColor={settings.accentColor}
          iqamaEnabled={settings.iqamaEnabled}
          iqamaOffsets={settings.iqamaOffsets}
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
    flex: 2, // ~2/3
    flexDirection: 'column',
  },
  displayArea: {
    flex: 1,
  },
  rightPane: {
    flex: 1, // ~1/3
  },
});
