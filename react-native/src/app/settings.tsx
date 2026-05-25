/**
 * Purpose: Settings screen — calc method, asr method, time format, dark mode, locale.
 * Inputs: usePrayerTimes() for settings + updateSettings
 * Outputs: Scrollable list of setting rows with pickers / toggles
 * Constraints: All changes persist immediately via usePrayerTimes.updateSettings().
 *   Locale list matches Flutter app's 23 supported locales.
 * SPORT: app/settings.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { MethodPicker } from '../components/MethodPicker';
import type { CalcMethodId } from '../types';

const LOCALES: Array<{ code: string; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ur', label: 'اردو' },
  { code: 'fa', label: 'فارسی' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk' },
  { code: 'da', label: 'Dansk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'so', label: 'Soomaali' },
];

export default function SettingsScreen() {
  const { location } = useLocation();
  const { settings, updateSettings } = usePrayerTimes(location);
  const [localeOpen, setLocaleOpen] = useState(false);

  const currentLocale = LOCALES.find((l) => l.code === (settings.locale ?? 'en')) ?? LOCALES[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Calculation method */}
        <View style={styles.section}>
          <MethodPicker
            value={settings.calcMethod as CalcMethodId}
            onSelect={(method) => updateSettings({ calcMethod: method })}
          />
        </View>

        {/* Asr method */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Asr Method</Text>
              <Text style={styles.rowSub}>
                {settings.asrMethod === 'hanafi' ? 'Hanafi school' : 'Shafi\'i / standard'}
              </Text>
            </View>
            <View style={styles.asrToggle}>
              <TouchableOpacity
                style={[styles.asrChip, settings.asrMethod === 'shafii' && styles.asrChipActive]}
                onPress={() => updateSettings({ asrMethod: 'shafii' })}
              >
                <Text style={[styles.asrChipLabel, settings.asrMethod === 'shafii' && styles.asrChipLabelActive]}>
                  Shafi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.asrChip, settings.asrMethod === 'hanafi' && styles.asrChipActive]}
                onPress={() => updateSettings({ asrMethod: 'hanafi' })}
              >
                <Text style={[styles.asrChipLabel, settings.asrMethod === 'hanafi' && styles.asrChipLabelActive]}>
                  Hanafi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Display preferences */}
        <View style={styles.section}>
          <View style={[styles.row, styles.borderBottom]}>
            <Text style={styles.rowLabel}>24-Hour Format</Text>
            <Switch
              value={settings.use24h ?? false}
              onValueChange={(v) => updateSettings({ use24h: v })}
              trackColor={{ true: '#34a853' }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <Switch
              value={settings.darkMode ?? true}
              onValueChange={(v) => updateSettings({ darkMode: v })}
              trackColor={{ true: '#34a853' }}
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setLocaleOpen(true)}>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Language</Text>
              <Text style={styles.rowSub}>{currentLocale.label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PrayCalc</Text>
            <Text style={styles.infoValue}>v1.0.0</Text>
          </View>
          <View style={[styles.infoRow, styles.borderBottom]}>
            <Text style={styles.infoLabel}>Calculation core</Text>
            <Text style={styles.infoValue}>pray-calc 2.x</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kaaba coordinates</Text>
            <Text style={styles.infoValue}>21.4225°N, 39.8262°E</Text>
          </View>
        </View>
      </ScrollView>

      {/* Locale picker modal */}
      <Modal visible={localeOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLocaleOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Language</Text>
            <TouchableOpacity onPress={() => setLocaleOpen(false)}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {LOCALES.map((locale) => (
              <TouchableOpacity
                key={locale.code}
                style={[styles.localeRow, locale.code === currentLocale.code && styles.localeRowActive]}
                onPress={() => {
                  updateSettings({ locale: locale.code });
                  setLocaleOpen(false);
                }}
              >
                <Text style={[styles.localeLabel, locale.code === currentLocale.code && styles.localeLabelActive]}>
                  {locale.label}
                </Text>
                {locale.code === currentLocale.code && (
                  <Text style={styles.localeCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d2015' },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 22, color: '#fff', fontWeight: '600', marginBottom: 4 },
  section: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 16, color: '#fff', fontWeight: '500' },
  rowSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  chevron: { fontSize: 22, color: 'rgba(255,255,255,0.4)', transform: [{ rotate: '90deg' }] },
  asrToggle: { flexDirection: 'row', gap: 8 },
  asrChip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  asrChipActive: {
    backgroundColor: 'rgba(52,168,83,0.25)',
    borderColor: '#34a853',
  },
  asrChipLabel: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  asrChipLabelActive: { color: '#34a853', fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  infoLabel: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  infoValue: { fontSize: 13, color: 'rgba(255,255,255,0.35)' },
  modal: { flex: 1, backgroundColor: '#0f2418' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  done: { fontSize: 16, color: '#34a853', fontWeight: '600' },
  localeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  localeRowActive: { backgroundColor: 'rgba(52,168,83,0.12)' },
  localeLabel: { fontSize: 16, color: 'rgba(255,255,255,0.85)' },
  localeLabelActive: { color: '#34a853', fontWeight: '700' },
  localeCheck: { fontSize: 18, color: '#34a853', fontWeight: '700' },
});
