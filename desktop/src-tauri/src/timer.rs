use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_notification::NotificationExt;

use crate::state::AppState;

/// Purpose: Native 1-second background timer — updates the tray label, fires
///   the OS adhan notification, and signals JS to auto-refresh the prayer list,
///   all independent of window visibility.
/// Inputs: `AppState` (written by the `set_next_prayer` command).
/// Outputs: tray title/tooltip updates, `prayer-time` / `prayer-refresh` events.
/// Constraints: countdown math (`seconds_until`) is anchored to the configured
///   location's IANA timezone (`PrayerState.tz`), not the device's own timezone
///   — the device clock is only used as a last-resort fallback if the stored
///   tz string fails to parse. This fixes a bug where a user whose configured
///   location is in a different timezone than their computer saw a countdown
///   computed against the wrong clock (prayer *times* were always correct;
///   only the "time remaining" math used the wrong "now").
/// SPORT: praycalc desktop — native background timer.

/// Arabic name shown in the OS notification body, matching AdhanOverlay's labels.
fn prayer_arabic(name: &str) -> &str {
    match name {
        "Fajr" => "الفجر",
        "Sunrise" => "الشروق",
        "Dhuhr" => "الظهر",
        "Asr" => "العصر",
        "Maghrib" => "المغرب",
        "Isha" => "العشاء",
        _ => name,
    }
}

fn prayer_abbrev(name: &str) -> &str {
    match name {
        "Fajr" => "F",
        "Sunrise" => "S",
        "Dhuhr" => "D",
        "Asr" => "A",
        "Maghrib" => "M",
        "Isha" => "I",
        _ => "?",
    }
}

fn format_time_12h(time_str: &str) -> String {
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() >= 2 {
        if let (Ok(h), Ok(m)) = (parts[0].parse::<u32>(), parts[1].parse::<u32>()) {
            let period = if h < 12 { "a" } else { "p" };
            let h12 = if h == 0 { 12 } else if h > 12 { h - 12 } else { h };
            return format!("{}:{:02}{}", h12, m, period);
        }
    }
    time_str.to_string()
}

pub fn format_tray_label(
    name: &str,
    time_str: &str,
    remaining_secs: i64,
    display_mode: &str,
    name_format: &str,
    show_seconds: bool,
    countdown_prefix: &str,
) -> String {
    if name.is_empty() {
        return "☽".to_string();
    }
    // At prayer time: full name + "!"
    if remaining_secs <= 0 {
        return format!("{}!", name);
    }
    let label = if name_format == "full" { name.to_string() } else { prayer_abbrev(name).to_string() };
    let value = if display_mode == "time" {
        format_time_12h(time_str)
    } else {
        let h = remaining_secs / 3600;
        let m = (remaining_secs % 3600) / 60;
        let s = remaining_secs % 60;
        if show_seconds {
            if h > 0 {
                format!("{}:{:02}:{:02}", h, m, s)
            } else {
                format!("{}:{:02}", m, s)
            }
        } else {
            if h > 0 {
                format!("{}:{:02}", h, m)
            } else {
                format!("{}", m)
            }
        }
    };
    let sep = match countdown_prefix {
        "minus" => " \u{2212}", // − (minus sign)
        "in"    => " in",
        _       => " ",
    };
    format!("{}{}{}", label, sep, value)
}

/// Current wall-clock time in the given IANA timezone (e.g. "Asia/Dubai"), as a
/// `NaiveDateTime` (no attached offset) so plain date/time arithmetic against a
/// prayer time's naive "HH:MM" works regardless of the machine's own timezone.
/// Falls back to the device's local time if `tz_name` fails to parse (e.g. an
/// empty/legacy settings value) rather than erroring — preserves the pre-fix
/// behavior as a safety net instead of silently defaulting to UTC.
fn now_naive_in_tz(tz_name: &str) -> chrono::NaiveDateTime {
    match tz_name.parse::<chrono_tz::Tz>() {
        Ok(tz) => chrono::Utc::now().with_timezone(&tz).naive_local(),
        Err(_) => chrono::Local::now().naive_local(),
    }
}

