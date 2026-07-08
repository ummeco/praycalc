/**
 * Purpose: Stylesheet for StatsScreen (streak cards, cross-feature summary
 *   cards, chart toggle tabs, chart card, per-prayer breakdown rows).
 * Inputs: ThemeColors (from useThemeColors hook).
 * Outputs: createStyles(colors) -> StyleSheet.create({...}) result.
 * Constraints: Pure function of colors — no component state. Memoized by
 *   callers via useMemo(() => createStyles(colors), [colors]).
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.brand.light },
  statLabel: { fontSize: 11, color: colors.brand.light + 'BB', marginTop: 2, textAlign: 'center' },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand.mid + '55',
  },
  summaryNumber: { fontSize: 22, fontWeight: '800', color: colors.brand.dark },
  summaryLabel: { fontSize: 11, color: colors.text.muted, marginTop: 2, textAlign: 'center' },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleTabActive: { backgroundColor: colors.brand.mid },
  toggleLabel: { fontSize: 14, color: colors.text.secondary, fontWeight: '500' },
  toggleLabelActive: { color: colors.text.inverse, fontWeight: '700' },
  chartCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
    minHeight: 44,
  },
  prayerName: { width: 64, fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.background.card,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.brand.mid,
    borderRadius: 5,
    minWidth: 4,
  },
  prayerCount: { width: 32, fontSize: 13, color: colors.text.muted, textAlign: 'right' },
});
