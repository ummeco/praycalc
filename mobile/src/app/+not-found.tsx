/**
 * Purpose: 404 / not-found route for Expo Router
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-not-found
 */
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../constants/colors';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen Not Found</Text>
      <Link href="/(tabs)/home" style={styles.link}>
        <Text style={styles.linkText}>Go to Prayer Times</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 20, fontWeight: '600', color: Colors.text.primary },
  link: {},
  linkText: { color: Colors.brand.dark, textDecorationLine: 'underline' },
});
