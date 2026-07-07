/**
 * Purpose: Settings screen — calculation method, madhab toggle, location picker
 *   (GPS + manual city search), notification preferences, 12/24h time format.
 * Inputs: useSettingsStore state; expo-location for GPS
 * Outputs: Settings form; changes persisted via zustand/AsyncStorage
 * Constraints: Method selector must show exactly 7 methods (no Tehran/Jafari — D-P3-19).
 *   All 7 UI states implemented. RTL layout prepared. Split into section components
 *   (SettingsCalculationSection, SettingsAdjustmentsSection, SettingsLanguageSection,
 *   SettingsAppearanceSection) to stay under the 300-line file cap — see those files for
 *   their own purpose headers.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-screen
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { PrayerName, HighLatRule, Madhab } from '../../../types/prayer';
import { ErrorState, LoadingState } from '../../../components/states';
import i18next, {
  RTL_LOCALES, persistLocale, useTranslation, type SupportedLocale,
} from '../../../i18n';
import { schedulePrayerNotifications } from '../../../lib/notifications/PrayerNotificationService';
import { SectionHeader } from './SettingsSectionHeader';
import { SettingsCalculationSection } from './SettingsCalculationSection';
import { SettingsAdjustmentsSection } from './SettingsAdjustmentsSection';
import { SettingsLanguageSection } from './SettingsLanguageSection';
import { SettingsAppearanceSection } from './SettingsAppearanceSection';

const UPGRADE_URL = 'https://praycalc.com/upgrade';

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

  function handleSetMethod(method: string) {
    settings.setMethod(method);
    rescheduleIfEnabled();
  }

  function handleSetCustomAngles(fajr: number, isha: number) {
    settings.setCustomAngles(fajr, isha);
    rescheduleIfEnabled();
  }

  function handleSetHighLatRule(rule: HighLatRule) {
    settings.setHighLatRule(rule);
    rescheduleIfEnabled();
  }

  function handleSetMadhab(madhab: Madhab) {
    settings.setMadhab(madhab);
    rescheduleIfEnabled();
  }

  // UI states
  if (isLocating) return <LoadingState message={t('settings.location.gettingLocation')} />;
  if (saveError) return <ErrorState error={saveError} onRetry={() => setSaveError(null)} />;

  // success (settings always show — no loading/empty/offline states for this screen)

  async function handleGPSLocation() {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('settings.location.permissionDenied'), t('settings.location.permissionDeniedBody'));
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
      rescheduleIfEnabled();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Location error');
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Account / Ummat+ */}
      <SectionHeader title={t('settings.account.title')} styles={styles} />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {auth.mode === 'account' ? t('settings.account.signedIn') : t('settings.account.anonymous')}
          </Text>
          {auth.isPlus ? (
            <Text style={styles.plusBadge}>Ummat+</Text>
          ) : (
            <Text style={styles.rowValue}>{t('settings.account.free')}</Text>
          )}
        </View>
        {!auth.isPlus && (
          <View style={styles.upsellRow}>
            <Text style={styles.hint}>
              {t('settings.upsell.priceLine')}
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => Linking.openURL(UPGRADE_URL)}
            >
              <Text style={styles.buttonSecondaryText}>{t('settings.upsell.upgradeButton')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Location */}
      <SectionHeader title={t('settings.location.title')} styles={styles} />
      <View style={styles.card}>
        {settings.location ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.location.currentCity')}</Text>
            <Text style={styles.rowValue}>
              {`${settings.location.city}, ${settings.location.country}`}
            </Text>
          </View>
        ) : (
          <Text style={styles.hint}>{t('settings.location.noneSet')}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleGPSLocation}>
          <Text style={styles.buttonText}>{t('settings.location.useGps')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/city-search')}
        >
          <Text style={styles.buttonSecondaryText}>{t('settings.location.searchManually')}</Text>
        </TouchableOpacity>
      </View>

      <SettingsCalculationSection
        method={settings.method}
        onSetMethod={handleSetMethod}
        customFajrAngle={settings.customFajrAngle}
        customIshaAngle={settings.customIshaAngle}
        onSetCustomAngles={handleSetCustomAngles}
        highLatRule={settings.highLatRule}
        onSetHighLatRule={handleSetHighLatRule}
        madhab={settings.madhab}
        onSetMadhab={handleSetMadhab}
      />

      <SettingsAdjustmentsSection
        prayerMinuteAdjustments={settings.prayerMinuteAdjustments}
        onAdjustPrayerMinutes={adjustPrayerMinutes}
        hijriDayAdjustment={settings.hijriDayAdjustment}
        onAdjustHijriDay={settings.setHijriDayAdjustment}
      />

      <SettingsLanguageSection
        locale={settings.locale}
        showLanguages={showLanguages}
        onToggleShowLanguages={() => setShowLanguages((v) => !v)}
        onSelectLocale={handleSelectLocale}
      />

      <SettingsAppearanceSection
        timeFormat={settings.timeFormat}
        onSetTimeFormat={settings.setTimeFormat}
        themeMode={settings.themeMode}
        onSetThemeMode={settings.setThemeMode}
      />

      {/* Notifications — single source of truth is NotificationSettingsScreen (per-prayer
          enable + advance minutes); this just links out instead of duplicating the picker. */}
      <SectionHeader title={t('settings.notifications.title')} styles={styles} />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.prayerAlerts')}</Text>
          <Text style={styles.rowValue}>{settings.notificationsEnabled ? t('common.on') : t('common.off')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('/settings/notifications')}
        >
          <Text style={styles.buttonSecondaryText}>{t('settings.manageNotifications')}</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
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
});
