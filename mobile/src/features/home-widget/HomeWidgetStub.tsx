/**
 * Purpose: Home screen widget setup screen + refresh trigger for Android (real,
 *   shipped via react-native-android-widget) and iOS (WidgetKit, still pending).
 * Inputs: Next prayer time from prayer-calc, MMKV city setting.
 * Outputs: HomeWidgetStub — Feature 16 of 20.
 * Constraints: Ummat+ gated (isPlus) — widgets are a paid feature; the preview below
 *   shows the user's REAL next-prayer time (computed the same way Home does).
 *   Android: the "NextPrayer" AppWidget is real (src/widgets/NextPrayerWidget.tsx +
 *   widgetTaskHandler.ts, registered in index.js) — writeWidgetData below triggers an
 *   immediate repaint via requestWidgetUpdate so the home-screen widget doesn't wait
 *   for its 30-minute updatePeriodMillis after settings/notifications change.
 *   iOS: WidgetKit (Swift extension) is NOT implemented — remains a documented no-op.
 *   PCI pci-praycalc-home-widgets-native tracks the iOS WidgetKit extension.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-16-home-widgets
 *
 * PCI filed: pci-praycalc-home-widgets-native — tracks native iOS WidgetKit extension development.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { EmptyState } from '../../components/states';
import { useAuthStore } from '../auth/store/useAuthStore';
import { useSettingsStore, useActiveLocation } from '../settings/store/useSettingsStore';
import { usePrayerTimes } from '../prayer/hooks/usePrayerTimes';
import type { CalcMethodKey } from '../../constants/methods';

/** Must match the `name` in app.json's react-native-android-widget plugin config. */
const NEXT_PRAYER_WIDGET_NAME = 'NextPrayer';

/**
 * Widget data writer — triggers a repaint of the home-screen widget after prayer
 * data or settings change, instead of waiting for the OS's periodic update tick.
 *
 * Android: real — calls react-native-android-widget's requestWidgetUpdate, which
 * re-renders NextPrayerWidget for every instance of the widget on the home screen.
 * Lazily imports the library and widget tree so iOS never loads Android-only code.
 *
 * iOS: documented no-op — WidgetKit requires a native Swift extension that does not
 * exist yet (PCI pci-praycalc-home-widgets-native). Nothing to trigger until then.
 */
export async function writeWidgetData(nextPrayer: {
  name: string;
  time: string;
  timestamp: number;
}): Promise<void> {
  void nextPrayer; // widget recomputes from live settings — see renderCurrentNextPrayerWidget
  if (Platform.OS !== 'android') {
    // iOS WidgetKit not implemented yet — see PCI pci-praycalc-home-widgets-native.
    return;
  }
  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { renderCurrentNextPrayerWidget } = await import('../../widgets/widgetTaskHandler');
    await requestWidgetUpdate({
      widgetName: NEXT_PRAYER_WIDGET_NAME,
      renderWidget: renderCurrentNextPrayerWidget,
    });
  } catch {
    // Best-effort refresh — a widget-update failure must never break the caller
    // (notification scheduling, settings save, etc.).
  }
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Widget setup screen ───────────────────────────────────────────────────────

export default function HomeWidgetScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPlus = useAuthStore((s) => s.isPlus);
  const settings = useSettingsStore();
  const activeLocation = useActiveLocation();

  const { times, nextPrayer, secondsToNextPrayer, status } = usePrayerTimes({
    date: new Date(),
    latitude: activeLocation?.latitude ?? null,
    longitude: activeLocation?.longitude ?? null,
    timezone: -(new Date().getTimezoneOffset() / 60),
    method: settings.method as CalcMethodKey,
    madhab: settings.madhab,
    highLatRule: settings.highLatRule,
    customAngles: settings.method === 'Custom'
      ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
      : undefined,
    minuteAdjustments: settings.prayerMinuteAdjustments,
  });

  if (!isPlus) {
    return (
      <EmptyState
        message="The home screen widget is an Ummat+ feature."
        action="Upgrade to Ummat+"
        onAction={() => router.push('/subscription')}
      />
    );
  }

  const hasPreview = status === 'success' && times && nextPrayer;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.icon}>📱</Text>
          <Text style={styles.title} accessibilityRole="header">Home Screen Widget</Text>
          <Text style={styles.subtitle}>See the next prayer time on your home screen</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Widget Preview</Text>
          <View style={styles.widgetPreview} accessibilityRole="image" accessibilityLabel="Widget preview showing next prayer time">
            <Text style={styles.widgetTitle}>Next Prayer</Text>
            {hasPreview ? (
              <>
                <Text style={styles.widgetPrayer}>{nextPrayer}</Text>
                <Text style={styles.widgetTime}>
                  {times[nextPrayer].toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </Text>
                <Text style={styles.widgetCountdown}>in {formatCountdown(secondsToNextPrayer)}</Text>
              </>
            ) : (
              <Text style={styles.widgetTime}>Set your location to preview</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Setup Instructions</Text>
          {[
            'Long-press your home screen',
            'Tap the + button (iOS) or Widgets menu (Android)',
            'Search for "Prayer Times"',
            'Choose your preferred widget size',
            'Tap Add Widget',
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Integration Status</Text>
          <Text style={styles.statusText}>
            Android: live — the "Next Prayer" home-screen widget ships via
            react-native-android-widget and refreshes automatically every 30 minutes
            (and immediately after you change settings or notifications).
          </Text>
          <Text style={styles.statusText}>
            iOS WidgetKit extension: not yet implemented — requires a native Swift
            extension. PCI pci-praycalc-home-widgets-native tracks this work.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', padding: 20, marginBottom: 12 },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.brand.dark },
  subtitle: { fontSize: 15, color: colors.text.muted, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },
  widgetPreview: {
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  widgetTitle: { fontSize: 12, color: colors.brand.light + '99', textTransform: 'uppercase', letterSpacing: 1 },
  widgetPrayer: { fontSize: 20, fontWeight: '800', color: colors.brand.light, marginTop: 4 },
  widgetTime: { fontSize: 32, fontWeight: '700', color: colors.text.inverse },
  widgetCountdown: { fontSize: 14, color: colors.brand.light + 'CC' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, minHeight: 40 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '700', color: colors.text.inverse },
  stepText: { fontSize: 14, color: colors.text.primary, flex: 1 },
  statusCard: {
    backgroundColor: colors.brand.light + '33',
    borderRadius: 12,
    padding: 14,
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: colors.brand.dark, marginBottom: 8 },
  statusText: { fontSize: 13, color: colors.brand.deep, lineHeight: 20, marginBottom: 6 },
});
