// main.cpp — PrayCalc Windows entry point.
// v1.1: wires SystemTrayController after window creation.

#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>
#include <windows.h>

#include "flutter_window.h"
#include "SystemTrayController.h"
#include "utils.h"

// Global tray controller so it lives for the duration of the app
static std::unique_ptr<SystemTrayController> g_tray;

int APIENTRY wWinMain(_In_ HINSTANCE instance, _In_opt_ HINSTANCE prev,
                      _In_ wchar_t *command_line, _In_ int show_command) {
  // Attach to console when present (e.g., 'flutter run') or create a temporary console.
  if (!::AttachConsole(ATTACH_PARENT_PROCESS) && ::IsDebuggerPresent()) {
    CreateAndAttachConsole();
  }

  // Initialize COM for WinRT (Windows.UI.Notifications) and Shell APIs.
  ::CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

  flutter::DartProject project(L"data");

  std::vector<std::string> command_line_arguments = GetCommandLineArguments();
  project.set_dart_entrypoint_arguments(std::move(command_line_arguments));

  FlutterWindow window(project);
  Win32Window::Point origin(10, 10);
  Win32Window::Size size(1280, 720);
  if (!window.Create(L"PrayCalc", origin, size)) {
    return EXIT_FAILURE;
  }

  // When all windows close: minimize to tray instead of quitting.
  // The user must click Quit in the tray menu to exit.
  window.SetQuitOnClose(false);

  // Set up system tray
  if (auto* vc = window.GetFlutterViewController()) {
    g_tray = std::make_unique<SystemTrayController>(vc);
    g_tray->Setup(window.GetHandle());
  }

  ::MSG msg;
  while (::GetMessage(&msg, nullptr, 0, 0)) {
    // Let the tray controller intercept tray messages before dispatch
    if (g_tray && g_tray->HandleMessage(msg.hwnd, msg.message, msg.wParam, msg.lParam)) {
      continue;
    }
    ::TranslateMessage(&msg);
    ::DispatchMessage(&msg);
  }

  if (g_tray) {
    g_tray->Teardown();
    g_tray.reset();
  }

  ::CoUninitialize();
  return EXIT_SUCCESS;
}
