/**
 * Purpose: City search route — manual city lookup using pc_ prefix tables
 *   (expo-sqlite city DB wired in T-02; this T-01 scaffold covers UI state and navigation)
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-city-search
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/shared/UIStates';

interface CityResult {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Minimal static city list for T-01 (full expo-sqlite city DB in T-02)
const SAMPLE_CITIES: CityResult[] = [
  { id: '1', city: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { id: '2', city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { id: '3', city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: '4', city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { id: '5', city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { id: '6', city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { id: '7', city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { id: '8', city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
];

export default function CitySearchScreen() {
  const setLocation = useSettingsStore((s) => s.setLocation);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) return <ErrorState error={error} onRetry={() => setError(null)} />;
  if (isSearching) return <LoadingState message="Searching cities..." />;

  function handleSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearched(true);
    // Simulated search (T-02 will use expo-sqlite city DB)
    setTimeout(() => {
      const filtered = SAMPLE_CITIES.filter(
        (c) =>
          c.city.toLowerCase().includes(query.toLowerCase()) ||
          c.country.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(filtered);
      setIsSearching(false);
    }, 300);
  }

  function selectCity(city: CityResult) {
    setLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.city,
      country: city.country,
      timezone: city.timezone,
    });
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search city or country..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor={Colors.text.muted}
          autoFocus
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {searched && results.length === 0 ? (
        <EmptyState title="No Results" subtitle={`No cities found for "${query}"`} />
      ) : (
        <FlatList
          data={results.length > 0 ? results : SAMPLE_CITIES}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            results.length === 0 ? (
              <Text style={styles.listHeader}>Popular Cities</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cityRow} onPress={() => selectCity(item)}>
              <View>
                <Text style={styles.cityName}>{item.city}</Text>
                <Text style={styles.countryName}>{item.country}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  searchRow: { flexDirection: 'row', padding: 16, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.background.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  searchButton: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: { color: Colors.text.inverse, fontWeight: '600' },
  listHeader: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 13, color: Colors.text.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cityRow: { padding: 16 },
  cityName: { fontSize: 16, color: Colors.text.primary, fontWeight: '500' },
  countryName: { fontSize: 13, color: Colors.text.muted },
  separator: { height: 1, backgroundColor: Colors.background.card, marginHorizontal: 16 },
});
