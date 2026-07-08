/**
 * Purpose: Shared StyleSheet for the Quran surah list (QuranScreen) and the
 *   per-surah reader (SurahDetailView) — kept in one place so the two screens'
 *   visual language never drifts apart.
 * Inputs: ThemeColors (light/dark theme palette).
 * Outputs: createStyles(colors) — a StyleSheet.create() result.
 * Constraints: values are unchanged from the original QuranScreen.tsx —
 *   this is a pure extraction, do not alter any style value here.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-10-quran
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
