/**
 * Purpose: Screen 5 — Dua Display: scrolling full-screen dua, Arabic + translation
 * Inputs: Dua ID from navigation params; dua list from pc_dua via urql
 * Outputs: Full-screen Arabic dua with RTL text, transliteration, translation; D-pad scroll
 * Constraints: Arabic RTL; tashkeel preserved; authenticated dua sources only per theology gate
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

// Sample authenticated dua — production fetches from pc_dua (theology-gate compliant)
const SAMPLE_DUAS = [
  {
    id: '1',
    titleAr: 'دعاء الاستفتاح',
    titleEn: 'Opening Supplication',
    textAr: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    textEn: 'Glory be to You, O Allah, and praise. Blessed is Your name, and exalted is Your majesty. There is no god but You.',
    transliteration: "Subhanakallahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghairuk",
    source: 'Sunan Abu Dawud 776; graded Sahih by Al-Albani',
  },
  {
    id: '2',
    titleAr: 'دعاء السفر',
    titleEn: 'Dua for Travel',
    textAr: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    textEn: 'Glory be to the One who has subjected this to us, for we could never have done it ourselves, and to our Lord we will return.',
    transliteration: "Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    source: 'Sunan Abu Dawud 2602; Sunan at-Tirmidhi 3447; graded Sahih',
  },
];

export default function DuaDisplayScreen(): React.JSX.Element {
  const navigation = useNavigation<DuaNavProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const backRef = useRef<TouchableHighlight>(null);
  const dua = SAMPLE_DUAS[currentIndex];

  useTVEventHandler((evt) => {
    if (evt.eventType === 'right' && currentIndex < SAMPLE_DUAS.length - 1) {
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
              {currentIndex + 1} / {SAMPLE_DUAS.length}
            </Text>
            {currentIndex < SAMPLE_DUAS.length - 1 && (
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
