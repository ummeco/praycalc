use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

mod tray;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrayerEntry {
    pub name: String,
    pub time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrayerTimesResponse {
    pub date: String,
    pub prayers: Vec<PrayerEntry>,
    pub method: String,
}

// API returns [{date, prayers: {Name: "HH:MM:SS"}}]
#[derive(Debug, Deserialize)]
struct ApiDay {
    date: String,
    prayers: HashMap<String, String>,
}

const PRAYER_ORDER: &[&str] = &["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

#[tauri::command]
async fn fetch_prayer_times(
    lat: f64,
    lng: f64,
    tz: String,
    _method: String,
    hanafi: bool,
) -> Result<PrayerTimesResponse, String> {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let url = format!(
        "https://praycalc.com/api/prayers?lat={}&lng={}&tz={}&from={}&to={}&hanafi={}",
        lat, lng, tz, today, today, if hanafi { 1 } else { 0 }
    );
    let days: Vec<ApiDay> = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let day = days.into_iter().next().ok_or("No prayer data returned")?;

    // Convert dict to ordered vec; trim seconds from "HH:MM:SS" → "HH:MM"
    let prayers: Vec<PrayerEntry> = PRAYER_ORDER
        .iter()
        .filter_map(|name| {
            day.prayers.get(*name).map(|t| PrayerEntry {
                name: name.to_string(),
                time: t.chars().take(5).collect(),
            })
        })
        .collect();

    Ok(PrayerTimesResponse {
        date: day.date,
        prayers,
        method: "MWL".to_string(),
    })
}

#[tauri::command]
async fn update_tray_tooltip(app: AppHandle, label: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_tooltip(Some(&label)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn update_tray_title(app: AppHandle, label: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_title(Some(&label)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_today_date() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

#[tauri::command]
async fn notify_prayer(app: AppHandle, name: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;
    app.notification()
        .builder()
        .title("Prayer Time")
        .body(format!("It's time for {}", name))
        .show()
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(|app| {
            tray::setup_tray(app)?;
            // Hide the default window — app lives in the tray
            if let Some(win) = app.get_webview_window("main") {
                win.hide()?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_prayer_times,
            update_tray_tooltip,
            update_tray_title,
            get_today_date,
            notify_prayer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running praycalc desktop");
}
