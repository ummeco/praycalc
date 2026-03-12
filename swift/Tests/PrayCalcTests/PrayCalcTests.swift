import XCTest
@testable import PrayCalc

final class PrayCalcTests: XCTestCase {

    private func date(_ y: Int, _ m: Int, _ d: Int) -> Date {
        var c = DateComponents(); c.year = y; c.month = m; c.day = d
        return Calendar(identifier: .gregorian).date(from: c)!
    }

    private func isValidTime(_ t: String) -> Bool {
        let parts = t.split(separator: ":").map(String.init)
        guard parts.count == 2,
              let h = Int(parts[0]), let m = Int(parts[1]) else { return false }
        return (0...23).contains(h) && (0...59).contains(m)
    }

    func testFajrFormat() {
        let r = calculatePrayerTimes(latitude: 21.39, longitude: 39.86, date: date(2024, 3, 20), method: .ummAlQura)
        XCTAssertTrue(isValidTime(r.fajr), "Fajr format invalid: \(r.fajr)")
    }

    func testAllTimesPresent() {
        let r = calculatePrayerTimes(latitude: 21.39, longitude: 39.86, date: date(2024, 3, 20))
        for t in [r.fajr, r.sunrise, r.dhuhr, r.asr, r.maghrib, r.isha] {
            XCTAssertTrue(isValidTime(t))
        }
    }

    func testFajrBeforeSunrise() {
        let r = calculatePrayerTimes(latitude: 51.51, longitude: -0.13, date: date(2024, 6, 21))
        XCTAssertLessThan(r.fajr, r.sunrise)
    }

    func testSunriseBeforeDhuhr() {
        let r = calculatePrayerTimes(latitude: 40.71, longitude: -74.01, date: date(2024, 3, 20))
        XCTAssertLessThan(r.sunrise, r.dhuhr)
    }

    func testDhuhrBeforeAsr() {
        let r = calculatePrayerTimes(latitude: 40.71, longitude: -74.01, date: date(2024, 3, 20))
        XCTAssertLessThan(r.dhuhr, r.asr)
    }

    func testAsrBeforeMaghrib() {
        let r = calculatePrayerTimes(latitude: 40.71, longitude: -74.01, date: date(2024, 3, 20))
        XCTAssertLessThan(r.asr, r.maghrib)
    }

    func testMaghribBeforeIsha() {
        let r = calculatePrayerTimes(latitude: 40.71, longitude: -74.01, date: date(2024, 3, 20))
        XCTAssertLessThan(r.maghrib, r.isha)
    }

    func testISNAMethod() {
        let r = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 1, 15), method: .isna)
        XCTAssertEqual(r.method, .isna)
    }

    func testMWLMethod() {
        let r = calculatePrayerTimes(latitude: 51.5, longitude: 0.0, date: date(2024, 1, 15), method: .mwl)
        XCTAssertEqual(r.method, .mwl)
    }

    func testEgyptMethod() {
        let r = calculatePrayerTimes(latitude: 30.0, longitude: 31.0, date: date(2024, 1, 15), method: .egypt)
        XCTAssertEqual(r.method, .egypt)
    }

    func testUmmAlQuraMethod() {
        let r = calculatePrayerTimes(latitude: 21.0, longitude: 39.0, date: date(2024, 1, 15), method: .ummAlQura)
        XCTAssertEqual(r.method, .ummAlQura)
    }

    func testTehranMethod() {
        let r = calculatePrayerTimes(latitude: 35.7, longitude: 51.4, date: date(2024, 1, 15), method: .tehran)
        XCTAssertEqual(r.method, .tehran)
    }

    func testKarachiMethod() {
        let r = calculatePrayerTimes(latitude: 24.9, longitude: 67.0, date: date(2024, 1, 15), method: .karachi)
        XCTAssertEqual(r.method, .karachi)
    }

    func testHanafiAsrLaterThanShafi() {
        let shafi = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 6, 21), madhab: .shafi)
        let hanafi = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 6, 21), madhab: .hanafi)
        XCTAssertLessThan(shafi.asr, hanafi.asr)
    }

    func testNorthernLatitude() {
        let r = calculatePrayerTimes(latitude: 59.9, longitude: 10.7, date: date(2024, 3, 20), method: .mwl)
        XCTAssertTrue(isValidTime(r.fajr))
    }

    func testSouthernLatitude() {
        let r = calculatePrayerTimes(latitude: -33.87, longitude: 151.21, date: date(2024, 3, 20), method: .mwl)
        XCTAssertTrue(isValidTime(r.fajr))
    }

    func testNegativeLongitude() {
        let r = calculatePrayerTimes(latitude: 43.65, longitude: -79.38, date: date(2024, 3, 20))
        XCTAssertTrue(isValidTime(r.dhuhr))
    }

    func testLatitudeStored() {
        let r = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 3, 20))
        XCTAssertEqual(r.latitude, 40.0)
    }

    func testLongitudeStored() {
        let r = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 3, 20))
        XCTAssertEqual(r.longitude, -75.0)
    }

    func testDateStored() {
        let r = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 3, 20))
        XCTAssertEqual(r.date, "2024-03-20")
    }

    func testMadhabShafi() {
        let r = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 3, 20), madhab: .shafi)
        XCTAssertEqual(r.madhab, .shafi)
    }

    func testMadhabHanafi() {
        let r = calculatePrayerTimes(latitude: 40.0, longitude: -75.0, date: date(2024, 3, 20), madhab: .hanafi)
        XCTAssertEqual(r.madhab, .hanafi)
    }

    func testUmmAlQuraIshaInterval() {
        let r = calculatePrayerTimes(latitude: 21.39, longitude: 39.86, date: date(2024, 3, 20), method: .ummAlQura)
        func toMin(_ t: String) -> Int {
            let parts = t.split(separator: ":").map { Int(String($0))! }
            return parts[0] * 60 + parts[1]
        }
        XCTAssertEqual(toMin(r.isha) - toMin(r.maghrib), 90)
    }
}
