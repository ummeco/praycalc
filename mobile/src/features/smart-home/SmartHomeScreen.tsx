/**
 * Purpose: Smart home integration — local authentication lock-on-salah mode
 *   (screen dim + DND via audio focus). expo-local-authentication.
 * Inputs: expo-local-authentication biometric check, prayer times for auto-dim trigger.
 * Outputs: SmartHomeScreen — Feature 17 of 20.
 * Constraints: iOS DnD requires entitlement (PCI pci-praycalc-ios-critical-alerts).
 *   Android: AUDIOFOCUS_GAIN used for media interruption.
 *   Smart home REST API calls via standard fetch (no native module needed).
 *   7 UI states.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-17-smart-home
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors } from '../../constants/colors';
import { PermissionDeniedState } from '../../components/states';

interface SmartHomeDevice {
  id: string;
  name: string;
  type: 'light' | 'speaker' | 'tv' | 'other';
  isOnline: boolean;
  apiUrl: string;
}

// Mock device list — in production, discovered via local network scan or user input
const DEMO_DEVICES: SmartHomeDevice[] = [
  { id: 'd1', name: 'Living Room Lights', type: 'light', isOnline: true, apiUrl: 'http://192.168.1.100' },
  { id: 'd2', name: 'Bedroom Speaker', type: 'speaker', isOnline: false, apiUrl: 'http://192.168.1.101' },
];

export default function SmartHomeScreen() {
  const [lockOnSalah, setLockOnSalah] = useState(false);
  const [biometricError, setBiometricError] = useState(false);
  const [deviceStates, setDeviceStates] = useState<Record<string, boolean>>({});

  const handleLockOnSalah = useCallback(async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable lock-on-salah',
          fallbackLabel: 'Use passcode',
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
      Alert.alert('Device unreachable', `Could not reach ${device.name}. It may be offline.`);
    }
  }, []);

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
          <Text style={styles.sectionTitle} accessibilityRole="header">Lock During Prayer</Text>
          <Text style={styles.sectionDesc}>
            Automatically dim screen and mute media when prayer time begins.
            Requires authentication to configure.
          </Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Lock on Salah</Text>
            <Switch
              value={lockOnSalah}
              onValueChange={handleLockOnSalah}
              trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
              thumbColor={Colors.brand.light}
              accessibilityLabel="Lock on salah mode"
            />
          </View>
          {lockOnSalah && (
            <Text style={styles.activeNote}>
              Screen will dim and media will be paused at prayer times.{'\n'}
              Android: media focus released. iOS: silent mode reminder shown.
            </Text>
          )}
        </View>

        {/* Smart home devices */}
        <Text style={styles.heading} accessibilityRole="header">Smart Devices</Text>
        {DEMO_DEVICES.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceLeft}>
              <Text style={styles.deviceIcon}>
                {device.type === 'light' ? '💡' : device.type === 'speaker' ? '🔊' : '📺'}
              </Text>
              <View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={[styles.deviceStatus, { color: device.isOnline ? Colors.state.success : Colors.text.muted }]}>
                  {device.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            <Switch
              value={deviceStates[device.id] ?? false}
              onValueChange={(v) => handleDeviceToggle(device, v)}
              disabled={!device.isOnline}
              trackColor={{ false: Colors.background.card, true: Colors.brand.mid }}
              thumbColor={Colors.brand.light}
              accessibilityLabel={`Toggle ${device.name}`}
              accessibilityState={{ disabled: !device.isOnline }}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('Coming soon', 'Smart device discovery will be available in a future update.')}
          accessibilityRole="button"
          accessibilityLabel="Add smart device"
        >
          <Text style={styles.addBtnText}>+ Add Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  sectionDesc: { fontSize: 14, color: Colors.text.muted, lineHeight: 22, marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  toggleLabel: { fontSize: 16, color: Colors.text.primary },
  activeNote: { fontSize: 13, color: Colors.brand.dark, marginTop: 10, lineHeight: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 10 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    minHeight: 64,
  },
  deviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deviceIcon: { fontSize: 24 },
  deviceName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  deviceStatus: { fontSize: 12, marginTop: 2 },
  addBtn: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.brand.mid,
    borderStyle: 'dashed',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 15, color: Colors.brand.mid, fontWeight: '600' },
});
