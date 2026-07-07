/**
 * Purpose: Screen 4 — Hadith of the Day: large text; touch-free; day-seeded rotation
 * Inputs: Bundled, cited Hadith collection; day-seeded index for 24h rotation
 * Outputs: Full-screen Hadith display with Arabic RTL text (tashkeel preserved), source citation
 * Constraints: Arabic text must be RTL; tashkeel (diacritics) preserved; cite narrator chain + collection.
 *   DATA PATH: bundled, not live-queried. pc_hadith does NOT exist in production (probed
 *   api.praycalc.com 2026-07-06 — "field 'pc_hadith' not found in type: 'query_root'") and no
 *   sourced hadith content exists elsewhere in this repo to reuse. Per the Islamic content gate,
 *   fabricating a live query against a nonexistent table (or fabricating more hadith text) is
 *   disallowed — this stays an honest, small, correctly-cited offline collection until a real
 *   pc_hadith table + Hasura source ships (queries.ts GET_HADITH_OF_DAY is kept ready for that).
 * SPORT: praycalc/tv screens
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import TvScreenWrapper from '../components/TvScreenWrapper';

type HadithNavProp = StackNavigationProp<RootStackParamList, 'HadithOfDay'>;

interface BundledHadith {
  textAr: string;
  textEn: string;
  source: string;
  narrator: string;
  grading: string;
}

// Bundled, cited Hadith collection — Sahih al-Bukhari / Sahih Muslim only (authenticated
// collections per the theology gate). Narrator chain + collection + grading required per entry.
const BUNDLED_HADITH: BundledHadith[] = [
  {
    textAr: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    textEn:
      'Actions are judged only by intentions, and every person will get what they intended.',
    source: 'Sahih al-Bukhari 1; Sahih Muslim 1907',
    narrator: 'Narrated by ʿUmar ibn al-Khaṭṭāb (رضي الله عنه)',
    grading: 'Sahih (Authentic)',
  },
  {
    textAr: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    textEn:
      'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    source: 'Sahih al-Bukhari 6018; Sahih Muslim 47',
    narrator: 'Narrated by Abu Hurayrah (رضي الله عنه)',
    grading: 'Sahih (Authentic)',
  },
  {
    textAr: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    textEn: 'Cleanliness is half of faith.',
    source: 'Sahih Muslim 223',
    narrator: 'Narrated by Abu Malik al-Ashʿari (رضي الله عنه)',
    grading: 'Sahih (Authentic)',
  },
];

/** Day-seeded index so the displayed Hadith rotates once per 24h without a server. */
function pickDailyHadith(): BundledHadith {
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return BUNDLED_HADITH[daySeed % BUNDLED_HADITH.length];
}

export default function HadithOfDayScreen(): React.JSX.Element {
  const navigation = useNavigation<HadithNavProp>();
  const backRef = useRef<TouchableHighlight>(null);
  const hadith = pickDailyHadith();

  return (
    <TvScreenWrapper title="Hadith of the Day" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.root}>
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
