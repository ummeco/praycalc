/**
 * Purpose: react-native-tvos entry point
 * Inputs: App component
 * Outputs: Registered RN app component for tvOS + Android TV
 * Constraints: Must use AppRegistry.registerComponent with 'PrayCalcTV'.
 *   react-native-gesture-handler must be imported before anything else.
 */

// MUST stay the first import in the bundle. react-native-gesture-handler installs
// its native handlers as an import side effect, and @react-navigation/stack needs
// them in place before any navigator is constructed. Importing it later, or not at
// all, surfaces at runtime as:
//   Invariant Violation: TurboModuleRegistry.getEnforcing(...):
//   'RNGestureHandlerModule' could not be found
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName ?? 'PrayCalcTV', () => App);
