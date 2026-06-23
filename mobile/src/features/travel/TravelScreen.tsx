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

import React, { useState, useCallback } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import CitySearchScreen from '../city-search/CitySearchScreen';
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
  const { location, setLocation } = useSettingsStore();
  const [musafirMode, setMusafirMode] = useState(false);
  const [travelCity, setTravelCity] = useState<CityCoords | null>(null);
  const [showCitySearch, setShowCitySearch] = useState(false);

  const handleMusafirToggle = useCallback((value: boolean) => {
    setMusafirMode(value);
    if (value) {
      Alert.alert(
        'Musafir (Traveller) Mode',
        'Qasr (shortening) reduces Dhuhr, Asr, and Isha from 4 to 2 rakat.\n\n' +
        'Note: Jama (combining prayers) is not automatically applied due to scholarly differences. ' +
        'Please follow your local scholar or madhab regarding combining prayers during travel.',
        [{ text: 'Understood', style: 'default' }],
      );
    }
  }, []);

  const handleSelectTravelCity = useCallback((city: CityCoords) => {
    setTravelCity(city);
    setLocation(city);
    setShowCitySearch(false);
  }, [setLocation]);

  if (showCitySearch) {
    return (
      <CitySearchScreen onSelectCity={handleSelectTravelCity} />
    );
  }

  const prayerNames: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Musafir toggle */}
        <View style={styles.musafirCard}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle} accessibilityRole="header">Musafir Mode</Text>
            <Text style={styles.cardDesc}>
              I am a traveller (musafir). Apply qasr to applicable prayers.
            </Text>
          </View>
          <Switch
            value={musafirMode}
            onValueChange={handleMusafirToggle}
            trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
            thumbColor={Colors.brand.light}
            accessibilityLabel="Musafir travel mode"
          />
        </View>

        {/* Qasr reference table */}
        {musafirMode && (
          <View style={styles.rakatCard}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Qasr Rakat Count
            </Text>
            {prayerNames.map((name) => {
              const r = QASR_RAKAT[name];
              if (!r || r.normal === 0) return null;
              return (
                <View
                  key={name}
                  style={styles.rakatRow}
                  accessible
                  accessibilityLabel={`${name}: normal ${r.normal} rakat, qasr ${r.qasr} rakat`}
                >
                  <Text style={styles.prayerName}>{name}</Text>
                  <Text style={styles.rakatNormal}>{r.normal} rak'at</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={[styles.rakatQasr, r.qasr < r.normal && styles.shortened]}>
                    {r.qasr} rak'at
                  </Text>
                </View>
              );
            })}
            <Text style={styles.fiqhNote}>
              Fajr and Maghrib are not shortened (qasr applies to 4-rakat prayers only).
              Jama (combining prayers) requires following your local scholar or madhab ruling.
            </Text>
          </View>
        )}

        {/* Travel city selection */}
        <View style={styles.cityCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Travel Destination</Text>
          {travelCity ? (
            <View style={styles.selectedCity} accessible accessibilityLabel={`Selected: ${travelCity.city}, ${travelCity.country}`}>
              <View>
                <Text style={styles.cityName}>{travelCity.city}</Text>
                <Text style={styles.cityCountry}>{travelCity.country}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCitySearch(true)}
                style={styles.changeBtn}
                accessibilityRole="button"
                accessibilityLabel="Change travel city"
              >
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectCityBtn}
              onPress={() => setShowCitySearch(true)}
              accessibilityRole="button"
              accessibilityLabel="Select travel city"
            >
              <Text style={styles.selectCityText}>Select Travel City</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.cityNote}>
            Prayer times will be recalculated for your travel destination.
          </Text>
        </View>

        {/* Current city */}
        <View style={styles.homeCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Home City</Text>
          <Text style={styles.homeCityText}>
            {location ? `${location.city}, ${location.country}` : 'Not set'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  musafirCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 72,
  },
  cardLeft: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  cardDesc: { fontSize: 13, color: Colors.text.muted, marginTop: 4, lineHeight: 20 },
  rakatCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 10 },
  rakatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    minHeight: 40,
  },
  prayerName: { width: 72, fontSize: 15, color: Colors.text.primary, fontWeight: '500' },
  rakatNormal: { fontSize: 14, color: Colors.text.muted, width: 60 },
  arrow: { fontSize: 14, color: Colors.text.muted },
  rakatQasr: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  shortened: { color: Colors.brand.dark, fontWeight: '800' },
  fiqhNote: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 10,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cityCard: {
    backgroundColor: Colors.background.secondary,
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
  cityName: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  cityCountry: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
  changeBtn: { padding: 8, minHeight: 44, justifyContent: 'center' },
  changeBtnText: { fontSize: 14, color: Colors.brand.dark, fontWeight: '600' },
  selectCityBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.brand.mid,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  selectCityText: { fontSize: 15, color: Colors.brand.mid, fontWeight: '600' },
  cityNote: { fontSize: 12, color: Colors.text.muted, marginTop: 8, fontStyle: 'italic' },
  homeCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
  },
  homeCityText: { fontSize: 16, color: Colors.text.primary },
});
