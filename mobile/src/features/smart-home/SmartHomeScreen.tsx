/**
 * Purpose: Smart home integration — local authentication lock-on-salah mode
 *   (screen dim + DND via audio focus) + Smart Home account-linking status
 *   (Alexa / Google Home / Home Assistant), matching web's Dashboard and
 *   desktop's SmartHomeManager. expo-local-authentication for the lock.
 * Inputs: expo-local-authentication biometric check, prayer times for auto-dim
 *   trigger; smartHomeClient.ts (direct Bearer fetch to smart.praycalc.com —
 *   status/unlink only; linking a NEW provider always starts from the
 *   assistant's own app, Alexa or Google Home, never from this screen).
 * Outputs: SmartHomeScreen — Feature 17 of 20.
 * Constraints: Ummat+ gated (isPlus) — this screen's whole premise (lock-on-
 *   salah + smart-home linking) is a paid feature. The linked-provider list
 *   replaced the earlier honestly-empty ad-hoc-device placeholder (WTH Epic H
 *   Wave H2) now that smart.praycalc.com exposes real link status.
 *   iOS DnD requires entitlement (PCI pci-praycalc-ios-critical-alerts).
 *   Android: AUDIOFOCUS_GAIN used for media interruption.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-17-smart-home
 */

import React, {
  useMemo, useState, useCallback, useEffect,
} from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Linking,
} from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { PermissionDeniedState, EmptyState } from '../../components/states';
import { useAuthStore } from '../auth/store/useAuthStore';
import {
  listLinks, unlinkProvider, PROVIDER_META, type LinkedProvider, type SmartHomeProvider,
} from './smartHomeClient';

const SMART_HOME_DOCS_URL = 'https://praycalc.org/features/smart-home';

export default function SmartHomeScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPlus = useAuthStore((s) => s.isPlus);
  const [lockOnSalah, setLockOnSalah] = useState(false);
  const [biometricError, setBiometricError] = useState(false);

  const [links, setLinks] = useState<LinkedProvider[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<SmartHomeProvider | null>(null);

  const loadLinks = useCallback(async () => {
    setLoadingLinks(true);
    setLinkError(null);
    const result = await listLinks();
    if (result.ok) {
      setLinks(result.links);
    } else {
      setLinkError(result.error);
    }
    setLoadingLinks(false);
  }, []);

  useEffect(() => {
    if (!isPlus) return;
    void loadLinks();
  }, [isPlus, loadLinks]);

  const handleLockOnSalah = useCallback(async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t('screens.smartHome.authPrompt'),
          fallbackLabel: t('screens.smartHome.useFallback'),
        });
        if (!result.success) {
          setBiometricError(true);
          return;
        }
      }
    }
    setBiometricError(false);
    setLockOnSalah(value);
  }, [t]);

  const handleUnlink = useCallback((provider: SmartHomeProvider) => {
    const label = PROVIDER_META[provider]?.label ?? provider;
    Alert.alert(
      t('screens.smartHome.unlinkConfirmTitle', { name: label }),
      t('screens.smartHome.unlinkConfirmBody', { name: label }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('screens.smartHome.unlinkConfirmAction'),
          style: 'destructive',
          onPress: () => {
            setUnlinkingProvider(provider);
            unlinkProvider(provider).then((result) => {
              setUnlinkingProvider(null);
              if (result.ok) {
                setLinks((cur) => cur.filter((l) => l.provider !== provider));
              } else {
                Alert.alert(t('screens.smartHome.unlinkFailedTitle'), result.error);
              }
            });
          },
        },
      ],
    );
  }, [t]);

  if (!isPlus) {
    return (
      <EmptyState
        message={t('screens.smartHome.proOnly')}
        action={t('screens.smartHome.upgradeAction')}
        onAction={() => router.push('/subscription')}
      />
    );
  }

  if (biometricError) {
    return (
      <PermissionDeniedState
        permission="Biometric authentication"
        onOpenSettings={() => setBiometricError(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Lock-on-salah section — unchanged */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('screens.smartHome.lockDuringPrayer')}</Text>
          <Text style={styles.sectionDesc}>
            {t('screens.smartHome.lockDesc')}
          </Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('screens.smartHome.lockOnSalah')}</Text>
            <Switch
              value={lockOnSalah}
              onValueChange={handleLockOnSalah}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={t('screens.smartHome.lockOnSalahAccessibilityLabel')}
            />
          </View>
          {lockOnSalah && (
            <Text style={styles.activeNote}>
              {t('screens.smartHome.activeNote')}
            </Text>
          )}
        </View>

        {/* Linked smart-home accounts — replaces the earlier honestly-empty
            device-list placeholder now that smart.praycalc.com exposes real
            link status (WTH Epic H, Wave H2). */}
        <Text style={styles.heading} accessibilityRole="header">{t('screens.smartHome.linkedAccounts')}</Text>

        {linkError && <Text style={styles.errorText}>{linkError}</Text>}

        {!loadingLinks && links.length === 0 && !linkError && (
          <Text style={styles.sectionDesc}>{t('screens.smartHome.noLinks')}</Text>
        )}

        {links.map((link) => {
          const meta = PROVIDER_META[link.provider];
          return (
            <View key={link.provider} style={styles.deviceCard}>
              <View style={styles.deviceLeft}>
                <Text style={styles.deviceIcon}>{meta?.icon ?? '🔗'}</Text>
                <View>
                  <Text style={styles.deviceName}>{meta?.label ?? link.provider}</Text>
                  <Text style={styles.deviceStatus}>
                    {t('screens.smartHome.linked', { date: new Date(link.linked_at).toLocaleDateString() })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleUnlink(link.provider)}
                disabled={unlinkingProvider === link.provider}
                accessibilityRole="button"
                accessibilityLabel={`${t('screens.smartHome.unlink')} ${meta?.label ?? link.provider}`}
              >
                <Text style={styles.unlinkText}>{t('screens.smartHome.unlink')}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Linking.openURL(SMART_HOME_DOCS_URL)}
          accessibilityRole="button"
          accessibilityLabel={t('screens.smartHome.learnMore')}
        >
          <Text style={styles.addBtnText}>{t('screens.smartHome.learnMore')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
  sectionDesc: { fontSize: 14, color: colors.text.muted, lineHeight: 22, marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  toggleLabel: { fontSize: 16, color: colors.text.primary },
  activeNote: { fontSize: 13, color: colors.brand.dark, marginTop: 10, lineHeight: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 10 },
  errorText: { fontSize: 13, color: colors.state.error, marginBottom: 10, lineHeight: 20 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    minHeight: 64,
  },
  deviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deviceIcon: { fontSize: 24 },
  deviceName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  deviceStatus: { fontSize: 12, marginTop: 2, color: colors.text.muted },
  unlinkText: { fontSize: 13, fontWeight: '600', color: colors.state.error },
  addBtn: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand.mid,
    borderStyle: 'dashed',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 15, color: colors.brand.mid, fontWeight: '600' },
});
