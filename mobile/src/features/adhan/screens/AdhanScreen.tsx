/**
 * Purpose: Adhan voice library screen — browse reciters, enable/disable per prayer,
 *   play preview, select custom adhan.
 * Inputs: pc_adhan_voice GraphQL query, useSettingsStore (adhanVoiceId + per-prayer
 *   enable — persisted via AsyncStorage so PrayerNotificationService can read the
 *   user's choice), useAuthStore (isPlus entitlement gate).
 * Outputs: AdhanScreen component (Feature 6 of 20).
 * Constraints: Background audio via react-native-track-player. 7 UI states.
 *   Pro-locked voices (is_pro && !isPlus) remain previewable but cannot be selected
 *   as the active adhan — selecting shows an Ummat+ upsell (Alert -> /subscription)
 *   instead of persisting the choice.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-06-adhan
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Switch, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'urql';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import {
  LoadingState, ErrorState, EmptyState, OfflineState, SkeletonState,
} from '../../../components/states';
import { playAdhan, stopAdhan } from '../services/AdhanAudioService';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { PrayerName } from '../../../types/prayer';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_ADHAN_LIBRARY = `
  query GetAdhanLibrary {
    pc_adhan_voice(order_by: { is_default: desc, reciter: asc }) {
      id
      name
      reciter
      audio_url
      is_default
      is_pro
    }
  }
`;

interface AdhanVoice {
  id: string;
  name: string;
  reciter: string;
  audio_url: string;
  is_default: boolean;
  is_pro: boolean;
}

// ── Prayer Toggles ────────────────────────────────────────────────────────────

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Translation key per prayer name, `prayer` namespace (render-time only). */
const PRAYER_LABEL_KEYS: Record<PrayerName, string> = {
  Fajr: 'prayer.fajr',
  Sunrise: 'prayer.sunrise',
  Dhuhr: 'prayer.dhuhr',
  Asr: 'prayer.asr',
  Maghrib: 'prayer.maghrib',
  Isha: 'prayer.isha',
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AdhanScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_ADHAN_LIBRARY });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const isPlus = useAuthStore((s) => s.isPlus);
  const selectedId = useSettingsStore((s) => s.adhanVoiceId);
  const setAdhanVoice = useSettingsStore((s) => s.setAdhanVoice);
  const enabledPrayers = useSettingsStore((s) => s.perPrayerAdhanEnabled);
  const setPerPrayerAdhanEnabled = useSettingsStore((s) => s.setPerPrayerAdhanEnabled);

  const togglePrayer = useCallback((name: PrayerName) => {
    setPerPrayerAdhanEnabled(name, !enabledPrayers[name]);
  }, [enabledPrayers, setPerPrayerAdhanEnabled]);

  const handleSelect = useCallback((voice: AdhanVoice) => {
    if (voice.is_pro && !isPlus) {
      Alert.alert(
        'Ummat+ Required',
        `${voice.name} is a Pro adhan voice. Upgrade to Ummat+ to set it as your active adhan.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ],
      );
      return;
    }
    // Persist url+name alongside id so the notification-tap handler can play
    // the chosen voice without a network round-trip.
    setAdhanVoice(voice.id, voice.audio_url, `${voice.name} — ${voice.reciter}`);
  }, [isPlus, setAdhanVoice]);

  const handlePlay = useCallback(async (voice: AdhanVoice) => {
    if (playingId === voice.id) {
      await stopAdhan();
      setPlayingId(null);
      return;
    }
    setPlayingId(voice.id);
    await playAdhan({
      audioUrl: voice.audio_url,
      prayerName: voice.name,
      reciterName: voice.reciter,
    });
  }, [playingId]);

  // ── 7 UI States ──────────────────────────────────────────────────────────────
  if (fetching && !data) return <SkeletonState rows={6} />;
  if (error) return <ErrorState error={error} onRetry={() => reexecuteQuery({ requestPolicy: 'network-only' })} />;
  if (!data?.pc_adhan_voice?.length) {
    return <EmptyState message="No adhan voices available." />;
  }

  const voices: AdhanVoice[] = data.pc_adhan_voice;

  return (
    <SafeAreaView style={styles.container}>
      {/* Per-prayer enable toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Enable Adhan Per Prayer</Text>
        {PRAYER_NAMES.map((name) => (
          <View key={name} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t(PRAYER_LABEL_KEYS[name])}</Text>
            <Switch
              value={enabledPrayers[name]}
              onValueChange={() => togglePrayer(name)}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={`Enable ${t(PRAYER_LABEL_KEYS[name])} adhan`}
            />
          </View>
        ))}
      </View>

      {/* Voice library */}
      <Text style={styles.sectionTitle} accessibilityRole="header">Adhan Library</Text>
      <FlatList
        data={voices}
        keyExtractor={(v) => v.id}
        renderItem={({ item: voice }) => (
          <TouchableOpacity
            style={[styles.voiceCard, selectedId === voice.id && styles.voiceCardSelected]}
            onPress={() => handleSelect(voice)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedId === voice.id }}
            accessibilityLabel={`${voice.name} by ${voice.reciter}${voice.is_pro ? ' (Pro, upgrade required to select)' : ''}`}
          >
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceName}>{voice.name}</Text>
              <Text style={styles.voiceReciter}>{voice.reciter}</Text>
              {voice.is_pro && (
                <Text style={styles.proBadge} accessibilityLabel="Pro feature">PRO</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handlePlay(voice)}
              style={styles.playButton}
              accessibilityRole="button"
              accessibilityLabel={playingId === voice.id ? 'Stop preview' : 'Play preview'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.playIcon}>{playingId === voice.id ? '■' : '▶'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        accessible
        accessibilityLabel="Adhan voice list"
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  section: { padding: 16, backgroundColor: colors.background.secondary },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 44,
  },
  toggleLabel: { fontSize: 16, color: colors.text.primary },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    minHeight: 64,
  },
  voiceCardSelected: {
    borderWidth: 2,
    borderColor: colors.brand.mid,
    backgroundColor: colors.brand.light + '22',
  },
  voiceInfo: { flex: 1 },
  voiceName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  voiceReciter: { fontSize: 14, color: colors.text.muted, marginTop: 2 },
  proBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.dark,
    backgroundColor: colors.brand.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 20, color: colors.brand.mid },
});
