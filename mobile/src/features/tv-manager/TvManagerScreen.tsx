/**
 * Purpose: "My TVs" management screen — lists every pc_tv_settings row owned by the
 *   signed-in user (paired PrayCalc TV displays) and lets them rename, recolor, change
 *   stream source, adjust rotation, toggle weather, refresh location, or unpair each one.
 * Inputs: urql query of pc_tv_settings (own rows only, per Hasura user-role select
 *   permission), useActiveLocation (settings store) for the "update to my current
 *   location" action, useAuthStore.isPlus for the Ummat+ gate.
 * Outputs: TvManagerScreen component, routed at /tvs.
 * Constraints: Ummat+ gated — TV pairing/management is a paid feature (matches the
 *   /pair-tv gate). Mutations refetch on completion rather than optimistic cache
 *   updates (acceptable latency for a settings-style screen). Location refresh here
 *   only updates the pc_tv_settings row — the TV itself only re-reads location during
 *   a fresh pairing handshake, so the hint text is explicit that a location change
 *   here does not push live to an already-paired TV until it re-pairs.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-tv-manager
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from 'urql';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import {
  LoadingState, ErrorState, EmptyState, SkeletonState,
} from '../../components/states';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useActiveLocation } from '../settings/store/useSettingsStore';

const UPGRADE_URL = 'https://praycalc.com/upgrade';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_TV_SETTINGS = `
  query GetTvSettings {
    pc_tv_settings(order_by: { created_at: asc }) {
      id
      device_id
      name
      accent_color
      stream_source
      rotate_minutes
      show_weather
      latitude
      longitude
      city
      timezone
      created_at
      updated_at
    }
  }
`;

const UPDATE_TV_SETTINGS = `
  mutation UpdateTvSettings($id: uuid!, $changes: pc_tv_settings_set_input!) {
    update_pc_tv_settings_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
    }
  }
`;

const DELETE_TV_SETTINGS = `
  mutation DeleteTvSettings($id: uuid!) {
    delete_pc_tv_settings_by_pk(id: $id) {
      id
    }
  }
`;

export type StreamSource = 'makkah-tv' | 'saudi-quran' | 'medina';

export interface TvSettingsRow {
  id: string;
  device_id: string;
  name: string;
  accent_color: string;
  stream_source: StreamSource;
  rotate_minutes: number;
  show_weather: boolean;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

interface TvSettingsPatch {
  name?: string;
  accent_color?: string;
  stream_source?: StreamSource;
  rotate_minutes?: number;
  show_weather?: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  timezone?: string;
}

const ACCENT_SWATCHES = ['#79C24C', '#C9F27A', '#4A9FD8', '#D8A24A', '#B981D9', '#FFFFFF'];
const STREAM_SOURCES: StreamSource[] = ['makkah-tv', 'saudi-quran', 'medina'];
const MIN_ROTATE_MINUTES = 1;
const MAX_ROTATE_MINUTES = 30;

const STREAM_LABEL_KEYS: Record<StreamSource, string> = {
  'makkah-tv': 'screens.tvManager.streamMakkah',
  'saudi-quran': 'screens.tvManager.streamSaudiQuran',
  medina: 'screens.tvManager.streamMedina',
};

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
                <View style={styles.cardBody}>
                  {/* Rename */}
                  <Text style={styles.fieldLabel}>{t('screens.tvManager.nameLabel')}</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={nameDraft}
                    onChangeText={(text) => setNameDrafts((prev) => ({ ...prev, [row.id]: text }))}
                    onBlur={() => handleRenameCommit(row)}
                    onSubmitEditing={() => handleRenameCommit(row)}
                    placeholderTextColor={colors.text.muted}
                    accessibilityLabel={t('screens.tvManager.nameLabel')}
                  />

                  {/* Accent color */}
                  <Text style={styles.fieldLabel}>{t('screens.tvManager.colorLabel')}</Text>
                  <View style={styles.swatchRow}>
                    {ACCENT_SWATCHES.map((hex) => (
                      <TouchableOpacity
                        key={hex}
                        style={[
                          styles.swatchOption,
                          { backgroundColor: hex },
                          row.accent_color === hex && styles.swatchOptionSelected,
                        ]}
                        onPress={() => applyPatch(row, { accent_color: hex })}
                        accessibilityRole="radio"
                        accessibilityLabel={`Accent color ${hex}`}
                        accessibilityState={{ selected: row.accent_color === hex }}
                      />
                    ))}
                  </View>

                  {/* Stream source */}
                  <Text style={styles.fieldLabel}>{t('screens.tvManager.streamLabel')}</Text>
                  <View style={styles.optionRow}>
                    {STREAM_SOURCES.map((source) => (
                      <TouchableOpacity
                        key={source}
                        style={[styles.optionChip, row.stream_source === source && styles.optionChipSelected]}
                        onPress={() => applyPatch(row, { stream_source: source })}
                        accessibilityRole="radio"
                        accessibilityLabel={t(STREAM_LABEL_KEYS[source])}
                        accessibilityState={{ selected: row.stream_source === source }}
                      >
                        <Text style={[styles.optionChipText, row.stream_source === source && styles.optionChipTextSelected]}>
                          {t(STREAM_LABEL_KEYS[source])}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Rotation minutes stepper */}
                  <View style={styles.row}>
                    <Text style={styles.fieldLabel}>{t('screens.tvManager.rotateLabel')}</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepperButton}
                        onPress={() => applyPatch(row, {
                          rotate_minutes: Math.max(MIN_ROTATE_MINUTES, row.rotate_minutes - 1),
                        })}
                        accessibilityLabel={t('screens.tvManager.decreaseRotate')}
                      >
                        <Text style={styles.stepperButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{row.rotate_minutes} min</Text>
                      <TouchableOpacity
                        style={styles.stepperButton}
                        onPress={() => applyPatch(row, {
                          rotate_minutes: Math.min(MAX_ROTATE_MINUTES, row.rotate_minutes + 1),
                        })}
                        accessibilityLabel={t('screens.tvManager.increaseRotate')}
                      >
                        <Text style={styles.stepperButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Weather toggle */}
                  <View style={styles.row}>
                    <Text style={styles.fieldLabel}>{t('screens.tvManager.weatherLabel')}</Text>
                    <Switch
                      value={row.show_weather}
                      onValueChange={(value) => applyPatch(row, { show_weather: value })}
                      trackColor={{ false: colors.background.card, true: colors.brand.mid }}
                      thumbColor={colors.brand.light}
                      accessibilityLabel={t('screens.tvManager.weatherLabel')}
                    />
                  </View>

                  {/* Location refresh */}
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => handleUpdateLocation(row)}
                    accessibilityRole="button"
                    accessibilityLabel={t('screens.tvManager.updateLocationAction')}
                  >
                    <Text style={styles.secondaryButtonText}>{t('screens.tvManager.updateLocationAction')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.hint}>{t('screens.tvManager.updateLocationHint')}</Text>

                  {/* Delete */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(row)}
                    accessibilityRole="button"
                    accessibilityLabel={t('screens.tvManager.deleteAction')}
                  >
                    <Text style={styles.deleteButtonText}>{t('screens.tvManager.deleteAction')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    minHeight: 64,
  },
  swatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#00000022' },
  cardHeaderText: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  cardMeta: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  chevron: { fontSize: 16, color: colors.text.muted },
  cardBody: { padding: 16, paddingTop: 0, gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text.muted, marginTop: 8 },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.background.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    minHeight: 44,
  },
  swatchRow: { flexDirection: 'row', gap: 10 },
  swatchOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchOptionSelected: { borderColor: colors.brand.dark },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    minHeight: 36,
    justifyContent: 'center',
  },
  optionChipSelected: { backgroundColor: colors.brand.mid },
  optionChipText: { fontSize: 13, color: colors.brand.dark, fontWeight: '600' },
  optionChipTextSelected: { color: colors.text.inverse },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { fontSize: 18, fontWeight: '700', color: colors.brand.dark, lineHeight: 20 },
  stepperValue: { fontSize: 14, color: colors.text.primary, minWidth: 56, textAlign: 'center', fontVariant: ['tabular-nums'] },
  secondaryButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '600', color: colors.brand.dark },
  hint: { fontSize: 12, color: colors.text.muted, fontStyle: 'italic', marginTop: 4, lineHeight: 18 },
  deleteButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteButtonText: { fontSize: 14, fontWeight: '600', color: colors.state.error },
  upsellCard: { gap: 12, alignItems: 'center', padding: 8 },
  upsellBadge: {
    backgroundColor: colors.brand.mid,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upsellTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  upsellDesc: { fontSize: 14, color: colors.text.muted, textAlign: 'center', lineHeight: 20 },
  primaryButton: {
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.text.inverse, fontWeight: '700', fontSize: 16 },
});
