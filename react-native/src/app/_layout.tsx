/**
 * Purpose: Root layout — tab navigation with Prayer Times, Qibla, Settings tabs.
 * Inputs: Expo Router file-based routing
 * Outputs: Bottom tab bar wrapping the three main screens
 * Constraints: SplashScreen hidden after font load. Safe area context required.
 * SPORT: app/_layout.tsx
 */

import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a1f0f',
            borderTopColor: 'rgba(255,255,255,0.1)',
          },
          tabBarActiveTintColor: '#34a853',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Prayer Times',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🕌</Text>,
          }}
        />
        <Tabs.Screen
          name="qibla"
          options={{
            title: 'Qibla',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🕋</Text>,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔔</Text>,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
          }}
        />
      </Tabs>
    </>
  );
}
