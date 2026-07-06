/**
 * Purpose: City search using pc_cities table with fuzzy match and offline fallback
 *   from bundled city list. This is the app's single city-search implementation —
 *   the standalone /city-search route now renders this component directly instead
 *   of a separate, more primitive scaffold that used to live there.
 * Inputs: Search query (debounced 300ms), urql GraphQL query for pc_cities, bundled
 *   fallback list, expo-location for "Use Current Location".
 * Outputs: CitySearchScreen — Feature 14 of 20.
 * Constraints: Offline fallback from bundled JSON. Fuzzy match client-side.
 *   7 UI states including offline banner.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-14-city-search
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { useQuery } from 'urql';
import * as Location from 'expo-location';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { LoadingState, ErrorState, EmptyState, OfflineState } from '../../components/states';
import { useSettingsStore } from '../settings/store/useSettingsStore';
import type { CityCoords } from '../../types/prayer';

/** Debounce a fast-changing value so GraphQL isn't queried on every keystroke. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ── Bundled fallback city list (subset — full 100k in expo-sqlite DB) ────────

const FALLBACK_CITIES: CityCoords[] = [
  { city: 'Makkah', country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579, timezone: '+3' },
  { city: 'Madinah', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6024, timezone: '+3' },
  { city: 'Riyadh', country: 'Saudi Arabia', latitude: 24.6877, longitude: 46.7219, timezone: '+3' },
  { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: '+2' },
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: '+3' },
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: '+1' },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: '-5' },
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: '-5' },
  { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: '-6' },
  { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: '-8' },
  { city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: '+5' },
  { city: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: '+5' },
  { city: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: '+6' },
  { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: '+7' },
  { city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: '+8' },
  { city: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: '+4' },
  { city: 'Tehran', country: 'Iran', latitude: 35.6892, longitude: 51.3890, timezone: '+3.5' },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: '+1' },
  { city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: '+1' },
  { city: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timezone: '+3' },
];

// ── GraphQL ───────────────────────────────────────────────────────────────────

const SEARCH_CITIES = `
  query SearchCities($q: String!) {
    pc_cities(
      where: { name: { _ilike: $q } },
      order_by: { population: desc_nulls_last },
      limit: 20
    ) {
      id
      name
      country
      latitude
      longitude
      timezone
    }
  }
`;

// Simple fuzzy match: all terms in query appear in target (case-insensitive)
function fuzzyMatch(query: string, target: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const t = target.toLowerCase();
  return terms.every((term) => t.includes(term));
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface CitySearchScreenProps {
  onSelectCity?: (city: CityCoords) => void;
  /**
   * 'home' (default): selecting a city writes it to the store's HOME `location`
   *   (existing behavior — used by the standalone /city-search route and Settings).
   * 'travel': selection is reported ONLY via `onSelectCity` — this screen never
   *   touches `location` so home is never clobbered by a travel-city pick. The
   *   caller (e.g. TravelScreen) is responsible for calling setTravelLocation().
   */
  mode?: 'home' | 'travel';
}

export default function CitySearchScreen({ onSelectCity, mode = 'home' }: CitySearchScreenProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [isOffline, setIsOffline] = useState(false);
  const [locating, setLocating] = useState(false);
  const { setLocation } = useSettingsStore();

  const [{ data, fetching, error }] = useQuery({
    query: SEARCH_CITIES,
    variables: { q: `%${debouncedQuery}%` },
    pause: debouncedQuery.length < 2,
  });

  useEffect(() => {
    if (error?.networkError) setIsOffline(true);
    else setIsOffline(false);
  }, [error]);

  const results: CityCoords[] = useMemo(() => {
    if (isOffline || !data?.pc_cities) {
      // Offline fallback — fuzzy match on bundled list
      if (debouncedQuery.length < 2) return FALLBACK_CITIES.slice(0, 10);
      return FALLBACK_CITIES.filter((c) => fuzzyMatch(debouncedQuery, `${c.city} ${c.country}`));
    }
    return data.pc_cities.map((r: { name: string; country: string; latitude: number; longitude: number; timezone: string }) => ({
      city: r.name,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    }));
  }, [data, isOffline, debouncedQuery]);

  const handleSelect = useCallback((city: CityCoords) => {
    // Never write to home `location` in travel mode — the caller owns where a
    // travel-city selection is stored (setTravelLocation), so musafir mode
    // selection can never clobber the user's home city.
    if (mode === 'home') setLocation(city);
    onSelectCity?.(city);
  }, [setLocation, onSelectCity, mode]);

  const handleUseCurrentLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      handleSelect({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city: geo?.city ?? geo?.district ?? 'My Location',
        country: geo?.country ?? '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } finally {
      setLocating(false);
    }
  }, [handleSelect]);

  // ── 7 UI States ──────────────────────────────────────────────────────────────
  const showLoading = (fetching || query !== debouncedQuery) && debouncedQuery.length >= 2 && !data;
  const showEmpty = !showLoading && debouncedQuery.length >= 2 && results.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Search input */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={t('screens.citySearch.placeholder')}
          placeholderTextColor={colors.text.muted}
          accessibilityLabel="City search input"
          accessibilityHint="Type a city name to search"
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="words"
        />
        <TouchableOpacity
          style={styles.currentLocationBtn}
          onPress={handleUseCurrentLocation}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel="Use current location"
        >
          <Text style={styles.currentLocationText}>
            {locating ? t('screens.citySearch.locating') : `📍 ${t('screens.citySearch.useCurrentLocation')}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Offline banner */}
      {isOffline && <OfflineState cachedAt="bundled city list" />}

      {/* Error (non-offline) */}
      {error && !isOffline && (
        <Text style={styles.errorText}>{t('screens.citySearch.searchError', { message: error.message })}</Text>
      )}

      {/* Loading */}
      {showLoading && <LoadingState message={t('screens.citySearch.searching')} />}

      {/* Empty */}
      {showEmpty && <EmptyState message={t('screens.citySearch.noResults', { query })} />}

      {/* Results */}
      {!showLoading && !showEmpty && (
        <FlatList
          data={results}
          keyExtractor={(c, i) => `${c.city}-${i}`}
          ListHeaderComponent={
            query.length < 2 ? (
              <Text style={styles.hint}>{t('screens.citySearch.popularHint')}</Text>
            ) : null
          }
          renderItem={({ item: city }) => (
            <TouchableOpacity
              style={styles.cityRow}
              onPress={() => handleSelect(city)}
              accessibilityRole="button"
              accessibilityLabel={`${city.city}, ${city.country}`}
            >
              <Text style={styles.cityName}>{city.city}</Text>
              <Text style={styles.countryName}>{city.country}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
          accessible
          accessibilityLabel="City search results"
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  searchBar: {
    padding: 12,
    backgroundColor: colors.background.secondary,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.card,
    minHeight: 44,
  },
  hint: { fontSize: 13, color: colors.text.muted, padding: 12, textAlign: 'center' },
  currentLocationBtn: { marginTop: 8, paddingVertical: 10, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  currentLocationText: { fontSize: 14, color: colors.brand.dark, fontWeight: '600' },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 56,
  },
  cityName: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  countryName: { fontSize: 14, color: colors.text.muted },
  errorText: { fontSize: 14, color: colors.state.error, padding: 12, textAlign: 'center' },
});
