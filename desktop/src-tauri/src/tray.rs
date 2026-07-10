use tauri::{
    image::Image,
    menu::{Menu, MenuBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Emitter, Manager, Runtime,
};

/// Builds the tray's right-click/fallback menu: "Open PrayCalc", "Check for
/// Updates", and "Quit". DT-01: libappindicator (the tray backend on most
/// Linux desktop environments) only supports menu-driven tray icons — raw
/// `TrayIconEvent::Click` events used for the macOS/Windows toggle-on-click
/// behavior below frequently never fire there at all, which would leave
/// Linux users with no way to open the app. A menu is therefore built and
/// attached on every platform; only *which* click shows it differs by OS
/// (see `setup_tray`'s `show_menu_on_left_click` cfg block).
fn build_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    MenuBuilder::new(app)
        .text("open", "Open PrayCalc")
        .text("check_updates", "Check for Updates")
        .separator()
        .text("quit", "Quit")
        .build()
}

pub fn setup_tray(app: &mut App) -> tauri::Result<()> {
    #[cfg(target_os = "macos")]
    let icon = Image::from_bytes(include_bytes!("../icons/tray-icon@2x.png"))?;
    #[cfg(not(target_os = "macos"))]
    let icon = Image::from_bytes(include_bytes!("../icons/tray-icon.png"))?;

    let menu = build_menu(app.handle())?;

    let mut builder = TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("PrayCalc — click to open")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
            "check_updates" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
                // JS (hooks/useUpdater.ts) listens for this and runs an
                // immediate check, bypassing the hourly poll — this is the
                // "Check for Updates" menu item's only platform-independent
                // entry point since there is no other way in from Rust here.
                let _ = app.emit("menu-check-for-updates", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                position,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    if win.is_visible().unwrap_or(false) {
                        let _ = win.hide();
                    } else {
                        position_window_near_tray(&win, &rect, position.x, position.y);
                        let _ = win.show();
                        let _ = win.set_focus();
                    }
                }
            }
        });

    // macOS/Windows: left click keeps the existing toggle-the-window
    // behavior above; the menu only appears on right click (the platform
    // default when a menu is attached but `show_menu_on_left_click` is off).
    #[cfg(any(target_os = "macos", target_os = "windows"))]
    {
        builder = builder.show_menu_on_left_click(false);
    }
    // Linux: left click shows the menu (explicit — this is also the crate's
    // default — because `TrayIconEvent::Click` above is not a reliable way
    // to open the window here; the menu is the only dependable entry point).
    #[cfg(target_os = "linux")]
    {
        builder = builder.show_menu_on_left_click(true);
    }

    #[cfg(target_os = "macos")]
    {
        builder = builder.icon_as_template(true);
    }

    builder.build(app)?;
    Ok(())
}

/// Place the popup next to the tray icon, cross-platform.
///
/// macOS puts the menu bar (and tray) at the top of the screen, so the window
/// opens below the icon. Windows' taskbar tray and most Linux panels sit at the
/// bottom, so opening below would push the window off-screen — there we open
/// above the icon instead. The decision is made per-monitor from the icon's
/// position, and X is clamped so the window always stays on-screen.
///
/// DT-06: monitor bounds are looked up via `monitor_from_point` at the tray
/// icon/cursor's own physical position, not `current_monitor()` (which
/// reports the *window's* monitor — for this always-on-top, normally-hidden
/// window that can be stale/wrong on a multi-monitor setup, e.g. still
/// reporting the primary display after the user opened the tray from a
/// secondary one). Positioning must be relative to where the user actually
/// clicked, not wherever the window last happened to be.
fn position_window_near_tray(
    win: &tauri::WebviewWindow,
    rect: &tauri::Rect,
    cursor_x: f64,
    cursor_y: f64,
) {
    use tauri::PhysicalPosition;

    let Ok(size) = win.outer_size() else { return };
    let scale = win.scale_factor().unwrap_or(1.0);

    let (icon_center_x, icon_top_y, icon_bottom_y) =
        rect_bounds_physical(rect, scale, cursor_x, cursor_y);

    let win_w = size.width as f64;
    let win_h = size.height as f64;
    let gap = 8.0 * scale;

    // Monitor bounds (physical), looked up at the icon's own position rather
    // than the window's — see the DT-06 note above. Falls back to unbounded
    // if the platform can't resolve a monitor at that point.
    let (mon_top, mon_bottom, mon_left, mon_right) = match win
        .monitor_from_point(icon_center_x, icon_top_y)
    {
        Ok(Some(m)) => {
            let p = m.position();
            let s = m.size();
            (
                p.y as f64,
                (p.y + s.height as i32) as f64,
                p.x as f64,
                (p.x + s.width as i32) as f64,
            )
        }
        _ => (0.0, f64::MAX, 0.0, f64::MAX),
    };

    // Icon in the bottom half of its monitor (Windows taskbar / bottom panel)
    // → open above it; otherwise (macOS menu bar / top panel) → open below.
    let mon_mid = (mon_top + mon_bottom) / 2.0;
    let y = if mon_bottom < f64::MAX && icon_bottom_y > mon_mid {
        icon_top_y - win_h - gap
    } else {
        icon_bottom_y + gap
    };

    let mut x = icon_center_x - win_w / 2.0;
    if mon_right < f64::MAX {
        x = x.min(mon_right - win_w - gap).max(mon_left + gap);
    } else {
        x = x.max(8.0);
    }

    let _ = win.set_position(PhysicalPosition::new(x as i32, y as i32));
}

/// Returns the icon's (center_x, top_y, bottom_y) in physical pixels, falling
/// back to the cursor position when the platform reports an empty tray rect.
fn rect_bounds_physical(
    rect: &tauri::Rect,
    scale: f64,
    cursor_x: f64,
    cursor_y: f64,
) -> (f64, f64, f64) {
    let (x, y, w, h) = match &rect.position {
        tauri::Position::Physical(pos) => {
            let (w, h) = size_to_physical(&rect.size, scale);
            (pos.x as f64, pos.y as f64, w, h)
        }
        tauri::Position::Logical(pos) => {
            let (w, h) = size_to_physical(&rect.size, scale);
            (pos.x * scale, pos.y * scale, w, h)
        }
    };
    if w <= 0.0 || h <= 0.0 {
        return (cursor_x, cursor_y, cursor_y);
    }
    (x + w / 2.0, y, y + h)
}

fn size_to_physical(size: &tauri::Size, scale: f64) -> (f64, f64) {
    match size {
        tauri::Size::Physical(s) => (s.width as f64, s.height as f64),
        tauri::Size::Logical(s) => (s.width * scale, s.height * scale),
    }
}
