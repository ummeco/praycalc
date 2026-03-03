// PrayCalcLiveActivity — ActivityKit Live Activity Extension
import ActivityKit
import SwiftUI
import WidgetKit

public struct PrayTimesAttributes: ActivityAttributes {
    public typealias ContentState = State

    public struct State: Codable, Hashable {
        var nextPrayer: String      // "Asr"
        var countdown: String       // "2:14"
        var prayerTime: String      // "3:45 PM"
        var afterPrayer: String     // "Maghrib 7:34 PM"
    }
}

struct PrayCalcLiveActivityView: View {
    let context: ActivityViewContext<PrayTimesAttributes>
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("🕌 \(context.state.nextPrayer)")
                    .font(.headline)
                    .foregroundColor(.white)
                    .bold()
                Text("in \(context.state.countdown)")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.8))
                if !context.state.prayerTime.isEmpty {
                    Text(context.state.prayerTime)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text("After")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.5))
                Text(context.state.afterPrayer)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
        }
        .padding()
        .activityBackgroundTint(Color(red: 0.118, green: 0.369, blue: 0.184))
    }
}

@main
struct PrayCalcLiveActivityBundle: WidgetBundle {
    var body: some Widget {
        PrayCalcLiveActivityWidget()
    }
}

struct PrayCalcLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayTimesAttributes.self) { context in
            PrayCalcLiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("🕌 \(context.state.nextPrayer)")
                        .foregroundColor(.white)
                        .font(.headline)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.countdown)
                        .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
                        .font(.headline)
                        .bold()
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("After: \(context.state.afterPrayer)")
                        .foregroundColor(.white.opacity(0.7))
                        .font(.caption)
                }
            } compactLeading: {
                Text("🕌")
            } compactTrailing: {
                Text(context.state.countdown)
                    .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
                    .font(.caption)
                    .bold()
            } minimal: {
                Text("🕌")
            }
        }
    }
}
