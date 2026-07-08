/**
 * Purpose: Stylesheet for NotificationSettingsScreen and its extracted sub-components
 *   (BatteryOptimizationCard, PerPrayerAlertsSection). Split out verbatim from
 *   NotificationSettingsScreen.tsx to keep that file under the 300-line cap.
 * Inputs: ThemeColors (light/dark theme).
 * Outputs: createStyles(colors) — same StyleSheet shape as before the split.
 * Constraints: Must stay byte-identical in style values to the pre-split version.
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  masterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    minHeight: 64,
  },
  masterLeft: { flex: 1, marginRight: 12 },
  masterLabel: { fontSize: 17, fontWeight: '700', color: colors.text.primary },
  masterSub: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  infoCard: {
    backgroundColor: colors.brand.light + '33',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 13, color: colors.brand.dark, lineHeight: 20 },
  linkBtn: { marginTop: 8, minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 14, color: colors.brand.dark, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8, marginTop: 20 },
  sectionSub: { fontSize: 13, color: colors.text.muted, marginBottom: 8, lineHeight: 18 },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.card,
    minHeight: 56,
  },
  prayerLabel: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  prayerControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  advanceLabel: { fontSize: 13, color: colors.text.muted, padding: 4 },
  // Adhan sound picker
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    marginBottom: 6,
    minHeight: 48,
  },
  soundRowSelected: { borderWidth: 2, borderColor: colors.brand.mid, backgroundColor: colors.brand.light + '22' },
  soundLabel: { fontSize: 15, color: colors.text.primary },
  soundCheck: { fontSize: 16, color: colors.brand.mid, fontWeight: '700' },
  // Smart alarms
  smartLeft: { flex: 1, marginRight: 12 },
  smartSub: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  customTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  timeValue: { fontSize: 15, fontWeight: '600', color: colors.brand.dark },
  // Night times
  nightCard: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: 12 },
  nightRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  nightLabel: { fontSize: 14, color: colors.text.secondary },
  nightValue: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  // Battery education
  batteryCard: {
    backgroundColor: colors.state.warning + '22',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  batteryTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  batteryStep: { fontSize: 13, color: colors.text.primary, lineHeight: 20, marginTop: 6 },
  batteryOem: { fontSize: 12, color: colors.text.muted, lineHeight: 18, marginTop: 10 },
  batteryButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  batteryBtn: { minHeight: 44, justifyContent: 'center' },
  dismissBtn: { marginTop: 10, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-end' },
  dismissText: { fontSize: 14, color: colors.text.muted, fontWeight: '600' },
  // Test adhan
  testBtn: {
    marginTop: 20,
    backgroundColor: colors.brand.mid,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  testBtnText: { fontSize: 15, fontWeight: '700', color: colors.text.inverse },
});

export type NotificationSettingsStyles = ReturnType<typeof createStyles>;
