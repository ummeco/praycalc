/**
 * Purpose: Settings screen — calculation method, madhab toggle, location picker
 *   (GPS + manual city search), notification preferences, 12/24h time format.
 * Inputs: useSettingsStore state; expo-location for GPS
 * Outputs: Settings form; changes persisted via zustand/AsyncStorage
 * Constraints: Method selector must show exactly 7 methods (no Tehran/Jafari — D-P3-19).
 *   All 7 UI states implemented. RTL layout prepared.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-screen
 */

import React, { useMemo, useState } from 'react';
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
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { CALC_METHODS } from '../../../constants/methods';
import { useSettingsStore } from '../store/useSettingsStore';
import type { ThemeMode } from '../store/useSettingsStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { Madhab, TimeFormat, HighLatRule, PrayerName } from '../../../types/prayer';
import { ErrorState, LoadingState } from '../../../components/shared/UIStates';
import i18next, {
  SUPPORTED_LOCALES, LOCALE_NAMES, RTL_LOCALES, persistLocale, useTranslation, type SupportedLocale,
} from '../../../i18n';
import { schedulePrayerNotifications } from '../../../lib/notifications/PrayerNotificationService';

/** Prayers exposed for manual minute corrections (Sunrise included — timetable alignment). */
const ADJUSTABLE_PRAYERS: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Translation key per prayer name, `prayer` namespace (render-time only). */
const PRAYER_LABEL_KEYS: Record<PrayerName, string> = {
  Fajr: 'prayer.fajr',
  Sunrise: 'prayer.sunrise',
  Dhuhr: 'prayer.dhuhr',
  Asr: 'prayer.asr',
  Maghrib: 'prayer.maghrib',
  Isha: 'prayer.isha',
};

const HIGH_LAT_RULES: { key: HighLatRule; label: string }[] = [
  { key: 'NightMiddle', label: 'Middle of the Night' },
  { key: 'AngleBased', label: 'Angle-Based' },
  { key: 'OneSeventh', label: 'One-Seventh of Night' },
  { key: 'None', label: 'None (may show unavailable)' },
];

const UPGRADE_URL = 'https://praycalc.com/upgrade';

