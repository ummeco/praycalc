/**
 * Purpose: Auth screen — anonymous mode (no API calls, local-only flag) +
 *   optional account mode (Hasura JWT via api.ummat.dev, stored in SecureStore).
 * Inputs: useAuthStore actions; GraphQL mutation for registration/login
 * Outputs: Auth mode selection; JWT stored in SecureStore on account login
 * Constraints: Anonymous mode MUST make zero API calls (acceptance criterion).
 *   JWT stored in SecureStore (never AsyncStorage). All 7 UI states implemented.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-auth-screen
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from '../../../i18n';
import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import { signin, signup } from '../../../lib/auth/authClient';
import {
  LoadingState,
  ErrorState,
} from '../../../components/states';

type AuthTab = 'anonymous' | 'login' | 'register';

export default function AuthScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const auth = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuthTab>('anonymous');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI states
  if (isLoading) return <LoadingState message={t('screens.auth.signingIn')} />;
  if (error) return <ErrorState error={error} onRetry={() => setError(null)} />;

  async function handleAnonymous() {
    // Anonymous mode — zero API calls (acceptance criterion)
    auth.setAnonymous();
    // Navigation handled by router — auth store change triggers redirect
  }

  async function handleAccountLogin() {
    if (!email || !password) {
      setError(t('screens.auth.enterEmailPassword'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const session = await signin(email, password);
      await auth.setAccount(session.user.id, session.accessToken, session.refreshToken);
      await auth.fetchEntitlement();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('screens.auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccountRegister() {
    if (!email || !password) {
      setError(t('screens.auth.enterEmailPassword'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const session = await signup(email, password, displayName || undefined);
      if (!session) {
        // Email verification required — no session issued yet.
        setError(t('screens.auth.verifyEmail'));
        setActiveTab('login');
        return;
      }
      await auth.setAccount(session.user.id, session.accessToken, session.refreshToken);
      await auth.fetchEntitlement();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('screens.auth.registerFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('screens.auth.appTagline')}</Text>
        </View>

        {/* Tab selector */}
        <View style={styles.tabs}>
          {(['anonymous', 'login', 'register'] as AuthTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
              accessibilityLabel={tab === 'anonymous' ? t('screens.auth.tabSkip') : tab.charAt(0).toUpperCase() + tab.slice(1)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'anonymous' ? t('screens.auth.tabSkip') : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Anonymous mode */}
        {activeTab === 'anonymous' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t('screens.auth.continueTitle')}</Text>
            <Text style={styles.panelDesc}>
              {t('screens.auth.continueDesc')}
            </Text>
            <View style={styles.featureList}>
              {[
                t('screens.auth.featurePrayerQibla'),
                t('screens.auth.featureCalendar'),
                t('screens.auth.featureSettings'),
              ].map((f) => (
                <Text key={f} style={styles.featureItem}>✓ {f}</Text>
              ))}
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAnonymous}
              accessibilityRole="button"
              accessibilityLabel={t('screens.auth.continueAnonymously')}
            >
              <Text style={styles.primaryButtonText}>{t('screens.auth.continueAnonymously')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Login */}
        {activeTab === 'login' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t('screens.auth.signInTitle')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('screens.auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.auth.emailPlaceholder')}
            />
            <TextInput
              style={styles.input}
              placeholder={t('screens.auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.auth.passwordPlaceholder')}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAccountLogin}
              accessibilityRole="button"
              accessibilityLabel={t('common.signIn')}
            >
              <Text style={styles.primaryButtonText}>{t('common.signIn')}</Text>
            </TouchableOpacity>
            <Text style={styles.switchHint}>
              {t('screens.auth.switchHint')}
            </Text>
          </View>
        )}

        {/* Register */}
        {activeTab === 'register' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t('screens.auth.registerTitle')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('screens.auth.namePlaceholder')}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.auth.namePlaceholder')}
            />
            <TextInput
              style={styles.input}
              placeholder={t('screens.auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.auth.emailPlaceholder')}
            />
            <TextInput
              style={styles.input}
              placeholder={t('screens.auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.text.muted}
              accessibilityLabel={t('screens.auth.passwordPlaceholder')}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAccountRegister}
              accessibilityRole="button"
              accessibilityLabel={t('common.createAccount')}
            >
              <Text style={styles.primaryButtonText}>{t('common.createAccount')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: 24, gap: 24, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', gap: 8 },
  appName: { fontSize: 36, fontWeight: '800', color: colors.brand.dark },
  tagline: { fontSize: 14, color: colors.text.muted, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: colors.background.secondary, borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: colors.background.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, color: colors.text.muted },
  tabTextActive: { fontWeight: '600', color: colors.brand.dark },
  panel: { gap: 16 },
  panelTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  panelDesc: { fontSize: 14, color: colors.text.muted, lineHeight: 20 },
  featureList: { gap: 6 },
  featureItem: { fontSize: 14, color: colors.text.secondary },
  input: {
    borderWidth: 1,
    borderColor: colors.background.card,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  primaryButton: {
    backgroundColor: colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.text.inverse, fontWeight: '700', fontSize: 16 },
  switchHint: { fontSize: 12, color: colors.text.muted, textAlign: 'center' },
});
