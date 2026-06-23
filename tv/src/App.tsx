/**
 * Purpose: Root entry point for PrayCalc TV — react-native-tvos
 * Inputs: urql Provider, RootNavigator
 * Outputs: Full app tree with GraphQL and navigation context
 * Constraints: react-native-tvos (NOT Expo Router); react-navigation v6; React 19
 * SPORT: praycalc/tv root
 */

import React from 'react';
import { Provider as UrqlProvider } from 'urql';
import { graphqlClient } from './lib/graphql/client';
import RootNavigator from './navigation/RootNavigator';

export default function App(): React.JSX.Element {
  return (
    <UrqlProvider value={graphqlClient}>
      <RootNavigator />
    </UrqlProvider>
  );
}
