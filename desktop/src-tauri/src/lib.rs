use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};

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

#[tauri::command]
async fn fetch_prayer_times(
    lat: f64,
    lng: f64,
    tz: String,
    method: String,
    hanafi: bool,
) -> Result<PrayerTimesResponse, String> {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let url = format!(
        "https://praycalc.com/api/prayers?lat={}&lng={}&tz={}&date={}&hanafi={}&method={}",
        lat, lng, tz, today, if hanafi { 1 } else { 0 }, method
    );
    let resp = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json::<PrayerTimesResponse>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(resp)
}

#[tauri::command]
async fn update_tray_tooltip(app: AppHandle, label: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_tooltip(Some(&label)).map_err(|e| e.to_string())?;
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
            get_today_date,
            notify_prayer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running praycalc desktop");
}
