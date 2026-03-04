import Foundation
import CoreLocation
import UserNotifications
import Combine

class PrayerService: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var prayers: [PrayerTime] = []
    @Published var nextPrayer: PrayerTime?
    @Published var qiblaBearing: Double?
    @Published var countdownText: String = "--:--"
    @Published var currentLocation: CLLocationCoordinate2D?

    private let locationManager = CLLocationManager()
    private var countdownTimer: Timer?
    private var refreshTimer: Timer?
    private var cachedDate: String?

    private static let baseURL = "https://api.praycalc.com/api/v1/times"

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyKilometer
        locationManager.requestWhenInUseAuthorization()
        locationManager.startUpdatingLocation()

        startCountdownTimer()
        scheduleMidnightRefresh()
    }

    // MARK: - Public

    func refresh() {
        cachedDate = nil
        fetchPrayerTimes()
    }

    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { granted, error in
            if let error = error {
                print("Notification permission error: \(error)")
            }
            if granted {
                DispatchQueue.main.async {
                    self.scheduleNotifications()
                }
            }
        }
    }

    func scheduleNotifications() {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()

        let enabledPrayers = getEnabledPrayers()

        for prayer in prayers {
            guard enabledPrayers.contains(prayer.name) else { continue }
            guard prayer.name != "Sunrise" else { continue }

            let content = UNMutableNotificationContent()
            content.title = "PrayCalc"
            content.body = "\(prayer.name) prayer time: \(prayer.displayTime)"
            content.sound = .default

            let calendar = Calendar.current
            let components = calendar.dateComponents([.hour, .minute], from: prayer.date)

            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            let request = UNNotificationRequest(
                identifier: "praycalc-\(prayer.name.lowercased())",
                content: content,
                trigger: trigger
            )

            center.add(request) { error in
                if let error = error {
                    print("Failed to schedule \(prayer.name) notification: \(error)")
                }
            }
        }
    }

    // MARK: - CLLocationManagerDelegate

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        currentLocation = location.coordinate
        fetchPrayerTimes()
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
        // Fall back to stored manual coordinates
        fetchPrayerTimes()
    }

    // MARK: - Private

    private func fetchPrayerTimes() {
        let today = dateString(from: Date())
        if cachedDate == today && !prayers.isEmpty { return }

        let (lat, lng) = getCoordinates()
        let method = UserDefaults.standard.string(forKey: "calculationMethod") ?? "isna"
        let madhab = UserDefaults.standard.string(forKey: "madhab") ?? "shafii"

        let urlString = "\(Self.baseURL)?lat=\(lat)&lng=\(lng)&date=\(today)&method=\(method)&madhab=\(madhab)"
        guard let url = URL(string: urlString) else { return }

        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            guard let self = self, let data = data, error == nil else {
                if let error = error {
                    print("API error: \(error.localizedDescription)")
                }
                return
            }

            do {
                let response = try JSONDecoder().decode(PrayerResponse.self, from: data)
                DispatchQueue.main.async {
                    self.processPrayerResponse(response)
                    self.cachedDate = today
                }
            } catch {
                print("JSON decode error: \(error)")
            }
        }.resume()
    }

    private func processPrayerResponse(_ response: PrayerResponse) {
        let calendar = Calendar.current
        let today = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"

        let prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]
        let timeStrings = [
            response.prayers.fajr,
            response.prayers.sunrise,
            response.prayers.dhuhr,
            response.prayers.asr,
            response.prayers.maghrib,
            response.prayers.isha
        ]

        var parsedPrayers: [PrayerTime] = []

        for (index, name) in prayerNames.enumerated() {
            guard let time = formatter.date(from: timeStrings[index]) else { continue }
            let components = calendar.dateComponents([.hour, .minute], from: time)
            guard let prayerDate = calendar.date(
                bySettingHour: components.hour ?? 0,
                minute: components.minute ?? 0,
                second: 0,
                of: today
            ) else { continue }

            let isNext = name.lowercased() == response.nextPrayer
            parsedPrayers.append(PrayerTime(
                name: name,
                date: prayerDate,
                isNext: isNext
            ))
        }

        self.prayers = parsedPrayers
        self.nextPrayer = parsedPrayers.first(where: { $0.isNext })
        self.qiblaBearing = response.qibla?.bearing
        updateCountdown()
        scheduleNotifications()
    }

    private func getCoordinates() -> (Double, Double) {
        let useAuto = UserDefaults.standard.bool(forKey: "useAutoLocation")

        if useAuto, let location = currentLocation {
            return (location.latitude, location.longitude)
        }

        let latStr = UserDefaults.standard.string(forKey: "manualLatitude") ?? ""
        let lngStr = UserDefaults.standard.string(forKey: "manualLongitude") ?? ""

        if let lat = Double(latStr), let lng = Double(lngStr) {
            return (lat, lng)
        }

        // Default: New York
        return (40.7128, -74.0060)
    }

    private func getEnabledPrayers() -> Set<String> {
        var enabled = Set<String>()
        let defaults = UserDefaults.standard
        if defaults.object(forKey: "notifyFajr") == nil || defaults.bool(forKey: "notifyFajr") { enabled.insert("Fajr") }
        if defaults.object(forKey: "notifyDhuhr") == nil || defaults.bool(forKey: "notifyDhuhr") { enabled.insert("Dhuhr") }
        if defaults.object(forKey: "notifyAsr") == nil || defaults.bool(forKey: "notifyAsr") { enabled.insert("Asr") }
        if defaults.object(forKey: "notifyMaghrib") == nil || defaults.bool(forKey: "notifyMaghrib") { enabled.insert("Maghrib") }
        if defaults.object(forKey: "notifyIsha") == nil || defaults.bool(forKey: "notifyIsha") { enabled.insert("Isha") }
        return enabled
    }

    private func startCountdownTimer() {
        countdownTimer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            self?.updateCountdown()
        }
    }

    private func updateCountdown() {
        guard let next = nextPrayer else {
            countdownText = "--:--"
            return
        }

        let now = Date()
        var target = next.date
        if target < now {
            target = Calendar.current.date(byAdding: .day, value: 1, to: target) ?? target
        }

        let interval = target.timeIntervalSince(now)
        let hours = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60

        if hours > 0 {
            countdownText = "\(hours)h \(minutes)m"
        } else {
            countdownText = "\(minutes)m"
        }
    }

    private func scheduleMidnightRefresh() {
        let calendar = Calendar.current
        guard let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()),
              let midnight = calendar.date(bySettingHour: 0, minute: 1, second: 0, of: tomorrow)
        else { return }

        let interval = midnight.timeIntervalSinceNow
        refreshTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: false) { [weak self] _ in
            self?.cachedDate = nil
            self?.fetchPrayerTimes()
            self?.scheduleMidnightRefresh()
        }
    }

    private func dateString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}
