/**
 * Purpose: Focusable "Menu" affordance + overlay list that reaches every existing TV
 *   screen from the new dashboard. Keeps the full legacy navigation intact.
 * Inputs: navigation (RootStack).
 * Outputs: a focus-ringed Menu button; pressing it opens an overlay of screen links.
 * Constraints: D-pad focus — the button has a visible focus ring; the first overlay row
 *   takes hasTVPreferredFocus so the remote lands there when the menu opens. min 28pt.
 * SPORT: praycalc/tv components/dashboard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Modal,
  ScrollView,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type Nav = StackNavigationProp<RootStackParamList>;

/** All legacy screens reachable from the dashboard menu (navigation kept intact). */
const MENU_ITEMS: Array<{ label: string; screen: keyof RootStackParamList }> = [
  { label: 'Prayer Times (Home)', screen: 'Home' },
  { label: 'Qibla', screen: 'Qibla' },
  { label: 'Calendar', screen: 'Calendar' },
  { label: 'Hadith of the Day', screen: 'HadithOfDay' },
  { label: 'Dua & Dhikr', screen: 'DuaDisplay' },
  { label: 'Islamic Events', screen: 'IslamicEvents' },
  { label: 'Ramadan', screen: 'Ramadan' },
  { label: 'Moon Phase', screen: 'MoonPhase' },
  { label: 'Adhan Settings', screen: 'AdhanSettings' },
  { label: 'Notification Schedule', screen: 'NotificationSchedule' },
  { label: 'City Search', screen: 'CitySearch' },
  { label: 'Pair with Phone', screen: 'Pairing' },
  { label: 'Settings', screen: 'Settings' },
  { label: 'TV System', screen: 'TvSystem' },
  { label: 'Screensaver', screen: 'Screensaver' },
  { label: 'About', screen: 'About' },
];

interface DashboardMenuProps {
  navigation: Nav;
  /** hasTVPreferredFocus on the Menu button (initial dashboard focus target). */
  hasTVPreferredFocus?: boolean;
}

export default function DashboardMenu({
  navigation,
  hasTVPreferredFocus = true,
}: DashboardMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const go = (screen: keyof RootStackParamList): void => {
    setOpen(false);
    // DuaDisplay is the only param screen; it accepts an optional duaId.
    if (screen === 'DuaDisplay') {
      navigation.navigate('DuaDisplay', {});
    } else {
      navigation.navigate(screen as never);
    }
  };

  return (
    <>
      <TouchableHighlight
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPress={() => setOpen(true)}
        underlayColor="#1E5E2F"
        style={[styles.menuButton, focused && styles.menuButtonFocused]}
      >
        <Text style={styles.menuButtonText}>☰  Menu</Text>
      </TouchableHighlight>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Menu</Text>
            <ScrollView contentContainerStyle={styles.panelList}>
              {MENU_ITEMS.map((item, i) => (
                <TouchableHighlight
                  key={item.screen}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  hasTVPreferredFocus={i === 0}
                  onPress={() => go(item.screen)}
                  underlayColor="#2a7a3d"
                  style={styles.menuRow}
                >
                  <Text style={styles.menuRowText}>{item.label}</Text>
                </TouchableHighlight>
              ))}
            </ScrollView>
            <TouchableHighlight
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={() => setOpen(false)}
              underlayColor="#1E5E2F"
              style={styles.closeRow}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 64,
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 94, 47, 0.85)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  menuButtonFocused: {
    borderColor: '#C9F27A',
    backgroundColor: '#1E5E2F',
  },
  menuButtonText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 47, 23, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: 640,
    maxHeight: '85%',
    backgroundColor: '#0D2F17',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1E5E2F',
    padding: 32,
  },
  panelTitle: {
    color: '#C9F27A',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  panelList: {
    gap: 8,
  },
  menuRow: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#1E5E2F',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  menuRowText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  closeRow: {
    marginTop: 16,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#123d1f',
    borderRadius: 12,
  },
  closeText: {
    color: '#79C24C',
    fontSize: 28,
    fontWeight: '700',
  },
});
