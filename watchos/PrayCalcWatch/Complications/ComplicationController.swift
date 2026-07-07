import Foundation
import WidgetKit

// MARK: - Timeline Provider (offline-first, computed locally via the C core)
//
// This provider computes prayer times entirely on-device with `PrayCalcEngine`
// (the Swift wrapper over the shared C core). There is NO network call in the
// complication path — that is the whole point of the watch app: the next-prayer
// complication must update on the wrist even with no connectivity.
//
// Location + method/madhab come from `SharedLocationStore` (an App Group suite
// the watch app writes to). When the paired iOS app ships, it will push the same
// values into that suite; until then the app's own GPS fix populates it.

struct PrayerTimelineProvider: TimelineProvider {
    typealias Entry = PrayerTimelineEntry

    func placeholder(in context: Context) -> PrayerTimelineEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerTimelineEntry) -> Void) {
        if context.isPreview {
            completion(.placeholder)
            return
        }
        completion(currentEntry() ?? .placeholder)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimelineEntry>) -> Void) {
        completion(buildTimeline())
    }

    // MARK: - Local computation

    /// Compute today's prayer schedule from the shared location using the C core.
    /// Returns `nil` if no location is stored or the engine cannot compute.
    private func computeSchedule(now: Date = Date()) -> PrayerSchedule? {
        guard SharedLocationStore.hasLocation else { return nil }

        let method = PrayCalcEngine.CalculationMethod(apiKey: SharedLocationStore.methodKey) ?? .isna
        let madhab = PrayCalcEngine.AsrMadhab(apiKey: SharedLocationStore.madhabKey) ?? .shafi

        guard let times = PrayCalcEngine.calculatePrayerTimes(
            latitude: SharedLocationStore.latitude,
            longitude: SharedLocationStore.longitude,
            date: now,
            method: method,
            madhab: madhab
        ) else { return nil }

        return PrayerSchedule(times: times, now: now)
    }

    /// A single "now" entry (used for snapshots and cache reads).
    private func currentEntry() -> PrayerTimelineEntry? {
        guard let schedule = computeSchedule() else { return nil }
        return schedule.entry(at: Date())
    }

    /// Build a full timeline: one entry per prayer transition today plus a
    /// mid-point entry for smoother ring animation, refreshing at midnight.
    private func buildTimeline() -> Timeline<PrayerTimelineEntry> {
        let now = Date()
        guard let schedule = computeSchedule(now: now) else {
            // No location yet — show placeholder, retry in 15 min.
            return Timeline(
                entries: [.placeholder],
                policy: .after(now.addingTimeInterval(900))
            )
        }

        var entries: [PrayerTimelineEntry] = [schedule.entry(at: now)]

        // Add an entry at each upcoming prayer boundary + a midpoint between them
        // so the countdown/progress refreshes as the day advances.
        let upcoming = schedule.transitions.filter { $0.date >= now }
        for transition in upcoming {
            entries.append(schedule.entry(at: transition.date))
            // Midpoint toward the following transition, for a smoother ring.
            if let next = schedule.transitionAfter(transition.date) {
                let mid = transition.date.addingTimeInterval(
                    next.date.timeIntervalSince(transition.date) / 2
                )
                entries.append(schedule.entry(at: mid))
            }
        }

        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) ?? now
        let midnight = calendar.startOfDay(for: tomorrow)

        return Timeline(
            entries: entries.sorted { $0.date < $1.date },
            policy: .after(midnight)
        )
    }
}

// MARK: - PrayerSchedule
//
// A day's ordered five-prayer schedule derived from the C-core engine output,
// with helpers to build a timeline entry for any instant.

private struct PrayerSchedule {
    struct Transition {
        let name: String
        let date: Date
    }

    /// The five prayers in order, as (display name, Date) — Sunrise excluded.
    let transitions: [Transition]
    /// Display strings keyed by prayer name for the "all prayers" list view.
    let allPrayers: [(name: String, time: String)]

    init(times: PrayCalcEngine.PrayerTimes, now: Date) {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        let ordered: [(String, Date)] = [
            ("Fajr", times.fajr),
            ("Dhuhr", times.dhuhr),
            ("Asr", times.asr),
            ("Maghrib", times.maghrib),
            ("Isha", times.isha),
        ]

        self.transitions = ordered.map { Transition(name: $0.0, date: $0.1) }
        self.allPrayers = ordered.map { ($0.0, formatter.string(from: $0.1)) }
    }

    /// The next prayer transition strictly after `date`. After Isha, rolls over
    /// to tomorrow's Fajr (approximated one day ahead of today's Fajr).
    func nextTransition(after date: Date) -> Transition {
        if let upcoming = transitions.first(where: { $0.date > date }) {
            return upcoming
        }
        // Past Isha: next is tomorrow's Fajr.
        let fajr = transitions[0]
        let tomorrowFajr = Calendar.current.date(byAdding: .day, value: 1, to: fajr.date) ?? fajr.date
        return Transition(name: "Fajr", date: tomorrowFajr)
    }

    /// The transition immediately following the one at/after `date` — used to
    /// place a midpoint entry.
    func transitionAfter(_ date: Date) -> Transition? {
        transitions.first(where: { $0.date > date })
    }

    /// The prayer period `date` currently sits in — its start bounds the ring
    /// progress. Before Fajr, the period starts at "start of day".
    private func periodStart(before date: Date) -> Date {
        let past = transitions.filter { $0.date <= date }
        if let last = past.last { return last.date }
        return Calendar.current.startOfDay(for: date)
    }

    /// Build a timeline entry describing the state at `instant`.
    func entry(at instant: Date) -> PrayerTimelineEntry {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        let next = nextTransition(after: instant)
        let start = periodStart(before: instant)
        let total = next.date.timeIntervalSince(start)
        let remaining = max(next.date.timeIntervalSince(instant), 0)
        let progress = total > 0 ? min(max((total - remaining) / total, 0), 1) : 0

        return PrayerTimelineEntry(
            date: instant,
            prayerName: next.name,
            prayerTime: formatter.string(from: next.date),
            timeRemaining: remaining,
            progress: progress,
            allPrayers: allPrayers,
            isPlaceholder: false
        )
    }
}
