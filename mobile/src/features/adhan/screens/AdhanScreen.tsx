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
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import type { ThemeColors } from '../../../constants/colors';
import {
  ErrorState, EmptyState, SkeletonState,
} from '../../../components/states';
import { playAdhan, stopAdhan } from '../services/AdhanAudioService';
import { useSettingsStore } from '../../settings/store/useSettingsStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { schedulePrayerNotifications } from '../../../lib/notifications/PrayerNotificationService';
import { PRAYER_LABEL_KEYS, NOTIFIABLE_PRAYERS as PRAYER_NAMES } from '../../../constants/prayers';
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

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AdhanScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_ADHAN_LIBRARY });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const isPlus = useAuthStore((s) => s.isPlus);
  const selectedId = useSettingsStore((s) => s.adhanVoiceId);
  const setAdhanVoice = useSettingsStore((s) => s.setAdhanVoice);
  const enabledPrayers = useSettingsStore((s) => s.perPrayerAdhanEnabled);
  const setPerPrayerAdhanEnabled = useSettingsStore((s) => s.setPerPrayerAdhanEnabled);

  /** Reschedule notifications after a change that affects the baked-in sound/channel (guarded, fire-and-forget). */
  function rescheduleIfEnabled() {
    if (useSettingsStore.getState().notificationsEnabled) {
      void schedulePrayerNotifications().catch(() => undefined);
    }
  }

  const togglePrayer = useCallback((name: PrayerName) => {
    setPerPrayerAdhanEnabled(name, !enabledPrayers[name]);
    rescheduleIfEnabled();
  }, [enabledPrayers, setPerPrayerAdhanEnabled]);

  const handleSelect = useCallback((voice: AdhanVoice) => {
    if (voice.is_pro && !isPlus) {
      Alert.alert(
        t('screens.adhan.proRequiredTitle'),
        t('screens.adhan.proRequiredBody', { name: voice.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.upgrade'), onPress: () => router.push('/subscription') },
        ],
      );
      return;
    }
    // Persist url+name alongside id so the notification-tap handler can play
    // the chosen voice without a network round-trip.
    setAdhanVoice(voice.id, voice.audio_url, `${voice.name} — ${voice.reciter}`);
    rescheduleIfEnabled();
  }, [isPlus, setAdhanVoice, t]);

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
    return <EmptyState message={t('screens.adhan.noVoices')} />;
  }

  const voices: AdhanVoice[] = data.pc_adhan_voice;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}>
        {/* Per-prayer enable toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.adhan.enablePerPrayer')}</Text>
          {PRAYER_NAMES.map((name) => (
            <View key={name} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{t(PRAYER_LABEL_KEYS[name])}</Text>
              <Switch
                value={enabledPrayers[name]}
                onValueChange={() => togglePrayer(name)}
                trackColor={{ false: colors.background.card, true: colors.brand.mid }}
                thumbColor={colors.brand.light}
                accessibilityLabel={t('screens.adhan.enableAccessibilityLabel', { prayer: t(PRAYER_LABEL_KEYS[name]) })}
              />
            </View>
          ))}
        </View>

        {/* Voice library */}
        <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.adhan.library')}</Text>
        <FlatList
          data={voices}
          keyExtractor={(v) => v.id}
          renderItem={({ item: voice }) => (
            <TouchableOpacity
              style={[styles.voiceCard, selectedId === voice.id && styles.voiceCardSelected]}
              onPress={() => handleSelect(voice)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedId === voice.id }}
              accessibilityLabel={voice.is_pro
                ? t('screens.adhan.voiceAccessibilityLabelPro', { name: voice.name, reciter: voice.reciter })
                : t('screens.adhan.voiceAccessibilityLabel', { name: voice.name, reciter: voice.reciter })}
            >
              <View style={styles.voiceInfo}>
                <Text style={styles.voiceName}>{voice.name}</Text>
                <Text style={styles.voiceReciter}>{voice.reciter}</Text>
                {voice.is_pro && (
                  <Text style={styles.proBadge} accessibilityLabel={t('screens.adhan.proFeature')}>PRO</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handlePlay(voice)}
                style={styles.playButton}
                accessibilityRole="button"
                accessibilityLabel={playingId === voice.id ? t('screens.adhan.stopPreview') : t('screens.adhan.playPreview')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.playIcon}>{playingId === voice.id ? '■' : '▶'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          accessible
          accessibilityLabel={t('screens.adhan.voiceListLabel')}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1 },
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
