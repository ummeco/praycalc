/**
 * Purpose: Auth route group layout
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-auth-group
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
