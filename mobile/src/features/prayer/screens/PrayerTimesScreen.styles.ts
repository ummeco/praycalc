/**
 * Purpose: Stylesheet for PrayerTimesScreen and its extracted sub-component
 *   (PrayerList). Split out verbatim from PrayerTimesScreen.tsx to keep that
 *   file under the 300-line cap.
 * Inputs: ThemeColors (light/dark theme).
 * Outputs: createStyles(colors) — same StyleSheet shape as before the split.
 * Constraints: Must stay byte-identical in style values to the pre-split version.
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: 16, gap: 16 },
  dateHeader: { alignItems: 'center', gap: 2 },
  hijriDate: { fontSize: 15, fontWeight: '600', color: colors.brand.dark },
  gregorianDate: { fontSize: 13, color: colors.text.muted },
  locationName: { fontSize: 13, color: colors.text.secondary, marginTop: 4, fontWeight: '500' },
  shareButton: { marginTop: 8, minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  shareButtonText: { fontSize: 13, color: colors.brand.dark, fontWeight: '600' },
  muteIcon: { fontSize: 13, marginRight: 6 },
  completedCheck: { fontSize: 18, color: colors.text.muted, marginLeft: 10, width: 22, textAlign: 'center' },
  completedCheckActive: { color: colors.brand.mid, fontWeight: '700' },
  countdownCard: {
    backgroundColor: colors.brand.dark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  countdownLabel: { color: colors.brand.light, fontSize: 14, fontWeight: '500' },
  countdownTimer: { color: colors.text.inverse, fontSize: 36, fontWeight: '700', marginTop: 4 },
  prayerList: { gap: 4 },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    gap: 12,
  },
  prayerRowNext: { backgroundColor: colors.brand.deep, borderWidth: 2, borderColor: colors.brand.mid },
  prayerDot: { width: 10, height: 10, borderRadius: 5 },
  prayerName: { flex: 1, fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  prayerNameNext: { color: colors.brand.light },
  prayerTime: { fontSize: 16, color: colors.text.secondary, fontWeight: '600' },
  prayerTimeNext: { color: colors.brand.light },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, color: colors.text.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: colors.background.card },
  toggleOption: { flex: 1, padding: 12, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: colors.brand.dark },
  toggleText: { fontSize: 14, color: colors.text.primary },
  toggleTextActive: { color: colors.text.inverse, fontWeight: '600' },
  methodRow: { padding: 14, borderRadius: 8, backgroundColor: colors.background.secondary },
  methodRowActive: { backgroundColor: colors.brand.dark },
  methodText: { fontSize: 14, color: colors.text.primary },
  methodTextActive: { color: colors.text.inverse, fontWeight: '600' },
});

export type PrayerTimesScreenStyles = ReturnType<typeof createStyles>;
