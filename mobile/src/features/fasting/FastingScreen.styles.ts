/**
 * Purpose: StyleSheet definitions for FastingScreen, extracted to keep the
 *   screen component under the 300-line file cap.
 * Inputs: ThemeColors (from useThemeColors()).
 * Outputs: createStyles(colors) — same shape/values as the original inline
 *   StyleSheet.create block in FastingScreen.tsx.
 * Constraints: No behavior/visual changes — values copied verbatim.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-fasting
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  ramadanBanner: {
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  ramadanText: { fontSize: 16, fontWeight: '700', color: colors.text.inverse, marginBottom: 8 },
  progressTrack: {
    height: 8,
    backgroundColor: colors.brand.deep,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.brand.light, borderRadius: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    minHeight: 44,
    justifyContent: 'center',
  },
  typeChipActive: { backgroundColor: colors.brand.mid },
  typeChipText: { fontSize: 13, color: colors.text.secondary, fontWeight: '500' },
  typeChipTextActive: { color: colors.text.inverse, fontWeight: '700' },
  logButton: {
    backgroundColor: colors.brand.dark,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  logButtonActive: { backgroundColor: colors.state.success },
  logButtonText: { color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 68,
    justifyContent: 'center',
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: colors.brand.light },
  statLabel: { fontSize: 10, color: colors.brand.light + 'BB', marginTop: 2, textAlign: 'center' },
  statCardSmall: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  statNumberSmall: { fontSize: 16, fontWeight: '700', color: colors.brand.dark },
  statLabelSmall: { fontSize: 9, color: colors.text.muted, marginTop: 2, textAlign: 'center' },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginBottom: 6,
    gap: 8,
    minHeight: 44,
  },
  suggestionDate: { fontSize: 12, color: colors.text.muted, width: 84 },
  suggestionLabel: { flex: 1, fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  suggestionAction: { fontSize: 13, color: colors.brand.mid, fontWeight: '700' },
  sourceNote: { fontSize: 11, color: colors.text.muted, marginTop: 4, marginBottom: 16, lineHeight: 16 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 40,
  },
  historyDate: { fontSize: 13, color: colors.text.muted },
  historyType: { fontSize: 13, color: colors.text.primary, fontWeight: '500' },
});
