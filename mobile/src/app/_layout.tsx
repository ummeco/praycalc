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
import i18next, { useTranslation } from '../i18n';
import { GqlClientProvider } from '../lib/graphql';
import { parseDeepLink } from '../lib/deepLinkRoutes';
import { registerIAPListener } from '../lib/iap/IAPListener';
// Side-effect import: registers TaskManager.defineTask(GEOFENCE_TASK_NAME, ...) at
// module scope so masjid-mute geofence ENTER/EXIT events are handled even when the
// OS launches the app headlessly (app killed, no screen mounted) — see MOB-4. The
// task's only other importers (MasjidMuteScreen, useGeofenceSync) do not run until
// the user opens that screen, which is too late for a headless background wake.
import '../features/masjid-mute/lib/geofenceTask';
import { useOtaUpdates } from '../lib/updates/otaUpdates';
import {
  registerRescheduleTask,
  schedulePrayerNotifications,
} from '../lib/notifications/PrayerNotificationService';
import { playAdhan } from '../features/adhan/services/AdhanAudioService';
import { useSettingsStore } from '../features/settings/store/useSettingsStore';
import type { PrayerName } from '../types/prayer';
import { initSentry } from '../lib/sentry';

// Crash reporting: no-ops when EXPO_PUBLIC_SENTRY_DSN is unset (see sentry.ts).
// Runs at module scope, immediately after the RTL side-effect import above,
// so it activates as early as possible — before the React tree renders and
// before any of the effects below (IAP listener, notification scheduling)
// can throw. Never throws itself even when Sentry is disabled.
initSentry();

/**
 * Route praycalc:// deep links (cold start + foreground) to the matching screen.
 * praycalc://pair?pin=NNNNNN -> /pair-tv (original handler, behavior unchanged —
 * only the parsing moved into the shared parseDeepLink() so new routes can reuse
 * the same URL-parsing rules instead of duplicating them).
 * praycalc://city/<name> -> /city-search prefilled with that name.
 * praycalc://times -> /timetable.
 */
function useDeepLinkRouting() {
  useEffect(() => {
    function handleUrl(url: string | null) {
      if (!url) return;
      const route = parseDeepLink(url);
      if (!route) return;

      switch (route.kind) {
        case 'pair':
          router.push({ pathname: '/pair-tv', params: { pin: route.pin } });
          break;
        case 'city':
          router.push({ pathname: '/city-search', params: { q: route.name } });
          break;
        case 'times':
          router.push('/timetable');
          break;
      }
    }

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);
}

/**
 * Play the user's selected adhan voice when a prayer notification is tapped.
 * The notification itself plays the bundled 26.6s takbir cut (iOS caps
 * notification audio at 30s) — this handler is the full-length follow-through:
 * tapping the notification opens the app and the chosen reciter's complete
 * adhan plays. Dedupes cold-start getLastNotificationResponseAsync
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
  const { t } = useTranslation();
  useDeepLinkRouting();
  useAdhanOnNotificationTap();
  useOtaUpdates();

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

      // Locale single-source reconcile: i18n/index.ts resolves its own locale at module
      // init (MMKV persisted override, else device locale) independently of this zustand
      // store's `locale` field (AsyncStorage). The two can diverge — e.g. a fresh install
      // where i18next picked the device locale but the store still has its default 'en'
      // initial state before rehydration completes. i18next/MMKV is authoritative at boot
      // (it already drove RTL direction before React rendered — see the side-effect import
      // above), so bring the store in line with it rather than the other way around.
      if (useSettingsStore.getState().locale !== i18next.language) {
        useSettingsStore.getState().setLocale(i18next.language);
      }

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
        <Stack.Screen name="settings" options={{ headerShown: true, title: t('settings.title') }} />
        <Stack.Screen name="city-search" options={{ headerShown: true, title: t('screens.citySearch.findCityTitle') }} />
        <Stack.Screen name="timetable" options={{ headerShown: true, title: t('menu.timetable.label') }} />
        <Stack.Screen name="mosques" options={{ headerShown: true, title: t('menu.mosques.label') }} />
        <Stack.Screen name="jumuah" options={{ headerShown: true, title: t('menu.jumuah.label') }} />
        <Stack.Screen name="masjid-mute" options={{ headerShown: true, title: t('menu.masjidMute.label') }} />
        <Stack.Screen name="fasting" options={{ headerShown: true, title: t('menu.fasting.label') }} />
        <Stack.Screen name="qada" options={{ headerShown: true, title: t('menu.qada.label') }} />
        <Stack.Screen name="pair-tv" options={{ headerShown: true, title: t('menu.pairTv.label') }} />
        <Stack.Screen name="tvs" options={{ headerShown: true, title: t('menu.tvManager.label') }} />
        <Stack.Screen name="privacy" options={{ headerShown: true, title: t('menu.privacy.label') }} />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GqlClientProvider>
  );
}
