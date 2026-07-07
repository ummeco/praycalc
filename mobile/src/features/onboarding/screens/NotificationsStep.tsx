/**
 * Purpose: Onboarding step 3 — priming screen for adhan/reminder notifications,
 *   explaining WHY before triggering the actual OS notification permission
 *   prompt (only on Continue tap, never on mount).
 * Inputs: onDone(granted: boolean) callback, onSkip callback.
 * Outputs: NotificationsStep component.
 * Constraints: Uses expo-notifications directly (requestPermissionsAsync) rather
 *   than importing PrayerNotificationService — that module belongs to another
 *   agent this wave and does not export a permission-request helper; calling the
 *   same underlying Expo API here keeps behavior equivalent without touching
 *   notification-feature ownership.
 * SPORT: REGISTRY-SCREENS.md#praycalc-mobile-onboarding-notifications-step
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';

interface NotificationsStepProps {
  onDone: (granted: boolean) => void;
  onSkip: () => void;
}

export function NotificationsStep({ onDone, onSkip }: NotificationsStepProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [requesting, setRequesting] = useState(false);

  async function requestNotifications() {
    setRequesting(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      onDone(status === 'granted');
    } catch {
      onDone(false);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{t('onboarding.notifications.title')}</Text>
      <Text style={styles.desc}>{t('onboarding.notifications.prime')}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={requestNotifications}
        disabled={requesting}
        accessibilityRole="button"
      >
        {requesting ? (
          <ActivityIndicator color={colors.brand.deep} />
        ) : (
          <Text style={styles.buttonText}>{t('onboarding.notifications.allow')}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onSkip} accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>{t('onboarding.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  panel: { gap: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.brand.light },
  desc: { fontSize: 16, color: colors.text.inverse, lineHeight: 24, opacity: 0.9 },
  button: { backgroundColor: colors.brand.mid, borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: colors.brand.deep, fontWeight: '700', fontSize: 16 },
  secondaryButton: { alignItems: 'center', padding: 14 },
  secondaryButtonText: { color: colors.brand.light, fontSize: 14, opacity: 0.8 },
});
