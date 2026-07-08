use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

mod commands;
mod state;
mod timer;
mod tray;

use state::{AppState, PrayerState};

/// Purpose: App entry point — wires up plugins, tray, the native background
///   timer, and the command surface. Business logic lives in the sibling
///   modules (`commands`, `state`, `timer`, `tray`); this file is glue only.
/// SPORT: praycalc desktop — app bootstrap.
pub fn run() {
    tauri::Builder::default()
        .manage(AppState { prayer: Mutex::new(PrayerState::default()) })
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
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

            // Request OS notification permission up front so the background timer's
            // adhan notifications aren't silently dropped the first time they fire.
            // No-op if already granted/denied by a prior run.
            {
                let handle = app.handle().clone();
                if let Ok(false) = handle.notification().permission_state().map(|s| s == tauri_plugin_notification::PermissionState::Granted) {
                    let _ = handle.notification().request_permission();
                }
            }

            timer::spawn(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::fetch_prayer_times,
            commands::set_next_prayer,
            commands::update_tray_tooltip,
            commands::update_tray_title,
            commands::get_today_date,
            commands::quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running praycalc desktop");
}
