/**
 * Purpose: Masjid Auto-Mute — user-defined geofenced mute zones. PrayCalc has no
 *   masjid database (that's the future Ummat app), so the user manually adds their
 *   own zones (recommended: their local masjid) with a label, coordinates, and
 *   radius. While auto-mute is on, entering a zone silences the phone (Android:
 *   real ringer-mode change, restored on exit; iOS: Apple forbids programmatic
 *   mute, so a reminder notification fires instead — see geofenceTask.ts).
 * Inputs: useMuteStore (zones, autoMuteEnabled), expo-location (geocode/reverse-
 *   geocode/current position + background permission), useGeofenceSync (keeps OS
 *   registration in sync with store changes).
 * Outputs: MasjidMuteScreen — free feature (no Ummat+ gate: this is core prayer
 *   etiquette, not premium).
 * Constraints: No react-native-maps dependency (would require native prebuild +
 *   Google Maps API key provisioning, out of scope) — zone location is set via
 *   address search (Location.geocodeAsync, free, no API key) or current-location
 *   reverse-geocode, with manual lat/lng entry as a fallback. A visual map-picker
 *   is a documented follow-up (see mapPickerFollowUp copy). 7 UI states: loading
 *   (geocoding/locating), error, empty (no zones), permission-denied (background
 *   location refused — zones still save, note shown), populated list, add/edit
 *   modal-in-place form, delete-confirm (native Alert).
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-masjid-mute
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { EmptyState } from '../../components/states';
import {
  useMuteStore,
  clampRadius,
  MIN_RADIUS_METERS,
  MAX_RADIUS_METERS,
  DEFAULT_RADIUS_METERS,
  type MuteZone,
} from './store/useMuteStore';
import { useGeofenceSync } from './hooks/useGeofenceSync';
import { requestGeofencePermissions } from './lib/geofenceTask';

/** In-progress zone form state (draft), used for both add and edit flows. */
interface ZoneDraft {
  id: string | null; // null = new zone
  label: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
}

function emptyDraft(): ZoneDraft {
  return { id: null, label: '', latitude: '', longitude: '', radiusMeters: DEFAULT_RADIUS_METERS };
}

function draftFromZone(zone: MuteZone): ZoneDraft {
  return {
    id: zone.id,
    label: zone.label,
    latitude: String(zone.latitude),
    longitude: String(zone.longitude),
    radiusMeters: zone.radiusMeters,
  };
}

