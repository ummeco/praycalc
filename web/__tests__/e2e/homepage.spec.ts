import { test, expect } from "@playwright/test";

/**
 * Homepage E2E tests.
 *
 * The homepage shows a logo, city search input, GPS pill, location pills,
 * and a moon phase card. A single "Use my location" pill handles geolocation.
 *
 * We pre-set localStorage to dismiss the geo prompt in tests that don't need it,
 * keeping tests focused and fast.
 */

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to establish origin, dismiss geo prompt, then reload
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("pc_geo_prompt_dismissed", "1"));
    await page.reload();
    // Hydration barrier: LocationSearch is a *controlled* input, so a fill() that lands
    // before hydration is reset to '' when React mounts (dropping the query and its
    // /api/search request). The island autofocuses on mount, so waiting for focus is a
    // deterministic "island is interactive" signal. (Needed since the perf pass sped up
    // `load`, which previously covered this timing incidentally.)
    await expect(page.locator('[data-testid="city-search-input"]')).toBeFocused({
      timeout: 10_000,
    });
  });

  test("loads and renders core elements", async ({ page }) => {
    // Logo is visible
    await expect(page.locator("img[alt='PrayCalc']").or(page.locator("svg")).first()).toBeVisible();

    // Search input is present
    const searchInput = page.locator('[data-testid="city-search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test("renders search input with placeholder", async ({ page }) => {
    const searchInput = page.locator('[data-testid="city-search-input"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
    // Placeholder cycles through city names when unfocused, shows full text on focus
    await expect(searchInput).toHaveAttribute("placeholder", /.+/);
  });

  test("renders GPS use-my-location pill", async ({ page }) => {
    const gpsPill = page.locator(".gps-location-btn").or(page.locator(".location-gps-pill"));
    await expect(gpsPill.first()).toBeVisible();
  });

  test("city search shows dropdown results when typing", async ({ page }) => {
    const searchInput = page.locator('[data-testid="city-search-input"]');
    await searchInput.fill("London");
    // Deterministic wait: the dropdown only renders after /api/search responds
    await page.waitForResponse((r) => r.url().includes('/api/search'), { timeout: 10_000 });

    // Wait for debounce (250ms) + results to appear
    await expect(page.locator(".location-search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    // At least one result should appear
    const results = page.locator(".location-search-item");
    await expect(results.first()).toBeVisible();

    // Result name should be visible (green text)
    const firstName = results.first().locator(".location-search-name");
    await expect(firstName).toBeVisible();
    await expect(firstName).not.toBeEmpty();
  });

  test("city search result shows slug hint", async ({ page }) => {
    const searchInput = page.locator('[data-testid="city-search-input"]');
    await searchInput.fill("Mecca");
    // Deterministic wait: the dropdown only renders after /api/search responds
    await page.waitForResponse((r) => r.url().includes('/api/search'), { timeout: 10_000 });

    await expect(page.locator(".location-search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    const slugHint = page.locator(".location-search-slug").first();
    await expect(slugHint).toBeVisible();
    // Slug should start with /
    await expect(slugHint).toContainText("/");
  });

  test("selecting a search result navigates to city page", async ({ page }) => {
    const searchInput = page.locator('[data-testid="city-search-input"]');
    await searchInput.fill("New York");
    // Deterministic wait: the dropdown only renders after /api/search responds
    await page.waitForResponse((r) => r.url().includes('/api/search'), { timeout: 10_000 });

    await expect(page.locator(".location-search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    // Click the first result
    await page.locator(".location-search-item").first().click();

    // Should navigate away from homepage
    await page.waitForURL(/\/us\//, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/us\//);
  });

  test("search dropdown closes when pressing Escape", async ({ page }) => {
    const searchInput = page.locator('[data-testid="city-search-input"]');
    await searchInput.fill("London");
    // Deterministic wait: the dropdown only renders after /api/search responds
    await page.waitForResponse((r) => r.url().includes('/api/search'), { timeout: 10_000 });

    await expect(page.locator(".location-search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    await searchInput.press("Escape");
    await expect(page.locator(".location-search-dropdown")).not.toBeVisible();
  });

  test("moon phase card is rendered", async ({ page }) => {
    // Moon phase section is present
    const moonCard = page.locator(".home-moon-card");
    await expect(moonCard).toBeVisible();
  });

  test("page title includes PrayCalc", async ({ page }) => {
    await expect(page).toHaveTitle(/PrayCalc/i);
  });
});

// NOTE: The delayed floating "geolocation prompt" island was removed from the
// homepage (declutter + de-duplicate the location CTA — the always-visible
// "Use my location" pill covers the same action, now with an IP-geolocation
// fallback). Its tests were removed with it.
