import Foundation

enum Config {
    /// Base URL for the PrayCalc smart API server.
    static let smartBaseURL = "https://smart.praycalc.com"

    /// Builds the prayer-times endpoint URL for a city and calculation method.
    static func prayerTimesURL(city: String, method: String) -> URL? {
        guard let encoded = city.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else { return nil }
        return URL(string: "\(smartBaseURL)/api/v1/public/times?city=\(encoded)&method=\(method)")
    }
}
