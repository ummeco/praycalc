import { test, expect } from "@playwright/test";

/**
 * Settings toggle E2E tests.
 *
 * Settings live in SettingsGear → SettingsPanel on the city page.
 * The gear button opens a panel with toggles for:
 *   - Light Mode
 *   - Hanafi Asr
 *   - 24H Time
 *   - Countdown
 *   - Show Qiyam
 *
 * Settings are persisted to localStorage via useSettings.
 */

const LONDON = "/gb/england/london";

test.describe("Settings panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
      // Start from a clean settings state
      localStorage.removeItem("pc_settings");
      // Ensure no session bleeds in from account.spec.ts
      localStorage.removeItem("praycalc-session");
    });
    await page.goto(LONDON);
    // Wait for the prayer grid before opening settings
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  async function openSettings(page: Parameters<typeof test>[1] extends (args: { page: import("@playwright/test").Page }) => unknown ? import("@playwright/test").Page : import("@playwright/test").Page) {
    const gearBtn = page.locator('.settings-gear-btn');
    await expect(gearBtn).toBeVisible();
    await gearBtn.click();
    await expect(page.locator('.settings-panel')).toBeVisible();
  }

  test("gear button is visible on city page", async ({ page }) => {
    const gearBtn = page.locator(".settings-gear-btn");
    await expect(gearBtn).toBeVisible();
    await expect(gearBtn).toHaveAttribute("aria-label", "Settings");
  });

  test("clicking gear opens settings panel", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    await expect(page.locator(".settings-panel")).toBeVisible();
  });

  test("settings panel closes when clicking outside", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    await expect(page.locator(".settings-panel")).toBeVisible();

    // Click somewhere outside the settings panel
    await page.locator(".prayer-grid").click({ position: { x: 10, y: 10 } });
    await expect(page.locator(".settings-panel")).not.toBeVisible();
  });

  test("settings panel shows all expected toggle labels", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    await expect(panel).toContainText("Light Mode");
    await expect(panel).toContainText("Hanafi Asr");
    await expect(panel).toContainText("24H Time");
    await expect(panel).toContainText("Countdown");
    await expect(panel).toContainText("Show Qiyam");
    await expect(panel).toContainText("Notification");
    await expect(panel).toContainText("Home City");
  });
});

test.describe("Dark/Light mode toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
      localStorage.removeItem("pc_settings");
      localStorage.removeItem("praycalc-session");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("light mode toggle changes page appearance", async ({ page }) => {
    // Open settings
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");
    await expect(panel).toBeVisible();

    // Find the Light Mode toggle
    const lightModeRow = panel.locator(".settings-row").filter({ hasText: "Light Mode" });
    const toggle = lightModeRow.locator("button");
    await expect(toggle).toBeVisible();

    // The html or body element carries the light-mode class
    // Default is dark — check the toggle's aria-label describes current state
    const ariaLabel = await toggle.getAttribute("aria-label");
    expect(ariaLabel).toMatch(/Switch to light mode|Switch to dark mode/i);

    // Click to toggle
    await toggle.click();

    // Aria label should flip
    const newAriaLabel = await toggle.getAttribute("aria-label");
    expect(newAriaLabel).not.toBe(ariaLabel);
  });

  test("light mode toggle persists to localStorage", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    const lightModeRow = panel.locator(".settings-row").filter({ hasText: "Light Mode" });
    const toggle = lightModeRow.locator("button");

    // Click once to enable light mode
    await toggle.click();

    // Reload page — settings should persist
    await page.reload();
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });

    // Open settings again
    await page.locator(".settings-gear-btn").click();
    const reloadedPanel = page.locator(".settings-panel");
    await expect(reloadedPanel).toBeVisible();

    const reloadedRow = reloadedPanel.locator(".settings-row").filter({ hasText: "Light Mode" });
    const reloadedToggle = reloadedRow.locator("button");

    // Should now be in light mode (aria-label says "Switch to dark mode")
    await expect(reloadedToggle).toHaveAttribute("aria-label", "Switch to dark mode");
  });
});

