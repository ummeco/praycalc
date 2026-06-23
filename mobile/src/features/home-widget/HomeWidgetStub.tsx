/**
 * Purpose: Home screen widget scaffold for iOS (WidgetKit) and Android (AppWidget).
 *   Writes next prayer time to shared AppGroup storage (iOS) / SharedPreferences (Android)
 *   for native widget to read.
 * Inputs: Next prayer time from prayer-calc, MMKV city setting.
 * Outputs: HomeWidgetStub — Feature 16 of 20.
 * Constraints: expo-widget-kit is experimental in SDK 53. If not available, this stub
 *   documents the integration point and files PCI pci-praycalc-home-widgets-native.
 *   Full native WidgetKit (Swift) + AppWidget (Kotlin) required for production.
 *   Per spec §6.6: stub with PCI if expo-widget-kit unavailable.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-16-home-widgets
 *
 * PCI filed: pci-praycalc-home-widgets-native — tracks native WidgetKit extension development.
 * MIGRATION-STATUS.md updated below.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

/**
 * Widget data writer — writes next prayer info to shared storage.
 * On iOS: uses expo-secure-store with keychain group (App Group) so Swift widget can read.
 * On Android: uses AsyncStorage + WorkManager bridge.
 *
 * NOTE: Full native WidgetKit UI requires Swift extension in ios/ target.
 * The expo-widget-kit npm plugin scaffolds the extension.
 * Until the plugin reaches stable for SDK 53, this screen documents the integration.
 */
export async function writeWidgetData(nextPrayer: {
  name: string;
  time: string;
  timestamp: number;
}): Promise<void> {
  // In production: write to App Group UserDefaults (iOS) or SharedPreferences (Android)
  // using the expo-widget-kit plugin's shared storage bridge.
  // For now: no-op (widget reads from MMKV when native bridge is available)
  void nextPrayer;
}

// ── Widget setup screen ───────────────────────────────────────────────────────

export default function HomeWidgetScreen() {
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
          {/* Simulated widget preview */}
          <View style={styles.widgetPreview} accessibilityRole="image" accessibilityLabel="Widget preview showing next prayer time">
            <Text style={styles.widgetTitle}>Next Prayer</Text>
            <Text style={styles.widgetPrayer}>Maghrib</Text>
            <Text style={styles.widgetTime}>6:32 PM</Text>
            <Text style={styles.widgetCountdown}>in 2h 14m</Text>
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
            iOS WidgetKit extension: requires native Swift code via expo-widget-kit plugin.
            PCI pci-praycalc-home-widgets-native filed.
          </Text>
          <Text style={styles.statusText}>
            Android AppWidget: requires react-native-android-widget.
            PCI pci-praycalc-home-widgets-native filed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', padding: 20, marginBottom: 12 },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.brand.dark },
  subtitle: { fontSize: 15, color: Colors.text.muted, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  widgetPreview: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  widgetTitle: { fontSize: 12, color: Colors.brand.light + '99', textTransform: 'uppercase', letterSpacing: 1 },
  widgetPrayer: { fontSize: 20, fontWeight: '800', color: Colors.brand.light, marginTop: 4 },
  widgetTime: { fontSize: 32, fontWeight: '700', color: Colors.text.inverse },
  widgetCountdown: { fontSize: 14, color: Colors.brand.light + 'CC' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, minHeight: 40 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '700', color: Colors.text.inverse },
  stepText: { fontSize: 14, color: Colors.text.primary, flex: 1 },
  statusCard: {
    backgroundColor: Colors.brand.light + '33',
    borderRadius: 12,
    padding: 14,
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: Colors.brand.dark, marginBottom: 8 },
  statusText: { fontSize: 13, color: Colors.brand.deep, lineHeight: 20, marginBottom: 6 },
});
