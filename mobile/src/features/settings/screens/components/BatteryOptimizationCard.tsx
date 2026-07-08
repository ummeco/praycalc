/**
 * Purpose: Android-only battery-optimization education card shown under notification
 *   settings — explains exact-alarm + battery-optimization steps, links to system
 *   settings, and can be dismissed for the session. Extracted verbatim from
 *   NotificationSettingsScreen.tsx (was pushing that file over the 300-line cap).
 * Inputs: t (translation fn), styles (from NotificationSettingsScreen.styles), and
 *   parent-owned handlers for the two settings deep-links + dismiss.
 * Outputs: BatteryOptimizationCard component.
 * Constraints: Presentation-only — no state, no behavior change from the pre-extraction
 *   inline JSX. Visibility gating (notificationsEnabled && Android && !dismissed) stays
 *   in the parent.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { useTranslation } from '../../../../i18n';
import type { NotificationSettingsStyles } from '../NotificationSettingsScreen.styles';

interface BatteryOptimizationCardProps {
  t: ReturnType<typeof useTranslation>['t'];
  styles: NotificationSettingsStyles;
  onOpenSystemSettings: () => void;
  onOpenBatterySettings: () => void;
  onDismiss: () => void;
}

export function BatteryOptimizationCard({
  t, styles, onOpenSystemSettings, onOpenBatterySettings, onDismiss,
}: BatteryOptimizationCardProps) {
  return (
    <View style={styles.batteryCard}>
      <Text style={styles.batteryTitle}>{t('screens.notifications.batteryTitle')}</Text>
      <Text style={styles.infoText}>{t('screens.notifications.batteryIntro')}</Text>
      <Text style={styles.batteryStep}>1. {t('screens.notifications.batteryStepAlarms')}</Text>
      <Text style={styles.batteryStep}>2. {t('screens.notifications.batteryStepOptimization')}</Text>
      <Text style={styles.batteryOem}>{t('screens.notifications.batteryOemNote')}</Text>
      <View style={styles.batteryButtons}>
        <TouchableOpacity
          style={styles.batteryBtn}
          onPress={onOpenSystemSettings}
          accessibilityRole="button"
          accessibilityLabel={t('screens.notifications.openExactAlarm')}
        >
          <Text style={styles.linkText}>{t('screens.notifications.openExactAlarm')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.batteryBtn}
          onPress={onOpenBatterySettings}
          accessibilityRole="button"
          accessibilityLabel={t('screens.notifications.openBatterySettings')}
        >
          <Text style={styles.linkText}>{t('screens.notifications.openBatterySettings')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t('screens.notifications.dismiss')}
      >
        <Text style={styles.dismissText}>{t('screens.notifications.dismiss')}</Text>
      </TouchableOpacity>
    </View>
  );
}
