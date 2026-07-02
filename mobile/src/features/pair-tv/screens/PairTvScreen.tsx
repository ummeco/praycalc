/**
 * Purpose: Settings → "Pair TV" screen. User enters (or deep-links) the 6-digit PIN
 *   shown on the TV app and submits a GraphQL mutation to pair this account/device.
 * Inputs: useLocalSearchParams `pin` (from praycalc://pair?pin=NNNNNN deep link),
 *   manual PIN entry, useAuthStore (isPlus gate + JWT via urql client)
 * Outputs: pc_tv_pairing row insert/update; success/error UI
 * Constraints: Column names must match tv/src/lib/graphql/queries.ts CHECK_PRAYCALC_PAIRING
 *   exactly (pin, is_active, paired, user_id, device_id). Server (Hasura perms) also enforces
 *   Ummat+ entitlement — client shows the upsell instead of the form when !isPlus.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-pair-tv-screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation } from 'urql';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { PAIR_TV_MUTATION, buildPairTvRequest, isValidPin } from '../../../lib/pairing/pairingMutation';
import { getOrCreateDeviceId } from '../../../lib/pairing/deviceId';
import { LoadingState, ErrorState } from '../../../components/shared/UIStates';

const UPGRADE_URL = 'https://praycalc.com/upgrade';

export default function PairTvScreen() {
  const params = useLocalSearchParams<{ pin?: string }>();
  const isPlus = useAuthStore((s) => s.isPlus);
  const [pin, setPin] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, pairMutation] = useMutation<unknown, { pin: string; deviceId: string }>(
    PAIR_TV_MUTATION,
  );

  // Deep link praycalc://pair?pin=123456 pre-fills the field
  useEffect(() => {
    if (params.pin && isValidPin(params.pin)) {
      setPin(params.pin);
    }
  }, [params.pin]);

  async function handlePair() {
    setError(null);
    if (!isValidPin(pin)) {
      setError('Enter the 6-digit PIN shown on your TV.');
      return;
    }
    try {
      const deviceId = await getOrCreateDeviceId();
      const { variables } = buildPairTvRequest(pin, deviceId);
      const result = await pairMutation(variables);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pairing failed. Try again.');
    }
  }

  if (!isPlus) {
    return (
      <View style={styles.container}>
        <View style={styles.upsellCard}>
          <Text style={styles.upsellBadge}>Ummat+</Text>
          <Text style={styles.upsellTitle}>Unlock TV Pairing</Text>
          <Text style={styles.upsellDesc}>
            Ummat+ $9.99/yr — unlocks TV app & Smart Home
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(UPGRADE_URL)}
          >
            <Text style={styles.primaryButtonText}>Upgrade to Ummat+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>✓</Text>
          <Text style={styles.successTitle}>TV Paired</Text>
          <Text style={styles.successDesc}>
            Your TV app is now linked to this account.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => setError(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Pair with TV</Text>
        <Text style={styles.desc}>
          Open PrayCalc on your TV, then enter the 6-digit PIN shown on screen.
        </Text>
        <TextInput
          style={styles.pinInput}
          placeholder="000000"
          value={pin}
          onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor={Colors.text.muted}
          accessibilityLabel="TV pairing PIN"
        />
        <TouchableOpacity
          style={[styles.primaryButton, !isValidPin(pin) && styles.primaryButtonDisabled]}
          onPress={handlePair}
          disabled={!isValidPin(pin)}
        >
          <Text style={styles.primaryButtonText}>Pair Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary, padding: 24, justifyContent: 'center' },
  card: { gap: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  desc: { fontSize: 14, color: Colors.text.muted, lineHeight: 20 },
  pinInput: {
    borderWidth: 1,
    borderColor: Colors.background.card,
    borderRadius: 10,
    padding: 16,
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  primaryButton: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: Colors.text.inverse, fontWeight: '700', fontSize: 16 },
  upsellCard: { gap: 12, alignItems: 'center', padding: 8 },
  upsellBadge: {
    backgroundColor: Colors.brand.mid,
    color: Colors.text.inverse,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upsellTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  upsellDesc: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', lineHeight: 20 },
  successCard: { gap: 12, alignItems: 'center' },
  successEmoji: { fontSize: 48, color: Colors.brand.dark },
  successTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  successDesc: { fontSize: 14, color: Colors.text.muted, textAlign: 'center' },
});