export default function MasjidMuteScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const zones = useMuteStore((s) => s.zones);
  const autoMuteEnabled = useMuteStore((s) => s.autoMuteEnabled);
  const activeZoneIds = useMuteStore((s) => s.activeZoneIds);
  const addZone = useMuteStore((s) => s.addZone);
  const updateZone = useMuteStore((s) => s.updateZone);
  const removeZone = useMuteStore((s) => s.removeZone);
  const setAutoMuteEnabled = useMuteStore((s) => s.setAutoMuteEnabled);

  // Keeps expo-location geofence registration in sync with the store.
  useGeofenceSync();

  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ZoneDraft>(emptyDraft());
  const [manualEntry, setManualEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; latitude: number; longitude: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const openAddForm = useCallback(() => {
    setDraft(emptyDraft());
    setManualEntry(false);
    setSearchQuery('');
    setSearchResults([]);
    setFormError(null);
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((zone: MuteZone) => {
    setDraft(draftFromZone(zone));
    setManualEntry(true);
    setSearchQuery('');
    setSearchResults([]);
    setFormError(null);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleMasterToggle = useCallback(async (enabled: boolean) => {
    setAutoMuteEnabled(enabled);
    if (enabled) {
      const granted = await requestGeofencePermissions();
      setPermissionDenied(!granted);
    }
  }, [setAutoMuteEnabled]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 3) return;
    setSearching(true);
    setFormError(null);
    try {
      const results = await Location.geocodeAsync(searchQuery.trim());
      if (results.length === 0) {
        setSearchResults([]);
        setFormError(t('screens.masjidMute.searchNoResults'));
        return;
      }
      setSearchResults(
        results.slice(0, 5).map((r) => ({
          label: searchQuery.trim(),
          latitude: r.latitude,
          longitude: r.longitude,
        })),
      );
    } catch {
      setFormError(t('screens.masjidMute.searchNoResults'));
    } finally {
      setSearching(false);
    }
  }, [searchQuery, t]);

  const handleSelectSearchResult = useCallback((result: { label: string; latitude: number; longitude: number }) => {
    setDraft((d) => ({
      ...d,
      label: d.label || result.label,
      latitude: String(result.latitude),
      longitude: String(result.longitude),
    }));
    setSearchResults([]);
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    setLocating(true);
    setFormError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFormError(t('screens.masjidMute.locationFailed'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let label = '';
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        label = geo?.name ?? geo?.street ?? geo?.city ?? '';
      } catch {
        // Reverse geocode is a nicety for pre-filling the label — never block on it.
      }
      setDraft((d) => ({
        ...d,
        label: d.label || label,
        latitude: String(loc.coords.latitude),
        longitude: String(loc.coords.longitude),
      }));
    } catch {
      setFormError(t('screens.masjidMute.locationFailed'));
    } finally {
      setLocating(false);
    }
  }, [t]);

  const handleSaveZone = useCallback(() => {
    const label = draft.label.trim();
    if (!label) {
      setFormError(t('screens.masjidMute.labelRequired'));
      return;
    }
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      setFormError(t('screens.masjidMute.coordinatesInvalid'));
      return;
    }

    const radiusMeters = clampRadius(draft.radiusMeters);
    if (draft.id) {
      updateZone(draft.id, { label, latitude, longitude, radiusMeters });
    } else {
      addZone({ label, latitude, longitude, radiusMeters });
    }
    setShowForm(false);
  }, [draft, addZone, updateZone, t]);

  const handleDeleteZone = useCallback((zone: MuteZone) => {
    Alert.alert(
      t('screens.masjidMute.deleteConfirmTitle'),
      t('screens.masjidMute.deleteConfirmBody', { label: zone.label }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('screens.masjidMute.deleteZone'), style: 'destructive', onPress: () => removeZone(zone.id) },
      ],
    );
  }, [removeZone, t]);

  const adjustRadius = useCallback((delta: number) => {
    setDraft((d) => ({ ...d, radiusMeters: clampRadius(d.radiusMeters + delta) }));
  }, []);

  // ── Render: add/edit form ───────────────────────────────────────────────────

  if (showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.formScroll}>
          <Text style={styles.formTitle} accessibilityRole="header">
            {draft.id ? t('screens.masjidMute.editZoneTitle') : t('screens.masjidMute.addZoneTitle')}
          </Text>

          <Text style={styles.fieldLabel}>{t('screens.masjidMute.labelFieldLabel')}</Text>
          <TextInput
            style={styles.input}
            value={draft.label}
            onChangeText={(label) => setDraft((d) => ({ ...d, label }))}
            placeholder={t('screens.masjidMute.labelFieldPlaceholder')}
            placeholderTextColor={colors.text.muted}
            accessibilityLabel={t('screens.masjidMute.labelFieldLabel')}
          />

          {!manualEntry && (
            <>
              <Text style={styles.fieldLabel}>{t('screens.masjidMute.searchAddressLabel')}</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.input, styles.searchInput]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('screens.masjidMute.searchAddressPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  accessibilityLabel={t('screens.masjidMute.searchAddressLabel')}
                />
                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={handleSearch}
                  disabled={searching}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.search')}
                >
                  <Text style={styles.searchBtnText}>{searching ? '…' : t('common.search')}</Text>
                </TouchableOpacity>
              </View>

              {searchResults.map((result, i) => (
                <TouchableOpacity
                  key={`${result.latitude}-${result.longitude}-${i}`}
                  style={styles.resultRow}
                  onPress={() => handleSelectSearchResult(result)}
                  accessibilityRole="button"
                >
                  <Text style={styles.resultText}>
                    {result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.currentLocationBtn}
                onPress={handleUseCurrentLocation}
                disabled={locating}
                accessibilityRole="button"
                accessibilityLabel={t('screens.masjidMute.useCurrentLocation')}
              >
                <Text style={styles.currentLocationText}>
                  {locating ? t('screens.masjidMute.locating') : `📍 ${t('screens.masjidMute.useCurrentLocation')}`}
                </Text>
              </TouchableOpacity>

              <Text style={styles.mapFollowUpNote}>{t('screens.masjidMute.mapPickerFollowUp')}</Text>
            </>
          )}

          <TouchableOpacity
            style={styles.manualToggleRow}
            onPress={() => setManualEntry((m) => !m)}
            accessibilityRole="button"
          >
            <Text style={styles.manualToggleText}>
              {manualEntry ? `‹ ${t('screens.masjidMute.searchAddressLabel')}` : t('screens.masjidMute.manualEntryToggle')}
            </Text>
          </TouchableOpacity>

          {manualEntry && (
            <View style={styles.manualRow}>
              <View style={styles.manualCol}>
                <Text style={styles.fieldLabel}>{t('screens.masjidMute.latitudeLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={draft.latitude}
                  onChangeText={(latitude) => setDraft((d) => ({ ...d, latitude }))}
                  keyboardType="numbers-and-punctuation"
                  placeholder="21.4225"
                  placeholderTextColor={colors.text.muted}
                  accessibilityLabel={t('screens.masjidMute.latitudeLabel')}
                />
              </View>
              <View style={styles.manualCol}>
                <Text style={styles.fieldLabel}>{t('screens.masjidMute.longitudeLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={draft.longitude}
                  onChangeText={(longitude) => setDraft((d) => ({ ...d, longitude }))}
                  keyboardType="numbers-and-punctuation"
                  placeholder="39.8262"
                  placeholderTextColor={colors.text.muted}
                  accessibilityLabel={t('screens.masjidMute.longitudeLabel')}
                />
              </View>
            </View>
          )}

          <Text style={styles.fieldLabel}>{t('screens.masjidMute.radiusLabel', { radius: draft.radiusMeters })}</Text>
          <View style={styles.radiusRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustRadius(-25)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.masjidMute.decreaseRadiusAccessibilityLabel')}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.radiusValue}>{draft.radiusMeters} m</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustRadius(25)}
              accessibilityRole="button"
              accessibilityLabel={t('screens.masjidMute.increaseRadiusAccessibilityLabel')}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.radiusHint}>
            {t('screens.masjidMute.radiusHint', { min: MIN_RADIUS_METERS, max: MAX_RADIUS_METERS })}
          </Text>

          {formError && <Text style={styles.errorText}>{formError}</Text>}

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formBtn, styles.formBtnSecondary]}
              onPress={closeForm}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <Text style={styles.formBtnSecondaryText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formBtn, styles.formBtnPrimary]}
              onPress={handleSaveZone}
              accessibilityRole="button"
              accessibilityLabel={t('screens.masjidMute.saveZone')}
            >
              <Text style={styles.formBtnPrimaryText}>{t('screens.masjidMute.saveZone')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Render: main list ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={zones}
        keyExtractor={(z) => z.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.intro}>{t('screens.masjidMute.intro')}</Text>

            <View style={styles.masterCard}>
              <View style={styles.masterLeft}>
                <Text style={styles.masterLabel}>{t('screens.masjidMute.masterToggleLabel')}</Text>
                <Text style={styles.masterSub}>{t('screens.masjidMute.masterToggleSubtitle')}</Text>
              </View>
              <Switch
                value={autoMuteEnabled}
                onValueChange={(v) => void handleMasterToggle(v)}
                trackColor={{ false: colors.background.card, true: colors.brand.mid }}
                thumbColor={colors.brand.light}
                accessibilityLabel={t('screens.masjidMute.masterToggleLabel')}
              />
            </View>

            {permissionDenied && (
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{t('screens.masjidMute.permissionDeniedNote')}</Text>
              </View>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                {Platform.OS === 'android' ? t('screens.masjidMute.androidNote') : t('screens.masjidMute.iosNote')}
              </Text>
            </View>

            {zones.length > 0 && (
              <View style={styles.zonesHeadingRow}>
                <Text style={styles.zonesHeading} accessibilityRole="header">{t('screens.masjidMute.zonesHeading')}</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={openAddForm}
                  accessibilityRole="button"
                  accessibilityLabel={t('screens.masjidMute.addZoneButton')}
                >
                  <Text style={styles.addBtnText}>+ {t('screens.masjidMute.addZoneButton')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('screens.masjidMute.emptyTitle')}
            subtitle={t('screens.masjidMute.emptySubtitle')}
            action={t('screens.masjidMute.addZoneAction')}
            onAction={openAddForm}
          />
        }
        renderItem={({ item }) => {
          const isActive = activeZoneIds.includes(item.id);
          return (
            <View style={styles.zoneRow} accessible accessibilityLabel={`${item.label}, ${item.radiusMeters} meter radius`}>
              <TouchableOpacity style={styles.zoneInfo} onPress={() => openEditForm(item)} accessibilityRole="button">
                <Text style={styles.zoneLabel}>{item.label}</Text>
                <Text style={styles.zoneSub}>{t('screens.masjidMute.radiusValue', { radius: item.radiusMeters })}</Text>
                {isActive && <Text style={styles.zoneActive}>{t('screens.masjidMute.activeNow')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteZone(item)}
                accessibilityRole="button"
                accessibilityLabel={`${t('screens.masjidMute.deleteZone')} ${item.label}`}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  intro: { fontSize: 14, color: colors.text.secondary, lineHeight: 20, marginBottom: 16 },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
  },
  masterLeft: { flex: 1, marginRight: 12 },
  masterLabel: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  masterSub: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  infoCard: {
    backgroundColor: colors.background.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },
  zonesHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  zonesHeading: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.brand.mid,
    minHeight: 36,
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: colors.text.inverse },
  zoneRow: {
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
  zoneInfo: { flex: 1 },
  zoneLabel: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  zoneSub: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  zoneActive: { fontSize: 12, color: colors.state.success, fontWeight: '700', marginTop: 4 },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
  },
  deleteBtnText: { fontSize: 16, color: colors.state.error, fontWeight: '700' },

  // Form styles
  formScroll: { padding: 16, paddingBottom: 48, gap: 4 },
  formTitle: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.card,
    minHeight: 44,
  },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchInput: { flex: 1 },
  searchBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.brand.mid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: colors.text.inverse, fontWeight: '700', fontSize: 14 },
  resultRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.background.card,
    borderRadius: 8,
    marginTop: 6,
  },
  resultText: { fontSize: 14, color: colors.text.primary },
  currentLocationBtn: { marginTop: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  currentLocationText: { fontSize: 14, color: colors.brand.dark, fontWeight: '600' },
  mapFollowUpNote: { fontSize: 11, color: colors.text.muted, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  manualToggleRow: { marginTop: 16, alignItems: 'center', minHeight: 32, justifyContent: 'center' },
  manualToggleText: { fontSize: 13, color: colors.brand.dark, fontWeight: '600' },
  manualRow: { flexDirection: 'row', gap: 12 },
  manualCol: { flex: 1 },
  radiusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 4 },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  radiusValue: { fontSize: 20, fontWeight: '700', color: colors.text.primary, minWidth: 80, textAlign: 'center' },
  radiusHint: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 8 },
  errorText: { fontSize: 13, color: colors.state.error, marginTop: 12, textAlign: 'center' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  formBtn: { flex: 1, minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  formBtnPrimary: { backgroundColor: colors.brand.mid },
  formBtnPrimaryText: { color: colors.text.inverse, fontWeight: '700', fontSize: 16 },
  formBtnSecondary: { backgroundColor: colors.background.card },
  formBtnSecondaryText: { color: colors.text.primary, fontWeight: '600', fontSize: 16 },
});
