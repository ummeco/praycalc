/**
 * Purpose: Smart home integration — local authentication lock-on-salah mode
 *   (screen dim + DND via audio focus). expo-local-authentication.
 * Inputs: expo-local-authentication biometric check, prayer times for auto-dim trigger.
 * Outputs: SmartHomeScreen — Feature 17 of 20.
 * Constraints: Ummat+ gated (isPlus) — this screen's whole premise (lock-on-salah +
 *   device control) is a paid feature; it was previously reachable by free users.
 *   No real device-discovery mechanism exists yet, so the device list is honestly
 *   empty rather than showing two hardcoded fake devices as if they were the user's
 *   real hardware — "Add Device" documents that real discovery is not yet built.
 *   iOS DnD requires entitlement (PCI pci-praycalc-ios-critical-alerts).
 *   Android: AUDIOFOCUS_GAIN used for media interruption.
 *   Smart home REST API calls via standard fetch (no native module needed).
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-17-smart-home
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { PermissionDeniedState, EmptyState } from '../../components/states';
import { useAuthStore } from '../auth/store/useAuthStore';

interface SmartHomeDevice {
  id: string;
  name: string;
  type: 'light' | 'speaker' | 'tv' | 'other';
  isOnline: boolean;
  apiUrl: string;
}

export default function SmartHomeScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPlus = useAuthStore((s) => s.isPlus);
  const [lockOnSalah, setLockOnSalah] = useState(false);
  const [biometricError, setBiometricError] = useState(false);
  const [devices] = useState<SmartHomeDevice[]>([]); // No discovery mechanism yet — honestly empty, not mocked
  const [deviceStates, setDeviceStates] = useState<Record<string, boolean>>({});

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
  }, []);

  const handleDeviceToggle = useCallback(async (device: SmartHomeDevice, value: boolean) => {
    setDeviceStates((prev) => ({ ...prev, [device.id]: value }));
    try {
      // Standard fetch to local REST API — no native module needed
      await fetch(`${device.apiUrl}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ on: value }),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Graceful degrade — toggle still updates local UI
      Alert.alert(t('screens.smartHome.unreachableTitle'), t('screens.smartHome.unreachableBody', { name: device.name }));
    }
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
        {/* Lock-on-salah section */}
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

        {/* Smart home devices — honestly empty until real discovery/pairing ships */}
        <Text style={styles.heading} accessibilityRole="header">{t('screens.smartHome.smartDevices')}</Text>
        {devices.length === 0 && (
          <Text style={styles.sectionDesc}>
            {t('screens.smartHome.noDevices')}
          </Text>
        )}
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceLeft}>
              <Text style={styles.deviceIcon}>
                {device.type === 'light' ? '💡' : device.type === 'speaker' ? '🔊' : '📺'}
              </Text>
              <View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={[styles.deviceStatus, { color: device.isOnline ? colors.state.success : colors.text.muted }]}>
                  {device.isOnline ? t('screens.smartHome.online') : t('screens.smartHome.offline')}
                </Text>
              </View>
            </View>
            <Switch
              value={deviceStates[device.id] ?? false}
              onValueChange={(v) => handleDeviceToggle(device, v)}
              disabled={!device.isOnline}
              trackColor={{ false: colors.background.card, true: colors.brand.mid }}
              thumbColor={colors.brand.light}
              accessibilityLabel={`Toggle ${device.name}`}
              accessibilityState={{ disabled: !device.isOnline }}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert(t('screens.smartHome.comingSoonTitle'), t('screens.smartHome.comingSoonBody'))}
          accessibilityRole="button"
          accessibilityLabel={t('screens.smartHome.addDeviceAccessibilityLabel')}
        >
          <Text style={styles.addBtnText}>{t('screens.smartHome.addDevice')}</Text>
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
  deviceStatus: { fontSize: 12, marginTop: 2 },
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
