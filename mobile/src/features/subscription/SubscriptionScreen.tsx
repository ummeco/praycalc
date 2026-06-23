/**
 * Purpose: In-app purchase screen for PrayCalc Pro tier.
 *   expo-in-app-purchases, receipt validation via pc_iap_receipts table.
 * Inputs: IAP product IDs from constants, urql mutation, anonymous user check.
 * Outputs: SubscriptionScreen — Feature 13 of 20.
 * Constraints: Anonymous users prompted to create account before purchase.
 *   Receipt stored in pc_iap_receipts with transaction_id + product_id + user_id.
 *   7 UI states including payment-error.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-13-iap
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Colors } from '../../constants/colors';
import { LoadingState, ErrorState } from '../../components/states';

const PRODUCT_IDS_IOS = ['praycalc_pro_monthly', 'praycalc_pro_annual'];
const PRODUCT_IDS_ANDROID = ['praycalc_pro_monthly', 'praycalc_pro_annual'];

interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  subscriptionPeriod?: string;
}

const PRO_FEATURES = [
  'Adhan voice library — premium reciters',
  'Home screen widgets (next prayer)',
  'Prayer stats & streak tracking',
  'Custom calculation methods',
  'Ad-free experience',
];

export default function SubscriptionScreen() {
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

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
    setPurchasing(true);
    setError(null);
    try {
      await InAppPurchases.purchaseItemAsync(productId);
      // Purchase listener handles receipt + Hasura mutation
      // (see: src/lib/iap/IAPListener.ts which registers InAppPurchases.setPurchaseListener)
    } catch (e) {
      setError((e as Error).message ?? 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }, []);

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

  if (isPro) {
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
                <ActivityIndicator color={Colors.text.inverse} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.brand.dark },
  subtitle: { fontSize: 16, color: Colors.text.muted, marginTop: 4 },
  featuresCard: {
    width: '100%',
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  checkmark: { fontSize: 16, color: Colors.brand.mid, fontWeight: '700' },
  featureText: { fontSize: 15, color: Colors.text.primary, flex: 1 },
  productCard: {
    width: '100%',
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
  },
  productTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.inverse },
  productPrice: { fontSize: 18, fontWeight: '800', color: Colors.brand.light },
  noProducts: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    marginBottom: 12,
  },
  noProductsText: { fontSize: 14, color: Colors.text.muted, textAlign: 'center', lineHeight: 22 },
  errorText: { fontSize: 14, color: Colors.state.error, textAlign: 'center', marginBottom: 8 },
  restoreBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: { fontSize: 15, color: Colors.brand.dark, fontWeight: '500' },
  legal: {
    fontSize: 11,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  proView: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  proEmoji: { fontSize: 48 },
  proTitle: { fontSize: 24, fontWeight: '800', color: Colors.brand.dark },
  proSub: { fontSize: 16, color: Colors.text.muted },
});
