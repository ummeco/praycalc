/**
 * Purpose: Screen 6 — Adhan Settings: select calculation method, per-prayer volume control
 * Inputs: Current settings from settingsStore; method list
 * Outputs: D-pad navigable method selector + volume sliders; settings persisted to store
 * Constraints: All interactive elements focusable; hasTVPreferredFocus on first method option
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PrayerName } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import TvScreenWrapper from '../components/TvScreenWrapper';

type AdhanNavProp = StackNavigationProp<RootStackParamList, 'AdhanSettings'>;

const CALCULATION_METHODS = [
  { id: 'mwl',    name: 'Muslim World League',    nameAr: 'رابطة العالم الإسلامي' },
  { id: 'isna',   name: 'ISNA (North America)',   nameAr: 'ISNA' },
  { id: 'egypt',  name: 'Egyptian Authority',      nameAr: 'الهيئة المصرية' },
  { id: 'makkah', name: 'Umm al-Qura (Makkah)',   nameAr: 'أم القرى' },
  { id: 'karachi', name: 'University of Karachi', nameAr: 'جامعة كراتشي' },
  { id: 'tehran', name: 'Tehran',                  nameAr: 'طهران' },
];

const PRAYER_NAMES: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

export default function AdhanSettingsScreen(): React.JSX.Element {
  const navigation = useNavigation<AdhanNavProp>();
  const { settings, updateSettings } = useSettingsStore();
  const firstMethodRef = useRef<TouchableHighlight>(null);

  const setVolume = (name: PrayerName, delta: number): void => {
    const current = settings.prayerVolumes[name] ?? settings.adhanVolume;
    const next = Math.max(0, Math.min(1, current + delta));
    updateSettings({ prayerVolumes: { ...settings.prayerVolumes, [name]: next } });
  };

  return (
    <TvScreenWrapper title="Adhan Settings" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        {/* Calculation Method */}
        <Text style={styles.sectionTitle}>Calculation Method</Text>
        <TVFocusGuideView style={styles.methodGrid} destinations={[firstMethodRef]}>
          {CALCULATION_METHODS.map((method, i) => (
            <TouchableHighlight
              key={method.id}
              ref={i === 0 ? firstMethodRef : null}
              hasTVPreferredFocus={i === 0}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Select ${method.name} calculation method`}
              accessibilityState={{ selected: settings.calculationMethodId === method.id }}
              onPress={() => updateSettings({ calculationMethodId: method.id })}
              underlayColor="#1E5E2F"
              style={[
                styles.methodBtn,
                settings.calculationMethodId === method.id && styles.methodBtnSelected,
              ]}
            >
              <View style={styles.methodBtnInner}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodNameAr}>{method.nameAr}</Text>
              </View>
            </TouchableHighlight>
          ))}
        </TVFocusGuideView>

        {/* Per-prayer volume */}
        <Text style={styles.sectionTitle}>Prayer Volume</Text>
        <View style={styles.volumeGrid}>
          {PRAYER_NAMES.map((name) => {
            const vol = settings.prayerVolumes[name] ?? settings.adhanVolume;
            return (
              <View key={name} style={styles.volumeRow}>
                <Text style={styles.volumeLabel}>{PRAYER_LABELS[name]}</Text>
                <View style={styles.volumeControls}>
                  <TouchableHighlight
                    accessible={true}
                    accessibilityRole="button"
                    onPress={() => setVolume(name, -0.1)}
                    underlayColor="#1E5E2F"
                    style={styles.volBtn}
                  >
                    <Text style={styles.volBtnText}>−</Text>
                  </TouchableHighlight>
                  <View style={styles.volumeBar}>
                    <View style={[styles.volumeFill, { width: `${vol * 100}%` }]} />
                  </View>
                  <Text style={styles.volumeValue}>{Math.round(vol * 100)}%</Text>
                  <TouchableHighlight
                    accessible={true}
                    accessibilityRole="button"
                    onPress={() => setVolume(name, 0.1)}
                    underlayColor="#1E5E2F"
                    style={styles.volBtn}
                  >
                    <Text style={styles.volBtnText}>+</Text>
                  </TouchableHighlight>
                </View>
              </View>
            );
          })}
        </View>

        {/* Madhab */}
        <Text style={styles.sectionTitle}>Madhab (Asr)</Text>
        <View style={styles.madhabRow}>
          {(['shafi', 'hanafi'] as const).map((m) => (
            <TouchableHighlight
              key={m}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.madhab === m }}
              onPress={() => updateSettings({ madhab: m })}
              underlayColor="#1E5E2F"
              style={[styles.madhabBtn, settings.madhab === m && styles.madhabBtnSelected]}
            >
              <Text style={styles.madhabBtnText}>
                {m === 'shafi' ? 'Shafi\'i / Maliki / Hanbali' : 'Hanafi'}
              </Text>
            </TouchableHighlight>
          ))}
        </View>
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 40 },
  sectionTitle: { color: '#C9F27A', fontSize: 32, fontWeight: '700', marginBottom: 16, marginTop: 24 },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  methodBtn: {
    paddingHorizontal: 28, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#1E5E2F', borderWidth: 2, borderColor: 'transparent', minHeight: 88,
  },
  methodBtnSelected: { borderColor: '#C9F27A' },
  methodBtnInner: { alignItems: 'center' },
  methodName: { color: '#FFFFFF', fontSize: 22, fontWeight: '600' },
  methodNameAr: { color: '#79C24C', fontSize: 18, writingDirection: 'rtl' },
  volumeGrid: { gap: 12, marginBottom: 24 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', height: 60 },
  volumeLabel: { color: '#FFFFFF', fontSize: 24, width: 120 },
  volumeControls: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 },
  volBtn: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E5E2F',
    alignItems: 'center', justifyContent: 'center',
  },
  volBtnText: { color: '#C9F27A', fontSize: 28, fontWeight: '700' },
  volumeBar: {
    flex: 1, height: 12, backgroundColor: '#1E5E2F', borderRadius: 6, overflow: 'hidden',
  },
  volumeFill: { height: '100%', backgroundColor: '#79C24C', borderRadius: 6 },
  volumeValue: { color: '#79C24C', fontSize: 22, width: 60, textAlign: 'right' },
  madhabRow: { flexDirection: 'row', gap: 24 },
  madhabBtn: {
    flex: 1, paddingVertical: 24, borderRadius: 12, backgroundColor: '#1E5E2F',
    alignItems: 'center', borderWidth: 2, borderColor: 'transparent', minHeight: 88,
  },
  madhabBtnSelected: { borderColor: '#C9F27A' },
  madhabBtnText: { color: '#FFFFFF', fontSize: 24, fontWeight: '600' },
});
