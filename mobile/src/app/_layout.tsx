/**
 * Purpose: Root layout — GqlClientProvider (urql v4 + Bearer JWT) + navigation shell.
 *   RTL layout wiring prepared; actual RTL enforcement wired in T-03 i18n ticket.
 * Inputs: SecureStore JWT token on mount; auth store state
 * Outputs: Wrapped app tree with urql Provider; auth routing
 * Constraints: Expo Router v4 file-based routing. No ApolloProvider.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-root
 */

// i18n side-effect import MUST come first: it resolves the persisted/device
// locale and calls I18nManager.forceRTL before the React tree renders (RTL
// direction cannot change after first render without a full app reload).
import '../i18n';

import { useEffect, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { GqlClientProvider } from '../lib/graphql';
import { extractPinFromDeepLink } from '../lib/pairing/pairingMutation';
import { registerIAPListener } from '../lib/iap/IAPListener';
import {
  registerRescheduleTask,
  schedulePrayerNotifications,
} from '../lib/notifications/PrayerNotificationService';
import { playAdhan } from '../features/adhan/services/AdhanAudioService';
import { useSettingsStore } from '../features/settings/store/useSettingsStore';
import type { PrayerName } from '../types/prayer';

/** Route praycalc://pair?pin=NNNNNN deep links (cold start + foreground) to /pair-tv. */
function usePairingDeepLink() {
  useEffect(() => {
    function handleUrl(url: string | null) {
      if (!url) return;
      const pin = extractPinFromDeepLink(url);
      if (pin) {
        router.push({ pathname: '/pair-tv', params: { pin } });
      }
    }

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);
}

/**
 * Play the user's selected adhan voice when a prayer notification is tapped.
 * Notification SOUNDS are still the system default (bundled native sound assets
 * are tracked in PCI pci-praycalc-adhan-notification-sound) — this handler is the
 * honest in-between: tapping the notification opens the app and the chosen
 * reciter's adhan plays. Dedupes cold-start getLastNotificationResponseAsync
 * against the live listener via the notification request id.
 */
function useAdhanOnNotificationTap() {
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    function handle(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handledId.current === id) return;
      handledId.current = id;

      const prayerName = response.notification.request.content.data?.['prayerName'] as PrayerName | undefined;
      if (!prayerName) return;
      const s = useSettingsStore.getState();
      if (!s.perPrayerAdhanEnabled[prayerName] || !s.adhanVoiceUrl) return;
      void playAdhan({
        audioUrl: s.adhanVoiceUrl,
        prayerName,
        reciterName: s.adhanVoiceName ?? 'Adhan',
      }).catch(() => undefined);
    }

    void Notifications.getLastNotificationResponseAsync().then(handle);
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  usePairingDeepLink();
  useAdhanOnNotificationTap();

  // Same resolution rule as useThemeColors(): 'system' follows the OS, else forced.
  // Duplicated here (rather than calling useThemeColors) so the root layout doesn't
  // need the full color palette — it only needs the light/dark boolean for the bar.
  const themeMode = useSettingsStore((s) => s.themeMode);
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  useEffect(() => {
    // Global purchase listener — must be registered once at app start, not inside
    // SubscriptionScreen, so unfinished/restored transactions are never lost.
    registerIAPListener();
  }, []);

  useEffect(() => {
    // Keep the notification window alive: notifications are only pre-scheduled
    // NOTIFICATION_DAYS_AHEAD days out, so every app start (a) re-registers the
    // midnight background reschedule task and (b) refreshes the schedule now.
    // Without this the schedule silently expires if the app stays closed longer
    // than the pre-scheduled window and the background task was never registered.
    void (async () => {
      await useSettingsStore.persist.rehydrate();
      if (!useSettingsStore.getState().notificationsEnabled) return;
      await registerRescheduleTask();
      await schedulePrayerNotifications();
    })().catch(() => undefined);
  }, []);

  return (
    <GqlClientProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
        <Stack.Screen name="city-search" options={{ headerShown: true, title: 'Find City' }} />
        <Stack.Screen name="timetable" options={{ headerShown: true, title: 'Timetable' }} />
        <Stack.Screen name="mosques" options={{ headerShown: true, title: 'Nearby Mosques' }} />
        <Stack.Screen name="pair-tv" options={{ headerShown: true, title: 'Pair TV' }} />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GqlClientProvider>
  );
}
