/**
 * Purpose: Add/edit form for a masjid mute zone — address search (free,
 *   geocodeAsync), current-location reverse-geocode, manual lat/lng entry,
 *   and radius stepper. Extracted from MasjidMuteScreen to keep both files
 *   under the 300-line cap; behavior is unchanged.
 * Inputs: draft/setDraft (ZoneDraft), manualEntry/setManualEntry, search
 *   state (query/results/searching), handlers passed down from the parent
 *   (handleSearch, handleSelectSearchResult, handleUseCurrentLocation,
 *   adjustRadius, handleSaveZone, closeForm), formError, colors, styles
 *   (shared createStyles(colors) result), t (i18n translate).
 * Outputs: ZoneFormScreen — renders the add/edit modal-in-place form.
 * Constraints: No react-native-maps — location set via search or manual
 *   entry only (see MasjidMuteScreen.tsx header comment for rationale).
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import type { ThemeColors } from '../../constants/colors';
import { MIN_RADIUS_METERS, MAX_RADIUS_METERS } from './store/useMuteStore';
import type { ZoneDraft } from './zoneDraft';
import type { createStyles } from './MasjidMuteScreen.styles';

interface SearchResult {
  label: string;
  latitude: number;
  longitude: number;
}

export interface ZoneFormScreenProps {
  draft: ZoneDraft;
  setDraft: React.Dispatch<React.SetStateAction<ZoneDraft>>;
  manualEntry: boolean;
  setManualEntry: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: SearchResult[];
  searching: boolean;
  handleSearch: () => void;
  handleSelectSearchResult: (result: SearchResult) => void;
  handleUseCurrentLocation: () => void;
  locating: boolean;
  adjustRadius: (delta: number) => void;
  formError: string | null;
  closeForm: () => void;
  handleSaveZone: () => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export default function ZoneFormScreen(props: ZoneFormScreenProps) {
  const {
    draft, setDraft, manualEntry, setManualEntry,
    searchQuery, setSearchQuery, searchResults, searching, handleSearch,
    handleSelectSearchResult, handleUseCurrentLocation, locating,
    adjustRadius, formError, closeForm, handleSaveZone,
    colors, styles, t,
  } = props;

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
