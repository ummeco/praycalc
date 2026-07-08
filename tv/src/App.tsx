/**
 * Purpose: Root entry point for PrayCalc TV — react-native-tvos
 * Inputs: urql Provider, RootNavigator, boot-time paired-state check
 * Outputs: Full app tree with GraphQL and navigation context
 * Constraints: react-native-tvos (NOT Expo Router); react-navigation v6; React 19.
 *   A fresh/unpaired TV MUST show the pairing code immediately on launch — the boot
 *   gate below resolves paired state before the navigator mounts so it can pick the
 *   correct initial route (never flashes Dashboard on Mecca defaults first).
 * SPORT: praycalc/tv root
 */

import React, { useEffect, useState } from 'react';
import { Provider as UrqlProvider } from 'urql';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { graphqlClient } from './lib/graphql/client';
import { getOrCreateDeviceId } from './lib/pairing/pairingService';
import RootNavigator from './navigation/RootNavigator';
import type { RootStackParamList } from './types';

/**
 * Inline query (not added to lib/graphql/queries.ts — that file is owned by another
 * ticket) mirroring CHECK_PRAYCALC_PAIRING's shape but keyed by device_id instead of
 * pin, for the one-time boot-time "is this device already claimed" check.
 */
const CHECK_DEVICE_PAIRED = `
  query CheckDevicePaired($deviceId: String!) {
    pc_tv_pairing(
      where: { device_id: { _eq: $deviceId }, paired: { _eq: true } }
      order_by: { pin: desc }
      limit: 1
    ) {
      paired
      user_id
    }
  }
`;

type InitialRoute = keyof RootStackParamList;

/** Resolves the boot route: Dashboard when this device has a claimed pairing row, Pairing otherwise (or on any lookup failure — offline TVs must show the code, not guess). */
async function resolveInitialRoute(): Promise<InitialRoute> {
  try {
    const deviceId = await getOrCreateDeviceId();
    const result = await graphqlClient
      .query(CHECK_DEVICE_PAIRED, { deviceId })
      .toPromise();
    const row = result.data?.pc_tv_pairing?.[0];
    return row?.paired && row?.user_id ? 'Dashboard' : 'Pairing';
  } catch {
    // Offline or query error — fail safe to Pairing so the code is always visible
    // rather than silently booting into stale/default Dashboard data.
    return 'Pairing';
  }
}

export default function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveInitialRoute().then((route) => {
      if (!cancelled) setInitialRoute(route);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UrqlProvider value={graphqlClient}>
      {initialRoute ? (
        <RootNavigator initialRouteName={initialRoute} />
      ) : (
        <View style={styles.bootLoading}>
          <ActivityIndicator color="#C9F27A" size="large" />
        </View>
      )}
    </UrqlProvider>
  );
}

const styles = StyleSheet.create({
  bootLoading: {
    flex: 1,
    backgroundColor: '#0D2F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
