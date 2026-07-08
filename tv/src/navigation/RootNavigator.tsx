/**
 * Purpose: Root stack navigator for PrayCalc TV — react-navigation v6
 * Inputs: React Navigation stack; screen components
 * Outputs: Full navigation tree with D-pad focus support
 * Constraints: react-navigation (NOT Expo Router — tvOS requires react-navigation for focus engine)
 * SPORT: praycalc/tv navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import QiblaScreen from '../screens/QiblaScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HadithOfDayScreen from '../screens/HadithOfDayScreen';
import DuaDisplayScreen from '../screens/DuaDisplayScreen';
import AdhanSettingsScreen from '../screens/AdhanSettingsScreen';
import NotificationScheduleScreen from '../screens/NotificationScheduleScreen';
import CitySearchScreen from '../screens/CitySearchScreen';
import PairingScreen from '../screens/PairingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import RamadanScreen from '../screens/RamadanScreen';
import MoonPhaseScreen from '../screens/MoonPhaseScreen';
import IslamicEventsScreen from '../screens/IslamicEventsScreen';
import ScreensaverScreen from '../screens/ScreensaverScreen';
import TvSystemScreen from '../screens/TvSystemScreen';

const Stack = createStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  /** Boot-resolved starting screen — 'Pairing' for an unclaimed device, 'Dashboard'
   *  once this TV's device id maps to a claimed pc_tv_pairing row. Resolved in App.tsx
   *  before this navigator mounts so an unpaired TV never flashes Dashboard first. */
  initialRouteName: keyof RootStackParamList;
}

export default function RootNavigator({
  initialRouteName,
}: RootNavigatorProps): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          cardStyle: { backgroundColor: '#0D2F17' },
        }}
      >
        {/* Dashboard is the default masjid-display screen; all legacy screens below
            stay reachable via the dashboard Menu (navigation kept intact). */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Qibla" component={QiblaScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="HadithOfDay" component={HadithOfDayScreen} />
        <Stack.Screen name="DuaDisplay" component={DuaDisplayScreen} />
        <Stack.Screen name="AdhanSettings" component={AdhanSettingsScreen} />
        <Stack.Screen name="NotificationSchedule" component={NotificationScheduleScreen} />
        <Stack.Screen name="CitySearch" component={CitySearchScreen} />
        <Stack.Screen name="Pairing" component={PairingScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Ramadan" component={RamadanScreen} />
        <Stack.Screen name="MoonPhase" component={MoonPhaseScreen} />
        <Stack.Screen name="IslamicEvents" component={IslamicEventsScreen} />
        <Stack.Screen name="Screensaver" component={ScreensaverScreen} />
        <Stack.Screen name="TvSystem" component={TvSystemScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
