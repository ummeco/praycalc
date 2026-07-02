/**
 * Purpose: More tab — navigation hub for all secondary features.
 *   Updated in T-02 to wire all 15 feature routes.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-more-tab
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

interface MenuItem {
  label: string;
  subtitle: string;
  route: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Settings', subtitle: 'Method, location, notifications', route: '/settings', icon: '⚙️' },
  { label: 'Adhan Library', subtitle: 'Prayer call audio & reciter', route: '/adhan', icon: '🔊' },
  { label: 'Tasbeeh Counter', subtitle: 'Digital dhikr counter', route: '/tasbeeh', icon: '📿' },
  { label: 'Dua & Adhkar', subtitle: 'Morning & evening supplications', route: '/dua-dhikr', icon: '🤲' },
  { label: 'Moon Phase', subtitle: 'Lunar calendar & Hijri date', route: '/moon', icon: '🌙' },
  { label: 'Quran', subtitle: 'Uthmani script with bookmarks', route: '/quran', icon: '📖' },
  { label: 'Prayer Stats', subtitle: 'Track your prayers & streaks', route: '/stats', icon: '📊' },
  { label: 'Ramadan', subtitle: 'Suhoor & Iftar times, tracker', route: '/ramadan', icon: '🌙' },
  { label: 'Go Pro', subtitle: 'Unlock premium features', route: '/subscription', icon: '⭐' },
  { label: 'Home Widget', subtitle: 'Next prayer on home screen', route: '/home-widget', icon: '🪟' },
  { label: 'Smart Home', subtitle: 'Lock devices during salah', route: '/smart-home', icon: '🏠' },
  { label: 'Pair TV', subtitle: 'Link the PrayCalc TV app', route: '/pair-tv', icon: '📺' },
  { label: 'Prayer Calendar', subtitle: 'Add prayer times to calendar', route: '/agendas', icon: '📅' },
  { label: 'Travel Mode', subtitle: 'Musafir qasr for travellers', route: '/travel', icon: '✈️' },
];

export default function MoreScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading} accessibilityRole="header">More</Text>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.menuRow}
          onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
          accessibilityRole="menuitem"
          accessibilityLabel={item.label}
          accessibilityHint={item.subtitle}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  content: { padding: 16, gap: 4 },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, marginBottom: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    gap: 12,
    minHeight: 60,
  },
  menuIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '500', color: Colors.text.primary },
  menuSubtitle: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
  arrow: { fontSize: 20, color: Colors.text.muted },
});
