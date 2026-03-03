import { test, expect } from "@playwright/test";

/**
 * Homepage E2E tests.
 *
 * The homepage shows a logo, city search input, GPS button, popular city chips,
 * and a moon phase card. GeoPrompt appears after 1.5s unless dismissed before.
 *
 * We pre-set localStorage to dismiss the geo prompt in tests that don't need it,
 * keeping tests focused and fast.
 */

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-dismiss the geo prompt so it doesn't interfere with unrelated tests
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
    });
  });

  test("loads and renders core elements", async ({ page }) => {
    await page.goto("/");

    // Logo is visible
    await expect(page.locator("img[alt='PrayCalc']").or(page.locator("svg")).first()).toBeVisible();

    // Search input is present
    const searchInput = page.locator(
      'input[placeholder="City, zip code, or country…"]',
    );
    await expect(searchInput).toBeVisible();
  });

  test("renders search input with correct placeholder", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator(
      'input[placeholder="City, zip code, or country…"]',
    );
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });

  test("renders GPS use-my-location button", async ({ page }) => {
    await page.goto("/");
    const gpsBtn = page.locator(".gps-location-btn");
    await expect(gpsBtn).toBeVisible();
    await expect(gpsBtn).toContainText("Use my location");
  });

  test("renders popular city chips", async ({ page }) => {
    await page.goto("/");

    // Wait for client-side hydration — PopularCities is client-rendered
    const chips = page.locator(".popular-city-chip");
    await expect(chips).toHaveCount(6);

    // Verify specific cities are present
    await expect(chips.filter({ hasText: "Mecca" })).toBeVisible();
    await expect(chips.filter({ hasText: "Medina" })).toBeVisible();
    await expect(chips.filter({ hasText: "London" })).toBeVisible();
    await expect(chips.filter({ hasText: "New York" })).toBeVisible();
    await expect(chips.filter({ hasText: "Istanbul" })).toBeVisible();
    await expect(chips.filter({ hasText: "Cairo" })).toBeVisible();
  });

  test("clicking a popular city chip navigates to that city page", async ({
    page,
  }) => {
    await page.goto("/");

    const londonChip = page
      .locator(".popular-city-chip")
      .filter({ hasText: "London" });
    await expect(londonChip).toBeVisible();
    await londonChip.click();

    // Should navigate to London's city page
    await page.waitForURL(/\/gb\/england\/london/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/gb\/england\/london/);
  });

  test("city search shows dropdown results when typing", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator(
      'input[placeholder="City, zip code, or country…"]',
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
    await page.goto("/");

    const searchInput = page.locator(
      'input[placeholder="City, zip code, or country…"]',
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
    await page.goto("/");

    const searchInput = page.locator(
      'input[placeholder="City, zip code, or country…"]',
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
    await page.goto("/");

    const searchInput = page.locator(
      'input[placeholder="City, zip code, or country…"]',
    );
    await searchInput.fill("London");

    await expect(page.locator(".search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    await searchInput.press("Escape");
    await expect(page.locator(".search-dropdown")).not.toBeVisible();
  });

  test("moon phase card is rendered", async ({ page }) => {
    await page.goto("/");

    // Moon phase section is present
    const moonCard = page.locator(".home-moon-card");
    await expect(moonCard).toBeVisible();
  });

  test("page title includes PrayCalc", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PrayCalc/i);
  });
});

test.describe("Homepage — geolocation prompt", () => {
  test("geo prompt appears after delay when not dismissed", async ({ page }) => {
    // Do NOT pre-dismiss — let the prompt show
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
    const dismissBtn = geoPrompt.locator('[aria-label="Dismiss"]');
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
    await geoPrompt.locator('[aria-label="Dismiss"]').click();
    await expect(geoPrompt).not.toBeVisible();

    // Check the dismissal flag was persisted
    const dismissed = await page.evaluate(() =>
      localStorage.getItem("pc_geo_prompt_dismissed"),
    );
    expect(dismissed).toBe("1");
  });
});
