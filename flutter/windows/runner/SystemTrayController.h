// SystemTrayController.h — PrayCalc Windows system tray.
// Spec §6.2, S19-E T25
//
// Provides:
//   - System tray icon with tooltip: "Asr in 2h 17m"
//   - Left-click opens popup menu: prayer list + Settings + Quit
//   - Windows.UI.Notifications (WinRT) toast on prayer arrival
//   - FF_DESKTOP_TRAY feature flag (default true per D-S19-02)
//
// Data is read from Flutter via MethodChannel "praycalc/tray".
// Flutter calls invokeMethod("onTrayDataReady", args) whenever data changes.

#pragma once

#include <windows.h>
#include <shellapi.h>
#include <string>
#include <vector>
#include <flutter/method_channel.h>
#include <flutter/method_result_functions.h>
#include <flutter/standard_method_codec.h>
#include <flutter/flutter_view_controller.h>

// WinRT for toast notifications
#include <winrt/Windows.UI.Notifications.h>
#include <winrt/Windows.Data.Xml.Dom.h>

// Custom WM_ message IDs
#define WM_TRAY_CALLBACK (WM_APP + 1)
#define TRAY_ICON_ID     1

struct PrayerEntry {
    std::wstring name;
    std::wstring time;
    bool isNext = false;
    bool isDone = false;
};

struct TrayData {
    std::wstring nextPrayer     = L"Fajr";
    std::wstring nextPrayerTime = L"--:--";
    std::wstring countdown      = L"";
    std::wstring locationName   = L"";
    std::vector<PrayerEntry> prayers;
};

class SystemTrayController {
public:
    explicit SystemTrayController(flutter::FlutterViewController* controller);
    ~SystemTrayController();

    // Call from WinMain after FlutterWindow is created.
    bool Setup(HWND hwnd);

    // WndProc intercept — call from FlutterWindow::WndProc before DefWindowProc.
    // Returns true if the message was handled.
    bool HandleMessage(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam);

    void Teardown();

private:
    // Tray icon management
    bool AddTrayIcon(HWND hwnd);
    void RemoveTrayIcon();
    void UpdateTrayTooltip(const std::wstring& tooltip);

    // Popup menu
    void ShowContextMenu(HWND hwnd, POINT pt);

    // Flutter channel
    void SetupMethodChannel();

    // Toast notification (WinRT)
    void ShowPrayerToast(const std::wstring& prayer, const std::wstring& time);

    // Timer callback (60 s refresh)
    static VOID CALLBACK TimerProc(HWND hwnd, UINT msg, UINT_PTR id, DWORD time);

    // Helpers
    std::wstring FormatCountdown(double nextTs);
    bool FeatureFlagEnabled() const;

    flutter::FlutterViewController* flutter_controller_;
    std::shared_ptr<flutter::MethodChannel<flutter::EncodableValue>> channel_;

    HWND            hwnd_       = nullptr;
    NOTIFYICONDATAW nid_        = {};
    UINT_PTR        timer_id_   = 0;
    TrayData        data_;
    std::wstring    last_notified_prayer_;
    bool            initialized_ = false;

    // Menu item IDs
    enum MenuId : UINT {
        ID_SETTINGS = 100,
        ID_QUIT     = 101,
        ID_PRAYER_BASE = 200  // 200–204 for Fajr–Isha
    };
};
