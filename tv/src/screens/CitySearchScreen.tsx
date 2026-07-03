/**
 * Purpose: Screen 8 — City Search TV: D-pad navigable city picker
 * Inputs: City list from pc_city GraphQL; D-pad navigation for selection
 * Outputs: Selected city persisted to settingsStore; prayer times recalculated
 * Constraints: D-pad navigation only; hasTVPreferredFocus on first city; focus never stuck
 * SPORT: praycalc/tv screens
 */

import React, { useState } from 'react';
import { useFocusDestination } from '../hooks/useFocusDestination';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CityLocation } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import TvScreenWrapper from '../components/TvScreenWrapper';

type CityNavProp = StackNavigationProp<RootStackParamList, 'CitySearch'>;

// Sample cities — production queries pc_city with D-pad letter navigation
const SAMPLE_CITIES: CityLocation[] = [
  { id: 'mecca',    name: 'Mecca',       country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh' },
  { id: 'medina',   name: 'Medina',      country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6150, timezone: 'Asia/Riyadh' },
  { id: 'cairo',    name: 'Cairo',       country: 'Egypt',        latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { id: 'istanbul', name: 'Istanbul',    country: 'Turkey',       latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { id: 'jakarta',  name: 'Jakarta',     country: 'Indonesia',    latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { id: 'karachi',  name: 'Karachi',     country: 'Pakistan',     latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { id: 'london',   name: 'London',      country: 'UK',           latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'newyork',  name: 'New York',    country: 'USA',          latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { id: 'chicago',  name: 'Chicago',     country: 'USA',          latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { id: 'toronto',  name: 'Toronto',     country: 'Canada',       latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { id: 'dubai',    name: 'Dubai',       country: 'UAE',          latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'kualalumpur', name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
];

export default function CitySearchScreen(): React.JSX.Element {
  const navigation = useNavigation<CityNavProp>();
  const { settings, updateSettings } = useSettingsStore();
  const [selected, setSelected] = useState(settings.cityId);
  const [firstNode, firstRef] = useFocusDestination<TouchableHighlight>();

  const handleSelect = (city: CityLocation): void => {
    setSelected(city.id);
    updateSettings({
      cityId: city.id,
      cityName: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
    });
    navigation.goBack();
  };

  return (
    <TvScreenWrapper title="Select City" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        <Text style={styles.hint}>D-pad Up/Down to navigate · Select to confirm</Text>
        <TVFocusGuideView style={styles.listContainer} destinations={firstNode ? [firstNode] : []}>
          <FlatList
            data={SAMPLE_CITIES}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item, index }) => (
              <TouchableHighlight
                ref={index === 0 ? firstRef : null}
                hasTVPreferredFocus={index === 0}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.name}, ${item.country}`}
                accessibilityState={{ selected: selected === item.id }}
                onPress={() => handleSelect(item)}
                underlayColor="#1E5E2F"
                style={[
                  styles.cityBtn,
                  selected === item.id && styles.cityBtnSelected,
                  settings.cityId === item.id && styles.cityBtnCurrent,
                ]}
              >
                <View style={styles.cityBtnInner}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityCountry}>{item.country}</Text>
                  {settings.cityId === item.id && (
                    <Text style={styles.currentLabel}>✓ Current</Text>
                  )}
                </View>
              </TouchableHighlight>
            )}
          />
        </TVFocusGuideView>
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 40 },
  hint: { color: '#79C24C', fontSize: 22, marginBottom: 24, textAlign: 'center' },
  listContainer: { flex: 1 },
  cityBtn: {
    flex: 1,
    margin: 12,
    minHeight: 120,
    backgroundColor: '#1E5E2F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cityBtnSelected: { borderColor: '#C9F27A', backgroundColor: '#2a7a3d' },
  cityBtnCurrent: { borderColor: '#79C24C' },
  cityBtnInner: { alignItems: 'center' },
  cityName: { color: '#FFFFFF', fontSize: 26, fontWeight: '700' },
  cityCountry: { color: '#79C24C', fontSize: 20, marginTop: 4 },
  currentLabel: { color: '#C9F27A', fontSize: 18, fontWeight: '600', marginTop: 8 },
});
