/**
 * Purpose: Screen 8 — City Search TV: D-pad navigable city picker
 * Inputs: pc_cities via urql (live, debounced by typed search text); D-pad navigation for selection
 * Outputs: Selected city persisted to settingsStore; prayer times recalculated
 * Constraints: D-pad navigation only; hasTVPreferredFocus on first city; focus never stuck.
 *   DATA PATH: live query. pc_cities exists in production (verified via introspection + a live
 *   query against api.praycalc.com 2026-07-06 — 49,742 rows, public role select, server-capped
 *   at limit 50). Before any search text is typed, a small curated "popular cities" quick-pick
 *   list is shown (bundled, not fabricated — these are well-known city names/coords used only
 *   as a starting point; typing narrows to the live pc_cities result set).
 * SPORT: praycalc/tv screens
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useFocusDestination } from '../hooks/useFocusDestination';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from 'urql';
import { RootStackParamList, CityLocation } from '../types';
import { useSettingsStore } from '../stores/settingsStore';
import TvScreenWrapper from '../components/TvScreenWrapper';
import { GET_CITY_LIST } from '../lib/graphql/queries';

type CityNavProp = StackNavigationProp<RootStackParamList, 'CitySearch'>;

const SEARCH_DEBOUNCE_MS = 400;
const RESULT_LIMIT = 50;

// Quick-pick list shown before the user types a search — not a substitute for the
// live pc_cities table, just a fast starting point for the most commonly selected cities.
const POPULAR_CITIES: CityLocation[] = [
  { id: 'mecca',    name: 'Mecca',       country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh' },
  { id: 'medina',   name: 'Medina',      country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6150, timezone: 'Asia/Riyadh' },
  { id: 'cairo',    name: 'Cairo',       country: 'Egypt',        latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { id: 'istanbul', name: 'Istanbul',    country: 'Turkey',       latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { id: 'jakarta',  name: 'Jakarta',     country: 'Indonesia',    latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { id: 'karachi',  name: 'Karachi',     country: 'Pakistan',     latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
];

interface PcCitiesRow {
  id: number;
  name: string;
  country: string;
  state: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number | null;
}

function toCityLocation(row: PcCitiesRow): CityLocation {
  return {
    id: String(row.id),
    name: row.state ? `${row.name}, ${row.state}` : row.name,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
  };
}

export default function CitySearchScreen(): React.JSX.Element {
  const navigation = useNavigation<CityNavProp>();
  const { settings, updateSettings } = useSettingsStore();
  const [selected, setSelected] = useState(settings.cityId);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [firstNode, firstRef] = useFocusDestination<TouchableHighlight>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const [{ data, fetching }] = useQuery<{ pc_cities: PcCitiesRow[] }>({
    query: GET_CITY_LIST,
    variables: { search: `%${debouncedSearch}%`, limit: RESULT_LIMIT },
    pause: debouncedSearch.length < 2,
  });

  const cities: CityLocation[] = useMemo(() => {
    if (debouncedSearch.length < 2) return POPULAR_CITIES;
    return (data?.pc_cities ?? []).map(toCityLocation);
  }, [debouncedSearch, data]);

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
        <TextInput
          style={styles.searchInput}
          placeholder="Type to search cities…"
          placeholderTextColor="#79C24C"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          {debouncedSearch.length < 2
            ? 'D-pad Up/Down to navigate popular cities · type to search 49,000+ cities'
            : fetching
              ? 'Searching…'
              : `${cities.length} result${cities.length === 1 ? '' : 's'}`}
        </Text>
        {fetching && debouncedSearch.length >= 2 ? (
          <ActivityIndicator color="#C9F27A" size="large" style={styles.loader} />
        ) : (
          <TVFocusGuideView style={styles.listContainer} destinations={firstNode ? [firstNode] : []}>
            <FlatList
              data={cities}
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
        )}
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D2F17', padding: 40 },
  searchInput: {
    backgroundColor: '#1E5E2F',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#79C24C',
    color: '#FFFFFF',
    fontSize: 26,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 64,
    marginBottom: 16,
  },
  hint: { color: '#79C24C', fontSize: 22, marginBottom: 24, textAlign: 'center' },
  loader: { marginTop: 60 },
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
