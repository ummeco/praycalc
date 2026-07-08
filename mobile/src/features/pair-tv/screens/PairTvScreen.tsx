/**
 * Purpose: Settings → "Pair TV" screen. User enters (or deep-links) the 6-digit PIN
 *   shown on the TV app and submits a GraphQL mutation to claim this account against
 *   the TV's pre-inserted pc_tv_pairing row.
 * Inputs: useLocalSearchParams `pin` (from praycalc://pair?pin=NNNNNN deep link),
 *   manual PIN entry, useAuthStore (isPlus gate + JWT via urql client)
 * Outputs: pc_tv_pairing row update (claim by PIN) + pc_tv_settings row seed; success/error UI
 * Constraints: Column names must match tv/src/lib/graphql/queries.ts CHECK_PRAYCALC_PAIRING
 *   exactly (pin, is_active, paired, user_id, device_id). The claim mutation is an UPDATE
 *   keyed on `pin` — it never sends a device_id, since the TV owns its own stable
 *   device_id (see pairingMutation.ts header for the full rationale). The device_id used
 *   to seed pc_tv_settings comes from the claim mutation's `returning[0].device_id`, not
 *   from this device. `affected_rows === 0` means the PIN is invalid, already claimed, or
 *   expired. Server (Hasura perms) also enforces Ummat+ entitlement — client shows the
 *   upsell instead of the form when !isPlus.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-pair-tv-screen
 */

import React, { useEffect, useMemo, useState } from 'react';
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
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  CLAIM_TV_MUTATION,
  SEED_TV_SETTINGS_MUTATION,
  buildPairTvRequest,
  buildSeedTvSettingsRequest,
  isValidPin,
  type ClaimTvResult,
  type ClaimTvVariables,
  type SeedTvSettingsVariables,
} from '../../../lib/pairing/pairingMutation';
import { ErrorState } from '../../../components/states';
import { useActiveLocation } from '../../settings/store/useSettingsStore';

const UPGRADE_URL = 'https://praycalc.com/upgrade';

export default function PairTvScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ pin?: string }>();
  const isPlus = useAuthStore((s) => s.isPlus);
  const activeLocation = useActiveLocation();
  const [pin, setPin] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, claimMutation] = useMutation<ClaimTvResult, ClaimTvVariables>(CLAIM_TV_MUTATION);
  const [, seedTvSettingsMutation] = useMutation<unknown, SeedTvSettingsVariables>(
    SEED_TV_SETTINGS_MUTATION,
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
      setError(t('screens.pairTv.enterPin'));
      return;
    }
    try {
      const location = activeLocation
        ? {
            latitude: activeLocation.latitude,
            longitude: activeLocation.longitude,
            city: activeLocation.city,
            timezone: activeLocation.timezone,
          }
        : null;
      const { variables } = buildPairTvRequest(pin, location);
      const result = await claimMutation(variables);
      if (result.error) {
        throw new Error(result.error.message);
      }
      const claim = result.data?.update_pc_tv_pairing;
      const deviceId = claim?.returning?.[0]?.device_id;
      if (!claim || claim.affected_rows === 0 || !deviceId) {
        throw new Error(t('screens.pairTv.invalidOrExpiredPin'));
      }
      // Seed the pc_tv_settings management row (best-effort — the claim itself already
      // succeeded above, so a failure here shouldn't block the success screen). Uses the
      // TV's real device_id returned by the claim, never a phone-generated one.
      const { variables: seedVariables } = buildSeedTvSettingsRequest(deviceId, location);
      await seedTvSettingsMutation(seedVariables).catch(() => undefined);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('screens.pairTv.pairFailed'));
    }
  }

  if (!isPlus) {
    return (
      <View style={styles.container}>
        <View style={styles.upsellCard}>
          <Text style={styles.upsellBadge}>{t('screens.pairTv.upsellBadge')}</Text>
          <Text style={styles.upsellTitle}>{t('screens.pairTv.unlockTitle')}</Text>
          <Text style={styles.upsellDesc}>
            {t('screens.pairTv.unlockDesc')}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(UPGRADE_URL)}
          >
            <Text style={styles.primaryButtonText}>{t('common.upgrade')}</Text>
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
          <Text style={styles.successTitle}>{t('screens.pairTv.pairedTitle')}</Text>
          <Text style={styles.successDesc}>
            {t('screens.pairTv.pairedDesc')}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>{t('common.done')}</Text>
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
        <Text style={styles.title}>{t('screens.pairTv.title')}</Text>
        <Text style={styles.desc}>
          {t('screens.pairTv.desc')}
        </Text>
        <TextInput
          style={styles.pinInput}
          placeholder="000000"
          value={pin}
          onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor={colors.text.muted}
          accessibilityLabel="TV pairing PIN"
        />
        <TouchableOpacity
          style={[styles.primaryButton, !isValidPin(pin) && styles.primaryButtonDisabled]}
          onPress={handlePair}
          disabled={!isValidPin(pin)}
        >
          <Text style={styles.primaryButtonText}>{t('screens.pairTv.pairDevice')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: 24, justifyContent: 'center' },
  card: { gap: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  desc: { fontSize: 14, color: colors.text.muted, lineHeight: 20 },
  pinInput: {
    borderWidth: 1,
    borderColor: colors.background.card,
    borderRadius: 10,
    padding: 16,
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  primaryButton: {
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: colors.text.inverse, fontWeight: '700', fontSize: 16 },
  upsellCard: { gap: 12, alignItems: 'center', padding: 8 },
  upsellBadge: {
    backgroundColor: colors.brand.mid,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upsellTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  upsellDesc: { fontSize: 14, color: colors.text.muted, textAlign: 'center', lineHeight: 20 },
  successCard: { gap: 12, alignItems: 'center' },
  successEmoji: { fontSize: 48, color: colors.brand.dark },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  successDesc: { fontSize: 14, color: colors.text.muted, textAlign: 'center' },
});
