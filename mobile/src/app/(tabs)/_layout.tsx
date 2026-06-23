/**
 * Purpose: Tab navigator layout — home (prayer times), qibla, calendar, more (settings entry)
 * Inputs: Expo Router tabs
 * Outputs: Bottom tab bar with 4 tabs
 * Constraints: Expo Router v4; no react-navigation explicit navigator needed (Expo Router wraps it).
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-tabs
 */

import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.dark,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: { backgroundColor: Colors.background.primary },
        headerStyle: { backgroundColor: Colors.brand.deep },
        headerTintColor: Colors.text.inverse,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Prayer Times',
          tabBarLabel: 'Prayers',
          tabBarIcon: () => null, // Icon wired in T-03 with @expo/vector-icons
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Qibla',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
