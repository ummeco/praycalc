import Foundation

/// Swift wrapper around the C core prayer calculation library.
///
/// Architecture: watchOS uses an offline-first approach for prayer times.
/// The C core library (via this bridge) is the primary calculation engine,
/// running entirely on-device with no network required. The PrayCalc API
/// serves as a fallback when C core calculation fails. This ensures prayer
/// times are always available on Apple Watch even without connectivity.
final class PrayCalcEngine {

    // MARK: - Types

    enum CalculationMethod: Int, CaseIterable, Identifiable {
        case isna = 0
        case mwl = 1
        case egypt = 2
        case ummAlQura = 3
        case tehran = 4
        case karachi = 5

        var id: Int { rawValue }

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

        /// Map from API string keys to enum cases.
        init?(apiKey: String) {
            switch apiKey {
            case "isna": self = .isna
            case "mwl": self = .mwl
            case "egypt": self = .egypt
            case "umm_al_qura", "makkah": self = .ummAlQura
            case "tehran": self = .tehran
            case "karachi": self = .karachi
            default: return nil
            }
        }
    }

    enum AsrMadhab: Int, CaseIterable, Identifiable {
        case shafi = 0
        case hanafi = 1

        var id: Int { rawValue }

        var displayName: String {
            switch self {
            case .shafi: return "Shafi'i"
            case .hanafi: return "Hanafi"
            }
        }

        init?(apiKey: String) {
            switch apiKey {
            case "shafii", "shafi": self = .shafi
            case "hanafi": self = .hanafi
            default: return nil
            }
        }
    }

    struct PrayerTimes {
        let fajr: Date
        let sunrise: Date
        let dhuhr: Date
        let asr: Date
        let maghrib: Date
        let isha: Date
        let qiblaBearing: Double
    }

    // MARK: - Calculation

    /// Calculate prayer times for a given location, date, method, and madhab.
    /// All computation happens on-device using the C core library.
    static func calculatePrayerTimes(
        latitude: Double,
        longitude: Double,
        date: Date = Date(),
        elevation: Double = 0,
        method: CalculationMethod = .isna,
        madhab: AsrMadhab = .shafi
    ) -> PrayerTimes? {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month, .day], from: date)

        guard let year = components.year,
              let month = components.month,
              let day = components.day else {
            return nil
        }

        let timezone = Double(TimeZone.current.secondsFromGMT(for: date)) / 3600.0

        var input = PrayCalcInput()
        pray_calc_input_init(&input)

        input.latitude = latitude
        input.longitude = longitude
        input.year = Int32(year)
        input.month = Int32(month)
        input.day = Int32(day)
        input.timezone = timezone
        input.elevation = elevation
        input.method = Int32(method.rawValue)
        input.madhab = Int32(madhab.rawValue)

        let result = pray_calc_times(input)

        // Convert fractional hours to Date objects for today
        guard let startOfDay = calendar.date(from: DateComponents(
            year: year, month: month, day: day,
            hour: 0, minute: 0, second: 0
        )) else {
            return nil
        }

        func toDate(_ fractionalHours: Double) -> Date {
            let seconds = fractionalHours * 3600.0
            return startOfDay.addingTimeInterval(seconds)
        }

        return PrayerTimes(
            fajr: toDate(result.fajr),
            sunrise: toDate(result.sunrise),
            dhuhr: toDate(result.dhuhr),
            asr: toDate(result.asr),
            maghrib: toDate(result.maghrib),
            isha: toDate(result.isha),
            qiblaBearing: result.qibla_bearing
        )
    }

    /// Calculate Qibla bearing from the given coordinates.
    /// Returns degrees clockwise from north (0=N, 90=E, 180=S, 270=W).
    static func calculateQiblaBearing(latitude: Double, longitude: Double) -> Double {
        return qibla_bearing(latitude, longitude)
    }

    /// Format fractional hours (from C core) as "h:mm a" string.
    static func formatTime(_ fractionalHours: Double) -> String {
        guard !fractionalHours.isNaN else { return "--:--" }

        let totalMinutes = Int(fractionalHours * 60)
        var hour = totalMinutes / 60
        let minute = totalMinutes % 60
        let period = hour >= 12 ? "PM" : "AM"

        if hour == 0 {
            hour = 12
        } else if hour > 12 {
            hour -= 12
        }

        return String(format: "%d:%02d %@", hour, minute, period)
    }
}
