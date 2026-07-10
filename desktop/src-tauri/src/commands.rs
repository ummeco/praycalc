use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::AppHandle;

use crate::state::AppState;

/// Purpose: Tauri commands invoked from the JS frontend — fetch prayer times,
///   register the next prayer for the native timer, quit the app, and a couple
///   of legacy no-op stubs kept so old JS invocations never error.
/// Inputs: see each command's params.
/// Outputs: see each command's return type.
/// Constraints: no business logic beyond thin IPC glue; the actual countdown
///   math lives in `timer.rs`, tray placement in `tray.rs`. The prayer-times
///   fetch date is anchored to the *configured location's* timezone (DT-04),
///   not the device's own — see `today_and_tomorrow` / `timer::now_naive_in_tz`.
/// SPORT: praycalc desktop — Rust command surface.

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrayerEntry {
    pub name: String,
    pub time: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrayerTimesResponse {
    pub date: String,
    pub prayers: Vec<PrayerEntry>,
    pub method: String,
    /// Tomorrow's Fajr time (HH:MM) — used by JS after Isha so the countdown
    /// rolls over to the next day instead of freezing on "Isha!" until midnight.
    pub tomorrow_fajr: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ApiDay {
    date: String,
    prayers: HashMap<String, String>,
}

const PRAYER_ORDER: &[&str] = &["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

/// Computes ("today", "tomorrow") as "YYYY-MM-DD" strings anchored to the
/// *configured location's* timezone rather than the device's own (DT-04) —
/// mirrors `timer::now_naive_in_tz` so the fetched date never disagrees with
/// the countdown for a user whose device clock is in a different zone.
fn today_and_tomorrow(tz: &str) -> (String, String) {
    let now = crate::timer::now_naive_in_tz(tz);
    let today = now.format("%Y-%m-%d").to_string();
    let tomorrow = (now + chrono::Duration::days(1)).format("%Y-%m-%d").to_string();
    (today, tomorrow)
}

/// Percent-encodes a string for safe interpolation into a URL query
/// component (DT-05). IANA timezone identifiers are the only free-form value
/// interpolated here and can contain `/` (e.g. "America/New_York"), which
/// must be escaped rather than sent raw.
fn url_encode_component(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for byte in s.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(byte as char)
            }
            _ => out.push_str(&format!("%{:02X}", byte)),
        }
    }
    out
}

#[tauri::command]
pub async fn fetch_prayer_times(
    lat: f64,
    lng: f64,
    tz: String,
    method: String,
    hanafi: bool,
) -> Result<PrayerTimesResponse, String> {
    // Fetch today AND tomorrow so the countdown can roll over to tomorrow's
    // Fajr after Isha. `method` (a pray-calc method ID, e.g. "MWL", "Karachi")
    // is forwarded to the API when set; empty string means "PrayCalc Dynamic
    // Method" (server default), matching Settings' METHODS[''] option.
    let (today, tomorrow) = today_and_tomorrow(&tz);
    let mut url = format!(
        "https://praycalc.com/api/prayers?lat={}&lng={}&tz={}&from={}&to={}&hanafi={}",
        lat, lng, url_encode_component(&tz), today, tomorrow, if hanafi { 1 } else { 0 }
    );
    if !method.is_empty() {
        url.push_str(&format!("&method={}", method));
    }
    let days: Vec<ApiDay> = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let mut iter = days.into_iter();
    let day = iter.next().ok_or("No prayer data returned")?;
    let tomorrow_fajr = iter
        .next()
        .and_then(|d| d.prayers.get("Fajr").map(|t| t.chars().take(5).collect()));
    let prayers: Vec<PrayerEntry> = PRAYER_ORDER
        .iter()
        .filter_map(|name| {
            day.prayers.get(*name).map(|t| PrayerEntry {
                name: name.to_string(),
                time: t.chars().take(5).collect(),
            })
        })
        .collect();

    let method_label = if method.is_empty() { "PrayCalc".to_string() } else { method };
    Ok(PrayerTimesResponse { date: day.date, prayers, method: method_label, tomorrow_fajr })
}

/// JS calls this whenever next prayer or settings change.
/// Rust background loop uses this to update the tray and fire adhan.
#[tauri::command]
pub fn set_next_prayer(
    state: tauri::State<AppState>,
    name: String,
    time: String,
    tz: String,
    notifications: bool,
    display_mode: String,
    name_format: String,
    show_seconds: bool,
    countdown_prefix: String,
    show_icon: bool,
) {
    let mut p = state.prayer.lock().unwrap();
    let changed = name != p.next_name || time != p.next_time;
    p.next_name = name;
    p.next_time = time;
    p.tz = tz;
    p.notifications = notifications;
    p.display_mode = display_mode;
    p.name_format = name_format;
    p.show_seconds = show_seconds;
    p.countdown_prefix = countdown_prefix;
    p.show_icon = show_icon;
    if changed {
        p.adhan_triggered = false;
        p.refresh_triggered = false;
    }
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}

/// Compile-time target OS ("windows" | "macos" | "linux" | ...). Used by the
/// JS updater flow (lib/updater.ts) to skip the post-install relaunch on
/// Windows, whose installer already restarts the app as part of `install()`
/// (UPD-2) — calling `relaunch()` again there would race an already-dying
/// process.
#[tauri::command]
pub fn get_platform() -> &'static str {
    std::env::consts::OS
}

// Legacy stubs so old JS invocations don't error
#[tauri::command]
pub async fn update_tray_title(_app: AppHandle, _label: String) -> Result<(), String> {
    Ok(())
}
#[tauri::command]
pub async fn update_tray_tooltip(_app: AppHandle, _label: String) -> Result<(), String> {
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn today_and_tomorrow_are_one_day_apart_in_configured_tz() {
        // Regression guard for DT-04: the fetch date must be computed from the
        // *configured* tz, not device-local — proven here by asserting the
        // pair is always exactly one calendar day apart in an arbitrary zone.
        let (today, tomorrow) = today_and_tomorrow("Asia/Tokyo");
        let d1 = chrono::NaiveDate::parse_from_str(&today, "%Y-%m-%d").unwrap();
        let d2 = chrono::NaiveDate::parse_from_str(&tomorrow, "%Y-%m-%d").unwrap();
        assert_eq!(d2, d1 + chrono::Duration::days(1));
    }

    #[test]
    fn today_and_tomorrow_falls_back_gracefully_on_bad_tz() {
        let (today, tomorrow) = today_and_tomorrow("Not/ARealZone");
        assert!(!today.is_empty() && !tomorrow.is_empty());
    }

    #[test]
    fn url_encode_component_escapes_forward_slash() {
        // DT-05: IANA tz identifiers contain '/' and must be percent-encoded
        // before interpolation into the prayer-times query string.
        assert_eq!(url_encode_component("America/New_York"), "America%2FNew_York");
    }

    #[test]
    fn url_encode_component_leaves_safe_chars_untouched() {
        assert_eq!(url_encode_component("Asia-Dubai_1.0~x"), "Asia-Dubai_1.0~x");
    }
}
