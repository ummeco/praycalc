use std::sync::Mutex;

/// Purpose: Shared prayer/display state written by JS (via `set_next_prayer`)
///   and read by the native background timer (`timer.rs`) to drive the tray
///   label, OS notification, and auto-refresh signal.
/// Inputs: written wholesale by the `set_next_prayer` command.
/// Outputs: read (cloned) once per second by the timer loop.
/// Constraints: guarded by a `Mutex` since the timer loop and command handler
///   run on different tasks; kept `Clone` so the timer can snapshot-and-release
///   the lock quickly instead of holding it across the tray/notification calls.
#[derive(Default, Clone)]
pub struct PrayerState {
    pub next_name: String,
    pub next_time: String, // "HH:MM" 24h, in the configured location's wall-clock
    /// IANA timezone of the configured location (e.g. "Asia/Dubai"). Used so the
    /// countdown is computed against the location's clock, not the device's own
    /// timezone — see `timer::seconds_until`.
    pub tz: String,
    pub notifications: bool,
    pub display_mode: String, // "countdown" | "time"
    pub name_format: String,  // "abbrev" | "full"
    pub show_seconds: bool,
    pub countdown_prefix: String, // "minus" | "none" | "in"
    pub adhan_triggered: bool,
    pub refresh_triggered: bool, // auto-advance to next prayer after 60s
}

pub struct AppState {
    pub prayer: Mutex<PrayerState>,
}
