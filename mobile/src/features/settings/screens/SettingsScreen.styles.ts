/**
 * Purpose: Stylesheet for SettingsScreen. Split out verbatim from SettingsScreen.tsx
 *   to keep that file under the 300-line cap.
 * Inputs: ThemeColors (light/dark theme).
 * Outputs: createStyles(colors) — same StyleSheet shape as before the split.
 * Constraints: Must stay byte-identical in style values to the pre-split version.
 */

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../constants/colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: 16, gap: 8 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: colors.text.primary },
  rowValue: { fontSize: 14, color: colors.text.muted },
  hint: { fontSize: 13, color: colors.text.muted, fontStyle: 'italic' },
  plusBadge: {
    backgroundColor: colors.brand.mid,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upsellRow: { gap: 8 },
  button: {
    backgroundColor: colors.brand.dark,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: colors.text.inverse, fontWeight: '600', fontSize: 14 },
  buttonSecondary: { backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.brand.mid },
  buttonSecondaryText: { color: colors.brand.dark, fontWeight: '600', fontSize: 14 },
});
