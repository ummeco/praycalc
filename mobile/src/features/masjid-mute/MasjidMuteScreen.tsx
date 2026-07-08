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
 *   Render logic is split across MasjidMuteScreen.styles.ts (shared StyleSheet),
 *   zoneDraft.ts (form draft type/helpers), ZoneFormScreen.tsx (add/edit form),
 *   and ZoneListRow.tsx (list row) — all in this same directory.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-masjid-mute
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EmptyState } from '../../components/states';
import {
  useMuteStore,
  clampRadius,
  type MuteZone,
} from './store/useMuteStore';
import { useGeofenceSync } from './hooks/useGeofenceSync';
import { requestGeofencePermissions } from './lib/geofenceTask';
import { createStyles } from './MasjidMuteScreen.styles';
import { emptyDraft, draftFromZone, type ZoneDraft } from './zoneDraft';
import ZoneFormScreen from './ZoneFormScreen';
import ZoneListRow from './ZoneListRow';
import ZoneListHeader from './ZoneListHeader';

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
      <ZoneFormScreen
        draft={draft}
        setDraft={setDraft}
        manualEntry={manualEntry}
        setManualEntry={setManualEntry}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        searching={searching}
        handleSearch={() => void handleSearch()}
        handleSelectSearchResult={handleSelectSearchResult}
        handleUseCurrentLocation={() => void handleUseCurrentLocation()}
        locating={locating}
        adjustRadius={adjustRadius}
        formError={formError}
        closeForm={closeForm}
        handleSaveZone={handleSaveZone}
        colors={colors}
        styles={styles}
        t={t}
      />
    );
  }

  // ── Render: main list ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={zones}
        keyExtractor={(z) => z.id}
        ListHeaderComponent={
          <ZoneListHeader
            autoMuteEnabled={autoMuteEnabled}
            permissionDenied={permissionDenied}
            hasZones={zones.length > 0}
            onMasterToggle={(v) => void handleMasterToggle(v)}
            onAddZone={openAddForm}
            colors={colors}
            styles={styles}
            t={t}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('screens.masjidMute.emptyTitle')}
            subtitle={t('screens.masjidMute.emptySubtitle')}
            action={t('screens.masjidMute.addZoneAction')}
            onAction={openAddForm}
          />
        }
        renderItem={({ item }) => (
          <ZoneListRow
            zone={item}
            isActive={activeZoneIds.includes(item.id)}
            onEdit={openEditForm}
            onDelete={handleDeleteZone}
            styles={styles}
            t={t}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}
