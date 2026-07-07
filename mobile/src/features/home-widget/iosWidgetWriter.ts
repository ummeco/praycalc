/**
 * Purpose: Single iOS-side writer for the WidgetKit "Next Prayer" widget. Computes the
 *   full day's remaining prayers via the shared widgetTaskHandler helper, serializes
 *   them into App Group UserDefaults with @bacons/apple-targets' ExtensionStorage, and
 *   reloads the widget timeline. Shared by HomeWidgetStub.writeWidgetData and
 *   PrayerNotificationService.refreshHomeScreenWidget so there is exactly one place
 *   that decides what the iOS widget reads.
 * Inputs: computeIosWidgetPayload() (reuses the same settings + calc-engine path the
 *   Android widget task handler uses), no arguments.
 * Outputs: refreshIosHomeWidget() — best-effort; never throws (the caller's real job
 *   is notification scheduling / settings save, which a widget failure must not break).
 * Constraints: iOS-only — callers guard with Platform.OS === 'ios'. The App Group and
 *   payload key MUST match targets/next-prayer-widget/expo-target.config.js, the Swift
 *   NextPrayerWidget.swift, and app.json ios.entitlements. ExtensionStorage's native
 *   module is a no-op stub off-device, so this is import-safe under Jest/web.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-ios-widget-writer
 */

import { computeIosWidgetPayload } from '../../widgets/widgetTaskHandler';

/** Must match app.json ios.entitlements, expo-target.config.js, and NextPrayerWidget.swift. */
export const IOS_WIDGET_APP_GROUP = 'group.com.praycalc.praycalcApp';
/** UserDefaults key the Swift TimelineProvider reads the JSON payload from. */
export const IOS_WIDGET_PAYLOAD_KEY = 'nextPrayerWidget';
/** WidgetKit `kind` string — matches NextPrayerWidget.swift's Widget.kind. */
export const IOS_WIDGET_KIND = 'NextPrayerWidget';

/**
 * Recompute the day's remaining prayers and push them to the iOS widget. Writes the
 * payload as a JSON string (WidgetKit decodes it in Swift) rather than nested native
 * objects, which keeps one stable schema across the JS↔Swift boundary. Best-effort:
 * swallows every error so a widget refresh can never surface to the caller.
 */
export async function refreshIosHomeWidget(): Promise<void> {
  try {
    const { ExtensionStorage } = await import('@bacons/apple-targets');
    const payload = await computeIosWidgetPayload();
    const storage = new ExtensionStorage(IOS_WIDGET_APP_GROUP);
    // No location/prayers → clear the key so the widget shows its "Open PrayCalc" state.
    storage.set(IOS_WIDGET_PAYLOAD_KEY, payload ? JSON.stringify(payload) : undefined);
    ExtensionStorage.reloadWidget(IOS_WIDGET_KIND);
  } catch {
    // Best-effort only — never let a widget-refresh failure surface to the caller.
  }
}
