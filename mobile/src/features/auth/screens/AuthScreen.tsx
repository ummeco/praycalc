/**
 * Purpose: Auth screen — anonymous mode (no API calls, local-only flag) +
 *   optional account mode (Hasura JWT via api.ummat.dev, stored in SecureStore).
 * Inputs: useAuthStore actions; GraphQL mutation for registration/login
 * Outputs: Auth mode selection; JWT stored in SecureStore on account login
 * Constraints: Anonymous mode MUST make zero API calls (acceptance criterion).
 *   JWT stored in SecureStore (never AsyncStorage). All 7 UI states implemented.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-auth-screen
 */

import React, { useState } from 'react';
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
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import { signin, signup } from '../../../lib/auth/authClient';
import {
  LoadingState,
  ErrorState,
} from '../../../components/shared/UIStates';

type AuthTab = 'anonymous' | 'login' | 'register';

export default function AuthScreen() {
  const auth = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuthTab>('anonymous');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI states
  if (isLoading) return <LoadingState message="Signing in..." />;
  if (error) return <ErrorState error={error} onRetry={() => setError(null)} />;

  async function handleAnonymous() {
    // Anonymous mode — zero API calls (acceptance criterion)
    auth.setAnonymous();
    // Navigation handled by router — auth store change triggers redirect
  }

  async function handleAccountLogin() {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const session = await signin(email, password);
      await auth.setAccount(session.user.id, session.accessToken, session.refreshToken);
      await auth.fetchEntitlement();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccountRegister() {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const session = await signup(email, password, displayName || undefined);
      if (!session) {
        // Email verification required — no session issued yet.
        setError('Check your email to verify your account, then sign in.');
        setActiveTab('login');
        return;
      }
      await auth.setAccount(session.user.id, session.accessToken, session.refreshToken);
      await auth.fetchEntitlement();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <Text style={styles.appName}>PrayCalc</Text>
          <Text style={styles.tagline}>Accurate prayer times for every Muslim</Text>
        </View>

        {/* Tab selector */}
        <View style={styles.tabs}>
          {(['anonymous', 'login', 'register'] as AuthTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'anonymous' ? 'Skip' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Anonymous mode */}
        {activeTab === 'anonymous' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Continue Without Account</Text>
            <Text style={styles.panelDesc}>
              Prayer times, Qibla, and calendar work fully offline with no account needed.
              Your settings are saved locally.
            </Text>
            <View style={styles.featureList}>
              {['Prayer times & Qibla', 'Islamic calendar', 'Settings & notifications'].map((f) => (
                <Text key={f} style={styles.featureItem}>✓ {f}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAnonymous}>
              <Text style={styles.primaryButtonText}>Continue Anonymously</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Login */}
        {activeTab === 'login' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Sign In</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={Colors.text.muted}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={Colors.text.muted}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleAccountLogin}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.switchHint}>
              Account enables cloud sync and prayer history across devices.
            </Text>
          </View>
        )}

        {/* Register */}
        {activeTab === 'register' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Create Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (optional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              placeholderTextColor={Colors.text.muted}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={Colors.text.muted}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={Colors.text.muted}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleAccountRegister}>
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  content: { padding: 24, gap: 24, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', gap: 8 },
  appName: { fontSize: 36, fontWeight: '800', color: Colors.brand.dark },
  tagline: { fontSize: 14, color: Colors.text.muted, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.background.secondary, borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.background.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, color: Colors.text.muted },
  tabTextActive: { fontWeight: '600', color: Colors.brand.dark },
  panel: { gap: 16 },
  panelTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  panelDesc: { fontSize: 14, color: Colors.text.muted, lineHeight: 20 },
  featureList: { gap: 6 },
  featureItem: { fontSize: 14, color: Colors.text.secondary },
  input: {
    borderWidth: 1,
    borderColor: Colors.background.card,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  primaryButton: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.text.inverse, fontWeight: '700', fontSize: 16 },
  switchHint: { fontSize: 12, color: Colors.text.muted, textAlign: 'center' },
});
