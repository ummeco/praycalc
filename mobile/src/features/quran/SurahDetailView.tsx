/**
 * Purpose: Readable mini-mushaf view for a single surah (or a single standalone
 *   ayah, e.g. Ayat al-Kursi) — Arabic + transliteration + translation per verse,
 *   with per-verse bookmarks persisted via MMKV.
 * Inputs: surah (Surah metadata), onBack callback, optional singleAyah override,
 *   parent-owned colors/styles/t (computed once by QuranScreen, per the same
 *   prop-passing convention as every other split screen child, e.g. PrayerList).
 * Outputs: SurahDetailView component, used by QuranScreen for both a regular
 *   surah and the featured Ayat al-Kursi card.
 * Constraints: Arabic ayat MUST use Uthmani script, RTL, tashkeel preserved.
 *   No truncation of Arabic strings. Bookmarks via MMKV under BOOKMARKS_KEY.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-10-quran
 *
 * Islamic content gate: Quran text must match Uthmani script exactly — see
 * ./data/verses.ts for the verified corpus and per-surah source notes.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ScrollView, Linking,
} from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { mmkv } from '../../lib/storage/mmkv';
import { loadAyahs, type Ayah } from './data/verses';
import type { QuranScreenStyles } from './QuranScreen.styles';
import type { Surah } from './quran.types';
import type { ThemeColors } from '../../constants/colors';

const BOOKMARKS_KEY = 'pc:quran:bookmarks';

interface SurahDetailViewProps {
  surah: Surah;
  onBack: () => void;
  singleAyah?: Ayah;
  /** Accepted for parity with the sibling props-passing convention (e.g. PrayerList) —
   *  not read directly here since every visual value already flows through `styles`. */
  colors: ThemeColors;
  styles: QuranScreenStyles;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function SurahDetailView({
  surah, onBack, singleAyah, styles, t,
}: SurahDetailViewProps) {
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const ayahs = singleAyah ? [singleAyah] : loadAyahs(surah.number);
  const rawBookmarks = mmkv.getString(BOOKMARKS_KEY);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return rawBookmarks ? (JSON.parse(rawBookmarks) as string[]) : []; }
    catch { return []; }
  });

  const toggleBookmark = useCallback((key: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      mmkv.set(BOOKMARKS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('screens.quran.backToList')}
        >
          <Text style={styles.backText}>← {t('screens.quran.back')}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {/* Surah name — RTL, full tashkeel */}
          <Text
            style={styles.surahNameArabic}
            accessibilityLabel={t('screens.quran.surahNameAccessibilityLabel', { name: surah.transliteratedName })}
          >
            {surah.arabicName}
          </Text>
          <Text style={styles.surahNameEn}>{surah.englishName}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}
      >
        {/* Bismillah (except At-Tawba 9, Al-Fatiha 1 which has its own, and mid-surah
            single-verse views like Ayat al-Kursi) */}
        {ayahs && !singleAyah && surah.number !== 1 && surah.number !== 9 && (
          <Text style={styles.bismillah} accessibilityLabel={t('screens.quran.bismillah')}>
            {'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
          </Text>
        )}
        {/* Proper scope: praycalc shows a sample; the full Quran (all 114 surahs
            with translations & audio) lives on Islam.Wiki. Deep-link out. */}
        {!ayahs && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonArabic}>{surah.arabicName}</Text>
            <Text style={styles.comingSoonTitle}>{surah.transliteratedName}</Text>
            <Text style={styles.comingSoonBody}>
              {t('screens.quran.comingSoonBody', { name: surah.transliteratedName, count: surah.verseCount })}
            </Text>
            <TouchableOpacity
              style={styles.wikiBtn}
              onPress={() => Linking.openURL(`https://islam.wiki/quran/${surah.number}`)}
              accessibilityRole="link"
              accessibilityLabel={t('screens.quran.readOnWikiAccessibilityLabel', { name: surah.transliteratedName })}
            >
              <Text style={styles.wikiBtnText}>{t('screens.quran.readOnWiki')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {(ayahs ?? []).map((ayah) => {
          const key = `${surah.number}:${ayah.number}`;
          const isBookmarked = bookmarks.includes(key);
          return (
            <View
              key={ayah.number}
              style={styles.ayahCard}
              accessible
              accessibilityLabel={t('screens.quran.verseAccessibilityLabel', { number: ayah.number, transliteration: ayah.transliteration })}
            >
              {/* Verse number */}
              <View style={styles.ayahMeta}>
                <View style={styles.verseCircle}>
                  <Text style={styles.verseNumber}>{ayah.number}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleBookmark(key)}
                  accessibilityRole="button"
                  accessibilityLabel={isBookmarked ? t('screens.quran.removeBookmark') : t('screens.quran.bookmarkVerse')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.bookmark}>{isBookmarked ? '🔖' : '○'}</Text>
                </TouchableOpacity>
              </View>
              {/* Arabic — Uthmani script, RTL, no truncation */}
              <Text style={styles.arabicAyah}>
                {ayah.arabic}
              </Text>
              <Text style={styles.transliteration}>{ayah.transliteration}</Text>
              <Text style={styles.translation}>{ayah.translation}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
