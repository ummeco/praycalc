import Foundation

// MARK: - API Response

struct PrayerResponse: Codable {
    let prayers: PrayerTimes
    let nextPrayer: NextPrayerInfo
    let qibla: QiblaData
    let meta: PrayerMeta
}

struct PrayerTimes: Codable {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
}

struct NextPrayerInfo: Codable {
    let name: String
    let time: String
    let remaining: String
}

struct QiblaData: Codable {
    let bearing: Double
}

struct PrayerMeta: Codable {
    let method: String
    let madhab: String
    let latitude: Double
    let longitude: Double
    let timezone: String
    let date: String
}

// MARK: - App Models

struct PrayerTime: Identifiable {
    let id = UUID()
    let name: String
    let time: String
    let date: Date?
    var isNext: Bool
    var isPast: Bool

    static let prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]
    static let fivePrayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
}

// MARK: - Calculation Method

enum CalculationMethod: String, CaseIterable, Identifiable {
    case isna = "isna"
    case mwl = "mwl"
    case egypt = "egypt"
    case ummAlQura = "umm_al_qura"
    case tehran = "tehran"
    case karachi = "karachi"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .isna: return "ISNA"
        case .mwl: return "MWL"
        case .egypt: return "Egypt"
        case .ummAlQura: return "Umm al-Qura"
        case .tehran: return "Tehran"
        case .karachi: return "Karachi"
        }
    }
}

// MARK: - Madhab

enum Madhab: String, CaseIterable, Identifiable {
    case shafii = "shafii"
    case hanafi = "hanafi"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .shafii: return "Shafii"
        case .hanafi: return "Hanafi"
        }
    }
}

// MARK: - Helpers

extension PrayerTimes {
    func toPrayerTimeArray(nextPrayerName: String, dateString: String) -> [PrayerTime] {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        let timeStrings: [(String, String)] = [
            ("Fajr", fajr),
            ("Sunrise", sunrise),
            ("Dhuhr", dhuhr),
            ("Asr", asr),
            ("Maghrib", maghrib),
            ("Isha", isha),
        ]

        let now = Date()
        var foundNext = false

        return timeStrings.map { name, time in
            let parsedDate = formatter.date(from: time)
            let isNext = name.lowercased() == nextPrayerName.lowercased() && !foundNext
            if isNext { foundNext = true }

            let isPast: Bool
            if let parsed = parsedDate {
                let calendar = Calendar.current
                let todayComponents = calendar.dateComponents([.year, .month, .day], from: now)
                let timeComponents = calendar.dateComponents([.hour, .minute], from: parsed)
                var combined = DateComponents()
                combined.year = todayComponents.year
                combined.month = todayComponents.month
                combined.day = todayComponents.day
                combined.hour = timeComponents.hour
                combined.minute = timeComponents.minute
                if let fullDate = calendar.date(from: combined) {
                    isPast = fullDate < now && !isNext
                } else {
                    isPast = false
                }
            } else {
                isPast = false
            }

            return PrayerTime(
                name: name,
                time: time,
                date: parsedDate,
                isNext: isNext,
                isPast: isPast
            )
        }
    }

    func fivePrayerArray(nextPrayerName: String, dateString: String) -> [PrayerTime] {
        toPrayerTimeArray(nextPrayerName: nextPrayerName, dateString: dateString)
            .filter { $0.name != "Sunrise" }
    }
}

extension PrayerResponse {
    /// Determines the next prayer based on current time, returning the PrayerTime model.
    func currentNextPrayer() -> PrayerTime? {
        let all = prayers.fivePrayerArray(
            nextPrayerName: nextPrayer.name,
            dateString: meta.date
        )
        return all.first(where: { $0.isNext })
    }

    /// Returns the time interval remaining until the next prayer.
    func timeUntilNextPrayer() -> TimeInterval? {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        guard let nextTime = formatter.date(from: nextPrayer.time) else { return nil }

        let calendar = Calendar.current
        let now = Date()
        let todayComponents = calendar.dateComponents([.year, .month, .day], from: now)
        let timeComponents = calendar.dateComponents([.hour, .minute], from: nextTime)

        var combined = DateComponents()
        combined.year = todayComponents.year
        combined.month = todayComponents.month
        combined.day = todayComponents.day
        combined.hour = timeComponents.hour
        combined.minute = timeComponents.minute

        guard let fullDate = calendar.date(from: combined) else { return nil }

        let interval = fullDate.timeIntervalSince(now)
        return interval >= 0 ? interval : interval + 86400
    }

    /// Returns the total duration between the previous prayer and next prayer.
    func totalIntervalBetweenPrayers() -> TimeInterval? {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        let orderedTimes = [prayers.fajr, prayers.dhuhr, prayers.asr, prayers.maghrib, prayers.isha]
        let orderedNames = PrayerTime.fivePrayerNames

        guard let nextIndex = orderedNames.firstIndex(where: {
            $0.lowercased() == nextPrayer.name.lowercased()
        }) else { return nil }

        let prevIndex = nextIndex > 0 ? nextIndex - 1 : orderedNames.count - 1

        guard let nextTime = formatter.date(from: orderedTimes[nextIndex]),
              let prevTime = formatter.date(from: orderedTimes[prevIndex]) else { return nil }

        let calendar = Calendar.current
        let now = Date()
        let todayComponents = calendar.dateComponents([.year, .month, .day], from: now)

        func makeFullDate(from time: Date) -> Date? {
            let tc = calendar.dateComponents([.hour, .minute], from: time)
            var c = DateComponents()
            c.year = todayComponents.year
            c.month = todayComponents.month
            c.day = todayComponents.day
            c.hour = tc.hour
            c.minute = tc.minute
            return calendar.date(from: c)
        }

        guard let fullNext = makeFullDate(from: nextTime),
              let fullPrev = makeFullDate(from: prevTime) else { return nil }

        let interval = fullNext.timeIntervalSince(fullPrev)
        return interval > 0 ? interval : interval + 86400
    }
}
