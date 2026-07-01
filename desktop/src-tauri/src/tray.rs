use tauri::{
    image::Image,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager,
};

pub fn setup_tray(app: &mut App) -> tauri::Result<()> {
    #[cfg(target_os = "macos")]
    let icon = Image::from_bytes(include_bytes!("../icons/tray-icon@2x.png"))?;
    #[cfg(not(target_os = "macos"))]
    let icon = Image::from_bytes(include_bytes!("../icons/tray-icon.png"))?;

    let mut builder = TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("PrayCalc — click to open")
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

    // Monitor bounds (physical). Fall back to unbounded if unavailable.
    let (mon_top, mon_bottom, mon_left, mon_right) = match win.current_monitor() {
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
