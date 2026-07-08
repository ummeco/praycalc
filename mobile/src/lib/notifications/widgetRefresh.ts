/**
 * Purpose: Best-effort home-screen widget + Live Activity repaint after
 *   (re)scheduling notifications. Split out of PrayerNotificationService.ts to
 *   keep each file under the 300-line cap.
 * Inputs: none (reads native widget/live-activity modules via lazy platform-guarded
 *   import).
 * Outputs: refreshHomeScreenWidget.
 * Constraints: swallows all errors — a widget-refresh failure must never break
 *   notification scheduling, which is the caller's actual job.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import { Platform } from 'react-native';

/** Must match the `name` in app.json's react-native-android-widget plugin config. */
const NEXT_PRAYER_WIDGET_NAME = 'NextPrayer';

/**
 * Best-effort home-screen widget repaint after (re)scheduling notifications, so the
 * "Next Prayer" widget reflects a settings/schedule change immediately instead of
 * waiting for its periodic OS update tick. Handles BOTH platforms behind a lazy,
 * platform-guarded import so neither loads the other's native code:
 *   - Android: react-native-android-widget requestWidgetUpdate (re-renders the tree).
 *   - iOS: refreshIosHomeWidget (writes the day's remaining prayers into App Group
 *     UserDefaults via ExtensionStorage, then reloads the WidgetKit timeline).
 * Swallows all errors — a widget-refresh failure must never break notification
 * scheduling, which is the caller's actual job.
 */
export async function refreshHomeScreenWidget(): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      const { refreshIosHomeWidget } = await import('../../features/home-widget/iosWidgetWriter');
      await refreshIosHomeWidget();
    } catch {
      // Best-effort only — never let a widget-refresh failure surface to the caller.
    }
    try {
      // Also refresh the Dynamic Island / lock-screen Live Activity (iOS 16.1+).
      const { refreshNextPrayerLiveActivity } = await import('../../lib/live-activity');
      await refreshNextPrayerLiveActivity();
    } catch {
      // Best-effort — a Live Activity failure must never break scheduling.
    }
    return;
  }
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { renderCurrentNextPrayerWidget } = await import('../../widgets/widgetTaskHandler');
    await requestWidgetUpdate({
      widgetName: NEXT_PRAYER_WIDGET_NAME,
      renderWidget: renderCurrentNextPrayerWidget,
    });
  } catch {
    // Best-effort only — never let a widget-refresh failure surface to the caller.
  }
}
