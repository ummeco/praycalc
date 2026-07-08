/**
 * Purpose: StyleSheet definitions for TasbeehScreen, extracted to keep the
 *   screen component under the 300-line file cap.
 * Inputs: ThemeColors (from useThemeColors()).
 * Outputs: createStyles(colors) — same shape/values as the original inline
 *   StyleSheet.create block in TasbeehScreen.tsx.
 * Constraints: No behavior/visual changes — values copied verbatim.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-07-tasbeeh
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  arabicContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    width: '100%',
  },
  arabicText: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    fontWeight: '600',
    lineHeight: 52,
    width: '100%',
  },
  transliteration: {
    fontSize: 18,
    color: colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  source: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  counterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.brand.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.brand.deep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  counterButtonComplete: {
    backgroundColor: colors.state.success,
  },
  countNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text.inverse,
  },
  targetText: {
    fontSize: 14,
    color: colors.brand.light,
    marginTop: 2,
  },
  completeText: {
    fontSize: 14,
    color: colors.brand.light,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    width: '80%',
    height: 8,
    backgroundColor: colors.background.card,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.mid,
    borderRadius: 4,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: { fontSize: 16, color: colors.brand.mid, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  presetCard: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    marginBottom: 8,
    minHeight: 44,
  },
  presetCardActive: {
    borderWidth: 2,
    borderColor: colors.brand.mid,
    backgroundColor: colors.brand.light + '22',
  },
  presetArabic: {
    // Arabic RTL — full tashkeel — NEVER split
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: colors.brand.dark,
    lineHeight: 30,
  },
  presetTranslit: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  todayTotalCard: {
    width: '100%',
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  todayTotalNumber: { fontSize: 24, fontWeight: '800', color: colors.brand.light },
  todayTotalLabel: { fontSize: 12, color: colors.brand.light + 'CC', marginTop: 2 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 40,
    gap: 8,
  },
  historyName: { flex: 1, fontSize: 13, color: colors.text.primary, fontWeight: '500' },
  historyCount: { fontSize: 13, color: colors.brand.dark, fontWeight: '700' },
  historyTime: { fontSize: 11, color: colors.text.muted, width: 84, textAlign: 'right' },
});

export type TasbeehStyles = ReturnType<typeof createStyles>;
