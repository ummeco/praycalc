/**
 * Purpose: "My TVs" management screen — lists every pc_tv_settings row owned by the
 *   signed-in user (paired PrayCalc TV displays) and lets them rename, recolor, change
 *   stream source, adjust rotation, toggle weather, refresh/edit per-TV location, tune
 *   deep display settings (countdown takeover, iqama offsets, name-only mode, calc
 *   method/madhab/time format — rendered by the TvDeepSettings subcomponent), or unpair
 *   each one.
 * Inputs: urql query of pc_tv_settings (own rows only, per Hasura user-role select
 *   permission), useActiveLocation (settings store) for the "update to my current
 *   location" action, CitySearchScreen (travel-mode, callback-only) for per-TV city
 *   search, useAuthStore.isPlus for the Ummat+ gate.
 * Outputs: TvManagerScreen component, routed at /tvs.
 * Constraints: Ummat+ gated — TV pairing/management is a paid feature (matches the
 *   /pair-tv gate). Mutations refetch on completion rather than optimistic cache
 *   updates (acceptable latency for a settings-style screen). Per-TV location here is
 *   NOT the phone's location — it's an independent field on the pc_tv_settings row,
 *   editable via "my current location" OR city search OR manual lat/lng, and is read
 *   by the TV on every 5-minute sync (not just at pair time) — see T1's live schema
 *   contract. iqama_offsets is a jsonb column; Hasura's _set replaces the whole object,
 *   so writes always send the full 5-key {fajr,dhuhr,asr,maghrib,isha} shape (no partial
 *   patch), sourced from lib/pairing/pairingMutation.ts's TvSettingsPatch/IqamaOffsets
 *   contract (shared with the pairing seed flow so both surfaces agree on shape). This
 *   screen owns all state + mutations (drafts, applyPatch, refetch); TvCardBody renders
 *   the expanded card's basic fields and TvDeepSettings (nested inside it) renders the
 *   deep-settings disclosure — split out, along with tvManagerQueries.ts (query strings
 *   + row typing), tvManagerConstants.ts (option lists + label-key maps), and
 *   tvManagerStyles.ts (shared StyleSheet), so every file here stays under the 300-line
 *   cap.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-tv-manager
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from 'urql';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
  ErrorState, EmptyState, SkeletonState,
} from '../../components/states';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useActiveLocation } from '../settings/store/useSettingsStore';
import CitySearchScreen from '../city-search/CitySearchScreen';
import type { CityCoords } from '../../types/prayer';
import type { IqamaOffsets, TvSettingsPatch } from '../../lib/pairing/pairingMutation';
import { DEFAULT_IQAMA_OFFSETS } from '../../lib/pairing/pairingMutation';
import { GET_TV_SETTINGS, UPDATE_TV_SETTINGS, DELETE_TV_SETTINGS, type TvSettingsRow } from './tvManagerQueries';
import { STREAM_LABEL_KEYS, MIN_IQAMA_OFFSET, MAX_IQAMA_OFFSET } from './tvManagerConstants';
import { createStyles } from './tvManagerStyles';
import { TvCardBody } from './TvCardBody';

const UPGRADE_URL = 'https://praycalc.com/upgrade';

export default function TvManagerScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPlus = useAuthStore((s) => s.isPlus);
  const activeLocation = useActiveLocation();

  const [{ data, fetching, error }, reexecuteQuery] = useQuery<{ pc_tv_settings: TvSettingsRow[] }>({
    query: GET_TV_SETTINGS,
    pause: !isPlus,
  });
  const [, updateTvSettings] = useMutation<unknown, { id: string; changes: TvSettingsPatch }>(
    UPDATE_TV_SETTINGS,
  );
  const [, deleteTvSettings] = useMutation<unknown, { id: string }>(DELETE_TV_SETTINGS);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [citySearchForId, setCitySearchForId] = useState<string | null>(null);
  const [manualLocationId, setManualLocationId] = useState<string | null>(null);
  const [manualLatDrafts, setManualLatDrafts] = useState<Record<string, string>>({});
  const [manualLngDrafts, setManualLngDrafts] = useState<Record<string, string>>({});
  const [deepExpandedId, setDeepExpandedId] = useState<string | null>(null);

  const refetch = useCallback(() => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  }, [reexecuteQuery]);

  const applyPatch = useCallback(async (row: TvSettingsRow, changes: TvSettingsPatch) => {
    await updateTvSettings({ id: row.id, changes });
    refetch();
  }, [updateTvSettings, refetch]);

  const handleRenameCommit = useCallback((row: TvSettingsRow) => {
    const draft = nameDrafts[row.id];
    if (draft === undefined || draft.trim() === '' || draft === row.name) return;
    void applyPatch(row, { name: draft.trim() });
  }, [nameDrafts, applyPatch]);

  const handleUpdateLocation = useCallback((row: TvSettingsRow) => {
    if (!activeLocation) {
      Alert.alert(t('screens.tvManager.noLocationTitle'), t('screens.tvManager.noLocationBody'));
      return;
    }
    void applyPatch(row, {
      latitude: activeLocation.latitude,
      longitude: activeLocation.longitude,
      city: activeLocation.city,
      timezone: activeLocation.timezone,
    }).then(() => {
      Alert.alert(t('screens.tvManager.locationUpdatedTitle'), t('screens.tvManager.locationUpdatedBody'));
    });
  }, [activeLocation, applyPatch, t]);

  const handleSelectCityForRow = useCallback((row: TvSettingsRow, city: CityCoords) => {
    void applyPatch(row, {
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.city,
      timezone: city.timezone,
    }).then(() => {
      setCitySearchForId(null);
      Alert.alert(t('screens.tvManager.locationUpdatedTitle'), t('screens.tvManager.locationUpdatedBody'));
    });
  }, [applyPatch, t]);

  const handleManualLocationCommit = useCallback((row: TvSettingsRow) => {
    const latDraft = manualLatDrafts[row.id];
    const lngDraft = manualLngDrafts[row.id];
    const lat = parseFloat(latDraft ?? '');
    const lng = parseFloat(lngDraft ?? '');
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert(t('screens.tvManager.invalidCoordsTitle'), t('screens.tvManager.invalidCoordsBody'));
      return;
    }
    void applyPatch(row, { latitude: lat, longitude: lng }).then(() => {
      setManualLocationId(null);
      Alert.alert(t('screens.tvManager.locationUpdatedTitle'), t('screens.tvManager.locationUpdatedBody'));
    });
  }, [manualLatDrafts, manualLngDrafts, applyPatch, t]);

  const handleIqamaOffsetChange = useCallback((row: TvSettingsRow, prayer: keyof IqamaOffsets, delta: number) => {
    const current = row.iqama_offsets ?? DEFAULT_IQAMA_OFFSETS;
    const nextValue = Math.min(MAX_IQAMA_OFFSET, Math.max(MIN_IQAMA_OFFSET, current[prayer] + delta));
    const nextOffsets: IqamaOffsets = { ...current, [prayer]: nextValue };
    void applyPatch(row, { iqama_offsets: nextOffsets });
  }, [applyPatch]);

  const handleDelete = useCallback((row: TvSettingsRow) => {
    Alert.alert(
      t('screens.tvManager.deleteConfirmTitle'),
      t('screens.tvManager.deleteConfirmBody', { name: row.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('screens.tvManager.deleteConfirmAction'),
          style: 'destructive',
          onPress: () => {
            void deleteTvSettings({ id: row.id }).then(() => {
              if (expandedId === row.id) setExpandedId(null);
              refetch();
            });
          },
        },
      ],
    );
  }, [t, deleteTvSettings, refetch, expandedId]);

  // ── Ummat+ gate ────────────────────────────────────────────────────────────
  if (!isPlus) {
    return (
      <View style={styles.container}>
        <View style={styles.upsellCard}>
          <Text style={styles.upsellBadge}>{t('screens.tvManager.upsellBadge')}</Text>
          <Text style={styles.upsellTitle}>{t('screens.tvManager.unlockTitle')}</Text>
          <Text style={styles.upsellDesc}>{t('screens.tvManager.unlockDesc')}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openURL(UPGRADE_URL)}>
            <Text style={styles.primaryButtonText}>{t('common.upgrade')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── 7 UI states ──────────────────────────────────────────────────────────────
  if (fetching && !data) return <SkeletonState rows={4} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const rows = data?.pc_tv_settings ?? [];

  // Per-TV city search — full-screen swap (mirrors TravelScreen's pattern). Callback-only:
  // never writes to the phone's home `location`, only to this TV's pc_tv_settings row.
  if (citySearchForId) {
    const targetRow = rows.find((r) => r.id === citySearchForId);
    if (targetRow) {
      return (
        <CitySearchScreen
          mode="travel"
          onSelectCity={(city) => handleSelectCityForRow(targetRow, city)}
        />
      );
    }
    setCitySearchForId(null);
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t('screens.tvManager.emptyTitle')}
        subtitle={t('screens.tvManager.emptySubtitle')}
        action={t('screens.tvManager.pairACta')}
        onAction={() => router.push('/pair-tv')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {rows.map((row) => {
          const isExpanded = expandedId === row.id;
          const nameDraft = nameDrafts[row.id] ?? row.name;
          return (
            <View key={row.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setExpandedId(isExpanded ? null : row.id)}
                accessibilityRole="button"
                accessibilityLabel={`${row.name}, ${row.city ?? t('screens.tvManager.noCity')}`}
                accessibilityState={{ expanded: isExpanded }}
              >
                <View style={[styles.swatch, { backgroundColor: row.accent_color }]} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardName}>{row.name}</Text>
                  <Text style={styles.cardMeta}>
                    {(row.city ?? t('screens.tvManager.noCity'))} · {t(STREAM_LABEL_KEYS[row.stream_source])}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '︿' : '﹀'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <TvCardBody
                  row={row}
                  nameDraft={nameDraft}
                  onNameDraftChange={(text) => setNameDrafts((prev) => ({ ...prev, [row.id]: text }))}
                  onRenameCommit={() => handleRenameCommit(row)}
                  applyPatch={applyPatch}
                  onUpdateLocation={() => handleUpdateLocation(row)}
                  deepExpanded={deepExpandedId === row.id}
                  onToggleDeepExpanded={() => setDeepExpandedId(deepExpandedId === row.id ? null : row.id)}
                  manualLat={manualLatDrafts[row.id] ?? ''}
                  manualLng={manualLngDrafts[row.id] ?? ''}
                  onManualLatChange={(text) => setManualLatDrafts((prev) => ({ ...prev, [row.id]: text }))}
                  onManualLngChange={(text) => setManualLngDrafts((prev) => ({ ...prev, [row.id]: text }))}
                  onManualLocationCommit={() => handleManualLocationCommit(row)}
                  onIqamaOffsetChange={(prayer, delta) => handleIqamaOffsetChange(row, prayer, delta)}
                  manualEditing={manualLocationId === row.id}
                  onToggleManualEditing={() => setManualLocationId(manualLocationId === row.id ? null : row.id)}
                  onDelete={() => handleDelete(row)}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
