/// Islamic prayer time calculation library for Swift.
/// Pure Swift, no dependencies.
import Foundation

/// Calculation method for prayer times.
public enum Method: String, CaseIterable {
    case isna = "isna"
    case mwl = "mwl"
    case egypt = "egypt"
    case ummAlQura = "umm_al_qura"
    case tehran = "tehran"
    case karachi = "karachi"
}

/// Madhab (school of jurisprudence) for Asr time calculation.
public enum Madhab: String {
    case shafi = "shafi"
    case hanafi = "hanafi"
}

/// Calculated prayer times for a given day and location.
public struct PrayerTimes {
    public let fajr: String
    public let sunrise: String
    public let dhuhr: String
    public let asr: String
    public let maghrib: String
    public let isha: String
    public let date: String
    public let latitude: Double
    public let longitude: Double
    public let method: Method
    public let madhab: Madhab
}

private struct MethodParams {
    let fajrAngle: Double
    let ishaAngle: Double    // 0 if using interval
    let ishaInterval: Int    // minutes after maghrib; 0 if using angle
}

private let methodParams: [Method: MethodParams] = [
    .isna:       MethodParams(fajrAngle: 15.0, ishaAngle: 15.0, ishaInterval: 0),
    .mwl:        MethodParams(fajrAngle: 18.0, ishaAngle: 17.0, ishaInterval: 0),
    .egypt:      MethodParams(fajrAngle: 19.5, ishaAngle: 17.5, ishaInterval: 0),
    .ummAlQura:  MethodParams(fajrAngle: 18.5, ishaAngle: 0,    ishaInterval: 90),
    .tehran:     MethodParams(fajrAngle: 17.7, ishaAngle: 14.0, ishaInterval: 0),
    .karachi:    MethodParams(fajrAngle: 18.0, ishaAngle: 18.0, ishaInterval: 0),
]

private func toRad(_ d: Double) -> Double { d * .pi / 180 }
private func toDeg(_ r: Double) -> Double { r * 180 / .pi }
private func fixHour(_ h: Double) -> Double { h - 24 * floor(h / 24) }

private func julianDay(year: Int, month: Int, day: Int) -> Double {
    var y = year, m = month
    if m <= 2 { y -= 1; m += 12 }
    let a = floor(Double(y) / 100)
    let b = 2 - a + floor(a / 4)
    return floor(365.25 * Double(y + 4716)) + floor(30.6001 * Double(m + 1)) + Double(day) + b - 1524.5
}

private func sunPosition(jd: Double) -> (dec: Double, eqTime: Double) {
    let d = jd - 2451545.0
    let g = toRad(357.529 + 0.98560028 * d)
    let q = 280.459 + 0.98564736 * d
    let l = toRad(q + 1.915 * sin(g) + 0.020 * sin(2 * g))
    let e = toRad(23.439 - 0.00000036 * d)
    var ra = toDeg(atan2(cos(e) * sin(l), cos(l))) / 15
    ra = fixHour(ra)
    let dec = toDeg(asin(sin(e) * sin(l)))
    let eqTime = q / 15 - ra
    return (dec, eqTime)
}

private func sunAngleTime(jd: Double, lat: Double, angle: Double, clockwise: Bool) -> Double {
    let (dec, eqTime) = sunPosition(jd: jd)
    let noon = 12.0 - eqTime
    let cosVal = (-sin(toRad(angle)) - sin(toRad(dec)) * sin(toRad(lat))) /
                 (cos(toRad(dec)) * cos(toRad(lat)))
    guard cosVal >= -1, cosVal <= 1 else { return Double.nan }
    let t = toDeg(acos(cosVal)) / 15
    return clockwise ? noon + t : noon - t
}

private func asrTime(jd: Double, lat: Double, shadowFactor: Int) -> Double {
    let (dec, eqTime) = sunPosition(jd: jd)
    let noon = 12.0 - eqTime
    let targetAngle = -toDeg(atan(1.0 / (Double(shadowFactor) + tan(abs(toRad(lat - dec))))))
    let cosVal = (-sin(toRad(targetAngle)) - sin(toRad(dec)) * sin(toRad(lat))) /
                 (cos(toRad(dec)) * cos(toRad(lat)))
    guard cosVal >= -1, cosVal <= 1 else { return Double.nan }
    return noon + toDeg(acos(cosVal)) / 15
}

/// Rendered in place of a prayer that has no time on the requested date.
///
/// Above the polar circles the sun can fail to rise or set for weeks, so a depression
/// angle is simply unreachable and `sunAngleTime`/`asrTime` return NaN.
public let noTimePlaceholder = "--:--"

private func formatTime(_ hour: Double, lng: Double) -> String {
    // `Int(Double.nan)` is a FATAL TRAP in Swift, not a catchable error: it killed the
    // host process outright for any caller asking about a polar latitude (PKG-06).
    guard hour.isFinite else { return noTimePlaceholder }
    let h = fixHour(hour + lng / 15)
    guard h.isFinite else { return noTimePlaceholder }
    var hr = Int(h)
    var min = Int((h - Double(hr)) * 60 + 0.5)
    if min >= 60 { hr += 1; min -= 60 }
    return String(format: "%02d:%02d", hr % 24, min)
}

/// Calculate Islamic prayer times for a given location and date.
/// - Parameters:
///   - latitude: Decimal degrees (-90 to 90)
///   - longitude: Decimal degrees (-180 to 180)
///   - date: The date to calculate for
///   - method: Calculation method (default: .isna)
///   - madhab: Asr shadow ratio (default: .shafi)
/// - Returns: PrayerTimes with formatted HH:MM times
public func calculatePrayerTimes(
    latitude: Double,
    longitude: Double,
    date: Date,
    method: Method = .isna,
    madhab: Madhab = .shafi
) -> PrayerTimes {
    let cal = Calendar(identifier: .gregorian)
    let comps = cal.dateComponents([.year, .month, .day], from: date)
    let jd = julianDay(year: comps.year!, month: comps.month!, day: comps.day!)
    let params = methodParams[method]!
    let shadowFactor = madhab == .shafi ? 1 : 2

    let fajr = sunAngleTime(jd: jd, lat: latitude, angle: params.fajrAngle, clockwise: false)
    let sunrise = sunAngleTime(jd: jd, lat: latitude, angle: -0.833, clockwise: false)
    let (_, eqTime) = sunPosition(jd: jd)
    let dhuhr = 12.0 - eqTime
    let asr = asrTime(jd: jd, lat: latitude, shadowFactor: shadowFactor)
    let maghrib = sunAngleTime(jd: jd, lat: latitude, angle: -0.833, clockwise: true)
    let isha: Double = params.ishaInterval > 0
        ? maghrib + Double(params.ishaInterval) / 60
        : sunAngleTime(jd: jd, lat: latitude, angle: params.ishaAngle, clockwise: true)

    let df = DateFormatter()
    df.dateFormat = "yyyy-MM-dd"

    return PrayerTimes(
        fajr: formatTime(fajr, lng: longitude),
        sunrise: formatTime(sunrise, lng: longitude),
        dhuhr: formatTime(dhuhr, lng: longitude),
        asr: formatTime(asr, lng: longitude),
        maghrib: formatTime(maghrib, lng: longitude),
        isha: formatTime(isha, lng: longitude),
        date: df.string(from: date),
        latitude: latitude,
        longitude: longitude,
        method: method,
        madhab: madhab
    )
}
