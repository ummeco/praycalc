/**
 * Purpose: Screen 4 — Hadith of the Day: large text; touch-free; day-seeded rotation
 * Inputs: pc_hadith via urql (live, public role); bundled cited fallback for offline/error
 * Outputs: Full-screen Hadith display with Arabic RTL text (tashkeel preserved), source citation
 * Constraints: Arabic text must be RTL; tashkeel (diacritics) preserved; cite narrator chain + collection.
 *   DATA PATH: live query. pc_hadith now exists in production (Wave-1 gap closure W1.3,
 *   2026-07-07 — 3 rows seeded, public role select, verified live against
 *   api.praycalc.com). The day-seeded rotation index is applied client-side over whichever
 *   list is in play (live or fallback), so "hadith of the day" stays deterministic per
 *   calendar day either way. On fetch failure or empty result, falls back to the same
 *   small bundled+cited collection this screen shipped with.
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from 'urql';
import { RootStackParamList, HadithEntry } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';
import { GET_HADITH_LIST } from '../lib/graphql/queries';

type HadithNavProp = StackNavigationProp<RootStackParamList, 'HadithOfDay'>;

interface PcHadithRow {
  id: string;
  text_ar: string;
  text_en: string;
  narrator: string;
  source: string;
  grading: string;
}

function toHadithEntry(row: PcHadithRow): HadithEntry {
  return {
    id: row.id,
    textAr: row.text_ar,
    textEn: row.text_en,
    source: row.source,
    narrator: row.narrator.startsWith('Narrated by') ? row.narrator : `Narrated by ${row.narrator}`,
    grading: row.grading,
  };
}

// Offline/error fallback — same small bundled+cited collection this screen shipped
// with before pc_hadith existed (Sahih al-Bukhari / Sahih Muslim only, per the theology gate).
export const FALLBACK_HADITH: HadithEntry[] = [
  {
    id: 'hadith-01',
    textAr: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    textEn:
      'Actions are judged only by intentions, and every person will get what they intended.',
    source: 'Sahih al-Bukhari 1; Sahih Muslim 1907',
    narrator: 'Narrated by ʿUmar ibn al-Khaṭṭāb (رضي الله عنه)',
    grading: 'Sahih (Authentic)',
  },
  {
    id: 'hadith-02',
    textAr: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    textEn:
      'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    source: 'Sahih al-Bukhari 6018; Sahih Muslim 47',
    narrator: 'Narrated by Abu Hurayrah (رضي الله عنه)',
    grading: 'Sahih (Authentic)',
  },
  {
    id: 'hadith-03',
    textAr: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    textEn: 'Cleanliness is half of faith.',
    source: 'Sahih Muslim 223',
    narrator: 'Narrated by Abu Malik al-Ashʿari (رضي الله عنه)',
    grading: 'Sahih (Authentic)',
  },
];

/** Day-seeded index so the displayed Hadith rotates once per 24h without a server. */
export function pickDailyHadith(list: HadithEntry[]): HadithEntry {
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return list[daySeed % list.length];
}

export default function HadithOfDayScreen(): React.JSX.Element {
  const navigation = useNavigation<HadithNavProp>();
  const backRef = useRef<TouchableHighlight>(null);

  const [{ data, fetching, error }] = useQuery<{ pc_hadith: PcHadithRow[] }>({
    query: GET_HADITH_LIST,
  });

  const liveHadith = data?.pc_hadith?.map(toHadithEntry) ?? [];
  const list = liveHadith.length > 0 ? liveHadith : FALLBACK_HADITH;
  const usingFallback = liveHadith.length === 0;
  const hadith = pickDailyHadith(list);

  if (fetching && !data) {
    return (
      <TvScreenWrapper title="Hadith of the Day" onBack={() => navigation.goBack()}>
        <View style={styles.centerState}>
          <ActivityIndicator color="#C9F27A" size="large" />
        </View>
      </TvScreenWrapper>
    );
  }

  return (
    <TvScreenWrapper title="Hadith of the Day" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.root}>
          {(error || usingFallback) && (
            <Text style={styles.offlineNotice}>
              {error ? 'Offline — showing bundled Hadith' : 'Showing bundled Hadith'}
            </Text>
          )}

          {/* Arabic text — RTL, tashkeel preserved */}
          <View style={styles.arabicContainer}>
            <Text style={styles.arabicText}>{hadith.textAr}</Text>
          </View>

          {/* Translation */}
          <Text style={styles.translationText}>{hadith.textEn}</Text>

          {/* Source citation — narrator chain + collection */}
          <View style={styles.citationBox}>
            <Text style={styles.narratorText}>{hadith.narrator}</Text>
            <Text style={styles.sourceText}>{hadith.source}</Text>
            <Text style={styles.gradingText}>{hadith.grading}</Text>
          </View>

          {/* Back button */}
          <TouchableHighlight
            ref={backRef}
            hasTVPreferredFocus={true}
            accessible={true}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            underlayColor="#1E5E2F"
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Back to Home</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    backgroundColor: '#0D2F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineNotice: {
    color: '#79C24C',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: '#0D2F17',
    padding: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicContainer: {
    backgroundColor: '#1E5E2F',
    borderRadius: 16,
    padding: 40,
    marginBottom: 40,
    width: '100%',
    borderWidth: 2,
    borderColor: '#79C24C',
  },
  arabicText: {
    color: '#C9F27A',
    fontSize: 48,
    lineHeight: 72,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '600',
    // Tashkeel (diacritics) are part of the text — font must support Arabic diacritics
  },
  translationText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 48,
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
    paddingHorizontal: 40,
  },
  citationBox: {
    alignItems: 'center',
    marginBottom: 48,
    padding: 24,
    backgroundColor: '#0D2F17',
    borderTopWidth: 1,
    borderTopColor: '#1E5E2F',
    width: '100%',
  },
  narratorText: {
    color: '#79C24C',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  sourceText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  gradingText: {
    color: '#79C24C',
    fontSize: 22,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 60,
    paddingVertical: 24,
    backgroundColor: '#1E5E2F',
    borderRadius: 12,
    minHeight: 88,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '600',
  },
});
