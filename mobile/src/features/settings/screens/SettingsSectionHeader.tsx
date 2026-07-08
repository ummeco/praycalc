/**
 * Purpose: Tiny shared section-header label used by SettingsScreen and its extracted
 *   section components (SettingsLanguageSection, SettingsAdjustmentsSection,
 *   SettingsAppearanceSection) — avoids re-declaring the same one-line component 4 times.
 * Inputs: title text, the caller's own createStyles() output (each section has its own
 *   palette-derived StyleSheet, but all define an identical `sectionHeader` style shape).
 * Outputs: SectionHeader component.
 * Constraints: Style shape (`sectionHeader`) must exist on whatever `styles` object is
 *   passed in — every section-level createStyles() below defines it identically.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-settings-section-header
 */

import React from 'react';
import { Text } from 'react-native';

interface SectionHeaderStyles {
  sectionHeader: object;
}

export function SectionHeader({ title, styles }: { title: string; styles: SectionHeaderStyles }) {
  return (
    <Text style={styles.sectionHeader} accessibilityRole="header">
      {title}
    </Text>
  );
}
