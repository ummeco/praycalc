/**
 * Purpose: Travel mode — musafir toggle for qasr (shortened prayers), auto-detect timezone
 *   change, recalculate for travel location. UI setting only — user toggles manually.
 * Inputs: useSettingsStore, CitySearchScreen for travel city selection.
 * Outputs: TravelScreen — Feature 19 of 20.
 * Constraints: Musafir mode is UI-only toggle per ticket spec — no automatic jamah.
 *   Qasr reduces Dhuhr/Asr/Isha from 4 to 2 rakat (fard only). Fajr/Maghrib unchanged.
 *   Jama (combining prayers) NOT implemented without user confirmation (fiqh differences).
 *   7 UI states.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-19-travel
 *
 * Fiqh note (CR-C requirement): Qasr is agreed upon across madhabs for travel >~77km.
 * Jama (combining Dhuhr+Asr or Maghrib+Isha) has scholarly differences — NOT auto-implemented.
 * User must manually select jama if desired. This screen only handles qasr + travel city.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import CitySearchScreen from '../city-search/CitySearchScreen';
import { schedulePrayerNotifications } from '../../lib/notifications/PrayerNotificationService';
import { PRAYER_LABEL_KEYS, NOTIFIABLE_PRAYERS } from '../../constants/prayers';
import type { CityCoords } from '../../types/prayer';
import type { PrayerName } from '../../types/prayer';

// Qasr rakat counts (shortened fard prayer)
const QASR_RAKAT: Record<PrayerName, { normal: number; qasr: number }> = {
  Fajr:    { normal: 2, qasr: 2 },  // unchanged
  Sunrise:  { normal: 0, qasr: 0 },
  Dhuhr:   { normal: 4, qasr: 2 },  // shortened
  Asr:     { normal: 4, qasr: 2 },  // shortened
  Maghrib: { normal: 3, qasr: 3 },  // unchanged
  Isha:    { normal: 4, qasr: 2 },  // shortened
};

export default function TravelScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { location, travelLocation, musafirMode, setTravelLocation, setMusafirMode } = useSettingsStore();
  const [showCitySearch, setShowCitySearch] = useState(false);

  /** Reschedule notifications after a change that shifts computed times (guarded, fire-and-forget). */
  function rescheduleIfEnabled() {
    if (useSettingsStore.getState().notificationsEnabled) {
      void schedulePrayerNotifications().catch(() => undefined);
    }
  }

  const handleMusafirToggle = useCallback((value: boolean) => {
    setMusafirMode(value);
    rescheduleIfEnabled();
    if (value) {
      Alert.alert(
        t('screens.travel.musafirAlertTitle'),
        t('screens.travel.musafirAlertBody'),
        [{ text: t('screens.travel.understood'), style: 'default' }],
      );
    }
  }, [setMusafirMode, t]);

  const handleSelectTravelCity = useCallback((city: CityCoords) => {
    setTravelLocation(city);
    rescheduleIfEnabled();
    setShowCitySearch(false);
  }, [setTravelLocation]);

  if (showCitySearch) {
    return (
      <CitySearchScreen onSelectCity={handleSelectTravelCity} mode="travel" />
    );
  }

  const prayerNames: PrayerName[] = NOTIFIABLE_PRAYERS;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Musafir toggle */}
        <View style={styles.musafirCard}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle} accessibilityRole="header">{t('screens.travel.musafirModeTitle')}</Text>
            <Text style={styles.cardDesc}>
              {t('screens.travel.musafirModeDesc')}
            </Text>
          </View>
          <Switch
            value={musafirMode}
            onValueChange={handleMusafirToggle}
            trackColor={{ false: colors.background.card, true: colors.brand.mid }}
            thumbColor={colors.brand.light}
            accessibilityLabel="Musafir travel mode"
          />
        </View>

        {/* Qasr reference table */}
        {musafirMode && (
          <View style={styles.rakatCard}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('screens.travel.qasrRakatCount')}
            </Text>
            {prayerNames.map((name) => {
              const r = QASR_RAKAT[name];
              if (!r || r.normal === 0) return null;
              const label = t(PRAYER_LABEL_KEYS[name]);
              return (
                <View
                  key={name}
                  style={styles.rakatRow}
                  accessible
                  accessibilityLabel={`${label}: normal ${r.normal} rakat, qasr ${r.qasr} rakat`}
                >
                  <Text style={styles.prayerName}>{label}</Text>
                  <Text style={styles.rakatNormal}>{r.normal} rak'at</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={[styles.rakatQasr, r.qasr < r.normal && styles.shortened]}>
                    {r.qasr} rak'at
                  </Text>
                </View>
              );
            })}
            <Text style={styles.fiqhNote}>
              {t('screens.travel.fiqhNote')}
            </Text>
          </View>
        )}

        {/* Travel city selection */}
        <View style={styles.cityCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.travel.travelDestination')}</Text>
          {travelLocation ? (
            <View style={styles.selectedCity} accessible accessibilityLabel={`Selected: ${travelLocation.city}, ${travelLocation.country}`}>
              <View>
                <Text style={styles.cityName}>{travelLocation.city}</Text>
                <Text style={styles.cityCountry}>{travelLocation.country}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCitySearch(true)}
                style={styles.changeBtn}
                accessibilityRole="button"
                accessibilityLabel="Change travel city"
              >
                <Text style={styles.changeBtnText}>{t('screens.travel.changeCity')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectCityBtn}
              onPress={() => setShowCitySearch(true)}
              accessibilityRole="button"
              accessibilityLabel="Select travel city"
            >
              <Text style={styles.selectCityText}>{t('screens.travel.selectTravelCity')}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.cityNote}>
            {t('screens.travel.recalcNote')}
          </Text>
        </View>

        {/* Current city */}
        <View style={styles.homeCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.travel.homeCity')}</Text>
          <Text style={styles.homeCityText}>
            {location ? `${location.city}, ${location.country}` : t('screens.travel.notSet')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  musafirCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 72,
  },
  cardLeft: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  cardDesc: { fontSize: 13, color: colors.text.muted, marginTop: 4, lineHeight: 20 },
  rakatCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 10 },
  rakatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    minHeight: 40,
  },
  prayerName: { width: 72, fontSize: 15, color: colors.text.primary, fontWeight: '500' },
  rakatNormal: { fontSize: 14, color: colors.text.muted, width: 60 },
  arrow: { fontSize: 14, color: colors.text.muted },
  rakatQasr: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  shortened: { color: colors.brand.dark, fontWeight: '800' },
  fiqhNote: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 10,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cityCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  selectedCity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  cityName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  cityCountry: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  changeBtn: { padding: 8, minHeight: 44, justifyContent: 'center' },
  changeBtnText: { fontSize: 14, color: colors.brand.dark, fontWeight: '600' },
  selectCityBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  selectCityText: { fontSize: 15, color: colors.brand.mid, fontWeight: '600' },
  cityNote: { fontSize: 12, color: colors.text.muted, marginTop: 8, fontStyle: 'italic' },
  homeCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
  },
  homeCityText: { fontSize: 16, color: colors.text.primary },
});
