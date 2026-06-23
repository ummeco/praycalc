/**
 * Purpose: Root layout — GqlClientProvider (urql v4 + Bearer JWT) + navigation shell.
 *   RTL layout wiring prepared; actual RTL enforcement wired in T-03 i18n ticket.
 * Inputs: SecureStore JWT token on mount; auth store state
 * Outputs: Wrapped app tree with urql Provider; auth routing
 * Constraints: Expo Router v4 file-based routing. No ApolloProvider.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-root
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import { GqlClientProvider } from '../lib/graphql';

export default function RootLayout() {
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
        <Stack.Screen name="onboarding" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GqlClientProvider>
  );
}
