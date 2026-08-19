import XCTest
@testable import PrayCalc

/// PKG-06 — the Swift port crashed the host process at high latitudes.
///
/// `sunAngleTime` and `asrTime` return `Double.nan` when a depression angle is
/// geometrically unreachable, which is correct. `formatTime` then did `Int(h)` on that
/// value, and `Int(Double.nan)` is a fatal trap in Swift — not an exception a caller can
/// catch, a process kill. Any app asking for Tromso in June died on the spot.
final class PolarTests: XCTestCase {

    private func date(_ y: Int, _ m: Int, _ d: Int) -> Date {
        var c = DateComponents(); c.year = y; c.month = m; c.day = d
        return Calendar(identifier: .gregorian).date(from: c)!
    }

    private let polar: [(name: String, lat: Double, lng: Double, date: (Int, Int, Int))] = [
        ("Longyearbyen midnight sun", 78.22334, 15.64689, (2026, 6, 21)),
        ("Longyearbyen polar night", 78.22334, 15.64689, (2026, 12, 21)),
        ("Tromso midnight sun", 69.6492, 18.9553, (2026, 6, 21)),
        ("McMurdo polar night", -77.8419, 166.6863, (2026, 6, 21)),
    ]

    /// Reaching the assertion at all is the substance of this test: before the fix the
    /// process died inside `calculatePrayerTimes` and no assertion ran.
    func testPolarLatitudesDoNotCrash() {
        for c in polar {
            let r = calculatePrayerTimes(
                latitude: c.lat, longitude: c.lng,
                date: date(c.date.0, c.date.1, c.date.2)
            )
            for t in [r.fajr, r.sunrise, r.dhuhr, r.asr, r.maghrib, r.isha] {
                XCTAssertFalse(t.isEmpty, "\(c.name): empty time string")
            }
        }
    }

    /// An unreachable prayer must be reported as absent, never as a real-looking time.
    func testUnreachablePrayersRenderAsPlaceholder() {
        let r = calculatePrayerTimes(
            latitude: 78.22334, longitude: 15.64689, date: date(2026, 6, 21)
        )
        for t in [r.fajr, r.sunrise, r.maghrib, r.isha] {
            XCTAssertEqual(t, "--:--", "polar day should have no sunrise/sunset/twilight")
        }
    }

    /// No output may contain "nan" or a nonsense hour, whatever the latitude or date.
    func testNoNaNArtifactsAnywhere() {
        for lat in stride(from: -85.0, through: 85.0, by: 5.0) {
            for month in 1...12 {
                let r = calculatePrayerTimes(latitude: lat, longitude: 0, date: date(2026, month, 15))
                for t in [r.fajr, r.sunrise, r.dhuhr, r.asr, r.maghrib, r.isha] {
                    XCTAssertFalse(t.lowercased().contains("nan"), "lat \(lat) month \(month): \(t)")
                    if t != "--:--" {
                        let parts = t.split(separator: ":").map(String.init)
                        XCTAssertEqual(parts.count, 2, "malformed time \(t)")
                        guard let h = Int(parts[0]), let m = Int(parts[1]) else {
                            return XCTFail("unparseable time \(t) at lat \(lat)")
                        }
                        XCTAssertTrue((0...23).contains(h), "hour out of range in \(t)")
                        XCTAssertTrue((0...59).contains(m), "minute out of range in \(t)")
                    }
                }
            }
        }
    }

    /// Normal latitudes keep producing real times.
    func testNormalLatitudesUnchanged() {
        let r = calculatePrayerTimes(latitude: 21.39, longitude: 39.86, date: date(2026, 3, 20), method: .ummAlQura)
        for t in [r.fajr, r.sunrise, r.dhuhr, r.asr, r.maghrib, r.isha] {
            XCTAssertNotEqual(t, "--:--", "Mecca should have every prayer")
        }
    }
}
