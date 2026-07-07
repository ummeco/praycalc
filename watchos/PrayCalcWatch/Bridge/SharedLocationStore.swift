import Foundation

/// SharedLocationStore — the single source of truth for the user's location and
/// calculation preferences, shared between the watch app and the complication
/// widget extension.
///
/// Why this exists: a watchOS Widget Extension runs in its own process with its
/// own `UserDefaults.standard` sandbox, so the app and the complication cannot
/// see each other's `standard` defaults. They share state through an App Group
/// suite instead. The app writes the last-known GPS location + method/madhab
/// here; the complication reads them to compute prayer times **locally** via the
/// C core (`PrayCalcEngine`) — no network, offline-first.
///
/// Phone sync: when the paired iOS app ships, it will push location/preferences
/// into this same App Group (via WatchConnectivity), so the watch works before
/// its own GPS ever fixes. Until then, the app's own CoreLocation fix populates
/// it. The App Group id must match the `com.apple.security.application-groups`
/// entitlement on both targets.
enum SharedLocationStore {
    /// App Group identifier. Must equal the entitlement value in both targets.
    static let appGroup = "group.com.praycalc.watch"

    /// Shared defaults suite. Falls back to `.standard` only if the App Group is
    /// unavailable (e.g. entitlement not provisioned in a bare CI build), so the
    /// app still functions single-process.
    static let defaults: UserDefaults =
        UserDefaults(suiteName: appGroup) ?? .standard

    // Keys (kept identical to the legacy @AppStorage keys for continuity).
    enum Key {
        static let latitude = "lastLatitude"
        static let longitude = "lastLongitude"
        static let method = "calculationMethod"
        static let madhab = "madhab"
        static let city = "lastCity"
    }

    // MARK: - Location

    static var latitude: Double {
        get { defaults.double(forKey: Key.latitude) }
        set { defaults.set(newValue, forKey: Key.latitude) }
    }

    static var longitude: Double {
        get { defaults.double(forKey: Key.longitude) }
        set { defaults.set(newValue, forKey: Key.longitude) }
    }

    /// True once a real location has been stored (0,0 is treated as "unset").
    static var hasLocation: Bool {
        latitude != 0.0 && longitude != 0.0
    }

    // MARK: - Preferences

    static var methodKey: String {
        get { defaults.string(forKey: Key.method) ?? "isna" }
        set { defaults.set(newValue, forKey: Key.method) }
    }

    static var madhabKey: String {
        get { defaults.string(forKey: Key.madhab) ?? "shafii" }
        set { defaults.set(newValue, forKey: Key.madhab) }
    }

    /// Display label for the current location (e.g. "New York"). Set from a
    /// phone-synced context; empty when only a raw GPS fix is known.
    static var city: String {
        get { defaults.string(forKey: Key.city) ?? "" }
        set { defaults.set(newValue, forKey: Key.city) }
    }

    /// Persist the app's latest fix + preferences so the widget can read them.
    static func store(latitude: Double, longitude: Double, method: String, madhab: String) {
        self.latitude = latitude
        self.longitude = longitude
        self.methodKey = method
        self.madhabKey = madhab
    }
}
