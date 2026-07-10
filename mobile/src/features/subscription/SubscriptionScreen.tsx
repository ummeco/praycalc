/**
 * Purpose: In-app purchase screen for PrayCalc Pro / Ummat+ tier. Backed by
 *   react-native-iap via the iapClient adapter (src/lib/iap/iapClient.ts); the global
 *   IAPListener (src/lib/iap/IAPListener.ts) handles receipt validation + entitlement
 *   flip — this screen only initiates purchases and reflects useAuthStore().isPlus,
 *   the single unified entitlement flag for both the IAP purchase and the web Ummat+
 *   subscription (previously two incompatible systems).
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
import * as InAppPurchases from '../../lib/iap/iapClient';
import { useTranslation } from '../../i18n';
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
const PRO_FEATURE_KEYS = [
  'screens.subscription.featurePremiumAdhan',
  'screens.subscription.featureHomeWidget',
  'screens.subscription.featureTvPairing',
  'screens.subscription.featureSmartHome',
];

export default function SubscriptionScreen() {
  const { t } = useTranslation();
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
          setError(t('screens.subscription.loadProductsFailed'));
        }
      } catch (e) {
        if (mounted) setError((e as Error).message ?? t('screens.subscription.connectFailed'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // Intentional mount-once IAP connect+fetch; `t` is only read for error copy and must
    // not re-trigger connectAsync() on language change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePurchase = useCallback(async (productId: string) => {
    if (auth.mode === 'anonymous') {
      Alert.alert(
        t('screens.subscription.createAccountTitle'),
        t('screens.subscription.createAccountBody'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.signIn'), onPress: () => router.push('/sign-in') },
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
      setError((e as Error).message ?? t('screens.subscription.purchaseFailed'));
    } finally {
      setPurchasing(false);
    }
  }, [auth.mode, t]);

  const handleRestore = useCallback(async () => {
    setPurchasing(true);
    try {
      await InAppPurchases.getPurchaseHistoryAsync();
      // Listener handles restore
    } catch (e) {
      setError((e as Error).message ?? t('screens.subscription.restoreFailed'));
    } finally {
      setPurchasing(false);
    }
  }, [t]);

  // ── 7 UI States ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingState message={t('screens.subscription.loadingOptions')} />;
  if (error && products.length === 0) {
    return <ErrorState error={error} onRetry={() => { setError(null); setLoading(true); }} />;
  }

  if (auth.isPlus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.proView}>
          <Text style={styles.proEmoji}>✨</Text>
          <Text style={styles.proTitle} accessibilityRole="header">{t('screens.subscription.proTitle')}</Text>
          <Text style={styles.proSub}>{t('screens.subscription.proSub')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">{t('screens.subscription.title')}</Text>
          <Text style={styles.subtitle}>{t('screens.subscription.subtitle')}</Text>
        </View>

        {/* Pro features */}
        <View style={styles.featuresCard}>
          {PRO_FEATURE_KEYS.map((key, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{t(key)}</Text>
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
              accessibilityLabel={t('screens.subscription.subscribeAccessibilityLabel', { title: product.title, price: product.price })}
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
              {t('screens.subscription.noProducts')}
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
          accessibilityLabel={t('screens.subscription.restorePurchaseAccessibilityLabel')}
        >
          <Text style={styles.restoreText}>{t('screens.subscription.restorePurchase')}</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          {t('screens.subscription.legal')}
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
