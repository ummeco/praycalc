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
                        position_window_below_tray(&win, &rect, position.x, position.y);
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

fn position_window_below_tray(
    win: &tauri::WebviewWindow,
    rect: &tauri::Rect,
    cursor_x: f64,
    cursor_y: f64,
) {
    use tauri::PhysicalPosition;

    let Ok(size) = win.outer_size() else { return };
    let scale = win.scale_factor().unwrap_or(2.0);

    let (icon_center_x, icon_bottom_y) = rect_to_physical_bottom_center(rect, scale);

    let center_x = if icon_center_x > 0.0 { icon_center_x } else { cursor_x };
    let bottom_y = if icon_bottom_y > cursor_y { icon_bottom_y } else { cursor_y + 4.0 * scale };

    let win_width = size.width as f64;
    let x = (center_x - win_width / 2.0).max(8.0);
    let y = bottom_y + 8.0;

    let _ = win.set_position(PhysicalPosition::new(x as i32, y as i32));
}

fn rect_to_physical_bottom_center(rect: &tauri::Rect, scale: f64) -> (f64, f64) {
    match &rect.position {
        tauri::Position::Physical(pos) => {
            let (w, h) = size_to_physical(&rect.size, scale);
            (pos.x as f64 + w / 2.0, pos.y as f64 + h)
        }
        tauri::Position::Logical(pos) => {
            let (w, h) = size_to_physical(&rect.size, scale);
            (pos.x * scale + w / 2.0, pos.y * scale + h)
        }
    }
}

fn size_to_physical(size: &tauri::Size, scale: f64) -> (f64, f64) {
    match size {
        tauri::Size::Physical(s) => (s.width as f64, s.height as f64),
        tauri::Size::Logical(s) => (s.width * scale, s.height * scale),
    }
}
