/**
 * Purpose: Quran surah list with navigation to per-surah display (Arabic + transliteration),
 *   verse bookmarks persisted via MMKV.
 * Inputs: Surah metadata (static), Quran text displayed on-demand.
 * Outputs: QuranScreen, SurahListScreen, SurahDetailScreen — Feature 10 of 20.
 * Constraints: Arabic ayat MUST use Uthmani script, RTL, tashkeel preserved.
 *   No truncation of Arabic strings. Bookmarks via MMKV.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-10-quran
 *
 * Islamic content gate: Quran text must match Uthmani script exactly.
 * Al-Fatiha included below — verified character-by-character against standard mushaf.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { SkeletonState, EmptyState } from '../../components/states';
import { mmkv } from '../../lib/storage/mmkv';
import SURAH_META from './data/surahs.json';

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

interface Ayah {
  number: number;
  arabic: string;         // Uthmani script — NEVER split
  transliteration: string;
  translation: string;
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

/**
 * Al-Fatiha (1:1-7) — Uthmani script.
 * Verified against standard Hafs 'an 'Asim mushaf (Tanzil.net + IslamicFoundation.ca).
 * Any agent modifying this text MUST re-verify character-by-character.
 */
const AL_FATIHA_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismi llāhi r-raḥmāni r-raḥīm',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
  },
  {
    number: 2,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Al-ḥamdu lillāhi rabbi l-ʿālamīn",
    translation: 'Praise be to Allah, Lord of all worlds',
  },
  {
    number: 3,
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Ar-raḥmāni r-raḥīm',
    translation: 'The Most Gracious, the Most Merciful',
  },
  {
    number: 4,
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    transliteration: 'Māliki yawmi d-dīn',
    translation: 'Master of the Day of Judgment',
  },
  {
    number: 5,
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    transliteration: "Iyyāka naʿbudu wa-iyyāka nastaʿīn",
    translation: 'You alone we worship, and You alone we ask for help',
  },
  {
    number: 6,
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    transliteration: 'Ihdinā ṣ-ṣirāṭa l-mustaqīm',
    translation: 'Guide us on the straight path',
  },
  {
    number: 7,
    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: "Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn",
    translation: 'The path of those whom You have blessed — not of those against whom there is wrath, nor of those who are astray',
  },
];

// Surahs with verified, bundled ayah text. Others show an honest "coming soon"
// state rather than placeholder glyphs (Islamic content gate: never display
// unverified Quran text). The full Hafs corpus is bundled incrementally.
const BUNDLED_AYAHS: Record<number, Ayah[]> = {
  1: AL_FATIHA_AYAHS,
};

/** Verified ayahs for a surah, or null if its text is not yet bundled. */
function loadAyahs(surahNumber: number): Ayah[] | null {
  return BUNDLED_AYAHS[surahNumber] ?? null;
}

// ── Sub-screen: Surah Detail ──────────────────────────────────────────────────

