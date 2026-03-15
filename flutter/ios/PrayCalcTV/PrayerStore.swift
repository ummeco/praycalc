// PrayCalcTV — PrayerStore
// ObservableObject that owns all prayer-time state for the TV app.
// Fetches from the smart server REST API, parses times, drives the
// countdown timer, and schedules local notifications.

import Foundation
import Combine
import UserNotifications

class PrayerStore: ObservableObject {

    // MARK: - Published state

    @Published var prayers: [Prayer] = []
    @Published var nextPrayer: Prayer?
    @Published var countdown: String = "--"
    @Published var city: String = "Mecca" {
        didSet {
            UserDefaults.standard.set(city, forKey: "praycalc_city")
            Task { await fetchPrayerTimes() }
        }
    }
    @Published var calculationMethod: Int = 2 {
        didSet {
            UserDefaults.standard.set(calculationMethod, forKey: "praycalc_method")
            Task { await fetchPrayerTimes() }
        }
    }
    @Published var use24h: Bool = false {
        didSet { UserDefaults.standard.set(use24h, forKey: "praycalc_24h") }
    }
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    /// Set to non-nil when an adhan should fire; observed by ContentView.
    @Published var currentAdhanPrayer: Prayer?
    /// Flips to true momentarily when adhan fires; ContentView listens.
    @Published var adhanFired: Bool = false

    // MARK: - Private

    private var countdownTimer: Timer?
    private var midnightTimer: Timer?
    /// Tracks which prayer names we've already fired today to avoid repeats.
    private var firedToday: Set<String> = []
    private let calendar = Calendar.current

    // MARK: - Init

    init() {
        city              = UserDefaults.standard.string(forKey: "praycalc_city")     ?? "Mecca"
        calculationMethod = UserDefaults.standard.integer(forKey: "praycalc_method").nonZeroOr(2)
        use24h            = UserDefaults.standard.bool(forKey: "praycalc_24h")

        Task { await fetchPrayerTimes() }
        startCountdownTimer()
        scheduleMidnightRefresh()
        requestNotificationPermission()
    }

    // MARK: - Fetch

