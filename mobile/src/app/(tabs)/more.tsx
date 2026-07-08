/**
 * Purpose: More tab — navigation hub for all secondary features.
 *   Updated in T-02 to wire all 15 feature routes.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-more-tab
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { buildAppShareText } from '../../lib/share';

interface MenuItem {
  labelKey: string;
  subtitleKey: string;
  /** Either a route to push, or an 'action' for a non-navigation row (e.g. Share). */
  route: string | 'action:share';
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { labelKey: 'menu.settings.label', subtitleKey: 'menu.settings.subtitle', route: '/settings', icon: '⚙️' },
  { labelKey: 'menu.privacy.label', subtitleKey: 'menu.privacy.subtitle', route: '/privacy', icon: '🔒' },
  { labelKey: 'menu.adhan.label', subtitleKey: 'menu.adhan.subtitle', route: '/adhan', icon: '🔊' },
  { labelKey: 'menu.tasbeeh.label', subtitleKey: 'menu.tasbeeh.subtitle', route: '/tasbeeh', icon: '📿' },
  { labelKey: 'menu.duaDhikr.label', subtitleKey: 'menu.duaDhikr.subtitle', route: '/dua-dhikr', icon: '🤲' },
  { labelKey: 'menu.moon.label', subtitleKey: 'menu.moon.subtitle', route: '/moon', icon: '🌙' },
  { labelKey: 'menu.quran.label', subtitleKey: 'menu.quran.subtitle', route: '/quran', icon: '📖' },
  { labelKey: 'menu.stats.label', subtitleKey: 'menu.stats.subtitle', route: '/stats', icon: '📊' },
  { labelKey: 'menu.ramadan.label', subtitleKey: 'menu.ramadan.subtitle', route: '/ramadan', icon: '🌙' },
  { labelKey: 'menu.subscription.label', subtitleKey: 'menu.subscription.subtitle', route: '/subscription', icon: '⭐' },
  { labelKey: 'menu.homeWidget.label', subtitleKey: 'menu.homeWidget.subtitle', route: '/home-widget', icon: '🪟' },
  { labelKey: 'menu.smartHome.label', subtitleKey: 'menu.smartHome.subtitle', route: '/smart-home', icon: '🏠' },
  { labelKey: 'menu.pairTv.label', subtitleKey: 'menu.pairTv.subtitle', route: '/pair-tv', icon: '📺' },
  { labelKey: 'menu.tvManager.label', subtitleKey: 'menu.tvManager.subtitle', route: '/tvs', icon: '📺' },
  { labelKey: 'menu.agendas.label', subtitleKey: 'menu.agendas.subtitle', route: '/agendas', icon: '📅' },
  { labelKey: 'menu.timetable.label', subtitleKey: 'menu.timetable.subtitle', route: '/timetable', icon: '🗓️' },
  { labelKey: 'menu.mosques.label', subtitleKey: 'menu.mosques.subtitle', route: '/mosques', icon: '🕌' },
  { labelKey: 'menu.jumuah.label', subtitleKey: 'menu.jumuah.subtitle', route: '/jumuah', icon: '🕌' },
  { labelKey: 'menu.masjidMute.label', subtitleKey: 'menu.masjidMute.subtitle', route: '/masjid-mute', icon: '🔕' },
  { labelKey: 'menu.fasting.label', subtitleKey: 'menu.fasting.subtitle', route: '/fasting', icon: '🍽️' },
  { labelKey: 'menu.qada.label', subtitleKey: 'menu.qada.subtitle', route: '/qada', icon: '📝' },
  { labelKey: 'menu.travel.label', subtitleKey: 'menu.travel.subtitle', route: '/travel', icon: '✈️' },
  { labelKey: 'menu.shareApp.label', subtitleKey: 'menu.shareApp.subtitle', route: 'action:share', icon: '📤' },
];

export default function MoreScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handlePress(route: MenuItem['route']) {
    if (route === 'action:share') {
      void Share.share({ message: buildAppShareText() }).catch(() => undefined);
      return;
    }
    router.push(route as Parameters<typeof router.push>[0]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading} accessibilityRole="header">{t('screens.more.title')}</Text>
      {MENU_ITEMS.map((item) => {
        const label = t(item.labelKey);
        const subtitle = t(item.subtitleKey);
        return (
          <TouchableOpacity
            key={item.labelKey}
            style={styles.menuRow}
            onPress={() => handlePress(item.route)}
            accessibilityRole="menuitem"
            accessibilityLabel={label}
            accessibilityHint={subtitle}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{label}</Text>
              <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: 16, gap: 4 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    gap: 12,
    minHeight: 60,
  },
  menuIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '500', color: colors.text.primary },
  menuSubtitle: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  arrow: { fontSize: 20, color: colors.text.muted },
});
