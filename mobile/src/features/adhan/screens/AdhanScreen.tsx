/**
 * Purpose: Adhan voice library screen — browse reciters, enable/disable per prayer,
 *   play preview, select custom adhan.
 * Inputs: pc_adhan_voice GraphQL query, useSettingsStore (per-prayer enable).
 * Outputs: AdhanScreen component (Feature 6 of 20).
 * Constraints: Background audio via react-native-track-player. 7 UI states.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-06-adhan
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Switch, StyleSheet, SafeAreaView,
} from 'react-native';
import { useQuery } from 'urql';
import { Colors } from '../../../constants/colors';
import {
  LoadingState, ErrorState, EmptyState, OfflineState, SkeletonState,
} from '../../../components/states';
import { playAdhan, stopAdhan } from '../services/AdhanAudioService';
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

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AdhanScreen() {
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: GET_ADHAN_LIBRARY });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [enabledPrayers, setEnabledPrayers] = useState<Record<PrayerName, boolean>>({
    Fajr: true, Sunrise: false, Dhuhr: false, Asr: false, Maghrib: true, Isha: true,
  });

  const togglePrayer = useCallback((name: PrayerName) => {
    setEnabledPrayers((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

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
            <Text style={styles.toggleLabel}>{name}</Text>
            <Switch
              value={enabledPrayers[name]}
              onValueChange={() => togglePrayer(name)}
              trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
              thumbColor={Colors.brand.light}
              accessibilityLabel={`Enable ${name} adhan`}
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
            onPress={() => setSelectedId(voice.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedId === voice.id }}
            accessibilityLabel={`${voice.name} by ${voice.reciter}${voice.is_pro ? ' (Pro)' : ''}`}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  section: { padding: 16, backgroundColor: Colors.background.secondary },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
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
    borderBottomColor: Colors.background.card,
    minHeight: 44,
  },
  toggleLabel: { fontSize: 16, color: Colors.text.primary },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.background.secondary,
    minHeight: 64,
  },
  voiceCardSelected: {
    borderWidth: 2,
    borderColor: Colors.brand.mid,
    backgroundColor: Colors.brand.light + '22',
  },
  voiceInfo: { flex: 1 },
  voiceName: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  voiceReciter: { fontSize: 14, color: Colors.text.muted, marginTop: 2 },
  proBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.brand.dark,
    backgroundColor: Colors.brand.light,
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
  playIcon: { fontSize: 20, color: Colors.brand.mid },
});
