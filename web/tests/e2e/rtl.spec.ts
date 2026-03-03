import { test, expect, BrowserContext } from "@playwright/test";

/**
 * RTL visual regression tests for PrayCalc.
 *
 * Arabic (ar) and Urdu (ur) are RTL locales. The locale is stored in the
 * NEXT_LOCALE cookie — URLs never change (localePrefix: 'never').
 *
 * Tests verify:
 * - document.documentElement.dir === 'rtl' when NEXT_LOCALE=ar or ur
 * - document.documentElement.lang === 'ar' or 'ur' accordingly
 * - Arabic prayer names from messages/ar.json are visible in the DOM
 * - Default English locale produces dir=ltr
 * - Switching locale cookie mid-session updates direction on reload
 * - No horizontal overflow in RTL mode (viewport scroll check)
 */

const BIRMINGHAM_UK = "/gb/england/birmingham";

/** Helper — add NEXT_LOCALE cookie before navigation. */
async function setLocaleCookie(
  context: BrowserContext,
  locale: string
): Promise<void> {
  await context.addCookies([
    {
      name: "NEXT_LOCALE",
      value: locale,
      domain: "localhost",
      path: "/",
    },
  ]);
}

/** Helper — remove all NEXT_LOCALE cookies from context. */
async function clearLocaleCookie(context: BrowserContext): Promise<void> {
  await context.clearCookies({ name: "NEXT_LOCALE" });
}

// ---------------------------------------------------------------------------
// Arabic locale — homepage
// ---------------------------------------------------------------------------

test.describe("RTL layout — Arabic locale (homepage)", () => {
  test.beforeEach(async ({ context }) => {
    await setLocaleCookie(context, "ar");
  });

  test("html element has dir=rtl on homepage", async ({ page }) => {
    await page.goto("/");
    const dir = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(dir).toBe("rtl");
  });

  test("html element has lang=ar on homepage", async ({ page }) => {
    await page.goto("/");
    const lang = await page.evaluate(
      () => document.documentElement.lang
    );
    expect(lang).toBe("ar");
  });

  test("body contains at least one Arabic character on homepage", async ({
    page,
  }) => {
    await page.goto("/");
    // Arabic Unicode block: U+0600–U+06FF
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toMatch(/[\u0600-\u06FF]/);
  });

  test("no horizontal scroll in Arabic RTL mode on homepage", async ({
    page,
  }) => {
    await page.goto("/");
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Arabic locale — city page
// ---------------------------------------------------------------------------

test.describe("RTL layout — Arabic locale (city page)", () => {
  test.beforeEach(async ({ context, page }) => {
    await setLocaleCookie(context, "ar");
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
    });
  });

  test("html element has dir=rtl on Birmingham UK city page", async ({
    page,
  }) => {
    await page.goto(BIRMINGHAM_UK);
    const dir = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(dir).toBe("rtl");
  });

  test("html element has lang=ar on Birmingham UK city page", async ({
    page,
  }) => {
    await page.goto(BIRMINGHAM_UK);
    const lang = await page.evaluate(
      () => document.documentElement.lang
    );
    expect(lang).toBe("ar");
  });

  test("Arabic prayer name الفجر (Fajr) is visible on city page", async ({
    page,
  }) => {
    await page.goto(BIRMINGHAM_UK);
    // Wait for the prayer grid before asserting Arabic text
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
    // Fajr in Arabic
    await expect(page.getByText("الفجر")).toBeVisible();
  });

  test("Arabic prayer name الظهر (Dhuhr) is visible on city page", async ({
    page,
  }) => {
    await page.goto(BIRMINGHAM_UK);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
    // Dhuhr in Arabic
    await expect(page.getByText("الظهر")).toBeVisible();
  });

  test("Arabic prayer name المغرب (Maghrib) is visible on city page", async ({
    page,
  }) => {
    await page.goto(BIRMINGHAM_UK);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
    // Maghrib in Arabic
    await expect(page.getByText("المغرب")).toBeVisible();
  });

  test("no horizontal scroll in Arabic RTL mode on city page", async ({
    page,
  }) => {
    await page.goto(BIRMINGHAM_UK);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Urdu locale — homepage
// ---------------------------------------------------------------------------

test.describe("RTL layout — Urdu locale (homepage)", () => {
  test.beforeEach(async ({ context }) => {
    await setLocaleCookie(context, "ur");
  });

  test("html element has dir=rtl on homepage with NEXT_LOCALE=ur", async ({
    page,
  }) => {
    await page.goto("/");
    const dir = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(dir).toBe("rtl");
  });

  test("html element has lang=ur on homepage with NEXT_LOCALE=ur", async ({
    page,
  }) => {
    await page.goto("/");
    const lang = await page.evaluate(
      () => document.documentElement.lang
    );
    expect(lang).toBe("ur");
  });
});

// ---------------------------------------------------------------------------
// Default English locale — no cookie
// ---------------------------------------------------------------------------

test.describe("LTR layout — English locale (default, no cookie)", () => {
  test("html element has dir=ltr when no NEXT_LOCALE cookie is set", async ({
    page,
  }) => {
    // No cookie set — rely on default locale detection (en)
    await page.goto("/");
    const dir = await page.evaluate(
      () => document.documentElement.dir
    );
    // In LTR the browser may return 'ltr' explicitly or an empty string.
    // Both are valid representations of left-to-right direction.
    expect(["ltr", ""]).toContain(dir);
  });

  test("html element has lang=en when no NEXT_LOCALE cookie is set", async ({
    page,
  }) => {
    await page.goto("/");
    const lang = await page.evaluate(
      () => document.documentElement.lang
    );
    expect(lang).toBe("en");
  });
});

// ---------------------------------------------------------------------------
// Locale switching — ar → en cookie change
// ---------------------------------------------------------------------------

test.describe("Locale switching — Arabic to English", () => {
  test("switching from ar to en cookie produces dir=ltr on reload", async ({
    context,
    page,
  }) => {
    // Step 1 — set Arabic cookie, confirm RTL
    await setLocaleCookie(context, "ar");
    await page.goto("/");
    const dirRtl = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(dirRtl).toBe("rtl");

    // Step 2 — clear Arabic cookie, set English cookie
    await clearLocaleCookie(context);
    await setLocaleCookie(context, "en");

    // Step 3 — reload and confirm LTR
    await page.goto("/");
    const dirLtr = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(["ltr", ""]).toContain(dirLtr);
  });

  test("switching from en to ar cookie produces dir=rtl on reload", async ({
    context,
    page,
  }) => {
    // Step 1 — English (default)
    await setLocaleCookie(context, "en");
    await page.goto("/");
    const dirLtr = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(["ltr", ""]).toContain(dirLtr);

    // Step 2 — switch to Arabic
    await clearLocaleCookie(context);
    await setLocaleCookie(context, "ar");

    // Step 3 — reload and confirm RTL
    await page.goto("/");
    const dirRtl = await page.evaluate(
      () => document.documentElement.dir
    );
    expect(dirRtl).toBe("rtl");
  });
});
