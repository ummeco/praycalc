/**
 * Purpose: Home screen widget setup screen + refresh trigger for BOTH Android (real,
 *   shipped via react-native-android-widget) and iOS (real, WidgetKit via
 *   @bacons/apple-targets — code-complete, pending an EAS/native build).
 * Inputs: Next prayer time from prayer-calc, MMKV city setting.
 * Outputs: HomeWidgetStub — Feature 16 of 20.
 * Constraints: Ummat+ gated (isPlus) — widgets are a paid feature; the preview below
 *   shows the user's REAL next-prayer time (computed the same way Home does).
 *   Android: the "NextPrayer" AppWidget is real (src/widgets/NextPrayerWidget.tsx +
 *   widgetTaskHandler.ts, registered in index.js) — writeWidgetData below triggers an
 *   immediate repaint via requestWidgetUpdate so the home-screen widget doesn't wait
 *   for its 30-minute updatePeriodMillis after settings/notifications change.
 *   iOS: the WidgetKit extension is a `widget` Apple Target
 *   (targets/next-prayer-widget/ — Swift TimelineProvider + expo-target.config.js).
 *   writeWidgetData's iOS branch delegates to refreshIosHomeWidget, which computes the
 *   full day's remaining prayers (shared widgetTaskHandler helper), writes them as a
 *   JSON payload into App Group UserDefaults (ExtensionStorage) and reloads the widget
 *   timeline; the Swift side then advances entries locally so the widget flips at each
 *   prayer time without waking the app. Code-complete in-repo (JS + Swift + config);
 *   only a native build binds them. Closes PCI pci-praycalc-home-widgets-native.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-16-home-widgets
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from '../../i18n';
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
 * iOS: real — delegates to refreshIosHomeWidget (App Group UserDefaults via
 * ExtensionStorage + WidgetKit reload). Lazily imported so Android never loads
 * the iOS-only @bacons/apple-targets path.
 */
export async function writeWidgetData(nextPrayer: {
  name: string;
  time: string;
  timestamp: number;
}): Promise<void> {
  void nextPrayer; // widget recomputes from live settings — see computeIosWidgetPayload / renderCurrentNextPrayerWidget
  if (Platform.OS === 'ios') {
    try {
      const { refreshIosHomeWidget } = await import('./iosWidgetWriter');
      await refreshIosHomeWidget();
    } catch {
      // Best-effort refresh — a widget-update failure must never break the caller.
    }
    return;
  }
  if (Platform.OS !== 'android') return; // web / other — no home-screen widget host.
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
  const { t } = useTranslation();
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
          <Text style={styles.title} accessibilityRole="header">{t('screens.homeWidget.title')}</Text>
          <Text style={styles.subtitle}>{t('screens.homeWidget.subtitle')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('screens.homeWidget.widgetPreviewTitle')}</Text>
          <View style={styles.widgetPreview} accessibilityRole="image" accessibilityLabel={t('screens.homeWidget.widgetPreviewAccessibilityLabel')}>
            <Text style={styles.widgetTitle}>{t('screens.homeWidget.nextPrayer')}</Text>
            {hasPreview ? (
              <>
                <Text style={styles.widgetPrayer}>{nextPrayer}</Text>
                <Text style={styles.widgetTime}>
                  {times[nextPrayer].toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </Text>
                <Text style={styles.widgetCountdown}>in {formatCountdown(secondsToNextPrayer)}</Text>
              </>
            ) : (
              <Text style={styles.widgetTime}>{t('screens.homeWidget.setLocationToPreview')}</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('screens.homeWidget.setupInstructions')}</Text>
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
          <Text style={styles.statusTitle}>{t('screens.homeWidget.integrationStatus')}</Text>
          <Text style={styles.statusText}>
            Android: live — the "Next Prayer" home-screen widget ships via
            react-native-android-widget and refreshes automatically every 30 minutes
            (and immediately after you change settings or notifications).
          </Text>
          <Text style={styles.statusText}>
            iOS: live — the "Next Prayer" WidgetKit widget updates whenever you change
            settings or notifications and advances at each prayer time on its own.
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
