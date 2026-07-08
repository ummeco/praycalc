// Purpose: ActivityKit Live Activity for PrayCalc — a countdown to the next prayer that
//   appears in the Dynamic Island (compact / minimal / expanded) and as a lock-screen
//   banner. The activity is STARTED / UPDATED / ENDED from the RN app process (ActivityKit
//   Activity.request must run in-app, not in this extension) via the native module wired by
//   src/lib/live-activity/. This file only declares the shared attributes + the SwiftUI
//   presentations WidgetKit renders for the running activity.
// Inputs: NextPrayerActivityAttributes (static: prayerName, cityName) + its ContentState
//   (dynamic: prayerTimestamp epoch-ms, plus a precomputed prayerTimeLabel string). The
//   countdown itself is driven by SwiftUI's Text(_:style:) against the target Date so it
//   ticks locally without the app pushing every-second updates.
// Outputs: NextPrayerLiveActivity — an ActivityConfiguration added to the widget bundle
//   (NextPrayerWidget.swift @main NextPrayerWidgetBundle), guarded to iOS 16.1+.
// Constraints: The attributes' field names/types MUST match the JS payload built in
//   src/lib/live-activity/liveActivity.ts (see NEXT_PRAYER_ACTIVITY_ATTRIBUTES there).
//   Requires NSSupportsLiveActivities=true in the MAIN app Info.plist (set via app.json
//   ios.infoPlist). Brand colors reuse the same asset-catalog names as the widget.
// SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-16-home-widgets

import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Shared attributes (mirror src/lib/live-activity/liveActivity.ts)

@available(iOS 16.1, *)
struct NextPrayerActivityAttributes: ActivityAttributes {
    /// Dynamic values that change over the life of the activity (pushed via update()).
    struct ContentState: Codable, Hashable {
        /// Epoch milliseconds of the prayer this activity counts down to.
        var prayerTimestamp: Double
        /// Pre-formatted clock label (e.g. "5:42 AM") from the JS side, so the exact
        /// time string matches the rest of the app regardless of locale/formatting.
        var prayerTimeLabel: String
        /// The prayer name can advance while the activity stays live (Fajr → Dhuhr …).
        var prayerName: String

        /// The target Date the SwiftUI timer/relative styles count toward.
        var prayerDate: Date { Date(timeIntervalSince1970: prayerTimestamp / 1000.0) }
    }

    /// City label shown under the countdown; fixed for the activity's lifetime.
    var cityName: String?
}

// MARK: - Brand colors (fallbacks match src/constants/colors.ts DarkColors)

@available(iOS 16.1, *)
private extension Color {
    static let paBackground = Color("WidgetBackground", bundle: nil, paFallback: Color(red: 0.051, green: 0.184, blue: 0.090)) // #0D2F17
    static let paAccent = Color("WidgetAccent", bundle: nil, paFallback: Color(red: 0.788, green: 0.949, blue: 0.478)) // #C9F27A

    init(_ name: String, bundle: Bundle?, paFallback: Color) {
        if UIColor(named: name) != nil {
            self = Color(name)
        } else {
            self = paFallback
        }
    }
}

// MARK: - Live Activity configuration

@available(iOS 16.1, *)
struct NextPrayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NextPrayerActivityAttributes.self) { context in
            // Lock-screen / banner presentation.
            lockScreenBanner(context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded (long-press) presentation.
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.state.prayerName, systemImage: "moon.stars.fill")
                        .font(.system(size: 15, weight: .heavy))
                        .foregroundStyle(Color.paAccent)
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.prayerDate, style: .timer)
                        .font(.system(size: 15, weight: .bold))
                        .monospacedDigit()
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 64)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text(context.state.prayerTimeLabel)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(.white)
                        if let city = context.attributes.cityName, !city.isEmpty {
                            Spacer()
                            Text(city)
                                .font(.system(size: 12))
                                .foregroundStyle(.white.opacity(0.6))
                        }
                    }
                    .padding(.horizontal, 4)
                }
            } compactLeading: {
                Image(systemName: "moon.stars.fill").foregroundStyle(Color.paAccent)
            } compactTrailing: {
                Text(context.state.prayerDate, style: .timer)
                    .font(.system(size: 13, weight: .semibold))
                    .monospacedDigit()
                    .frame(maxWidth: 44)
                    .foregroundStyle(Color.paAccent)
            } minimal: {
                Image(systemName: "moon.stars.fill").foregroundStyle(Color.paAccent)
            }
            .widgetURL(URL(string: "praycalc://"))
            .keylineTint(Color.paAccent)
        }
    }

    @ViewBuilder
    private func lockScreenBanner(_ context: ActivityViewContext<NextPrayerActivityAttributes>) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text("NEXT PRAYER")
                    .font(.system(size: 10, weight: .bold))
                    .kerning(1)
                    .foregroundStyle(Color.paAccent.opacity(0.9))
                Text(context.state.prayerName)
                    .font(.system(size: 22, weight: .heavy))
                    .foregroundStyle(Color.paAccent)
                if let city = context.attributes.cityName, !city.isEmpty {
                    Text(city)
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.6))
                        .lineLimit(1)
                }
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 2) {
                Text(context.state.prayerDate, style: .timer)
                    .font(.system(size: 28, weight: .bold))
                    .monospacedDigit()
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text(context.state.prayerTimeLabel)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.paAccent.opacity(0.85))
            }
        }
        .padding(16)
        .activityBackgroundTint(Color.paBackground)
        .activitySystemActionForegroundColor(Color.paAccent)
    }
}
