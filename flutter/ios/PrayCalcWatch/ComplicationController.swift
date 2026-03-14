// PrayCalcWatch — ComplicationController
// Provides prayer-time complication data to ClockKit from the AppGroup
// UserDefaults written by ExtensionDelegate.storePrayerPayload().
//
// Supported families:
//   .modularSmall, .utilitarianSmall, .circularSmall — next prayer name + time
//   .modularLarge, .utilitarianLarge                — next prayer + countdown
//   .graphicCircular, .graphicCorner, .graphicBezel  — SwiftUI if available
//
// NOTE: This file is a stub. Wire it into the Xcode watch extension target
// and it will compile as-is. All data reads come from UserDefaults; no
// network calls are made from the watch side.

import ClockKit
import WatchKit

class ComplicationController: NSObject, CLKComplicationDataSource {

  // MARK: - Constants

  private static let appGroup = "group.com.praycalc.app"

  // MARK: - Helpers

  /// Reads stored prayer times from the AppGroup UserDefaults.
  /// Returns a dict of { "Fajr": "05:23", "Dhuhr": "12:30", ... }.
  private func storedTimes() -> [String: String] {
    guard let defaults = UserDefaults(suiteName: Self.appGroup) else { return [:] }
    var result = [String: String]()
    let prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
    for name in prayers {
      if let t = defaults.string(forKey: "widget_\(name)") {
        result[name.capitalized] = t
      }
    }
    return result
  }

  /// Determines the next upcoming prayer from a [String: String] times dict
  /// keyed by prayer name (capitalized). Returns ("Prayer", "HH:mm").
  private func nextPrayer(from times: [String: String]) -> (String, String) {
    let order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
    let cal = Calendar.current
    let now = Date()
    let nowMinutes = cal.component(.hour, from: now) * 60 + cal.component(.minute, from: now)

    for name in order {
      guard let timeStr = times[name],
            let prayerMinutes = parseTime(timeStr) else { continue }
      if prayerMinutes > nowMinutes {
        return (name, timeStr)
      }
    }
    // Wrap: next prayer is tomorrow's Fajr
    return ("Fajr", times["Fajr"] ?? "--:--")
  }

  /// Parses "HH:mm" → total minutes since midnight.
  private func parseTime(_ s: String) -> Int? {
    let parts = s.split(separator: ":").compactMap { Int($0) }
    guard parts.count == 2 else { return nil }
    return parts[0] * 60 + parts[1]
  }

  /// Returns a countdown string like "in 2h 14m" or "in 5m".
  private func countdown(to timeStr: String) -> String {
    guard let target = parseTime(timeStr) else { return "--" }
    let cal = Calendar.current
    let now = Date()
    let nowMinutes = cal.component(.hour, from: now) * 60 + cal.component(.minute, from: now)
    var diff = target - nowMinutes
    if diff <= 0 { diff += 1440 } // next day
    let h = diff / 60
    let m = diff % 60
    return h > 0 ? "\(h)h \(m)m" : "\(m)m"
  }

  // MARK: - CLKComplicationDataSource — Timeline

  func getComplicationDescriptors(
    handler: @escaping ([CLKComplicationDescriptor]) -> Void
  ) {
    let descriptor = CLKComplicationDescriptor(
      identifier: "praycalc.nextprayer",
      displayName: "Next Prayer",
      supportedFamilies: CLKComplicationFamily.allCases
    )
    handler([descriptor])
  }

  func getCurrentTimelineEntry(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void
  ) {
    let times = storedTimes()
    let (name, timeStr) = nextPrayer(from: times)
    let entry = makeEntry(for: complication, prayer: name, time: timeStr, at: Date())
    handler(entry)
  }

  func getTimelineEntries(
    for complication: CLKComplication,
    after date: Date,
    limit: Int,
    withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void
  ) {
    // Return a single refresh point 5 minutes from now.
    // ClockKit will call getCurrentTimelineEntry again after that.
    let times = storedTimes()
    let (name, timeStr) = nextPrayer(from: times)
    let refreshDate = date.addingTimeInterval(5 * 60)
    if let entry = makeEntry(for: complication, prayer: name, time: timeStr, at: refreshDate) {
      handler([entry])
    } else {
      handler(nil)
    }
  }