/// Signed seconds until `time_str` ("HH:MM") next occurs, evaluated against the
/// current wall-clock time in `tz_name` (the *configured location's* timezone —
/// see module docs above for why this must not be the device's own timezone).
pub fn seconds_until(time_str: &str, tz_name: &str) -> i64 {
    let now = now_naive_in_tz(tz_name);
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() >= 2 {
        if let (Ok(h), Ok(m)) = (parts[0].parse::<u32>(), parts[1].parse::<u32>()) {
            if let Some(target) = now.date().and_hms_opt(h, m, 0) {
                let secs = (target - now).num_seconds();
                // Day-aware rollover: after Isha the next prayer is tomorrow's
                // Fajr, whose HH:MM lies far in "today's" past. Prayers are never
                // >6h apart, so anything beyond -6h means "tomorrow" — shift by
                // 24h so the countdown keeps working across midnight. The adhan
                // hold window (0 to -60s) is unaffected.
                return if secs < -21_600 { secs + 86_400 } else { secs };
            }
        }
    }
    i64::MIN
}

/// Starts the native 1-second timer. Runs regardless of window visibility.
pub fn spawn(handle: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

            let state = handle.state::<AppState>();
            let snapshot = state.prayer.lock().unwrap().clone();

            if snapshot.next_name.is_empty() {
                continue;
            }

            let remaining = seconds_until(&snapshot.next_time, &snapshot.tz);
            let label = format_tray_label(
                &snapshot.next_name,
                &snapshot.next_time,
                remaining,
                &snapshot.display_mode,
                &snapshot.name_format,
                snapshot.show_seconds,
                &snapshot.countdown_prefix,
            );

            if let Some(tray) = handle.tray_by_id("main") {
                // macOS shows this text in the menu bar. set_title is a no-op on
                // Windows and hidden on Linux, so mirror the label into the tooltip
                // — hover then gives Win/Linux users the same live countdown.
                let _ = tray.set_title(Some(&label));
                let _ = tray.set_tooltip(Some(&label));
            }

            if remaining <= 0 && !snapshot.adhan_triggered && snapshot.notifications {
                {
                    let mut p = state.prayer.lock().unwrap();
                    p.adhan_triggered = true;
                }
                // Native OS notification — fires from this background timer, which
                // runs independent of window visibility, so it reaches the user even
                // when the window is closed/hidden and only the tray icon is alive.
                // The in-window AdhanOverlay (driven by the "prayer-time" event below)
                // additionally plays audio + full-screen visuals when the window is open.
                let title = format!("{} — {}", snapshot.next_name, prayer_arabic(&snapshot.next_name));
                let _ = handle
                    .notification()
                    .builder()
                    .title(title)
                    .body("It's time to pray.")
                    .show();
                let _ = handle.emit("prayer-time", &snapshot.next_name);
            }

            // Auto-advance: tell JS to reload prayers 60s after prayer time
            if remaining < -60 && !snapshot.refresh_triggered {
                {
                    let mut p = state.prayer.lock().unwrap();
                    p.refresh_triggered = true;
                }
                let _ = handle.emit("prayer-refresh", ());
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seconds_until_uses_configured_timezone_not_device_local() {
        // Compute "5 minutes from now" in Asia/Tokyo wall-clock time, then verify
        // seconds_until reports a small positive value regardless of what
        // timezone this test machine runs in — proving the calculation is
        // anchored to the *configured* location's timezone (Asia/Tokyo), not
        // chrono::Local (the pre-fix bug this ticket fixes).
        let tokyo: chrono_tz::Tz = "Asia/Tokyo".parse().unwrap();
        let now_tokyo = chrono::Utc::now().with_timezone(&tokyo);
        let target = now_tokyo + chrono::Duration::minutes(5);
        let time_str = target.format("%H:%M").to_string();

        let secs = seconds_until(&time_str, "Asia/Tokyo");
        // %H:%M truncates seconds, so the true gap is between ~4:01 and 5:00.
        assert!(secs > 0 && secs <= 300, "expected 0-300s, got {secs}");
    }

    #[test]
    fn seconds_until_falls_back_gracefully_on_bad_tz() {
        // An invalid/legacy tz string must never panic — it degrades to
        // device-local time (the pre-fix behavior) instead of erroring.
        let secs = seconds_until("00:00", "Not/ARealZone");
        assert_ne!(secs, i64::MIN);
    }

    #[test]
    fn format_tray_label_shows_bell_glyph_when_no_prayer_name() {
        assert_eq!(format_tray_label("", "00:00", 0, "countdown", "abbrev", false, "minus"), "☽");
    }

    #[test]
    fn format_tray_label_shows_bang_at_prayer_time() {
        assert_eq!(format_tray_label("Fajr", "05:00", 0, "countdown", "abbrev", false, "minus"), "Fajr!");
    }
}
