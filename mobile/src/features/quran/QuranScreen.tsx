/**
 * Purpose: Quran surah list with navigation to a readable mini-mushaf per-surah display
 *   (Arabic + transliteration + translation, verse by verse) for a small curated set of
 *   surahs useful in salah context, plus verse bookmarks persisted via MMKV.
 * Inputs: Surah metadata (static), curated verse text from ./data/verses.ts.
 * Outputs: QuranScreen, SurahListScreen, SurahDetailScreen — Feature 10 of 20.
 * Constraints: Arabic ayat MUST use Uthmani script, RTL, tashkeel preserved.
 *   No truncation of Arabic strings. Bookmarks via MMKV.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-10-quran
 *
 * Islamic content gate: Quran text must match Uthmani script exactly — see
 * ./data/verses.ts for the verified corpus and per-surah source notes. The full
 * 114-surah Quran (with audio) is intentionally deferred to Islam.Wiki; this
 * screen ships only what has been verbatim-verified.
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView, Linking,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { EmptyState } from '../../components/states';
import SURAH_META from './data/surahs.json';
import { loadAyahs, AYAT_AL_KURSI_VERSE } from './data/verses';
import { SurahDetailView } from './SurahDetailView';
import { createStyles } from './QuranScreen.styles';
import type { Surah } from './quran.types';

// ── Surah metadata (first 7 surahs — full 114 loaded from bundled JSON in production) ──

/** Raw shape of the bundled 114-surah metadata (data/surahs.json). */
interface SurahMetaRaw {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslit: string;
  totalAyahs: number;
  revelationType: string; // 'Meccan' | 'Medinan'
  juzStart: number;
}

/**
 * All 114 surahs (metadata) — Arabic names in Uthmani script, from the verified
 * bundled corpus (data/surahs.json). DO NOT hand-edit Arabic without re-verifying
 * against Tanzil.net.
 */
export const SURAHS: Surah[] = (SURAH_META as SurahMetaRaw[]).map((s) => ({
  number: s.number,
  arabicName: s.nameArabic,
  transliteratedName: s.nameTranslit,
  englishName: s.nameEnglish,
  verseCount: s.totalAyahs,
  revelationType: s.revelationType.toLowerCase() === 'medinan' ? 'medinan' : 'meccan',
  juzNumber: s.juzStart,
}));

// Surahs with verified, bundled ayah text live in ./data/verses.ts (loadAyahs).
// Others show an honest "coming soon" state rather than placeholder glyphs
// (Islamic content gate: never display unverified Quran text). The full Hafs
// corpus (all 114 surahs, translations & audio) is on Islam.Wiki.

// ── Main Screen: Surah List ───────────────────────────────────────────────────

/** Synthetic "surah" card for the standalone Ayat al-Kursi (2:255) featured verse. */
const AYAT_AL_KURSI_CARD: Surah = {
  number: 2,
  arabicName: 'آية الكرسي',
  transliteratedName: 'Āyat al-Kursī',
  englishName: 'The Throne Verse (2:255)',
  verseCount: 1,
  revelationType: 'medinan',
  juzNumber: 3,
};

export default function QuranScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [showKursi, setShowKursi] = useState(false);

  if (showKursi) {
    return (
      <SurahDetailView
        surah={AYAT_AL_KURSI_CARD}
        onBack={() => setShowKursi(false)}
        singleAyah={AYAT_AL_KURSI_VERSE}
        colors={colors}
        styles={styles}
        t={t}
      />
    );
  }

  if (selectedSurah) {
    return (
      <SurahDetailView
        surah={selectedSurah}
        onBack={() => setSelectedSurah(null)}
        colors={colors}
        styles={styles}
        t={t}
      />
    );
  }

  if (SURAHS.length === 0) {
    return <EmptyState message={t('screens.quran.loading')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={SURAHS}
        keyExtractor={(s) => String(s.number)}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.screenTitle} accessibilityRole="header">
              {t('tabs.quran')} — القرآن الكريم
            </Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => setShowKursi(true)}
              accessibilityRole="button"
              accessibilityLabel={`${t('screens.quran.featuredVerse')}: Ayat al-Kursi`}
            >
              <Text style={styles.featuredArabic}>آيَةُ الْكُرْسِيِّ</Text>
              <Text style={styles.featuredLabel}>{t('screens.quran.featuredVerse')} · 2:255</Text>
            </TouchableOpacity>
          </>
        )}
        renderItem={({ item: surah }) => {
          const hasText = loadAyahs(surah.number) !== null;
          return (
            <TouchableOpacity
              style={styles.surahRow}
              onPress={() => setSelectedSurah(surah)}
              accessibilityRole="button"
              accessibilityLabel={`Surah ${surah.number}, ${surah.transliteratedName}, ${surah.verseCount} verses, ${surah.revelationType}${hasText ? ', full text available' : ''}`}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{surah.number}</Text>
              </View>
              <View style={styles.surahInfo}>
                <View style={styles.surahNameRow}>
                  <Text style={styles.transliteratedName}>{surah.transliteratedName}</Text>
                  {hasText && <Text style={styles.readableBadge}>{t('screens.quran.readableBadge')}</Text>}
                </View>
                <Text style={styles.englishName}>{surah.englishName} · {surah.verseCount}v</Text>
              </View>
              {/* Arabic surah name — RTL */}
              <Text style={styles.arabicSurahName}>{surah.arabicName}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[{ paddingBottom: 32 }, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}
        accessible
        accessibilityLabel={t('screens.quran.surahList')}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.wikiFooter}
            onPress={() => Linking.openURL('https://islam.wiki/quran')}
            accessibilityRole="link"
            accessibilityLabel={t('screens.quran.openFullQuran')}
          >
            <Text style={styles.wikiFooterText}>
              {t('screens.quran.wikiFooter')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