    @MainActor
    func fetchPrayerTimes() async {
        isLoading = true
        errorMessage = nil

        guard let url = Config.prayerTimesURL(city: city, method: calculationMethod) else {
            errorMessage = "Invalid city name."
            isLoading = false
            return
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try parseResponse(data)
            buildPrayers(from: decoded)
            scheduleAdhanNotifications()
        } catch {
            errorMessage = "Could not load prayer times. \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Response parsing

    private func parseResponse(_ data: Data) throws -> PrayerResponse {
        // The smart server may return the times at the top level OR nested under a "times" key.
        // Try top-level first, fall back to wrapper.
        if let direct = try? JSONDecoder().decode(PrayerResponse.self, from: data) {
            return direct
        }
        // Nested wrapper
        struct Wrapper: Codable {
            let times: PrayerResponse?
            let data: PrayerResponse?
        }
        let wrapper = try JSONDecoder().decode(Wrapper.self, from: data)
        guard let inner = wrapper.times ?? wrapper.data else {
            throw URLError(.cannotParseResponse)
        }
        return inner
    }

    private func buildPrayers(from response: PrayerResponse) {
        let raw: [(String, String, String)] = [
            ("Fajr",    "الفجر",    response.fajr),
            ("Dhuhr",   "الظهر",    response.dhuhr),
            ("Asr",     "العصر",    response.asr),
            ("Maghrib", "المغرب",   response.maghrib),
            ("Isha",    "العشاء",   response.isha),
        ]

        var built: [Prayer] = []
        for (name, arabic, timeStr) in raw {
            if let date = parseTimeString(timeStr) {
                built.append(Prayer(name: name, arabicName: arabic, time: date))
            }
        }

        // Mark next prayer
        let now = Date()
        var foundNext = false
        for i in built.indices {
            if !foundNext && built[i].time > now {
                built[i].isNext = true
                foundNext = true
            }
        }
        if !foundNext, var first = built.first {
            first.isNext = true
            built[0] = first
        }

        prayers = built
        updateNextPrayer()
        firedToday.removeAll()
    }

    // MARK: - Time string parsing

    /// Parses "5:23 AM", "17:45", or "5:23" into a Date for today.
    private func parseTimeString(_ s: String) -> Date? {
        let trimmed = s.trimmingCharacters(in: .whitespaces)
        let formats = ["h:mm a", "H:mm", "hh:mm a", "HH:mm"]
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        let today = calendar.startOfDay(for: Date())

        for fmt in formats {
            formatter.dateFormat = fmt
            if let parsed = formatter.date(from: trimmed) {
                // Combine today's date with the parsed time components
                let comps = calendar.dateComponents([.hour, .minute], from: parsed)
                return calendar.date(bySettingHour: comps.hour ?? 0,
                                     minute: comps.minute ?? 0,
                                     second: 0,
                                     of: today)
            }
        }
        return nil
    }

    // MARK: - Countdown timer

    private func startCountdownTimer() {
        countdownTimer?.invalidate()
        countdownTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.tick()
        }
        RunLoop.main.add(countdownTimer!, forMode: .common)
    }

    @objc private func tick() {
        updateNextPrayer()
        checkAdhanTrigger()
    }

    private func updateNextPrayer() {
        let now = Date()
        let upcoming = prayers.filter { $0.time > now }.sorted { $0.time < $1.time }
        let next = upcoming.first ?? prayers.first

        nextPrayer = next
        if let next = next {
            countdown = formatCountdown(to: next.time)
        } else {
            countdown = "--"
        }

        // Refresh isNext flags
        if var idx = prayers.firstIndex(where: { $0.id == next?.id }) {
            for i in prayers.indices { prayers[i].isNext = false }
            prayers[idx].isNext = true
        }
    }

    private func formatCountdown(to date: Date) -> String {
        let diff = max(0, Int(date.timeIntervalSinceNow))
        let h = diff / 3600
        let m = (diff % 3600) / 60
        let s = diff % 60
        if h > 0 {
            return "\(h)h \(m)m"
        } else if m > 0 {
            return "\(m)m \(s)s"
        } else {
            return "\(s)s"
        }
    }

    // MARK: - Adhan trigger

    func checkAdhanTrigger() {
        let now = Date()
        for prayer in prayers {
            guard !firedToday.contains(prayer.name) else { continue }
            let diff = abs(prayer.time.timeIntervalSince(now))
            if diff <= 60 {
                firedToday.insert(prayer.name)
                DispatchQueue.main.async {
                    self.currentAdhanPrayer = prayer
                    self.adhanFired = true
                    // Reset flag so ContentView can re-observe next time
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        self.adhanFired = false
                    }
                }
            }
        }
    }

    // MARK: - Midnight refresh

    private func scheduleMidnightRefresh() {
        let nextMidnight = calendar.startOfDay(for: Date()).addingTimeInterval(86400)
        let interval = nextMidnight.timeIntervalSinceNow
        midnightTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: false) { [weak self] _ in
            Task { await self?.fetchPrayerTimes() }
            self?.scheduleMidnightRefresh()
        }
    }

    // MARK: - Local notifications

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    func scheduleAdhanNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()

        for prayer in prayers {
            let content = UNMutableNotificationContent()
            content.title = prayer.name
            content.body  = "Prayer time — \(formatTime(prayer.time))"
            content.sound = .default

            let comps = calendar.dateComponents([.hour, .minute], from: prayer.time)
            let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
            let request = UNNotificationRequest(
                identifier: "praycalc_tv_\(prayer.name)",
                content: content,
                trigger: trigger
            )
            UNUserNotificationCenter.current().add(request)
        }
    }

    // MARK: - Formatting

    func formatTime(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = use24h ? "HH:mm" : "h:mm a"
        return f.string(from: date)
    }
}

// MARK: - Helpers

private extension Int {
    func nonZeroOr(_ fallback: Int) -> Int { self == 0 ? fallback : self }
}
