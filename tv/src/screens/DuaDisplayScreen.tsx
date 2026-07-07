/**
 * Purpose: Screen 5 — Dua Display: scrolling full-screen dua, Arabic + translation
 * Inputs: Bundled, cited dua collection shared from mobile/src/features/dua-dhikr
 * Outputs: Full-screen Arabic dua with RTL text, transliteration, translation; D-pad scroll
 * Constraints: Arabic RTL; tashkeel preserved; authenticated dua sources only per theology gate.
 *   DATA PATH: bundled, not live-queried. pc_dua does NOT exist in production (probed
 *   api.praycalc.com 2026-07-06 — "field 'pc_dua' not found in type: 'query_root'"). Content
 *   below is copied verbatim (source citations intact) from
 *   mobile/src/features/dua-dhikr/DuaDhikrScreen.tsx, which cites Hisn al-Muslim (Sa'id
 *   al-Qahtani) and Sahih Bukhari/Muslim — the only sourced dua content in this repo. Per the
 *   Islamic content gate, no new dua text was authored here. queries.ts GET_DUA_LIST is kept
 *   ready for when a real pc_dua table + Hasura source ships.
 * SPORT: praycalc/tv screens
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';

type DuaNavProp = StackNavigationProp<RootStackParamList, 'DuaDisplay'>;

interface BundledDua {
  id: string;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  transliteration: string;
  source: string;
}

// Bundled dua collection — copied verbatim (citations intact) from
// mobile/src/features/dua-dhikr/DuaDhikrScreen.tsx (Hisn al-Muslim / Sahih Bukhari+Muslim).
const BUNDLED_DUAS: BundledDua[] = [
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
  const dua = BUNDLED_DUAS[currentIndex];

  useTVEventHandler((evt) => {
    if (evt.eventType === 'right' && currentIndex < BUNDLED_DUAS.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
    if (evt.eventType === 'left' && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
    if (evt.eventType === 'menu') navigation.goBack();
  });

  return (
    <TvScreenWrapper title="Dua & Dhikr" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.root}>
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
              {currentIndex + 1} / {BUNDLED_DUAS.length}
            </Text>
            {currentIndex < BUNDLED_DUAS.length - 1 && (
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
