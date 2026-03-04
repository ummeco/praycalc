import XCTest

@testable import PrayCalcWatch

final class PrayerDataTests: XCTestCase {

    // MARK: - Sample API Response

    private let sampleJSON = """
        {
            "prayers": {
                "fajr": "5:42 AM",
                "sunrise": "7:05 AM",
                "dhuhr": "12:30 PM",
                "asr": "3:45 PM",
                "maghrib": "6:15 PM",
                "isha": "7:45 PM"
            },
            "nextPrayer": {
                "name": "Asr",
                "time": "3:45 PM",
                "remaining": "2h 17m"
            },
            "qibla": {
                "bearing": 56.78
            },
            "meta": {
                "method": "isna",
                "madhab": "shafii",
                "latitude": 41.4993,
                "longitude": -81.6944,
                "timezone": "America/New_York",
                "date": "2026-03-04"
            }
        }
        """

    // MARK: - Test 1: PrayerResponse JSON Decoding

    func testPrayerResponseDecoding() throws {
        let data = sampleJSON.data(using: .utf8)!
        let response = try JSONDecoder().decode(PrayerResponse.self, from: data)

        XCTAssertEqual(response.prayers.fajr, "5:42 AM")
        XCTAssertEqual(response.prayers.sunrise, "7:05 AM")
        XCTAssertEqual(response.prayers.dhuhr, "12:30 PM")
        XCTAssertEqual(response.prayers.asr, "3:45 PM")
        XCTAssertEqual(response.prayers.maghrib, "6:15 PM")
        XCTAssertEqual(response.prayers.isha, "7:45 PM")

        XCTAssertEqual(response.nextPrayer.name, "Asr")
        XCTAssertEqual(response.nextPrayer.time, "3:45 PM")
        XCTAssertEqual(response.nextPrayer.remaining, "2h 17m")

        XCTAssertEqual(response.meta.method, "isna")
        XCTAssertEqual(response.meta.madhab, "shafii")
        XCTAssertEqual(response.meta.latitude, 41.4993, accuracy: 0.001)
        XCTAssertEqual(response.meta.longitude, -81.6944, accuracy: 0.001)
        XCTAssertEqual(response.meta.timezone, "America/New_York")
        XCTAssertEqual(response.meta.date, "2026-03-04")
    }

    // MARK: - Test 2: QiblaData Bearing Parsing

    func testQiblaDataBearingParsing() throws {
        let data = sampleJSON.data(using: .utf8)!
        let response = try JSONDecoder().decode(PrayerResponse.self, from: data)

        XCTAssertEqual(response.qibla.bearing, 56.78, accuracy: 0.01)
        XCTAssertGreaterThanOrEqual(response.qibla.bearing, 0)
        XCTAssertLessThan(response.qibla.bearing, 360)
    }

    // MARK: - Test 3: Next Prayer Determination

    func testNextPrayerDetermination() throws {
        let data = sampleJSON.data(using: .utf8)!
        let response = try JSONDecoder().decode(PrayerResponse.self, from: data)

        let prayers = response.prayers.fivePrayerArray(
            nextPrayerName: response.nextPrayer.name,
            dateString: response.meta.date
        )

        // Should have exactly 5 prayers (no Sunrise)
        XCTAssertEqual(prayers.count, 5)

        // Verify prayer names in order
        XCTAssertEqual(prayers[0].name, "Fajr")
        XCTAssertEqual(prayers[1].name, "Dhuhr")
        XCTAssertEqual(prayers[2].name, "Asr")
        XCTAssertEqual(prayers[3].name, "Maghrib")
        XCTAssertEqual(prayers[4].name, "Isha")

        // Exactly one prayer should be marked as next
        let nextPrayers = prayers.filter { $0.isNext }
        XCTAssertEqual(nextPrayers.count, 1)
        XCTAssertEqual(nextPrayers.first?.name, "Asr")

        // Verify times are populated
        for prayer in prayers {
            XCTAssertFalse(prayer.time.isEmpty, "\(prayer.name) should have a time")
        }
    }

    // MARK: - Test 4: Complication Timeline Entry Generation

    func testComplicationTimelineEntryGeneration() throws {
        let data = sampleJSON.data(using: .utf8)!
        let response = try JSONDecoder().decode(PrayerResponse.self, from: data)

        // Test placeholder entry
        let placeholder = PrayerTimelineEntry.placeholder
        XCTAssertTrue(placeholder.isPlaceholder)
        XCTAssertEqual(placeholder.allPrayers.count, 5)
        XCTAssertFalse(placeholder.prayerName.isEmpty)
        XCTAssertFalse(placeholder.prayerTime.isEmpty)
        XCTAssertGreaterThanOrEqual(placeholder.progress, 0)
        XCTAssertLessThanOrEqual(placeholder.progress, 1)

        // Test that currentNextPrayer returns a value
        let nextPrayer = response.currentNextPrayer()
        XCTAssertNotNil(nextPrayer)
        XCTAssertEqual(nextPrayer?.name, "Asr")

        // Test timeUntilNextPrayer returns a non-nil value
        let remaining = response.timeUntilNextPrayer()
        XCTAssertNotNil(remaining)

        // Test totalIntervalBetweenPrayers returns a positive value
        let total = response.totalIntervalBetweenPrayers()
        XCTAssertNotNil(total)
        if let total = total {
            XCTAssertGreaterThan(total, 0)
        }

        // Test that placeholder has correct structure for all complication families
        XCTAssertEqual(placeholder.allPrayers[0].name, "Fajr")
        XCTAssertEqual(placeholder.allPrayers[1].name, "Dhuhr")
        XCTAssertEqual(placeholder.allPrayers[2].name, "Asr")
        XCTAssertEqual(placeholder.allPrayers[3].name, "Maghrib")
        XCTAssertEqual(placeholder.allPrayers[4].name, "Isha")
    }
}
