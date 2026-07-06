/**
 * Purpose: In-app purchase screen for PrayCalc Pro / Ummat+ tier.
 *   expo-in-app-purchases; the global IAPListener (src/lib/iap/IAPListener.ts) handles
 *   receipt validation + entitlement flip — this screen only initiates purchases and
 *   reflects useAuthStore().isPlus, the single unified entitlement flag for both the
 *   IAP purchase and the web Ummat+ subscription (previously two incompatible systems).
 * Inputs: IAP product IDs from constants, useAuthStore (mode + isPlus).
 * Outputs: SubscriptionScreen — Feature 13 of 20.
 * Constraints: Anonymous users are prompted to create an account before purchase —
 *   useAuthStore makes zero API calls while anonymous, so there is nowhere to durably
 *   record a receipt until the user has an account.
 *   7 UI states including payment-error.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-13-iap
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as InAppPurchases from 'expo-in-app-purchases';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../constants/colors';
import { LoadingState, ErrorState } from '../../components/states';
import { useAuthStore } from '../auth/store/useAuthStore';

const PRODUCT_IDS_IOS = ['praycalc_pro_monthly', 'praycalc_pro_annual'];
const PRODUCT_IDS_ANDROID = ['praycalc_pro_monthly', 'praycalc_pro_annual'];

interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  subscriptionPeriod?: string;
}

// Must list ONLY features actually gated behind isPlus (stats, custom methods,
// and the whole app are free and ad-free for everyone — never imply otherwise).
const PRO_FEATURES = [
  'Premium adhan voices — additional reciters',
  'Home screen widget (next prayer)',
  'PrayCalc TV app pairing',
  'Smart Home — lock devices during salah',
];

export default function SubscriptionScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const auth = useAuthStore();
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        await InAppPurchases.connectAsync();
        const ids = process.env['EXPO_PUBLIC_PLATFORM'] === 'android'
          ? PRODUCT_IDS_ANDROID
          : PRODUCT_IDS_IOS;
        const { responseCode, results } = await InAppPurchases.getProductsAsync(ids);
        if (!mounted) return;
        if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
          setProducts(results.map((r) => ({
            productId: r.productId,
            title: r.title,
            description: r.description,
            price: r.price,
          })));
        } else {
          setError('Could not load products. Check your connection and try again.');
        }
      } catch (e) {
        if (mounted) setError((e as Error).message ?? 'Failed to connect to store.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handlePurchase = useCallback(async (productId: string) => {
    if (auth.mode === 'anonymous') {
      Alert.alert(
        'Create an Account',
        'Sign in first so your purchase can sync across your devices.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') },
        ],
      );
      return;
    }
    setPurchasing(true);
    setError(null);
    try {
      await InAppPurchases.purchaseItemAsync(productId);
      // The global IAPListener (src/lib/iap/IAPListener.ts, registered at app start)
      // handles the receipt mutation + isPlus reconciliation from here.
    } catch (e) {
      setError((e as Error).message ?? 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }, [auth.mode]);

  const handleRestore = useCallback(async () => {
    setPurchasing(true);
    try {
      await InAppPurchases.getPurchaseHistoryAsync();
      // Listener handles restore
    } catch (e) {
      setError((e as Error).message ?? 'Restore failed.');
    } finally {
      setPurchasing(false);
    }
  }, []);

  // ── 7 UI States ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingState message="Loading subscription options..." />;
  if (error && products.length === 0) {
    return <ErrorState error={error} onRetry={() => { setError(null); setLoading(true); }} />;
  }

  if (auth.isPlus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.proView}>
          <Text style={styles.proEmoji}>✨</Text>
          <Text style={styles.proTitle} accessibilityRole="header">You're on Pro</Text>
          <Text style={styles.proSub}>Thank you for supporting PrayCalc!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">PrayCalc Pro</Text>
          <Text style={styles.subtitle}>Enhance your worship experience</Text>
        </View>

        {/* Pro features */}
        <View style={styles.featuresCard}>
          {PRO_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Products */}
        {products.length > 0 ? (
          products.map((product) => (
            <TouchableOpacity
              key={product.productId}
              style={styles.productCard}
              onPress={() => handlePurchase(product.productId)}
              disabled={purchasing}
              accessibilityRole="button"
              accessibilityLabel={`Subscribe ${product.title} for ${product.price}`}
              accessibilityState={{ disabled: purchasing }}
            >
              {purchasing ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noProducts}>
            <Text style={styles.noProductsText}>
              Subscription products unavailable. Configure in App Store Connect / Google Play Console.
            </Text>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={purchasing}
          accessibilityRole="button"
          accessibilityLabel="Restore previous purchase"
        >
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Subscriptions auto-renew unless cancelled at least 24 hours before the end of the
          current period. Manage in your App Store / Google Play account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.brand.dark },
  subtitle: { fontSize: 16, color: colors.text.muted, marginTop: 4 },
  featuresCard: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  checkmark: { fontSize: 16, color: colors.brand.mid, fontWeight: '700' },
  featureText: { fontSize: 15, color: colors.text.primary, flex: 1 },
  productCard: {
    width: '100%',
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
  },
  productTitle: { fontSize: 16, fontWeight: '700', color: colors.text.inverse },
  productPrice: { fontSize: 18, fontWeight: '800', color: colors.brand.light },
  noProducts: {
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginBottom: 12,
  },
  noProductsText: { fontSize: 14, color: colors.text.muted, textAlign: 'center', lineHeight: 22 },
  errorText: { fontSize: 14, color: colors.state.error, textAlign: 'center', marginBottom: 8 },
  restoreBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: { fontSize: 15, color: colors.brand.dark, fontWeight: '500' },
  legal: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  proView: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  proEmoji: { fontSize: 48 },
  proTitle: { fontSize: 24, fontWeight: '800', color: colors.brand.dark },
  proSub: { fontSize: 16, color: colors.text.muted },
});
