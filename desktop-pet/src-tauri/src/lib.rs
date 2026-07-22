use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("芝士在呢~ {}!", name)
}

/// 切换鼠标穿透（后续防遮挡升级用）
/// enabled=true → 点击穿透到下层窗口
#[tauri::command]
fn set_click_through(window: tauri::Window, enabled: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(enabled).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // 获取主显示器并定位到右下角（收起态：120x120，含气泡空间）
            let pet_w = 120.0;
            let pet_h = 120.0;
            let margin = 20.0;

            // 尝试获取显示器尺寸来定位到右下角
            let monitors = app.available_monitors().ok().unwrap_or_default();
            let primary = app.primary_monitor().ok().flatten();
            let positioned = if let Some(mon) = monitors.first().or(primary.as_ref()) {
                let size = mon.size();
                let scale = mon.scale_factor();
                let x = (size.width as f64 / scale) - pet_w - margin;
                let y = (size.height as f64 / scale) - pet_h - margin - 40.0;
                window.set_position(tauri::PhysicalPosition::new(x.max(0.0), y.max(0.0))).is_ok()
            } else {
                false
            };
            if !positioned {
                window.set_position(tauri::PhysicalPosition::new(1780.0, 940.0)).ok();
            }

            // 设置为收起态尺寸
            window.set_size(tauri::PhysicalSize::new(pet_w, pet_h)).ok();

            // 渲染完再显示，避免白屏闪烁
            window.show().ok();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, set_click_through])
        .run(tauri::generate_context!())
        .expect("error while running 芝士");
}
