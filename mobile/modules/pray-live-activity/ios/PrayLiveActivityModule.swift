// Purpose: App-process ActivityKit bridge for PrayCalc's "Next Prayer" Live Activity.
//   ActivityKit's Activity.request / update / end APIs MUST run in the main app process
//   (not the widget extension), so this Expo native module exposes start/update/end to
//   JS. The activity UI itself lives in the widget extension
//   (targets/next-prayer-widget/NextPrayerLiveActivity.swift); ActivityKit pairs the two
//   by the attributes TYPE NAME + shape, so NextPrayerActivityAttributes here is a byte-
//   for-byte mirror of the extension's copy (the two targets cannot share a type).
// Inputs (from JS, src/lib/live-activity/liveActivity.ts):
//   start(prayerName, prayerTimestamp(ms), prayerTimeLabel, cityName?) -> activityId | nil
//   update(activityId, prayerName, prayerTimestamp(ms), prayerTimeLabel)
//   end(activityId)  /  endAll()
//   isSupported() -> Bool ; isRunning(activityId) -> Bool
// Outputs: PrayLiveActivityModule (autolinked via expo-module.config.json).
// Constraints: iOS 16.2+ for the used ActivityKit content API; guarded so older OSes and
//   the Simulator (Live Activities need a physical device or a dev-client capable sim)
//   degrade to no-ops. Requires NSSupportsLiveActivities=true in the app Info.plist and
//   the user's Live Activities toggle ON (ActivityAuthorizationInfo.areActivitiesEnabled).
// SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-live-activity-native

import ExpoModulesCore

#if canImport(ActivityKit)
import ActivityKit

/// App-side mirror of targets/next-prayer-widget/NextPrayerLiveActivity.swift's attributes.
/// Field names + types MUST match that copy AND src/lib/live-activity/liveActivity.ts.
@available(iOS 16.1, *)
struct NextPrayerActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var prayerTimestamp: Double
        var prayerTimeLabel: String
        var prayerName: String
    }
    var cityName: String?
}
#endif

public class PrayLiveActivityModule: Module {
    public func definition() -> ModuleDefinition {
        Name("PrayLiveActivity")

        // Whether Live Activities can run right now (OS version + user toggle + capability).
        Function("isSupported") { () -> Bool in
            #if canImport(ActivityKit)
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            }
            #endif
            return false
        }

        // Start (or restart) the Next Prayer activity. Returns the activity id, or nil if
        // unsupported/denied/failed. Ends any existing NextPrayer activities first so we
        // never stack duplicates when the next prayer rolls over.
        AsyncFunction("start") {
            (prayerName: String, prayerTimestamp: Double, prayerTimeLabel: String, cityName: String?) -> String? in
            #if canImport(ActivityKit)
            if #available(iOS 16.2, *) {
                guard ActivityAuthorizationInfo().areActivitiesEnabled else { return nil }
                for activity in Activity<NextPrayerActivityAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                let attributes = NextPrayerActivityAttributes(cityName: cityName)
                let state = NextPrayerActivityAttributes.ContentState(
                    prayerTimestamp: prayerTimestamp,
                    prayerTimeLabel: prayerTimeLabel,
                    prayerName: prayerName
                )
                do {
                    let content = ActivityContent(state: state, staleDate: Date(timeIntervalSince1970: prayerTimestamp / 1000.0))
                    let activity = try Activity.request(attributes: attributes, content: content, pushType: nil)
                    return activity.id
                } catch {
                    return nil
                }
            }
            #endif
            return nil
        }

        // Update a running activity's dynamic state (new prayer / countdown target).
        AsyncFunction("update") {
            (activityId: String, prayerName: String, prayerTimestamp: Double, prayerTimeLabel: String) -> Bool in
            #if canImport(ActivityKit)
            if #available(iOS 16.2, *) {
                guard let activity = Activity<NextPrayerActivityAttributes>.activities.first(where: { $0.id == activityId }) else {
                    return false
                }
                let state = NextPrayerActivityAttributes.ContentState(
                    prayerTimestamp: prayerTimestamp,
                    prayerTimeLabel: prayerTimeLabel,
                    prayerName: prayerName
                )
                await activity.update(ActivityContent(state: state, staleDate: Date(timeIntervalSince1970: prayerTimestamp / 1000.0)))
                return true
            }
            #endif
            return false
        }

        // End one activity by id (immediate dismissal).
        AsyncFunction("end") { (activityId: String) -> Void in
            #if canImport(ActivityKit)
            if #available(iOS 16.2, *) {
                for activity in Activity<NextPrayerActivityAttributes>.activities where activity.id == activityId {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
            }
            #endif
        }

        // End every NextPrayer activity (e.g. on location clear / settings reset).
        AsyncFunction("endAll") { () -> Void in
            #if canImport(ActivityKit)
            if #available(iOS 16.2, *) {
                for activity in Activity<NextPrayerActivityAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
            }
            #endif
        }

        // Whether a given activity id is currently active.
        Function("isRunning") { (activityId: String) -> Bool in
            #if canImport(ActivityKit)
            if #available(iOS 16.2, *) {
                return Activity<NextPrayerActivityAttributes>.activities.contains { $0.id == activityId }
            }
            #endif
            return false
        }
    }
}
