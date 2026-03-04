import Combine
import CoreLocation
import Foundation
import WatchKit

class PrayerService: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var prayerResponse: PrayerResponse?
    @Published var prayerTimes: [PrayerTime] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var locationAuthorized = false

    @AppStorage("calculationMethod") var calculationMethod: String = CalculationMethod.isna.rawValue
    @AppStorage("madhab") var madhab: String = Madhab.shafii.rawValue
    @AppStorage("lastLatitude") var lastLatitude: Double = 0.0
    @AppStorage("lastLongitude") var lastLongitude: Double = 0.0
    @AppStorage("cachedDate") var cachedDate: String = ""
    @AppStorage("cachedResponse") var cachedResponseData: Data = Data()

    private let locationManager = CLLocationManager()
    private var refreshTimer: Timer?
    private var midnightTimer: Timer?

    private let baseURL = "https://api.praycalc.com/api/v1/times"

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyKilometer
        loadCachedResponse()
    }

    // MARK: - Public

    func startUpdating() {
        requestLocation()
        scheduleMidnightRefresh()
    }

    func refresh() {
        requestLocation()
    }

    // MARK: - Location

    private func requestLocation() {
        let status = locationManager.authorizationStatus
        switch status {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            locationAuthorized = true
            locationManager.requestLocation()
        case .denied, .restricted:
            locationAuthorized = false
            if lastLatitude != 0.0 && lastLongitude != 0.0 {
                fetchPrayerTimes(latitude: lastLatitude, longitude: lastLongitude)
            } else {
                errorMessage = "Location access denied. Enable in Settings."
            }
        @unknown default:
            break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        lastLatitude = location.coordinate.latitude
        lastLongitude = location.coordinate.longitude
        fetchPrayerTimes(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        if lastLatitude != 0.0 && lastLongitude != 0.0 {
            fetchPrayerTimes(latitude: lastLatitude, longitude: lastLongitude)
        } else {
            errorMessage = "Unable to determine location."
        }
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        locationAuthorized = (status == .authorizedWhenInUse || status == .authorizedAlways)
        if locationAuthorized {
            manager.requestLocation()
        }
    }

    // MARK: - API

    private func fetchPrayerTimes(latitude: Double, longitude: Double) {
        let today = todayDateString()

        if today == cachedDate, let cached = decodeCachedResponse() {
            applyResponse(cached)
            return
        }

        isLoading = true
        errorMessage = nil

        var components = URLComponents(string: baseURL)!
        components.queryItems = [
            URLQueryItem(name: "lat", value: String(latitude)),
            URLQueryItem(name: "lng", value: String(longitude)),
            URLQueryItem(name: "date", value: today),
            URLQueryItem(name: "method", value: calculationMethod),
            URLQueryItem(name: "madhab", value: madhab),
        ]

        guard let url = components.url else {
            errorMessage = "Invalid URL."
            isLoading = false
            return
        }

        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.isLoading = false

                if let error = error {
                    self.errorMessage = error.localizedDescription
                    if let cached = self.decodeCachedResponse() {
                        self.applyResponse(cached)
                    }
                    return
                }

                guard let data = data else {
                    self.errorMessage = "No data received."
                    return
                }

                do {
                    let response = try JSONDecoder().decode(PrayerResponse.self, from: data)
                    self.cacheResponse(data: data, date: today)
                    self.applyResponse(response)
                } catch {
                    self.errorMessage = "Failed to parse prayer times."
                    if let cached = self.decodeCachedResponse() {
                        self.applyResponse(cached)
                    }
                }
            }
        }.resume()
    }

    private func applyResponse(_ response: PrayerResponse) {
        prayerResponse = response
        prayerTimes = response.prayers.fivePrayerArray(
            nextPrayerName: response.nextPrayer.name,
            dateString: response.meta.date
        )
    }

    // MARK: - Cache

    private func cacheResponse(data: Data, date: String) {
        cachedResponseData = data
        cachedDate = date
    }

    private func decodeCachedResponse() -> PrayerResponse? {
        guard !cachedResponseData.isEmpty else { return nil }
        return try? JSONDecoder().decode(PrayerResponse.self, from: cachedResponseData)
    }

    private func loadCachedResponse() {
        if let cached = decodeCachedResponse(), cachedDate == todayDateString() {
            applyResponse(cached)
        }
    }

    // MARK: - Scheduling

    private func scheduleMidnightRefresh() {
        midnightTimer?.invalidate()

        let calendar = Calendar.current
        guard let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()),
              let midnight = calendar.date(bySettingHour: 0, minute: 1, second: 0, of: tomorrow)
        else { return }

        let interval = midnight.timeIntervalSince(Date())
        midnightTimer = Timer.scheduledTimer(withTimeInterval: max(interval, 60), repeats: false) {
            [weak self] _ in
            self?.refresh()
            self?.scheduleMidnightRefresh()
        }
    }

    // MARK: - Helpers

    private func todayDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }
}
