/**
 * Purpose: Custom app entry point — wraps expo-router's default entry so the
 *   react-native-android-widget headless task handler can be registered alongside
 *   the router's root component registration.
 * Inputs: none (side-effect module, executed once at process start).
 * Outputs: Registers the expo-router root ('main') AND the widget headless task
 *   ('RNWidgetBackgroundTask') via AppRegistry.registerHeadlessTask.
 * Constraints: Must run BEFORE any other app code — this is package.json's "main".
 *   `expo-router/entry` is imported for its side effect (calls registerRootComponent);
 *   nothing is imported FROM it. iOS never touches react-native-android-widget code
 *   paths at runtime (the library's native module is Android-only), but the JS-level
 *   registerWidgetTaskHandler call is harmless cross-platform (no-op if the native
 *   widget host doesn't exist).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-entry
 */

import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

registerWidgetTaskHandler(widgetTaskHandler);
