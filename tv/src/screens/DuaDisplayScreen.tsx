/**
 * Purpose: Screen 5 — Dua Display: scrolling full-screen dua, Arabic + translation
 * Inputs: pc_dua via urql (live, public role); bundled cited fallback for offline/error
 * Outputs: Full-screen Arabic dua with RTL text, transliteration, translation; D-pad scroll
 * Constraints: Arabic RTL; tashkeel preserved; authenticated dua sources only per theology gate.
 *   DATA PATH: live query. pc_dua now exists in production (Wave-1 gap closure W1.3,
 *   2026-07-07 — 9 rows seeded, public role select, verified live against
 *   api.praycalc.com). On fetch failure or empty result (offline TV, network blip), falls
 *   back to the same small bundled+cited collection this screen shipped with — an honest
 *   degraded state, not fabricated content.
 * SPORT: praycalc/tv screens
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  ActivityIndicator,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from 'urql';
import { RootStackParamList, DuaEntry } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';
import { GET_DUA_LIST } from '../lib/graphql/queries';

type DuaNavProp = StackNavigationProp<RootStackParamList, 'DuaDisplay'>;

interface PcDuaRow {
  id: string;
  title_ar: string;
  title_en: string;
  text_ar: string;
  text_en: string;
  transliteration: string;
  source: string;
}

function toDuaEntry(row: PcDuaRow): DuaEntry {
  return {
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    textAr: row.text_ar,
    textEn: row.text_en,
    transliteration: row.transliteration,
    source: row.source,
  };
}

// Offline/error fallback — same small bundled+cited collection this screen shipped
// with before pc_dua existed (Hisn al-Muslim / Sahih Bukhari+Muslim). Kept as a
// last-resort so the screen still shows something honest when the TV has no network.
export const FALLBACK_DUAS: DuaEntry[] = [
  {
    id: 'morning-01',
    titleAr: 'آية الكرسي (الصباح)',
    titleEn: 'Ayat al-Kursi (Morning)',
    textAr: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    textEn: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence',
    transliteration: 'Allahu la ilaha illa huwal-hayyul-qayyum',
    source: 'Hisn al-Muslim #96 (Ayat al-Kursi)',
  },
  {
    id: 'evening-02',
    titleAr: 'سيد الاستغفار (المساء)',
    titleEn: 'Sayyid al-Istighfar (Evening)',
    textAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    textEn: 'O Allah, You are my Lord, none has the right to be worshipped except You; You created me and I am Your servant',
    transliteration: "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana abduk",
    source: 'Hisn al-Muslim #118 (Sahih Bukhari 6306) — Sayyid al-Istighfar',
  },
  {
    id: 'post-04',
    titleAr: 'دعاء بعد الصلاة',
    titleEn: 'Post-Prayer Dua',
    textAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    textEn: 'None has the right to be worshipped except Allah, alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent',
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    source: 'Sahih Muslim 597',
  },
];

export default function DuaDisplayScreen(): React.JSX.Element {
  const navigation = useNavigation<DuaNavProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const backRef = useRef<TouchableHighlight>(null);

  const [{ data, fetching, error }] = useQuery<{ pc_dua: PcDuaRow[] }>({
    query: GET_DUA_LIST,
  });

  const liveDuas = data?.pc_dua?.map(toDuaEntry) ?? [];
  const duas = liveDuas.length > 0 ? liveDuas : FALLBACK_DUAS;
  const usingFallback = liveDuas.length === 0;
  const dua = duas[Math.min(currentIndex, duas.length - 1)];

  useTVEventHandler((evt) => {
    if (evt.eventType === 'right' && currentIndex < duas.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
    if (evt.eventType === 'left' && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
    if (evt.eventType === 'menu') navigation.goBack();
  });

  if (fetching && !data) {
    return (
      <TvScreenWrapper title="Dua & Dhikr" onBack={() => navigation.goBack()}>
        <View style={styles.centerState}>
          <ActivityIndicator color="#C9F27A" size="large" />
        </View>
      </TvScreenWrapper>
    );
  }

  return (
    <TvScreenWrapper title="Dua & Dhikr" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.root}>
          {(error || usingFallback) && (
            <Text style={styles.offlineNotice}>
              {error ? 'Offline — showing bundled duas' : 'Showing bundled duas'}
            </Text>
          )}

          {/* Dua title */}
          <Text style={styles.titleAr}>{dua.titleAr}</Text>
          <Text style={styles.titleEn}>{dua.titleEn}</Text>

          {/* Arabic text — RTL with tashkeel */}
          <View style={styles.arabicBox}>
            <Text style={styles.arabicText}>{dua.textAr}</Text>
          </View>

          {/* Transliteration */}
          <Text style={styles.transliteration}>{dua.transliteration}</Text>

          {/* Translation */}
          <Text style={styles.translationText}>{dua.textEn}</Text>

          {/* Source */}
          <Text style={styles.sourceText}>{dua.source}</Text>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableHighlight
              ref={backRef}
              hasTVPreferredFocus={true}
              accessible={true}
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              underlayColor="#1E5E2F"
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>◀ Back</Text>
            </TouchableHighlight>
            <Text style={styles.pageIndicator}>
              {currentIndex + 1} / {duas.length}
            </Text>
            {currentIndex < duas.length - 1 && (
              <TouchableHighlight
                accessible={true}
                accessibilityRole="button"
                onPress={() => setCurrentIndex((i) => i + 1)}
                underlayColor="#1E5E2F"
                style={styles.navBtn}
              >
                <Text style={styles.navBtnText}>Next ▶</Text>
              </TouchableHighlight>
            )}
          </View>
        </View>
      </ScrollView>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
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
  },
  root: {
    flex: 1,
    backgroundColor: '#0D2F17',
    padding: 80,
    alignItems: 'center',
  },
  titleAr: {
    color: '#C9F27A',
    fontSize: 40,
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  titleEn: {
    color: '#79C24C',
    fontSize: 28,
    marginBottom: 40,
  },
  arabicBox: {
    backgroundColor: '#1E5E2F',
    borderRadius: 16,
    padding: 40,
    marginBottom: 32,
    width: '100%',
    borderWidth: 2,
    borderColor: '#79C24C',
  },
  arabicText: {
    color: '#C9F27A',
    fontSize: 44,
    lineHeight: 68,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '600',
  },
  transliteration: {
    color: '#79C24C',
    fontSize: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  translationText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  sourceText: {
    color: '#79C24C',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 48,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  navBtn: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#1E5E2F',
    borderRadius: 12,
    minHeight: 88,
    justifyContent: 'center',
  },
  navBtnText: {
    color: '#C9F27A',
    fontSize: 28,
    fontWeight: '600',
  },
  pageIndicator: {
    color: '#79C24C',
    fontSize: 24,
  },
});