/** Appearance section options — System follows the OS, Light/Dark force a palette. */
const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const settings = useSettingsStore();
  const auth = useAuthStore();
  const [isLocating, setIsLocating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  /** Reschedule notifications after a change that shifts computed times. */
  function rescheduleIfEnabled() {
    if (useSettingsStore.getState().notificationsEnabled) {
      void schedulePrayerNotifications().catch(() => undefined);
    }
  }

  function handleSelectLocale(locale: SupportedLocale) {
    const rtlChanged = RTL_LOCALES.has(locale) !== RTL_LOCALES.has(settings.locale as SupportedLocale);
    persistLocale(locale);
    settings.setLocale(locale);
    void i18next.changeLanguage(locale);
    setShowLanguages(false);
    if (rtlChanged) {
      Alert.alert(
        t('settings.language.restart_required'),
        t('settings.language.restart_prompt'),
      );
    }
  }

  function adjustPrayerMinutes(prayer: PrayerName, delta: number) {
    settings.setPrayerMinuteAdjustment(prayer, (settings.prayerMinuteAdjustments[prayer] ?? 0) + delta);
    rescheduleIfEnabled();
  }

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
      <SectionHeader title="Account" styles={styles} />
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
      <SectionHeader title={t('settings.location.title')} styles={styles} />
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
      <SectionHeader title={t('settings.calculation.title')} styles={styles} />
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
      <SectionHeader title="High-Latitude Adjustment" styles={styles} />
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
      <SectionHeader title="Madhab (Asr)" styles={styles} />
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

      {/* Prayer time fine-tuning — match a local mosque timetable */}
      <SectionHeader title="Prayer Time Adjustments" styles={styles} />
      <View style={styles.card}>
        <Text style={styles.hint}>
          Fine-tune each time by ±30 minutes to match your local mosque timetable.
        </Text>
        {ADJUSTABLE_PRAYERS.map((prayer) => {
          const value = settings.prayerMinuteAdjustments[prayer] ?? 0;
          return (
            <View key={prayer} style={styles.row}>
              <Text style={styles.rowLabel}>{t(PRAYER_LABEL_KEYS[prayer])}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => adjustPrayerMinutes(prayer, -1)}
                  accessibilityLabel={`Decrease ${prayer} adjustment`}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>
                  {value > 0 ? `+${value}` : value} min
                </Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => adjustPrayerMinutes(prayer, 1)}
                  accessibilityLabel={`Increase ${prayer} adjustment`}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Hijri date adjustment — local moon-sighting offset */}
      <SectionHeader title="Hijri Date Adjustment" styles={styles} />
      <View style={styles.card}>
        <Text style={styles.hint}>
          Shift the Hijri date by ±2 days if your local moon sighting differs from the
          Umm al-Qura calendar.
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Offset</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => settings.setHijriDayAdjustment(settings.hijriDayAdjustment - 1)}
              accessibilityLabel="Decrease Hijri offset"
            >
              <Text style={styles.stepperButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>
              {settings.hijriDayAdjustment > 0 ? `+${settings.hijriDayAdjustment}` : settings.hijriDayAdjustment} d
            </Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => settings.setHijriDayAdjustment(settings.hijriDayAdjustment + 1)}
              accessibilityLabel="Increase Hijri offset"
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Language */}
      <SectionHeader title={t('settings.language.title')} styles={styles} />
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setShowLanguages((v) => !v)}>
          <Text style={styles.rowLabel}>App Language</Text>
          <Text style={styles.rowValue}>
            {LOCALE_NAMES[settings.locale as SupportedLocale] ?? 'English'} {showLanguages ? '▴' : '▾'}
          </Text>
        </TouchableOpacity>
        {showLanguages && SUPPORTED_LOCALES.map((locale) => {
          const isSelected = settings.locale === locale;
          return (
            <TouchableOpacity
              key={locale}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => handleSelectLocale(locale)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {LOCALE_NAMES[locale]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time Format */}
      <SectionHeader title="Time Format" styles={styles} />
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

      {/* Appearance — theme mode: System follows the OS, Light/Dark force a palette */}
      <SectionHeader title="Appearance" styles={styles} />
      <View style={styles.card}>
        <View style={styles.toggle}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.toggleOption, settings.themeMode === opt.key && styles.toggleOptionActive]}
              onPress={() => settings.setThemeMode(opt.key)}
              accessibilityRole="button"
              accessibilityLabel={`${opt.label} theme`}
              accessibilityState={{ selected: settings.themeMode === opt.key }}
            >
              <Text style={[styles.toggleText, settings.themeMode === opt.key && styles.toggleTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications — single source of truth is NotificationSettingsScreen (per-prayer
          enable + advance minutes); this just links out instead of duplicating the picker. */}
      <SectionHeader title={t('settings.notifications.title')} styles={styles} />
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

function SectionHeader({ title, styles }: { title: string; styles: ReturnType<typeof createStyles> }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: 16, gap: 8 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.text.primary },
  rowValue: { fontSize: 14, color: colors.text.muted },
  hint: { fontSize: 13, color: colors.text.muted, fontStyle: 'italic' },
  customAnglesRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  angleField: { flex: 1, gap: 4 },
  angleInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.card,
    minHeight: 40,
  },
  plusBadge: {
    backgroundColor: colors.brand.mid,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upsellRow: { gap: 8 },
  button: {
    backgroundColor: colors.brand.dark,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: colors.text.inverse, fontWeight: '600', fontSize: 14 },
  buttonSecondary: { backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.brand.mid },
  buttonSecondaryText: { color: colors.brand.dark, fontWeight: '600', fontSize: 14 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  optionRowSelected: { backgroundColor: colors.background.secondary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.brand.dark },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.dark },
  optionLabel: { fontSize: 14, color: colors.text.primary, flex: 1 },
  optionLabelSelected: { fontWeight: '600', color: colors.brand.dark },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { fontSize: 18, fontWeight: '700', color: colors.brand.dark, lineHeight: 20 },
  stepperValue: { fontSize: 14, color: colors.text.primary, minWidth: 56, textAlign: 'center', fontVariant: ['tabular-nums'] },
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: colors.background.secondary },
  toggleOption: { flex: 1, padding: 12, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: colors.brand.dark },
  toggleText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  toggleTextActive: { color: colors.text.inverse, fontWeight: '700' },
});
