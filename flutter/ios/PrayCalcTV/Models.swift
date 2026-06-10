// PrayCalcTV — Core data models
// Shared across all views. No network code here — see PrayerStore.swift.

import Foundation

// MARK: - Prayer

struct Prayer: Identifiable {
    let id = UUID()
    let name: String
    let arabicName: String
    let time: Date
    var isNext: Bool = false
}

// MARK: - API response

struct PrayerResponse: Codable {
    let fajr: String
    let sunrise: String
    let dhuhr: String
    let asr: String
    let maghrib: String
    let isha: String
    let date: String

    // Top-level wrapper from the smart server
    enum CodingKeys: String, CodingKey {
        case fajr, sunrise, dhuhr, asr, maghrib, isha, date
    }
}

struct PrayerAPIWrapper: Codable {
    let times: PrayerResponse?
    let fajr: String?
    let sunrise: String?
    let dhuhr: String?
    let asr: String?
    let maghrib: String?
    let isha: String?
    let date: String?
}

// MARK: - Stream

struct Stream: Identifiable {
    let id = UUID()
    let name: String
    let arabicName: String
    let url: URL
    let emoji: String
    /// true = HLS/audio via AVPlayer; false = YouTube embed via WKWebView
    var isDirectStream: Bool = false
}
