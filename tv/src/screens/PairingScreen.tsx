/**
 * Purpose: Screen 9 — Pairing: display QR + 6-digit PIN; poll pairing status every 5s; show success
 * Inputs: PairingService (generates PIN, polls pc_tv_pairing); react-native-qrcode-svg
 * Outputs: QR code + PIN displayed; auto-navigates to Home on pairing success
 * Constraints: Uses pc_tv_pairing (NOT fl_tv_device_pairing); polling every 5s confirmed
 * SPORT: praycalc/tv screens
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PairingState } from '../types';
import { PairingService } from '../lib/pairing/pairingService';
import { graphqlClient } from '../lib/graphql/client';
import TvScreenWrapper from '../components/TvScreenWrapper';

type PairingNavProp = StackNavigationProp<RootStackParamList, 'Pairing'>;

export default function PairingScreen(): React.JSX.Element {
  const navigation = useNavigation<PairingNavProp>();
  const [pairingState, setPairingState] = useState<PairingState>({
    pin: '------',
    deviceId: '',
    isPaired: false,
  });
  const [pairingService, setPairingServiceState] = useState<PairingService | null>(null);
  const refreshRef = useRef<TouchableHighlight>(null);
  const backRef = useRef<TouchableHighlight>(null);

  const handlePairingStateChange = useCallback((state: PairingState) => {
    setPairingState(state);
    if (state.isPaired) {
      // Navigate to Home on successful pairing
      setTimeout(() => navigation.navigate('Home'), 1500);
    }
  }, [navigation]);

  useEffect(() => {
    const service = new PairingService(graphqlClient, handlePairingStateChange);
    setPairingServiceState(service);
    service.startPolling();
    return () => service.destroy();
  }, [handlePairingStateChange]);

  const qrUri = pairingState.pin !== '------'
    ? `praycalc://pair?pin=${pairingState.pin}`
    : '';

  if (pairingState.isPaired) {
    return (
      <TvScreenWrapper title="Paired!" showBackButton={false}>
        <View style={styles.successRoot}>
          <Text style={styles.successEmoji}>✓</Text>
          <Text style={styles.successTitle}>Successfully Paired</Text>
          <Text style={styles.successSubtitle}>Returning to home screen...</Text>
        </View>
      </TvScreenWrapper>
    );
  }

  return (
    <TvScreenWrapper title="Pair with Phone" onBack={() => navigation.goBack()}>
      <View style={styles.root}>
        <View style={styles.leftPanel}>
          {/* Instructions */}
          <Text style={styles.stepTitle}>How to pair:</Text>
          <Text style={styles.step}>1. Open PrayCalc on your phone</Text>
          <Text style={styles.step}>2. Go to Settings → TV Pairing</Text>
          <Text style={styles.step}>3. Scan the QR code or enter the PIN</Text>

          {/* PIN display */}
          <View style={styles.pinContainer}>
            <Text style={styles.pinLabel}>6-Digit PIN</Text>
            <View style={styles.pinRow}>
              {pairingState.pin.split('').map((digit, i) => (
                <View key={i} style={styles.pinDigitBox}>
                  <Text style={styles.pinDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Polling indicator */}
          <Text style={styles.pollingLabel}>Checking for pairing every 5s...</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableHighlight
              ref={refreshRef}
              hasTVPreferredFocus={true}
              accessible={true}
              accessibilityRole="button"
              onPress={() => pairingService?.regeneratePin()}
              underlayColor="#1E5E2F"
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>New PIN</Text>
            </TouchableHighlight>
            <TouchableHighlight
              ref={backRef}
              accessible={true}
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              underlayColor="#1E5E2F"
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>Back</Text>
            </TouchableHighlight>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrPanel}>
          {qrUri ? (
            <QRCode
              value={qrUri}
              size={280}
              color="#C9F27A"
              backgroundColor="#0D2F17"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>Loading...</Text>
            </View>
          )}
          <Text style={styles.qrLabel}>Scan with PrayCalc</Text>
          <Text style={styles.qrUri}>{qrUri}</Text>
        </View>
      </View>
    </TvScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#0D2F17', padding: 60,
    flexDirection: 'row', gap: 80,
  },
  leftPanel: { flex: 1, justifyContent: 'center' },
  stepTitle: { color: '#C9F27A', fontSize: 32, fontWeight: '700', marginBottom: 16 },
  step: { color: '#FFFFFF', fontSize: 26, lineHeight: 40, marginBottom: 8 },
  pinContainer: { marginTop: 32, marginBottom: 24 },
  pinLabel: { color: '#79C24C', fontSize: 24, marginBottom: 12 },
  pinRow: { flexDirection: 'row', gap: 12 },
  pinDigitBox: {
    width: 72, height: 88, backgroundColor: '#1E5E2F', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#79C24C',
  },
  pinDigit: { color: '#C9F27A', fontSize: 44, fontWeight: '800' },
  pollingLabel: { color: '#79C24C', fontSize: 20, marginBottom: 32 },
  buttonRow: { flexDirection: 'row', gap: 24 },
  actionBtn: {
    paddingHorizontal: 40, paddingVertical: 20, backgroundColor: '#1E5E2F',
    borderRadius: 12, minHeight: 88, justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  actionBtnText: { color: '#C9F27A', fontSize: 26, fontWeight: '600' },
  qrPanel: { width: 340, alignItems: 'center', justifyContent: 'center' },
  qrPlaceholder: {
    width: 280, height: 280, backgroundColor: '#1E5E2F', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  qrPlaceholderText: { color: '#79C24C', fontSize: 22 },
  qrLabel: { color: '#79C24C', fontSize: 24, marginTop: 16, fontWeight: '600' },
  qrUri: { color: '#1E5E2F', fontSize: 16, marginTop: 8 },
  successRoot: { flex: 1, backgroundColor: '#0D2F17', alignItems: 'center', justifyContent: 'center' },
  successEmoji: { color: '#C9F27A', fontSize: 120 },
  successTitle: { color: '#C9F27A', fontSize: 56, fontWeight: '700', marginTop: 24 },
  successSubtitle: { color: '#79C24C', fontSize: 28, marginTop: 12 },
});
