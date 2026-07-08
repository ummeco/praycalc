/**
 * Purpose: Adhkar organized by category (After Adhan, After Prayer, Morning, Evening)
 *   to assist users in-context around salah. Arabic text RTL, tashkeel preserved.
 * Inputs: Static dua data from ./data/adhkar.ts (sourced from Hisn al-Muslim / Sahih
 *   Bukhari+Muslim).
 * Outputs: DuaDhikrScreen — Feature 8 of 20.
 * Constraints: Arabic text MUST NOT be split with JS string methods. textAlign 'right',
 *   writingDirection 'rtl'. All sources cited in the data file.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-08-dua-dhikr
 *
 * Islamic content gate: All content is from Hisn al-Muslim (Sa'id al-Qahtani) and
 * Sahih Bukhari/Muslim — see ./data/adhkar.ts for per-entry citations. Agents
 * modifying dua content MUST re-verify source citations. Fabricated Islamic
 * rulings/text are an ABSOLUTE block on Done.
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import type { ThemeColors } from '../../constants/colors';
import { EmptyState } from '../../components/states';
import { ALL_DUAS, CATEGORIES, type CategoryFilter } from './data/adhkar';

export default function DuaDhikrScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { isWide, maxContentWidth } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? ALL_DUAS : ALL_DUAS.filter((d) => d.category === filter);

  if (filtered.length === 0) {
    return <EmptyState message={t('screens.duaDhikr.noResults')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isWide && { alignSelf: 'center', width: '100%', maxWidth: maxContentWidth }]}>
        {/* Category filter tabs — horizontally scrollable to keep 5 categories uncluttered */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          accessibilityRole="tablist"
        >
          {CATEGORIES.map((cat) => {
            const label = t(cat.labelKey);
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterTab, filter === cat.key && styles.filterTabActive]}
                onPress={() => setFilter(cat.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === cat.key }}
                accessibilityLabel={`${label} adhkar`}
              >
                <Text style={[styles.filterLabel, filter === cat.key && styles.filterLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: colors.background.secondary,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
