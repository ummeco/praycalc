/**
 * Purpose: "TV System" screen — Android-TV system integrations for masjid / institution
 *   displays: (1) Launch on startup, (2) Kiosk mode (default launcher), (3) Ambient
 *   screensaver. Each is a focusable card in the existing TV green style (min 28pt).
 * Inputs: navigation (RootStack); the TvSystemModule via lib/native/tvSystem (graceful no-op
 *   when the native module is absent — the toggles then read as OFF and the switches disable).
 * Outputs: toggles boot-launch / kiosk; deep-links to system screensaver settings.
 * Constraints: D-pad focusable rows; kiosk toggle confirms first, carrying the Home-button
 *   caveat. Copy states the honest OS limitations plainly.
 * SPORT: praycalc/tv screens
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableHighlight,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';
import {
  isTvSystemAvailable,
  isBootLaunchEnabled,
  setBootLaunchEnabled,
  isKioskEnabled,
  setKioskEnabled,
  openScreensaverSettings,
} from '../lib/native/tvSystem';

type TvSystemNavProp = StackNavigationProp<RootStackParamList, 'TvSystem'>;

export default function TvSystemScreen(): React.JSX.Element {
  const navigation = useNavigation<TvSystemNavProp>();
  const available = isTvSystemAvailable();
  const [boot, setBoot] = useState(false);
  const [kiosk, setKiosk] = useState(false);

  // Load current native state on mount (both read `false` when the module is absent).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [b, k] = await Promise.all([
        isBootLaunchEnabled(),
        isKioskEnabled(),
      ]);
      if (!cancelled) {
        setBoot(b);
        setKiosk(k);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onToggleBoot = (next: boolean): void => {
    setBoot(next);
    setBootLaunchEnabled(next);
  };

  const onToggleKiosk = (next: boolean): void => {
    if (next) {
      Alert.alert(
        'Enable kiosk mode?',
        'In kiosk mode the Home button returns to PrayCalc. Intended for masjid / ' +
          'institution displays. You will be taken to the system Home-app chooser to ' +
          'select PrayCalc as the default launcher.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setKiosk(true);
              setKioskEnabled(true);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable kiosk mode?',
        'PrayCalc will stop acting as the Home app. You will be taken to the system ' +
          'Home-app chooser to pick your normal TV launcher.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            onPress: () => {
              setKiosk(false);
              setKioskEnabled(false);
            },
          },
        ]
      );
    }
  };

  const switchColors = {
    trackColor: { false: '#123d1f', true: '#79C24C' },
    thumbColor: '#C9F27A',
  };

  return (
    <TvScreenWrapper title="TV System" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.root}>
        {!available && (
          <Text style={styles.unavailable}>
            System integration is available only on the Android TV / Fire TV build.
          </Text>
        )}

        {/* Card 1 — Launch on startup */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Launch on startup</Text>
            <Switch
              accessibilityLabel="Launch on startup"
              value={boot}
              disabled={!available}
              onValueChange={onToggleBoot}
              {...switchColors}
            />
          </View>
          <Text style={styles.cardBody}>
            Opens PrayCalc automatically when the TV powers on, so the display is ready
            instantly. Pressing Home still returns to the normal Android TV home. Off by
            default. Background start-up at boot is restricted on some Android versions; on
            Android TV / Fire TV this works on most TVs.
          </Text>
        </View>

        {/* Card 2 — Kiosk mode */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kiosk mode (default launcher)</Text>
            <Switch
              accessibilityLabel="Kiosk mode"
              value={kiosk}
              disabled={!available}
              onValueChange={onToggleKiosk}
              {...switchColors}
            />
          </View>
          <Text style={styles.cardBody}>
            In kiosk mode the Home button returns to PrayCalc. Intended for masjid /
            institution displays. Off by default — enabling it opens the system Home-app
            chooser so you can confirm PrayCalc as the launcher.
          </Text>
        </View>

        {/* Card 3 — Screensaver */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ambient screensaver</Text>
          </View>
          <Text style={styles.cardBody}>
            &quot;PrayCalc Ambient&quot; shows a clock, the next prayer countdown, and
            rotating remembrance while the TV is idle. Apps cannot set the screensaver
            themselves — open the system screensaver settings and choose
            &quot;PrayCalc Ambient&quot;.
          </Text>
          <TouchableHighlight
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open screensaver settings"
            disabled={!available}
            onPress={openScreensaverSettings}
            underlayColor="#2a7a3d"
            style={[styles.button, !available && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Open screensaver settings</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 60,
    gap: 24,
  },
  unavailable: {
    color: '#C9F27A',
    fontSize: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1E5E2F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123d1f',
    padding: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  cardBody: {
    color: '#C9F27A',
    fontSize: 28,
    lineHeight: 40,
  },
  button: {
    marginTop: 24,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    backgroundColor: '#0D2F17',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#79C24C',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '700',
  },
});
