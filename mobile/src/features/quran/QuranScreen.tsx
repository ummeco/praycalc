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

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { SkeletonState, EmptyState } from '../../components/states';
import { mmkv } from '../../lib/storage/mmkv';
import SURAH_META from './data/surahs.json';
import { loadAyahs, AYAT_AL_KURSI_VERSE, type Ayah } from './data/verses';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Surah {
  number: number;
  arabicName: string;     // Full tashkeel — RTL
  transliteratedName: string;
  englishName: string;
  verseCount: number;
  revelationType: 'meccan' | 'medinan';
  juzNumber: number;
}

const BOOKMARKS_KEY = 'pc:quran:bookmarks';

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

// ── Sub-screen: Surah Detail ──────────────────────────────────────────────────

function SurahDetailView({
  surah, onBack, singleAyah,
}: { surah: Surah; onBack: () => void; singleAyah?: Ayah }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
            accessibilityLabel={`Surah ${surah.transliteratedName}`}
          >
            {surah.arabicName}
          </Text>
          <Text style={styles.surahNameEn}>{surah.englishName}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
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
              accessibilityLabel={`Read Surah ${surah.transliteratedName} on Islam.Wiki`}
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
              accessibilityLabel={`Verse ${ayah.number}: ${ayah.transliteration}`}
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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [showKursi, setShowKursi] = useState(false);

  if (showKursi) {
    return (
      <SurahDetailView
        surah={AYAT_AL_KURSI_CARD}
        onBack={() => setShowKursi(false)}
        singleAyah={AYAT_AL_KURSI_VERSE}
      />
    );
  }

  if (selectedSurah) {
    return <SurahDetailView surah={selectedSurah} onBack={() => setSelectedSurah(null)} />;
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
        contentContainerStyle={{ paddingBottom: 32 }}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand.dark,
    padding: 16,
    textAlign: 'center',
  },
  featuredCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.brand.dark,
    alignItems: 'center',
    gap: 6,
  },
  featuredArabic: {
    fontSize: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
    color: colors.brand.light,
    fontWeight: '700',
  },
  featuredLabel: { fontSize: 13, color: colors.brand.light, fontWeight: '600' },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 56,
    gap: 12,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.mid + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { fontSize: 13, fontWeight: '700', color: colors.brand.dark },
  surahInfo: { flex: 1 },
  surahNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  transliteratedName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  readableBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.dark,
    backgroundColor: colors.brand.mid + '33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  englishName: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  arabicSurahName: {
    // Arabic RTL — full tashkeel
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    fontWeight: '500',
  },
  // Detail view
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.brand.dark,
    gap: 12,
  },
  backBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backText: { color: colors.brand.light, fontSize: 16 },
  headerCenter: { flex: 1, alignItems: 'center' },
  surahNameArabic: {
    fontSize: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.light,
    fontWeight: '600',
  },
  surahNameEn: { fontSize: 14, color: colors.brand.light + 'BB', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  bismillah: {
    // Bismillah — Uthmani Arabic, centered
    fontSize: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 38,
  },
  ayahCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  ayahMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand.mid + '44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumber: { fontSize: 12, fontWeight: '700', color: colors.brand.dark },
  bookmark: { fontSize: 20 },
  arabicAyah: {
    // Uthmani script — RTL — NEVER split with JS string methods
    fontSize: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.deep,
    fontWeight: '400',
    lineHeight: 40,
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 22,
  },
  translation: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
  },
  comingSoon: { alignItems: 'center', padding: 24, gap: 10 },
  comingSoonArabic: {
    fontSize: 30, textAlign: 'center', writingDirection: 'rtl',
    color: colors.brand.dark, fontWeight: '600', lineHeight: 48,
  },
  comingSoonTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  comingSoonBody: { fontSize: 14, color: colors.text.muted, textAlign: 'center', lineHeight: 21 },
  wikiBtn: {
    marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10,
    backgroundColor: colors.brand.dark,
  },
  wikiBtnText: { color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
  wikiFooter: {
    margin: 16, marginTop: 8, padding: 16, borderRadius: 12,
    backgroundColor: colors.brand.mid + '1A', borderWidth: 1, borderColor: colors.brand.mid + '44',
  },
  wikiFooterText: { color: colors.brand.dark, fontWeight: '600', fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
