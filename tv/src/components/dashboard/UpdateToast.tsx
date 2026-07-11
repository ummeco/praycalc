/**
 * Purpose: Small dismissible corner banner shown when useUpdateCheck finds a newer
 *   GitHub tv-v* release than the one currently running. TV builds never auto-install —
 *   store builds (Play/Fire TV) update themselves; this only points staff at where to
 *   grab a manual build.
 * Inputs: none (reads useUpdateCheck()).
 * Outputs: a focusable, dismissible corner banner, or null when no update is pending /
 *   already dismissed.
 * Constraints: renders above every dashboard layout (mounted once in DashboardScreen,
 *   not per-layout); D-pad focusable so the remote can dismiss it; bottom-right corner to
 *   avoid the top-left Menu button and top-right Ambient-layout clock chip.
 * SPORT: praycalc/tv components/dashboard
 */

import React from 'react';
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import { useUpdateCheck } from '../../hooks/useUpdateCheck';
import { useTheme } from '../../hooks/useTheme';

export default function UpdateToast(): React.JSX.Element | null {
  const { visible, dismiss } = useUpdateCheck();
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.root, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.textPrimary }]}>
        Update available on GitHub — praycalc.com/tv
      </Text>
      <TouchableHighlight
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Dismiss update notice"
        onPress={dismiss}
        underlayColor={theme.border}
        style={styles.dismissBtn}
      >
        <Text style={[styles.dismissText, { color: theme.textSecondary }]}>Dismiss</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 50,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
