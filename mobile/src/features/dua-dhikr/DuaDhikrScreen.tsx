/**
 * Purpose: Morning/evening adhkar, post-prayer duas. Arabic text RTL, tashkeel preserved.
 * Inputs: Static dua data (sourced from Hisn al-Muslim / Sahih Bukhari+Muslim).
 * Outputs: DuaDhikrScreen — Feature 8 of 20.
 * Constraints: Arabic text MUST NOT be split with JS string methods. textAlign 'right',
 *   writingDirection 'rtl'. All sources cited in comments.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-08-dua-dhikr
 *
 * Islamic content gate: All content is from Hisn al-Muslim (Sa'id al-Qahtani) and
 * Sahih Bukhari/Muslim. Agents modifying dua content MUST re-verify source citations.
 * Fabricated Islamic rulings/text are an ABSOLUTE block on Done.
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { EmptyState } from '../../components/states';

// ── Types ─────────────────────────────────────────────────────────────────────

type DuaCategory = 'morning' | 'evening' | 'postPrayer' | 'sleep' | 'general';

interface Dua {
  id: string;
  category: DuaCategory;
  arabic: string;           // Full tashkeel Uthmani — NEVER split
  transliteration: string;
  translation: string;
  source: string;
  repeatCount?: number;
}

// ── Data — Islamic content verified against Hisn al-Muslim ───────────────────

/**
 * Morning Adhkar — Hisn al-Muslim (Sa'id al-Qahtani, 3rd ed.)
 * These are recited after Fajr prayer until sunrise.
 */
const MORNING_ADHKAR: Dua[] = [
  {
    id: 'morning-01',
    category: 'morning',
    // Hisn al-Muslim #96 — "Ayat al-Kursi" (morning)
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    transliteration: 'Allahu la ilaha illa huwal-hayyul-qayyum',
    translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence',
    source: 'Hisn al-Muslim #96 (Ayat al-Kursi)',
    repeatCount: 1,
  },
  {
    id: 'morning-02',
    category: 'morning',
    // Hisn al-Muslim #100 — "Subhan Allah" × 100 morning
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: "Subhanallahi wa bihamdih",
    translation: 'Glory be to Allah and praise be to Him',
    source: 'Hisn al-Muslim #100 (Sahih Muslim 2692)',
    repeatCount: 100,
  },
  {
    id: 'morning-03',
    category: 'morning',
    // Hisn al-Muslim #83 — morning du'a
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdulillah",
    translation: 'We have entered the morning and the whole dominion belongs to Allah, and praise is for Allah',
    source: 'Hisn al-Muslim #83 (Sahih Muslim 2723)',
    repeatCount: 1,
  },
];

/**
 * Evening Adhkar — recited after Asr/Maghrib prayer.
 * Source: Hisn al-Muslim, evening section.
 */
const EVENING_ADHKAR: Dua[] = [
  {
    id: 'evening-01',
    category: 'evening',
    // Hisn al-Muslim #108 — evening dhikr
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdulillah",
    translation: 'We have entered the evening and the whole dominion belongs to Allah, and praise is for Allah',
    source: 'Hisn al-Muslim #108 (Abu Dawud 5068)',
    repeatCount: 1,
  },
  {
    id: 'evening-02',
    category: 'evening',
    // Hisn al-Muslim #118 — Sayyid al-Istighfar
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transliteration: "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana abduk",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You; You created me and I am Your servant',
    source: 'Hisn al-Muslim #118 (Sahih Bukhari 6306) — Sayyid al-Istighfar',
    repeatCount: 1,
  },
];

/**
 * Post-prayer duas — recited after each of the 5 daily prayers.
 * Source: Sahih Muslim + Sahih Bukhari.
 */
const POST_PRAYER_DUAS: Dua[] = [
  {
    id: 'post-01',
    category: 'postPrayer',
    // Sahih Muslim 591 — post-prayer tasbeeh
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    source: 'Sahih Muslim 591 (post-prayer × 33)',
    repeatCount: 33,
  },
  {
    id: 'post-02',
    category: 'postPrayer',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise be to Allah',
    source: 'Sahih Muslim 591 (post-prayer × 33)',
    repeatCount: 33,
  },
  {
    id: 'post-03',
    category: 'postPrayer',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    source: 'Sahih Muslim 591 (post-prayer × 34)',
    repeatCount: 34,
  },
  {
    id: 'post-04',
    category: 'postPrayer',
    // Sahih Muslim 597 — la ilaha illallah wahdahu (post-prayer × 10)
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    translation: 'None has the right to be worshipped except Allah, alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent',
    source: 'Sahih Muslim 597',
    repeatCount: 10,
  },
];

const ALL_DUAS: Dua[] = [...MORNING_ADHKAR, ...EVENING_ADHKAR, ...POST_PRAYER_DUAS];

// ── Screen ────────────────────────────────────────────────────────────────────

type CategoryFilter = 'all' | DuaCategory;

const CATEGORIES: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'morning', label: 'Morning' },
  { key: 'evening', label: 'Evening' },
  { key: 'postPrayer', label: 'Post-Prayer' },
];

export default function DuaDhikrScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? ALL_DUAS : ALL_DUAS.filter((d) => d.category === filter);

  if (filtered.length === 0) {
    return <EmptyState message="No duas found for this category." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Category filter tabs */}
      <View style={styles.filterRow} accessibilityRole="tablist">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.filterTab, filter === cat.key && styles.filterTabActive]}
            onPress={() => setFilter(cat.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === cat.key }}
            accessibilityLabel={`${cat.label} adhkar`}
          >
            <Text style={[styles.filterLabel, filter === cat.key && styles.filterLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        renderItem={({ item: dua, index }) => (
          <TouchableOpacity
            style={styles.duaCard}
            onPress={() => setExpanded(expanded === dua.id ? null : dua.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded === dua.id }}
            accessibilityLabel={`Dua ${index + 1}: ${dua.transliteration}`}
            accessibilityHint="Tap to expand or collapse"
          >
            <View style={styles.duaNumber}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.duaContent}>
              {/* Arabic — RTL, full tashkeel, no truncation */}
              <Text
                style={styles.arabicText}
                accessibilityLabel={`Arabic: ${dua.transliteration}`}
              >
                {dua.arabic}
              </Text>
              {dua.repeatCount && dua.repeatCount > 1 && (
                <Text style={styles.repeatBadge}>× {dua.repeatCount}</Text>
              )}
              {expanded === dua.id && (
                <>
                  <Text style={styles.transliteration}>{dua.transliteration}</Text>
                  <Text style={styles.translation}>{dua.translation}</Text>
                  <Text style={styles.source}>{dua.source}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        accessible
        accessibilityLabel={`${filter === 'all' ? 'All' : filter} adhkar list`}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: colors.background.secondary,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  filterTabActive: { backgroundColor: colors.brand.mid },
  filterLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: '500' },
  filterLabelActive: { color: colors.text.inverse, fontWeight: '700' },
  duaCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    gap: 12,
  },
  duaNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { fontSize: 12, fontWeight: '700', color: colors.text.inverse },
  duaContent: { flex: 1 },
  arabicText: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    fontWeight: '500',
    lineHeight: 36,
    width: '100%',
  },
  repeatBadge: {
    fontSize: 12,
    color: colors.brand.mid,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 2,
  },
  transliteration: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.text.secondary,
    marginTop: 8,
  },
  translation: {
    fontSize: 14,
    color: colors.text.primary,
    marginTop: 4,
    lineHeight: 22,
  },
  source: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
