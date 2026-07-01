use tauri::{AppHandle, Emitter, Manager};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

mod tray;

// Shared state updated by JS whenever next prayer changes
#[derive(Default, Clone)]
struct PrayerState {
    next_name: String,
    next_time: String, // "HH:MM" 24h
    notifications: bool,
    display_mode: String,    // "countdown" | "time"
    name_format: String,     // "abbrev" | "full"
    show_seconds: bool,
    countdown_prefix: String, // "minus" | "none" | "in"
    adhan_triggered: bool,
    refresh_triggered: bool, // auto-advance to next prayer after 60s
}

struct AppState {
    prayer: Mutex<PrayerState>,
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

fn format_tray_label(
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

fn seconds_until(time_str: &str) -> i64 {
    use chrono::TimeZone;
    let now = chrono::Local::now();
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() >= 2 {
        if let (Ok(h), Ok(m)) = (parts[0].parse::<u32>(), parts[1].parse::<u32>()) {
            if let Some(naive) = now.date_naive().and_hms_opt(h, m, 0) {
                if let Some(t) = chrono::Local.from_local_datetime(&naive).single() {
                    let secs = (t - now).num_seconds();
                    // Day-aware rollover: after Isha the next prayer is tomorrow's
                    // Fajr, whose HH:MM lies far in "today's" past. Prayers are never
                    // >6h apart, so anything beyond -6h means "tomorrow" — shift by
                    // 24h so the countdown keeps working across midnight. The adhan
                    // hold window (0 to -60s) is unaffected.
                    return if secs < -21_600 { secs + 86_400 } else { secs };
                }
            }
        }
    }
    i64::MIN
}

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

#[tauri::command]
async fn fetch_prayer_times(lat: f64, lng: f64, tz: String, _method: String, hanafi: bool) -> Result<PrayerTimesResponse, String> {
    // Fetch today AND tomorrow so the countdown can roll over to tomorrow's
    // Fajr after Isha (the API computes PrayCalc's own method; only `hanafi`
    // affects output — there is no method parameter server-side).
    let now = chrono::Local::now();
    let today = now.format("%Y-%m-%d").to_string();
    let tomorrow = (now + chrono::Duration::days(1)).format("%Y-%m-%d").to_string();
    let url = format!(
        "https://praycalc.com/api/prayers?lat={}&lng={}&tz={}&from={}&to={}&hanafi={}",
        lat, lng, tz, today, tomorrow, if hanafi { 1 } else { 0 }
    );
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

    Ok(PrayerTimesResponse { date: day.date, prayers, method: "PrayCalc".to_string(), tomorrow_fajr })
}

/// JS calls this whenever next prayer or settings change.
/// Rust background loop uses this to update the tray and fire adhan.
#[tauri::command]
fn set_next_prayer(
    state: tauri::State<AppState>,
    name: String,
    time: String,
    notifications: bool,
    display_mode: String,
    name_format: String,
    show_seconds: bool,
    countdown_prefix: String,
) {
    let mut p = state.prayer.lock().unwrap();
    let changed = name != p.next_name || time != p.next_time;
    p.next_name = name;
    p.next_time = time;
    p.notifications = notifications;
    p.display_mode = display_mode;
    p.name_format = name_format;
    p.show_seconds = show_seconds;
    p.countdown_prefix = countdown_prefix;
    if changed {
        p.adhan_triggered = false;
        p.refresh_triggered = false;
    }
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn get_today_date() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

// Legacy stubs so old JS invocations don't error
#[tauri::command]
async fn update_tray_title(_app: AppHandle, _label: String) -> Result<(), String> { Ok(()) }
#[tauri::command]
async fn update_tray_tooltip(_app: AppHandle, _label: String) -> Result<(), String> { Ok(()) }
#[tauri::command]
async fn notify_prayer(_app: AppHandle, _name: String) -> Result<(), String> { Ok(()) }

pub fn run() {
    tauri::Builder::default()
        .manage(AppState { prayer: Mutex::new(PrayerState::default()) })
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(|app| {
            // Hide dock icon — tray-only app
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            tray::setup_tray(app)?;
            if let Some(win) = app.get_webview_window("main") {
                win.hide()?;
            }

            // Native 1-second timer — runs regardless of window visibility
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

                    let state = handle.state::<AppState>();
                    let snapshot = state.prayer.lock().unwrap().clone();

                    if snapshot.next_name.is_empty() {
                        continue;
                    }

                    let remaining = seconds_until(&snapshot.next_time);
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

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_prayer_times,
            set_next_prayer,
            update_tray_tooltip,
            update_tray_title,
            get_today_date,
            notify_prayer,
            quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running praycalc desktop");
}
