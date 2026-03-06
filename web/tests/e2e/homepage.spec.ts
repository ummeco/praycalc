import { test, expect } from "@playwright/test";

/**
 * Homepage E2E tests.
 *
 * The homepage shows a logo, city search input, GPS pill, location pills,
 * and a moon phase card. GeoPrompt appears after 1.5s unless dismissed before.
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
  });

  test("loads and renders core elements", async ({ page }) => {
    // Logo is visible
    await expect(page.locator("img[alt='PrayCalc']").or(page.locator("svg")).first()).toBeVisible();

    // Search input is present
    const searchInput = page.locator(
      'input[placeholder="Search cities, airports, zip codes..."]',
    );
    await expect(searchInput).toBeVisible();
  });

  test("renders search input with correct placeholder", async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder="Search cities, airports, zip codes..."]',
    );
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });

  test("renders GPS use-my-location pill", async ({ page }) => {
    const gpsPill = page.locator(".gps-location-btn").or(page.locator(".location-gps-pill"));
    await expect(gpsPill.first()).toBeVisible();
  });

  test("city search shows dropdown results when typing", async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder="Search cities, airports, zip codes..."]',
    );
    await searchInput.fill("London");

    // Wait for debounce (250ms) + results to appear
    await expect(page.locator(".search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    // At least one result should appear
    const results = page.locator(".search-dropdown-item");
    await expect(results.first()).toBeVisible();

    // Result name should be visible (green text)
    const firstName = results.first().locator(".search-result-name");
    await expect(firstName).toBeVisible();
    await expect(firstName).not.toBeEmpty();
  });

  test("city search result shows slug hint", async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder="Search cities, airports, zip codes..."]',
    );
    await searchInput.fill("Mecca");

    await expect(page.locator(".search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    const slugHint = page.locator(".search-result-slug").first();
    await expect(slugHint).toBeVisible();
    // Slug should start with /
    await expect(slugHint).toContainText("/");
  });

  test("selecting a search result navigates to city page", async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder="Search cities, airports, zip codes..."]',
    );
    await searchInput.fill("New York");

    await expect(page.locator(".search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    // Click the first result
    await page.locator(".search-dropdown-item").first().click();

    // Should navigate away from homepage
    await page.waitForURL(/\/us\//, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/us\//);
  });

  test("search dropdown closes when pressing Escape", async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder="Search cities, airports, zip codes..."]',
    );
    await searchInput.fill("London");

    await expect(page.locator(".search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    await searchInput.press("Escape");
    await expect(page.locator(".search-dropdown")).not.toBeVisible();
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

test.describe("Homepage — geolocation prompt", () => {
  // Clear geolocation permission so the prompt actually shows
  // (the global config grants geolocation, which suppresses the prompt)
  test.use({ permissions: [] });

  test("geo prompt appears after delay when not dismissed", async ({ page }) => {
    // Navigate fresh — do NOT dismiss the prompt
    await page.goto("/");

    // GeoPrompt fires after DELAY_MS=1500ms
    const geoPrompt = page.locator('[role="dialog"][aria-label="Location permission prompt"]');
    await expect(geoPrompt).toBeVisible({ timeout: 5_000 });

    // Prompt contains the expected text
    await expect(geoPrompt).toContainText("Find prayer times for your location?");
    await expect(geoPrompt.locator(".geo-prompt-btn")).toBeVisible();
  });

  test("geo prompt can be dismissed by clicking X", async ({ page }) => {
    await page.goto("/");

    const geoPrompt = page.locator('[role="dialog"][aria-label="Location permission prompt"]');
    await expect(geoPrompt).toBeVisible({ timeout: 5_000 });

    // Click the dismiss button
    const dismissBtn = geoPrompt.locator(".geo-prompt-close");
    await dismissBtn.click();

    // Prompt should disappear
    await expect(geoPrompt).not.toBeVisible();
  });

  test("geo prompt does not reappear after dismissal (localStorage key set)", async ({
    page,
  }) => {
    await page.goto("/");

    const geoPrompt = page.locator('[role="dialog"][aria-label="Location permission prompt"]');
    await expect(geoPrompt).toBeVisible({ timeout: 5_000 });

    // Dismiss it
    await geoPrompt.locator(".geo-prompt-close").click();
    await expect(geoPrompt).not.toBeVisible();

    // Check the dismissal flag was persisted
    const dismissed = await page.evaluate(() =>
      localStorage.getItem("pc_geo_prompt_dismissed"),
    );
    expect(dismissed).toBe("1");
  });
});
