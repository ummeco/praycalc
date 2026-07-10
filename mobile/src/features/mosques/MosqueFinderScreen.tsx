/**
 * Purpose: Mosque Finder — lists nearby mosques (within 10km) using the free
 *   OpenStreetMap Overpass API, with a one-tap "Open in Maps" per row.
 * Inputs: useActiveLocation() (home, or travel city while musafir mode is on —
 *   same travel-aware pattern as every other location-driven surface).
 * Outputs: MosqueFinderScreen — FlatList of nearby mosques with distance + directions.
 * Constraints: No location → EmptyState routing to /city-search. Network/parse
 *   failure → ErrorState with retry. No results within 10km → EmptyState.
 *   Pull-to-refresh re-queries. OpenStreetMap attribution footer is a license
 *   requirement (ODbL) — must not be removed. a11y labels on every row/button.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-mosque-finder
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { LoadingState, ErrorState, EmptyState } from '../../components/states';
import { useActiveLocation } from '../settings/store/useSettingsStore';
import { searchNearbyMosques, type Mosque } from '../../lib/mosques/overpass';

/** Build the platform-appropriate "open directions" URL for a mosque. */
function directionsUrl(mosque: Mosque): string {
  return Platform.OS === 'ios'
    ? `https://maps.apple.com/?daddr=${mosque.lat},${mosque.lng}&q=${encodeURIComponent(mosque.name)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`;
}

function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export default function MosqueFinderScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Travel-aware: search around the travel city while musafir mode is on,
  // matching every other location-driven surface (Qibla/Timetable/Ramadan/etc).
  const activeLocation = useActiveLocation();

  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runSearch = useCallback(async (isRefresh: boolean) => {
    if (!activeLocation) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const results = await searchNearbyMosques(activeLocation.latitude, activeLocation.longitude);
      setMosques(results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('screens.mosques.searchFailed')));
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [activeLocation, t]);

  useEffect(() => {
    void runSearch(false);
    // Only re-run when the active location itself changes (home <-> travel city),
    // not on every runSearch identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocation?.latitude, activeLocation?.longitude]);

  const handleRefresh = useCallback(() => {
    void runSearch(true);
  }, [runSearch]);

  const handleRetry = useCallback(() => {
    void runSearch(false);
  }, [runSearch]);

  const handleOpenMaps = useCallback((mosque: Mosque) => {
    void Linking.openURL(directionsUrl(mosque));
  }, []);

  // ── UI states ────────────────────────────────────────────────────────────

  if (!activeLocation) {
    return (
      <EmptyState
        message={t('screens.mosques.setLocation')}
        action={t('screens.mosques.setLocationAction')}
        onAction={() => router.push('/city-search')}
      />
    );
  }

  if (loading) {
    return <LoadingState message={t('screens.mosques.finding')} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  if (mosques && mosques.length === 0) {
    return (
      <EmptyState
        message={t('screens.mosques.noResults')}
        action={t('screens.mosques.retry')}
        onAction={handleRetry}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mosques ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand.mid} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={styles.row}
            accessible
            accessibilityLabel={t('screens.mosques.rowAccessibilityLabel', { name: item.name, distance: formatDistance(item.distanceKm) })}
          >
            <View style={styles.rowInfo}>
              <Text style={styles.mosqueName}>{item.name}</Text>
              <Text style={styles.mosqueDistance}>{formatDistance(item.distanceKm)}</Text>
            </View>
            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => handleOpenMaps(item)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.mosques.directionsAccessibilityLabel', { name: item.name })}
            >
              <Text style={styles.directionsBtnText}>{t('common.openInMaps')}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.attribution} accessibilityRole="text">
            {t('screens.mosques.attribution')}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  listContent: { padding: 16, paddingBottom: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
    gap: 12,
  },
  rowInfo: { flex: 1 },
  mosqueName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  mosqueDistance: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  directionsBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.brand.mid,
    minHeight: 44,
    justifyContent: 'center',
  },
  directionsBtnText: { fontSize: 13, fontWeight: '700', color: colors.text.inverse },
  attribution: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