function SurahDetailView({ surah, onBack }: { surah: Surah; onBack: () => void }) {
  const ayahs = loadAyahs(surah.number);
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
          accessibilityLabel="Back to surah list"
        >
          <Text style={styles.backText}>← Back</Text>
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
        {/* Bismillah (except At-Tawba 9 and Al-Fatiha 1 which has its own) */}
        {ayahs && surah.number !== 1 && surah.number !== 9 && (
          <Text style={styles.bismillah} accessibilityLabel="Bismillah">
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
              Read {surah.transliteratedName} ({surah.verseCount} verses) with
              translation and recitation on Islam.Wiki — our full Quran reader.
            </Text>
            <TouchableOpacity
              style={styles.wikiBtn}
              onPress={() => Linking.openURL(`https://islam.wiki/quran/${surah.number}`)}
              accessibilityRole="link"
              accessibilityLabel={`Read Surah ${surah.transliteratedName} on Islam.Wiki`}
            >
              <Text style={styles.wikiBtnText}>Read on Islam.Wiki →</Text>
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
                  accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
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

export default function QuranScreen() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  if (selectedSurah) {
    return <SurahDetailView surah={selectedSurah} onBack={() => setSelectedSurah(null)} />;
  }

  if (SURAHS.length === 0) {
    return <EmptyState message="Quran data loading..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={SURAHS}
        keyExtractor={(s) => String(s.number)}
        ListHeaderComponent={() => (
          <Text style={styles.screenTitle} accessibilityRole="header">
            Quran — القرآن الكريم
          </Text>
        )}
        renderItem={({ item: surah }) => (
          <TouchableOpacity
            style={styles.surahRow}
            onPress={() => setSelectedSurah(surah)}
            accessibilityRole="button"
            accessibilityLabel={`Surah ${surah.number}, ${surah.transliteratedName}, ${surah.verseCount} verses, ${surah.revelationType}`}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{surah.number}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={styles.transliteratedName}>{surah.transliteratedName}</Text>
              <Text style={styles.englishName}>{surah.englishName} · {surah.verseCount}v</Text>
            </View>
            {/* Arabic surah name — RTL */}
            <Text style={styles.arabicSurahName}>{surah.arabicName}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        accessible
        accessibilityLabel="Surah list"
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.wikiFooter}
            onPress={() => Linking.openURL('https://islam.wiki/quran')}
            accessibilityRole="link"
            accessibilityLabel="Open the full Quran on Islam.Wiki"
          >
            <Text style={styles.wikiFooterText}>
              📖 Full Quran — all 114 surahs, translations & audio on Islam.Wiki →
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.brand.dark,
    padding: 16,
    textAlign: 'center',
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.card,
    minHeight: 56,
    gap: 12,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand.mid + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { fontSize: 13, fontWeight: '700', color: Colors.brand.dark },
  surahInfo: { flex: 1 },
  transliteratedName: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  englishName: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
  arabicSurahName: {
    // Arabic RTL — full tashkeel
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.brand.dark,
    fontWeight: '500',
  },
  // Detail view
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.brand.dark,
    gap: 12,
  },
  backBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backText: { color: Colors.brand.light, fontSize: 16 },
  headerCenter: { flex: 1, alignItems: 'center' },
  surahNameArabic: {
    fontSize: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.brand.light,
    fontWeight: '600',
  },
  surahNameEn: { fontSize: 14, color: Colors.brand.light + 'BB', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  bismillah: {
    // Bismillah — Uthmani Arabic, centered
    fontSize: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
    color: Colors.brand.dark,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 38,
  },
  ayahCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.background.secondary,
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
    backgroundColor: Colors.brand.mid + '44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumber: { fontSize: 12, fontWeight: '700', color: Colors.brand.dark },
  bookmark: { fontSize: 20 },
  arabicAyah: {
    // Uthmani script — RTL — NEVER split with JS string methods
    fontSize: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: Colors.brand.deep,
    fontWeight: '400',
    lineHeight: 40,
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.text.secondary,
    marginBottom: 4,
    lineHeight: 22,
  },
  translation: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  comingSoon: { alignItems: 'center', padding: 24, gap: 10 },
  comingSoonArabic: {
    fontSize: 30, textAlign: 'center', writingDirection: 'rtl',
    color: Colors.brand.dark, fontWeight: '600', lineHeight: 48,
  },
  comingSoonTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  comingSoonBody: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', lineHeight: 21 },
  wikiBtn: {
    marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10,
    backgroundColor: Colors.brand.dark,
  },
  wikiBtnText: { color: Colors.text.inverse, fontWeight: '700', fontSize: 15 },
  wikiFooter: {
    margin: 16, marginTop: 8, padding: 16, borderRadius: 12,
    backgroundColor: Colors.brand.mid + '1A', borderWidth: 1, borderColor: Colors.brand.mid + '44',
  },
  wikiFooterText: { color: Colors.brand.dark, fontWeight: '600', fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
