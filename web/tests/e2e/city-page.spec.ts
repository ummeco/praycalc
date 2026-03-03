import { test, expect } from "@playwright/test";

/**
 * City page E2E tests.
 *
 * Uses London (gb/england/london) as the canonical test city — it is a
 * hardcoded popular city in PopularCities.tsx and has a reliable slug.
 *
 * Tests cover:
 * - Prayer time display
 * - Qibla compass tile + modal
 * - Monthly calendar toggle
 * - PDF export buttons
 * - Location search (compact mode)
 */

const LONDON = "/gb/england/london";

test.describe("City page — prayer times", () => {
  test.beforeEach(async ({ page }) => {
    // Suppress geo prompt on every test
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
    });
    await page.goto(LONDON);
    // Wait for the prayer grid to render
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("renders the city name in the header", async ({ page }) => {
    // CityInfoHeader should display "London" somewhere on page
    const body = page.locator("body");
    await expect(body).toContainText("London");
  });

  test("prayer grid shows five main prayer names", async ({ page }) => {
    const grid = page.locator(".prayer-grid");
    await expect(grid).toBeVisible();

    // Default display list is Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
    const rows = grid.locator(".prayer-row");
    await expect(rows).toHaveCount(6); // 5 prayers + Sunrise

    // Check specific prayer names are displayed (English labels from PRAYER_META)
    await expect(grid).toContainText("Fajr");
    await expect(grid).toContainText("Sunrise");
    await expect(grid).toContainText("Dhuhr");
    await expect(grid).toContainText("Asr");
    await expect(grid).toContainText("Maghrib");
    await expect(grid).toContainText("Isha");
  });

  test("each prayer row shows a time in HH:MM format", async ({ page }) => {
    const times = page.locator(".prayer-time");
    const count = await times.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Every visible time should look like a time string
    for (let i = 0; i < count; i++) {
      const text = await times.nth(i).textContent();
      expect(text).toMatch(/\d+:\d{2}/);
    }
  });

  test("page title contains Prayer Times and London", async ({ page }) => {
    await expect(page).toHaveTitle(/Prayer Times.*London|London.*Prayer Times/i);
  });

  test("location search is visible in compact mode on city page", async ({
    page,
  }) => {
    const compactSearch = page.locator('input[placeholder="Search city…"]');
    await expect(compactSearch).toBeVisible();
  });

  test("compact search navigates when a result is selected", async ({
    page,
  }) => {
    const compactSearch = page.locator('input[placeholder="Search city…"]');
    await compactSearch.fill("Cairo");

    await expect(page.locator(".search-dropdown")).toBeVisible({
      timeout: 5_000,
    });

    await page.locator(".search-dropdown-item").first().click();
    await page.waitForURL(/\/eg\//, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/eg\//);
  });

  test("JSON-LD structured data is present", async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);

    const content = await jsonLd.textContent();
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content!);
    expect(parsed["@type"]).toBe("WebPage");
    expect(parsed.about["@type"]).toBe("City");
  });

  test("PrayCalc home link navigates back to homepage", async ({ page }) => {
    const homeLink = page.locator('a[aria-label="PrayCalc home"]');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await page.waitForURL(/\/$|\?from=logo/, { timeout: 10_000 });
    // Should be back at root (with or without query param)
    expect(page.url()).toMatch(/\/(\?|$)/);
  });
});

