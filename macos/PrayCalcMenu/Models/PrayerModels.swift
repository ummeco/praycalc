import Foundation

struct PrayerTime: Identifiable, Codable {
    var id: String { name }
    let name: String
    let date: Date
    let isNext: Bool

    var displayTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }

    enum CodingKeys: String, CodingKey {
        case name, date, isNext
    }
}

struct PrayerTimesRaw: Codable {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
}

struct QiblaInfo: Codable {
    let bearing: Double
    let distance: Double
}

struct PrayerMeta: Codable {
    let method: String
    let madhab: String
    let timezone: String?
    let latitude: Double?
    let longitude: Double?
}

struct PrayerResponse: Codable {
    let prayers: PrayerTimesRaw
    let nextPrayer: String
    let qibla: QiblaInfo?
    let meta: PrayerMeta?
}