  func getTimelineEndDate(
    for complication: CLKComplication,
    withHandler handler: @escaping (Date?) -> Void
  ) {
    // Timeline is valid until end of day; phone syncs fresh data at midnight.
    let endOfDay = Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400)
    handler(endOfDay)
  }

  func getPrivacyBehavior(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void
  ) {
    handler(.showOnLockScreen)
  }

  // MARK: - Template factory

  private func makeEntry(
    for complication: CLKComplication,
    prayer: String,
    time: String,
    at date: Date
  ) -> CLKComplicationTimelineEntry? {
    guard let template = makeTemplate(for: complication, prayer: prayer, time: time) else {
      return nil
    }
    return CLKComplicationTimelineEntry(date: date, complicationTemplate: template)
  }

  private func makeTemplate(
    for complication: CLKComplication,
    prayer: String,
    time: String
  ) -> CLKComplicationTemplate? {
    let cd = countdown(to: time)

    switch complication.family {
    case .modularSmall:
      let t = CLKComplicationTemplateModularSmallStackText()
      t.line1TextProvider = CLKSimpleTextProvider(text: prayer)
      t.line2TextProvider = CLKSimpleTextProvider(text: time)
      return t

    case .modularLarge:
      let t = CLKComplicationTemplateModularLargeStandardBody()
      t.headerTextProvider = CLKSimpleTextProvider(text: "PrayCalc")
      t.body1TextProvider = CLKSimpleTextProvider(text: prayer)
      t.body2TextProvider = CLKSimpleTextProvider(text: "\(time) · \(cd)")
      return t

    case .utilitarianSmall, .utilitarianSmallFlat:
      let t = CLKComplicationTemplateUtilitarianSmallFlat()
      t.textProvider = CLKSimpleTextProvider(text: "\(prayer) \(time)")
      return t

    case .utilitarianLarge:
      let t = CLKComplicationTemplateUtilitarianLargeFlat()
      t.textProvider = CLKSimpleTextProvider(text: "\(prayer) \(time) (\(cd))")
      return t

    case .circularSmall:
      let t = CLKComplicationTemplateCircularSmallStackText()
      t.line1TextProvider = CLKSimpleTextProvider(text: prayer)
      t.line2TextProvider = CLKSimpleTextProvider(text: time)
      return t

    case .graphicCircular:
      if #available(watchOS 5.0, *) {
        let t = CLKComplicationTemplateGraphicCircularStackText()
        t.line1TextProvider = CLKSimpleTextProvider(text: prayer)
        t.line2TextProvider = CLKSimpleTextProvider(text: time)
        return t
      }
      return nil

    case .graphicCorner:
      if #available(watchOS 5.0, *) {
        let t = CLKComplicationTemplateGraphicCornerStackText()
        t.innerTextProvider = CLKSimpleTextProvider(text: time)
        t.outerTextProvider = CLKSimpleTextProvider(text: prayer)
        return t
      }
      return nil

    case .graphicBezel:
      if #available(watchOS 5.0, *) {
        let circle = CLKComplicationTemplateGraphicCircularStackText()
        circle.line1TextProvider = CLKSimpleTextProvider(text: prayer)
        circle.line2TextProvider = CLKSimpleTextProvider(text: time)
        let t = CLKComplicationTemplateGraphicBezelCircularText()
        t.circularTemplate = circle
        t.textProvider = CLKSimpleTextProvider(text: "\(cd) until \(prayer)")
        return t
      }
      return nil

    case .graphicRectangular:
      if #available(watchOS 5.0, *) {
        let t = CLKComplicationTemplateGraphicRectangularStandardBody()
        t.headerTextProvider = CLKSimpleTextProvider(text: "Next Prayer")
        t.body1TextProvider = CLKSimpleTextProvider(text: prayer)
        t.body2TextProvider = CLKSimpleTextProvider(text: "\(time) · \(cd)")
        return t
      }
      return nil

    case .graphicExtraLarge:
      if #available(watchOS 7.0, *) {
        let t = CLKComplicationTemplateGraphicExtraLargeCircularStackText()
        t.line1TextProvider = CLKSimpleTextProvider(text: prayer)
        t.line2TextProvider = CLKSimpleTextProvider(text: time)
        return t
      }
      return nil

    @unknown default:
      return nil
    }
  }
}
