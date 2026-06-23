/**
 * Purpose: react-native-tvos entry point
 * Inputs: App component
 * Outputs: Registered RN app component for tvOS + Android TV
 * Constraints: Must use AppRegistry.registerComponent with 'PrayCalcTV'
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName ?? 'PrayCalcTV', () => App);
