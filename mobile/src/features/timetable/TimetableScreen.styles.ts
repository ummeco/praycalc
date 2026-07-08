/**
 * Purpose: Stylesheet for TimetableScreen (monthly prayer timetable) — split
 *   out of TimetableScreen.tsx to keep the component file under the 300-line
 *   cap. Values unchanged from the original inline StyleSheet.create block.
 * Inputs: ThemeColors (from useThemeColors hook).
 * Outputs: createStyles(colors) -> StyleSheet.create({...}) result.
 * Constraints: Pure function of colors — no component state. Memoized by
 *   the caller via useMemo(() => createStyles(colors), [colors]).
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.background.primary },
  container: { flex: 1, padding: 16, gap: 12 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  navButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 28, color: colors.brand.dark, fontWeight: '700' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.text.primary, minWidth: 140, textAlign: 'center' },
  locationLabel: { fontSize: 13, color: colors.text.muted, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 12 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 36,
  },
  tableRowToday: {
    backgroundColor: colors.brand.light + '33',
    borderRadius: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tableCellDay: {
    flex: 0.5,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tableCellToday: {
    color: colors.brand.dark,
    fontWeight: '700',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1 },
  exportButton: {
    backgroundColor: colors.brand.dark,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  exportButtonText: { color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
  shareButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand.mid,
  },
  shareButtonText: { color: colors.brand.dark, fontWeight: '700', fontSize: 15 },
});
