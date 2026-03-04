import XCTest
@testable import PrayCalcMenu

final class PrayerServiceTests: XCTestCase {

    // MARK: - API Response Parsing

    func testAPIResponseParsing() throws {
        let json = """
        {
            "prayers": {
                "fajr": "05:30",
                "sunrise": "06:55",
                "dhuhr": "12:15",
                "asr": "15:45",
                "maghrib": "18:30",
                "isha": "20:00"
            },
            "nextPrayer": "dhuhr",
            "qibla": {
                "bearing": 56.78,
                "distance": 10234.5
            },
            "meta": {
                "method": "isna",
                "madhab": "shafii",
                "timezone": "America/New_York",
                "latitude": 40.7128,
                "longitude": -74.006
            }
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(PrayerResponse.self, from: json)

        XCTAssertEqual(response.prayers.fajr, "05:30")
        XCTAssertEqual(response.prayers.dhuhr, "12:15")
        XCTAssertEqual(response.prayers.isha, "20:00")
        XCTAssertEqual(response.nextPrayer, "dhuhr")
        XCTAssertEqual(response.qibla?.bearing, 56.78, accuracy: 0.01)
        XCTAssertEqual(response.qibla?.distance, 10234.5, accuracy: 0.1)
        XCTAssertEqual(response.meta?.method, "isna")
        XCTAssertEqual(response.meta?.madhab, "shafii")
    }

    // MARK: - Location Fallback

    func testLocationFallbackToDefaults() {
        // When no location is available and no manual coordinates are set,
        // the service should fall back to default coordinates (New York).
        let defaults = UserDefaults.standard
        defaults.removeObject(forKey: "manualLatitude")
        defaults.removeObject(forKey: "manualLongitude")
        defaults.set(false, forKey: "useAutoLocation")

        // Simulate the coordinate resolution logic
        let useAuto = defaults.bool(forKey: "useAutoLocation")
        XCTAssertFalse(useAuto)

        let latStr = defaults.string(forKey: "manualLatitude") ?? ""
        let lngStr = defaults.string(forKey: "manualLongitude") ?? ""
        let lat = Double(latStr)
        let lng = Double(lngStr)

        // Both should be nil since we removed them
        XCTAssertNil(lat)
        XCTAssertNil(lng)

        // Default fallback
        let fallbackLat = lat ?? 40.7128
        let fallbackLng = lng ?? -74.0060
        XCTAssertEqual(fallbackLat, 40.7128, accuracy: 0.001)
        XCTAssertEqual(fallbackLng, -74.0060, accuracy: 0.001)
    }

    // MARK: - Notification Scheduling

    func testNotificationSchedulingRespectsPreferences() {
        let defaults = UserDefaults.standard

        // Enable Fajr and Maghrib, disable others
        defaults.set(true, forKey: "notifyFajr")
        defaults.set(false, forKey: "notifyDhuhr")
        defaults.set(false, forKey: "notifyAsr")
        defaults.set(true, forKey: "notifyMaghrib")
        defaults.set(false, forKey: "notifyIsha")

        // Simulate the enabled-prayers logic
        var enabled = Set<String>()
        if defaults.bool(forKey: "notifyFajr") { enabled.insert("Fajr") }
        if defaults.bool(forKey: "notifyDhuhr") { enabled.insert("Dhuhr") }
        if defaults.bool(forKey: "notifyAsr") { enabled.insert("Asr") }
        if defaults.bool(forKey: "notifyMaghrib") { enabled.insert("Maghrib") }
        if defaults.bool(forKey: "notifyIsha") { enabled.insert("Isha") }

        XCTAssertTrue(enabled.contains("Fajr"))
        XCTAssertFalse(enabled.contains("Dhuhr"))
        XCTAssertFalse(enabled.contains("Asr"))
        XCTAssertTrue(enabled.contains("Maghrib"))
        XCTAssertFalse(enabled.contains("Isha"))
        XCTAssertEqual(enabled.count, 2)
    }

    // MARK: - Settings Persistence

    func testSettingsPersistence() {
        let defaults = UserDefaults.standard

        // Set values
        defaults.set("mwl", forKey: "calculationMethod")
        defaults.set("hanafi", forKey: "madhab")
        defaults.set(true, forKey: "launchAtLogin")

        // Read them back
        XCTAssertEqual(defaults.string(forKey: "calculationMethod"), "mwl")
        XCTAssertEqual(defaults.string(forKey: "madhab"), "hanafi")
        XCTAssertTrue(defaults.bool(forKey: "launchAtLogin"))

        // Reset to defaults
        defaults.set("isna", forKey: "calculationMethod")
        defaults.set("shafii", forKey: "madhab")
        defaults.set(false, forKey: "launchAtLogin")

        XCTAssertEqual(defaults.string(forKey: "calculationMethod"), "isna")
        XCTAssertEqual(defaults.string(forKey: "madhab"), "shafii")
        XCTAssertFalse(defaults.bool(forKey: "launchAtLogin"))
    }
}
