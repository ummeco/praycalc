/**
 * Purpose: Root layout — GqlClientProvider (urql v4 + Bearer JWT) + navigation shell.
 *   RTL layout wiring prepared; actual RTL enforcement wired in T-03 i18n ticket.
 * Inputs: SecureStore JWT token on mount; auth store state
 * Outputs: Wrapped app tree with urql Provider; auth routing
 * Constraints: Expo Router v4 file-based routing. No ApolloProvider.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-root
 */

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import * as Linking from 'expo-linking';
import { GqlClientProvider } from '../lib/graphql';
import { extractPinFromDeepLink } from '../lib/pairing/pairingMutation';

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

export default function RootLayout() {
  usePairingDeepLink();

  useEffect(() => {
    // RTL layout hook — actual RTL enforcement via T-03 i18n (locale detection)
    // I18nManager.forceRTL(isRtlLocale) — wired here, not yet active
    // This comment is intentional: the hook point is in place for T-03.
  }, []);

  return (
    <GqlClientProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
        <Stack.Screen name="city-search" options={{ headerShown: true, title: 'Find City' }} />
        <Stack.Screen name="pair-tv" options={{ headerShown: true, title: 'Pair TV' }} />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GqlClientProvider>
  );
}
