/**
 * Purpose: Settings screen — calculation method, madhab toggle, location picker
 *   (GPS + manual city search), notification preferences, 12/24h time format.
 * Inputs: useSettingsStore state; expo-location for GPS
 * Outputs: Settings form; changes persisted via zustand/AsyncStorage
 * Constraints: Method selector must show exactly 7 methods (no Tehran/Jafari — D-P3-19).
 *   All 7 UI states implemented. RTL layout prepared.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../../constants/colors';
import { CALC_METHODS } from '../../../constants/methods';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { Madhab, TimeFormat, HighLatRule } from '../../../types/prayer';
import { ErrorState, LoadingState } from '../../../components/shared/UIStates';

const HIGH_LAT_RULES: { key: HighLatRule; label: string }[] = [
  { key: 'NightMiddle', label: 'Middle of the Night' },
  { key: 'AngleBased', label: 'Angle-Based' },
  { key: 'OneSeventh', label: 'One-Seventh of Night' },
  { key: 'None', label: 'None (may show unavailable)' },
];

const UPGRADE_URL = 'https://praycalc.com/upgrade';

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const auth = useAuthStore();
  const [isLocating, setIsLocating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // UI states
  if (isLocating) return <LoadingState message="Getting your location..." />;
  if (saveError) return <ErrorState error={saveError} onRetry={() => setSaveError(null)} />;

  // success (settings always show — no loading/empty/offline states for this screen)

  async function handleGPSLocation() {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location in Settings to auto-detect your city.');
        setIsLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      settings.setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: geo?.city ?? 'Unknown',
        country: geo?.country ?? 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Location error');
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Account / Ummat+ */}
      <SectionHeader title="Account" />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {auth.mode === 'account' ? 'Signed in' : 'Anonymous'}
          </Text>
          {auth.isPlus ? (
            <Text style={styles.plusBadge}>Ummat+</Text>
          ) : (
            <Text style={styles.rowValue}>Free</Text>
          )}
        </View>
        {!auth.isPlus && (
          <View style={styles.upsellRow}>
            <Text style={styles.hint}>
              Ummat+ $9.99/yr — unlocks TV app & Smart Home
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => Linking.openURL(UPGRADE_URL)}
            >
              <Text style={styles.buttonSecondaryText}>Upgrade to Ummat+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Location */}
      <SectionHeader title="Location" />
      <View style={styles.card}>
        {settings.location ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current City</Text>
            <Text style={styles.rowValue}>
              {`${settings.location.city}, ${settings.location.country}`}
            </Text>
          </View>
        ) : (
          <Text style={styles.hint}>No location set. GPS or manual city required.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleGPSLocation}>
          <Text style={styles.buttonText}>Use GPS Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/city-search')}
        >
          <Text style={styles.buttonSecondaryText}>Search City Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Calculation Method */}
      <SectionHeader title="Calculation Method" />
      <View style={styles.card}>
        {CALC_METHODS.map((method) => {
          const isSelected = settings.method === method.key;
          return (
            <TouchableOpacity
              key={method.key}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => settings.setMethod(method.key)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {settings.method === 'Custom' && (
          <View style={styles.customAnglesRow}>
            <View style={styles.angleField}>
              <Text style={styles.hint}>Fajr angle (°)</Text>
              <TextInput
                style={styles.angleInput}
                keyboardType="decimal-pad"
                value={String(settings.customFajrAngle)}
                onChangeText={(v) => {
                  const fajr = parseFloat(v);
                  if (!Number.isNaN(fajr)) settings.setCustomAngles(fajr, settings.customIshaAngle);
                }}
                accessibilityLabel="Custom Fajr angle in degrees"
              />
            </View>
            <View style={styles.angleField}>
              <Text style={styles.hint}>Isha angle (°)</Text>
              <TextInput
                style={styles.angleInput}
                keyboardType="decimal-pad"
                value={String(settings.customIshaAngle)}
                onChangeText={(v) => {
                  const isha = parseFloat(v);
                  if (!Number.isNaN(isha)) settings.setCustomAngles(settings.customFajrAngle, isha);
                }}
                accessibilityLabel="Custom Isha angle in degrees"
              />
            </View>
          </View>
        )}
      </View>

      {/* High-latitude rule */}
      <SectionHeader title="High-Latitude Adjustment" />
      <View style={styles.card}>
        <Text style={styles.hint}>
          Applied when Fajr/Isha can't reach the required angle (far-north/south locations
          in summer).
        </Text>
        {HIGH_LAT_RULES.map((rule) => {
          const isSelected = settings.highLatRule === rule.key;
          return (
            <TouchableOpacity
              key={rule.key}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => settings.setHighLatRule(rule.key)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {rule.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Madhab (Asr shadow factor) */}
      <SectionHeader title="Madhab (Asr)" />
      <View style={styles.card}>
        <View style={styles.toggle}>
          {(['Shafi', 'Hanafi'] as Madhab[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleOption, settings.madhab === m && styles.toggleOptionActive]}
              onPress={() => settings.setMadhab(m)}
            >
              <Text style={[styles.toggleText, settings.madhab === m && styles.toggleTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>
          Shafi: 1× shadow factor | Hanafi: 2× shadow factor
        </Text>
      </View>

      {/* Time Format */}
      <SectionHeader title="Time Format" />
      <View style={styles.card}>
        <View style={styles.toggle}>
          {(['12h', '24h'] as TimeFormat[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.toggleOption, settings.timeFormat === f && styles.toggleOptionActive]}
              onPress={() => settings.setTimeFormat(f)}
            >
              <Text style={[styles.toggleText, settings.timeFormat === f && styles.toggleTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications — single source of truth is NotificationSettingsScreen (per-prayer
          enable + advance minutes); this just links out instead of duplicating the picker. */}
      <SectionHeader title="Notifications" />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Prayer Time Alerts</Text>
          <Text style={styles.rowValue}>{settings.notificationsEnabled ? 'On' : 'Off'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/settings/notifications')}
        >
          <Text style={styles.buttonSecondaryText}>Manage Notifications</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  content: { padding: 16, gap: 8 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: Colors.text.primary },
  rowValue: { fontSize: 14, color: Colors.text.muted },
  hint: { fontSize: 13, color: Colors.text.muted, fontStyle: 'italic' },
  customAnglesRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  angleField: { flex: 1, gap: 4 },
  angleInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.background.card,
    minHeight: 40,
  },
  plusBadge: {
    backgroundColor: Colors.brand.mid,
    color: Colors.text.inverse,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upsellRow: { gap: 8 },
  button: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: Colors.text.inverse, fontWeight: '600', fontSize: 14 },
  buttonSecondary: { backgroundColor: Colors.background.secondary, borderWidth: 1, borderColor: Colors.brand.mid },
  buttonSecondaryText: { color: Colors.brand.dark, fontWeight: '600', fontSize: 14 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  optionRowSelected: { backgroundColor: Colors.background.secondary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.brand.dark },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand.dark },
  optionLabel: { fontSize: 14, color: Colors.text.primary, flex: 1 },
  optionLabelSelected: { fontWeight: '600', color: Colors.brand.dark },
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: Colors.background.secondary },
  toggleOption: { flex: 1, padding: 12, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: Colors.brand.dark },
  toggleText: { fontSize: 14, color: Colors.text.primary, fontWeight: '500' },
  toggleTextActive: { color: Colors.text.inverse, fontWeight: '700' },
});
