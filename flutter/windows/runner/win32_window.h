#ifndef RUNNER_WIN32_WINDOW_H_
#define RUNNER_WIN32_WINDOW_H_

#include <windows.h>

#include <functional>
#include <memory>
#include <string>

// A class abstraction for a high DPI-aware Win32 Window. Intended to be
// inherited from by classes that wish to specialize with custom rendering and
// input handling.
class Win32Window {
 public:
  struct Point {
    unsigned int x;
    unsigned int y;
    Point(unsigned int x, unsigned int y) : x(x), y(y) {}
  };

  struct Size {
    unsigned int width;
    unsigned int height;
    Size(unsigned int width, unsigned int height)
        : width(width), height(height) {}
  };

  Win32Window();
  virtual ~Win32Window();

  // Creates and shows a win32 window with |title| and position and size using
  // |origin| and |size|. New windows are created on the default monitor. Window
  // sizes are specified to the OS in physical pixels, hence they are
  // automatically adjusted for DPI.
  bool Create(const std::wstring& title, const Point& origin, const Size& size);

  // Release OS resources associated with window.
  void Destroy();

  // Inserts |content| into the window tree.
  void SetChildContent(HWND content);

  // Returns the backing Window handle to enable calls that are not wrapped by
  // this class.
  HWND GetHandle();

  // If true, closing this window will quit the application.
  void SetQuitOnClose(bool quit);

  // Return a RECT representing the bounds of the current client area.
  RECT GetClientArea();

  // Shows the window, after it has been created and made visible.
  void Show();

 protected:
  // Processes and routes salient window messages for handling.
  virtual bool OnCreate();
  virtual void OnDestroy();

 private:
  friend class Win32WindowTest;
  friend class WindowClassRegistrar;

  // OS callback called by message pump. Handles the WM_NCCREATE message which
  // is passed when the non-client area is being created and enables automatic
  // non-client DPI scaling so that the non-client area automatically responds
  // to changes in DPI.
  static LRESULT CALLBACK WndProc(HWND const window, UINT const message,
                                  WPARAM const wparam, LPARAM const lparam);

  // Retrieves the Win32Window* from a HWND via GetWindowLongPtr.
  static Win32Window* GetThisFromHandle(HWND const window) noexcept;

  // Updates the window's theme (dark/light mode) via DWM attributes.
  void UpdateTheme(HWND const window);

  // WM_DPICHANGED handler.
  LRESULT HandleDpiChange(HWND hwnd, WPARAM wparam, LPARAM lparam);

  // A reference to the child view.
  HWND child_content_ = nullptr;

  // Whether closing the window should quit the application.
  bool quit_on_close_ = false;

  // The window handle.
  HWND window_handle_ = nullptr;
};

#endif  // RUNNER_WIN32_WINDOW_H_