test.describe("12h/24h time format toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
      localStorage.removeItem("pc_settings");
      localStorage.removeItem("praycalc-session");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("prayer times display in 12h format by default", async ({ page }) => {
    // Default is 12h — times should include am/pm periods
    const times = page.locator(".prayer-time");
    const firstTime = times.first();
    await expect(firstTime).toBeVisible();
    const text = await firstTime.textContent();
    // 12h times look like "4:32" (period shown in separate .prayer-period span)
    expect(text).toMatch(/\d+:\d{2}/);

    // There should be period spans (am/pm)
    const periods = page.locator(".prayer-period");
    const periodCount = await periods.count();
    // At least some prayers should have a period shown in 12h mode
    expect(periodCount).toBeGreaterThan(0);
  });

  test("switching to 24h removes am/pm period spans", async ({ page }) => {
    // Open settings
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");
    await expect(panel).toBeVisible();

    const row24h = panel.locator(".settings-row").filter({ hasText: "24H Time" });
    const toggle24h = row24h.locator("button");
    await expect(toggle24h).toHaveAttribute("aria-label", "Switch to 24-hour");

    await toggle24h.click();

    // Close panel
    await page.locator(".prayer-grid").click({ position: { x: 10, y: 10 } });

    // In 24h mode, period spans should be gone (no am/pm)
    const periods = page.locator(".prayer-period");
    await expect(periods).toHaveCount(0);
  });

  test("24h times look like HH:MM format", async ({ page }) => {
    // Enable 24h mode via settings
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    const row24h = panel.locator(".settings-row").filter({ hasText: "24H Time" });
    await row24h.locator("button").click();

    // Close settings
    await page.keyboard.press("Escape");
    await page.locator(".prayer-grid").click({ position: { x: 10, y: 10 } });

    // Check times — 24h format shows hours 0–23
    const times = page.locator(".prayer-time");
    const count = await times.count();
    for (let i = 0; i < count; i++) {
      const text = await times.nth(i).textContent();
      // 24h pattern: one or two digits colon two digits (no am/pm appended here)
      expect(text).toMatch(/^\d{1,2}:\d{2}$/);
    }
  });

  test("24h toggle persists across page reload", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    const row24h = panel.locator(".settings-row").filter({ hasText: "24H Time" });
    const toggle = row24h.locator("button");
    await toggle.click(); // enable 24h

    await page.reload();
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });

    // In 24h mode after reload, period spans should still be absent
    const periods = page.locator(".prayer-period");
    await expect(periods).toHaveCount(0);
  });
});

test.describe("Qiyam toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
      localStorage.removeItem("pc_settings");
      localStorage.removeItem("praycalc-session");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("Qiyam is not shown by default", async ({ page }) => {
    const grid = page.locator(".prayer-grid");
    // Default displayList has 6 rows (Fajr/Sunrise/Dhuhr/Asr/Maghrib/Isha)
    const rows = grid.locator(".prayer-row");
    await expect(rows).toHaveCount(6);
    await expect(grid).not.toContainText("Qiyam");
  });

  test("enabling Show Qiyam adds a Qiyam row", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    const qiyamRow = panel.locator(".settings-row").filter({ hasText: "Show Qiyam" });
    const toggle = qiyamRow.locator("button");
    await expect(toggle).toHaveAttribute("aria-label", "Show Qiyam");

    await toggle.click();

    // Close panel
    await page.locator("body").press("Escape");
    await page.locator(".prayer-grid").click({ position: { x: 10, y: 10 } });

    // Qiyam row should now appear — grid has 7 rows
    const grid = page.locator(".prayer-grid");
    const rows = grid.locator(".prayer-row");
    await expect(rows).toHaveCount(7);
    await expect(grid).toContainText("Qiyam");
  });
});

test.describe("Notification sound mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
      localStorage.removeItem("pc_settings");
      localStorage.removeItem("praycalc-session");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("notification section has None, Beep, and Adhan buttons", async ({
    page,
  }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    const soundOpts = panel.locator(".settings-sound-opt");
    await expect(soundOpts.filter({ hasText: "None" })).toBeVisible();
    await expect(soundOpts.filter({ hasText: "Beep" })).toBeVisible();
    await expect(soundOpts.filter({ hasText: "Adhan" })).toBeVisible();
  });

  test("None is the active sound mode by default", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    const noneBtn = panel
      .locator(".settings-sound-opt")
      .filter({ hasText: "None" });
    await expect(noneBtn).toHaveClass(/settings-sound-opt--on/);
  });

  test("selecting Beep activates Beep and deactivates None", async ({
    page,
  }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    await panel.locator(".settings-sound-opt").filter({ hasText: "Beep" }).click();

    await expect(
      panel.locator(".settings-sound-opt").filter({ hasText: "Beep" }),
    ).toHaveClass(/settings-sound-opt--on/);
    await expect(
      panel.locator(".settings-sound-opt").filter({ hasText: "None" }),
    ).not.toHaveClass(/settings-sound-opt--on/);
  });

  test("selecting Adhan shows adhan voice picker", async ({ page }) => {
    await page.locator(".settings-gear-btn").click();
    const panel = page.locator(".settings-panel");

    await panel.locator(".settings-sound-opt").filter({ hasText: "Adhan" }).click();

    // Voice picker should appear with Mecca, Mishary, Pashaii
    await expect(panel.locator(".settings-sound-opt").filter({ hasText: "Mecca" })).toBeVisible();
    await expect(panel.locator(".settings-sound-opt").filter({ hasText: "Mishary" })).toBeVisible();
    await expect(panel.locator(".settings-sound-opt").filter({ hasText: "Pashaii" })).toBeVisible();
  });
});
