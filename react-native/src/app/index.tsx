/**
 * Purpose: Main Prayer Times screen — city name, countdown, full prayer list.
 * Inputs: useLocation(), usePrayerTimes() hooks
 * Outputs: Scrollable screen with CountdownTimer + PrayerCard list
 * Constraints: Shows loading state while location resolves.
 *   Shows inline error with retry button if location fails.
 *   Dark green gradient background consistent with Flutter app palette.
 * SPORT: app/index.tsx
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { PrayerCard } from '../components/PrayerCard';
import { CountdownTimer } from '../components/CountdownTimer';

export default function PrayerTimesScreen() {
  const { location, loading: locationLoading, error: locationError, refresh } = useLocation();
  const { times, loading: timesLoading } = usePrayerTimes(location);

  const loading = locationLoading || timesLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#34a853" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>PrayCalc</Text>
          {location && (
            <Text style={styles.cityName}>{location.cityName}</Text>
          )}
        </View>

        {/* Loading */}
        {loading && !times && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#34a853" />
            <Text style={styles.loadingText}>Calculating prayer times…</Text>
          </View>
        )}

        {/* Location error */}
        {locationError && !location && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prayer times */}
        {times && (
          <>
            <CountdownTimer nextPrayer={times.nextPrayer} />
            <View style={styles.prayerList}>
              {times.prayers.map((prayer) => (
                <PrayerCard
                  key={prayer.name}
                  prayer={prayer}
                  isNext={prayer.name === times.nextPrayer?.name}
                />
              ))}
            </View>
            <Text style={styles.dateLabel}>
              {times.date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d2015',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#0d2015',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cityName: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: 4,
  },
  center: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: 'rgba(220,50,50,0.15)',
    borderRadius: 12,
    padding: 20,
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: 'rgba(255,120,120,0.9)',
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  prayerList: {
    marginTop: 8,
    gap: 2,
  },
  dateLabel: {
    marginTop: 24,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