test.describe("City page — Qibla compass", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("Qibla tile is visible and shows bearing", async ({ page }) => {
    const qiblaTile = page.locator(".ftile").filter({ hasText: "Qibla" });
    await expect(qiblaTile).toBeVisible();

    // Should show a bearing like "118.5° SE"
    const bearing = qiblaTile.locator(".ftile-bearing");
    await expect(bearing).toBeVisible();
    await expect(bearing).toContainText("°");
  });

  test("clicking Qibla tile opens QiblaModal", async ({ page }) => {
    const qiblaTile = page.locator(".ftile").filter({ hasText: "Qibla" });
    await qiblaTile.click();

    // QiblaModal should appear — it has a role=dialog or overlay
    // The modal is dynamically imported (next/dynamic) — wait for it
    const modal = page.locator('[role="dialog"]').filter({ hasText: /Qibla|Direction/i });
    await expect(modal).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("City page — monthly calendar", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("Monthly Table tile is visible", async ({ page }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await expect(monthlyTile).toBeVisible();
  });

  test("clicking Monthly Table tile opens calendar modal", async ({ page }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    // Calendar modal renders with role="dialog"
    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Modal title
    await expect(modal).toContainText("Monthly Prayer Times");
  });

  test("calendar modal shows period label and navigation buttons", async ({
    page,
  }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Period label (e.g. "Ramadan 1446 AH" or "March 2026")
    const periodLabel = modal.locator(".cal-period");
    await expect(periodLabel).toBeVisible();
    await expect(periodLabel).not.toBeEmpty();

    // Prev/Next navigation buttons
    await expect(modal.locator('[aria-label="Previous"]')).toBeVisible();
    await expect(modal.locator('[aria-label="Next"]')).toBeVisible();
  });

  test("calendar modal has Hijri and Standard mode buttons", async ({
    page,
  }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    await expect(modal.locator(".cal-mode-btn").filter({ hasText: "Hijri" })).toBeVisible();
    await expect(modal.locator(".cal-mode-btn").filter({ hasText: "Standard" })).toBeVisible();
  });

  test("calendar modal table loads prayer data", async ({ page }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Wait for loading to complete
    await expect(modal.locator(".cal-loading")).not.toBeVisible({ timeout: 15_000 });

    // Table should have rows with prayer times
    const rows = modal.locator(".cal-tr");
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(28); // All months have at least 28 days
  });

  test("calendar modal PDF download button is present", async ({ page }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Wait for data to load before PDF button becomes enabled
    await expect(modal.locator(".cal-loading")).not.toBeVisible({ timeout: 15_000 });

    const pdfBtn = modal.locator(".cal-pdf-btn").filter({ hasText: /Download PDF|PDF/ });
    await expect(pdfBtn).toBeVisible();
    await expect(pdfBtn).toBeEnabled();
  });

  test("calendar modal closes when clicking X button", async ({ page }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    await modal.locator('[aria-label="Close"]').click();
    await expect(modal).not.toBeVisible();
  });

  test("calendar modal closes with Escape key", async ({ page }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("switching to Standard calendar mode updates period label", async ({
    page,
  }) => {
    const monthlyTile = page.locator(".ftile").filter({ hasText: "Monthly" });
    await monthlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Default is Hijri — click Standard
    await modal.locator(".cal-mode-btn").filter({ hasText: "Standard" }).click();

    // Period label should now show a Gregorian month name (e.g. "March 2026")
    const periodLabel = modal.locator(".cal-period");
    await expect(periodLabel).not.toBeEmpty();
    // Should match a year number like 2025 or 2026
    const labelText = await periodLabel.textContent();
    expect(labelText).toMatch(/202\d/);
  });
});

test.describe("City page — yearly calendar", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
  });

  test("Yearly Calendar tile is visible", async ({ page }) => {
    const yearlyTile = page.locator(".ftile").filter({ hasText: "Yearly" });
    await expect(yearlyTile).toBeVisible();
  });

  test("clicking Yearly Calendar tile opens year overview modal", async ({
    page,
  }) => {
    const yearlyTile = page.locator(".ftile").filter({ hasText: "Yearly" });
    await yearlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    await expect(modal).toContainText("Yearly Prayer Calendar");

    // Year overview shows month cards
    const monthCards = modal.locator(".cal-year-month-card");
    await expect(monthCards).toHaveCount(12);
  });

  test("year overview has PDF download buttons", async ({ page }) => {
    const yearlyTile = page.locator(".ftile").filter({ hasText: "Yearly" });
    await yearlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Year overview footer has Year Calendar PDF and Booklet PDF buttons
    const footer = modal.locator(".cal-footer");
    await expect(footer.locator(".cal-pdf-btn").filter({ hasText: /Year Calendar PDF/ })).toBeVisible();
    await expect(footer.locator(".cal-pdf-btn").filter({ hasText: /Booklet PDF/ })).toBeVisible();
  });

  test("clicking a month card in year overview navigates to month-cal view", async ({
    page,
  }) => {
    const yearlyTile = page.locator(".ftile").filter({ hasText: "Yearly" });
    await yearlyTile.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Click the first month card
    const firstMonth = modal.locator(".cal-year-month-card").first();
    await firstMonth.click();

    // Should transition to month-cal view — wait for loading to settle
    await expect(modal.locator(".cal-loading")).not.toBeVisible({ timeout: 15_000 });

    // month-cal view has a grid
    const calGrid = modal.locator(".month-cal-grid");
    await expect(calGrid).toBeVisible({ timeout: 10_000 });
  });
});
