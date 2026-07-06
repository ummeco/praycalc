/**
 * Purpose: Tab navigator layout — home (prayer times), qibla, calendar, quran, more (settings entry)
 * Inputs: Expo Router tabs
 * Outputs: Bottom tab bar with 5 tabs and Ionicons icons
 * Constraints: Expo Router v4; no react-navigation explicit navigator needed (Expo Router wraps it).
 *   Quran tab renders the same QuranScreen component as the top-level /quran stack route
 *   (kept for deep links) — see src/app/quran/index.tsx.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-tabs
 */

import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '../../hooks/useThemeColors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(
  name: IoniconsName,
  focusedName: IoniconsName,
): (props: { focused: boolean; color: string; size: number }) => React.ReactElement {
  return ({ focused, color, size }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

export default function TabLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand.dark,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: { backgroundColor: colors.background.primary },
        headerStyle: { backgroundColor: colors.brand.deep },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Prayer Times',
          tabBarLabel: 'Prayers',
          tabBarIcon: tabIcon('time-outline', 'time'),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Qibla',
          tabBarIcon: tabIcon('compass-outline', 'compass'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: tabIcon('calendar-outline', 'calendar'),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: tabIcon('book-outline', 'book'),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: tabIcon('menu-outline', 'menu'),
        }}
      />
    </Tabs>
  );
}
