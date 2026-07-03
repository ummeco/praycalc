/**
 * Purpose: Screen 10 — Settings: method, madhab, location, display options
 * Inputs: Current settings from settingsStore; navigation to sub-screens
 * Outputs: D-pad navigable settings menu; updates persisted to settingsStore
 * Constraints: All rows focusable (min 88pt height); hasTVPreferredFocus on first row
 * SPORT: praycalc/tv screens
 */

import React from 'react';
import { useFocusDestination } from '../hooks/useFocusDestination';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import TvScreenWrapper from '../components/TvScreenWrapper';

type SettingsNavProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsRow {
  label: string;
  value: string;
  onSelect: () => void;
}

export default function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation<SettingsNavProp>();
  const { settings, updateSettings } = useSettingsStore();
  const [firstNode, firstRef] = useFocusDestination<TouchableHighlight>();

  const rows: SettingsRow[] = [
    {
      label: 'Location / City',
      value: `${settings.cityName}, ${settings.timezone}`,
      onSelect: () => navigation.navigate('CitySearch'),
    },
    {
      label: 'Calculation Method',
      value: settings.calculationMethodId.toUpperCase(),
      onSelect: () => navigation.navigate('AdhanSettings'),
    },
    {
      label: 'Madhab (Asr time)',
      value: settings.madhab === 'hanafi' ? 'Hanafi' : "Shafi'i / Maliki / Hanbali",
      onSelect: () =>
        updateSettings({ madhab: settings.madhab === 'hanafi' ? 'shafi' : 'hanafi' }),
    },
    {
      label: 'Language',
      value: settings.language === 'ar' ? 'العربية' : 'English',
      onSelect: () =>
        updateSettings({ language: settings.language === 'ar' ? 'en' : 'ar' }),
    },
    {
      label: 'Screensaver Timeout',
      value: `${settings.screensaverTimeoutMinutes} minutes`,
      onSelect: () => {
        const options = [1, 5, 10, 15, 30];
        const idx = options.indexOf(settings.screensaverTimeoutMinutes);
        const next = options[(idx + 1) % options.length];
        updateSettings({ screensaverTimeoutMinutes: next });
      },
    },
    {
      label: 'Adhan Volume',
      value: `${Math.round(settings.adhanVolume * 100)}%`,
      onSelect: () => navigation.navigate('AdhanSettings'),
    },
    {
      label: 'Pair with Phone',
      value: '→',
      onSelect: () => navigation.navigate('Pairing'),
    },
    {
      label: 'About',
      value: '→',
      onSelect: () => navigation.navigate('About'),
    },
  ];

  return (
    <TvScreenWrapper title="Settings" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        <TVFocusGuideView style={styles.list} destinations={firstNode ? [firstNode] : []}>
          {rows.map((row, i) => (
            <TouchableHighlight
              key={row.label}
              ref={i === 0 ? firstRef : null}
              hasTVPreferredFocus={i === 0}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${row.label}: ${row.value}`}
              onPress={row.onSelect}
              underlayColor="#1E5E2F"
              style={styles.row}
            >
              <View style={styles.rowInner}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            </TouchableHighlight>
          ))}
        </TVFocusGuideView>
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 60 },
  list: { flex: 1 },
  row: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 88,
    marginBottom: 8,
  },
  rowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: '#1E5E2F',
    borderRadius: 10,
  },
  rowLabel: { color: '#FFFFFF', fontSize: 28, fontWeight: '600' },
  rowValue: { color: '#79C24C', fontSize: 26 },
});
