import { test, expect } from "@playwright/test";

/**
 * Account page E2E tests.
 *
 * Covers:
 *   - Sign-in form visible when not authenticated
 *   - Password form: fill + submit → dashboard visible
 *   - Dashboard shows correct display name and email
 *   - Owner badge visible for alisalaah@gmail.com
 *   - Sign-out returns to sign-in form
 *   - Session persists across page reload
 *   - Settings gear on city page hides display toggles when signed in
 *   - Settings gear on city page shows "Manage in Account →" when signed in
 */

const LONDON = "/gb/england/london";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Inject a session into localStorage before the page loads. */
function seedSession(
  email: string,
  displayName: string,
  isOwner = false,
  isUmmatPlus = false,
) {
  return () => {
    const initials = (() => {
      const parts = displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    })();
    localStorage.setItem(
      "praycalc-session",
      JSON.stringify({ email, displayName, initials, isOwner, isUmmatPlus }),
    );
  };
}

/** Clear any existing session before the page loads. */
function clearSession() {
  return () => {
    localStorage.removeItem("praycalc-session");
  };
}

// ---------------------------------------------------------------------------
// Sign-in form (not authenticated)
// ---------------------------------------------------------------------------

test.describe("Account page — not signed in", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(clearSession());
    await page.goto("/account");
  });

  test("shows the account card", async ({ page }) => {
    await expect(page.locator(".account-card")).toBeVisible();
  });

  test("shows the Sign In heading", async ({ page }) => {
    await expect(page.locator(".account-heading")).toBeVisible();
    await expect(page.locator(".account-heading")).toContainText("Sign in");
  });

  test("shows email and password inputs", async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("submit button is disabled when inputs are empty", async ({ page }) => {
    const btn = page.locator(".account-submit-btn");
    await expect(btn).toBeDisabled();
  });

  test("submit button is enabled with valid email + password", async ({
    page,
  }) => {
    await page.locator('input[type="email"]').fill("user@test.com");
    await page.locator('input[type="password"]').fill("secret");
    await expect(page.locator(".account-submit-btn")).toBeEnabled();
  });

  test("shows social login row with four providers", async ({ page }) => {
    const socialRow = page.locator(".account-social-row");
    await expect(socialRow).toBeVisible();
    const btns = socialRow.locator(".account-social-btn");
    await expect(btns).toHaveCount(4);
  });

  test("shows a Back Home link", async ({ page }) => {
    await expect(page.locator(".account-back")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Password sign-in flow
// ---------------------------------------------------------------------------

test.describe("Account page — password sign-in", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(clearSession());
    await page.goto("/account");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("signing in shows the dashboard", async ({ page }) => {
    await page.locator('input[type="email"]').fill("testuser@example.com");
    await page.locator('input[type="password"]').fill("anypassword");
    await page.locator(".account-submit-btn").click();

    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("dashboard shows the display name derived from email", async ({
    page,
  }) => {
    await page.locator('input[type="email"]').fill("john.doe@example.com");
    await page.locator('input[type="password"]').fill("anypassword");
    await page.locator(".account-submit-btn").click();

    await expect(page.locator(".dashboard-display-name")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator(".dashboard-display-name")).toContainText(
      "john doe",
    );
  });

  test("dashboard shows the email", async ({ page }) => {
    await page.locator('input[type="email"]').fill("hello@example.com");
    await page.locator('input[type="password"]').fill("anypassword");
    await page.locator(".account-submit-btn").click();

    await expect(page.locator(".dashboard-email")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator(".dashboard-email")).toContainText(
      "hello@example.com",
    );
  });

  test("sign-out returns to sign-in form", async ({ page }) => {
    await page.locator('input[type="email"]').fill("user@test.com");
    await page.locator('input[type="password"]').fill("anything");
    await page.locator(".account-submit-btn").click();

    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });

    await page.locator(".dashboard-signout-btn").click();

    await expect(page.locator(".account-heading")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(".account-heading")).toContainText("Sign in");
  });
});

// ---------------------------------------------------------------------------
// Pre-seeded session (simulates returning user)
// ---------------------------------------------------------------------------

test.describe("Account page — returning user (session seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      seedSession("returning@example.com", "Returning User"),
    );
    await page.goto("/account");
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("shows dashboard immediately (no sign-in form)", async ({ page }) => {
    await expect(page.locator(".account-card")).not.toBeVisible();
    await expect(page.locator(".dashboard-profile-card")).toBeVisible();
  });

  test("shows correct display name", async ({ page }) => {
    await expect(page.locator(".dashboard-display-name")).toContainText(
      "Returning User",
    );
  });

  test("shows correct email", async ({ page }) => {
    await expect(page.locator(".dashboard-email")).toContainText(
      "returning@example.com",
    );
  });

  test("dashboard has Account Settings card", async ({ page }) => {
    const cards = page.locator(".dashboard-card");
    await expect(cards.first()).toBeVisible();
    // The first card should contain settings toggles
    await expect(cards.first()).toContainText("Account Settings");
  });

  test("sign-out clears session from localStorage", async ({ page }) => {
    await page.locator(".dashboard-signout-btn").click();

    // After sign-out, sign-in form visible again
    await expect(page.locator(".account-heading")).toBeVisible({ timeout: 5_000 });

    // Reload to confirm session is gone
    await page.reload();
    await expect(page.locator(".account-heading")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(".account-heading")).toContainText("Sign in");
  });
});

// ---------------------------------------------------------------------------
// Owner session
// ---------------------------------------------------------------------------

test.describe("Account page — owner session", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      seedSession("alisalaah@gmail.com", "Ali Salaah", true, true),
    );
    await page.goto("/account");
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("shows Owner badge", async ({ page }) => {
    await expect(page.locator(".dashboard-owner-badge")).toBeVisible();
  });

  test("does not show Ummat+ upsell card (owner is already Ummat+)", async ({
    page,
  }) => {
    await expect(page.locator(".dashboard-plus-card")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Non-owner standard user — Ummat+ upsell
// ---------------------------------------------------------------------------

test.describe("Account page — standard user (Ummat+ upsell)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      seedSession("standard@example.com", "Standard User", false, false),
    );
    await page.goto("/account");
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("does not show Owner badge", async ({ page }) => {
    await expect(page.locator(".dashboard-owner-badge")).not.toBeVisible();
  });

  test("shows Ummat+ upsell card", async ({ page }) => {
    await expect(page.locator(".dashboard-plus-card")).toBeVisible();
  });

  test("Ummat+ upsell card shows the price", async ({ page }) => {
    await expect(page.locator(".dashboard-plus-price")).toBeVisible();
    await expect(page.locator(".dashboard-plus-price")).toContainText("$9.99");
  });
});

// ---------------------------------------------------------------------------
// Session persists across reload
// ---------------------------------------------------------------------------

test.describe("Account page — session persistence", () => {
  test("session persists across page reload", async ({ page }) => {
    await page.addInitScript(clearSession());
    await page.goto("/account");

    // Sign in
    await page.locator('input[type="email"]').fill("persist@test.com");
    await page.locator('input[type="password"]').fill("anything");
    await page.locator(".account-submit-btn").click();
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });

    // Reload
    await page.reload();
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator(".dashboard-display-name")).toContainText(
      "persist",
    );
  });
});

// ---------------------------------------------------------------------------
// City page — settings gear when signed in
// ---------------------------------------------------------------------------

test.describe("Settings gear — signed-in state on city page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pc_geo_prompt_dismissed", "1");
      localStorage.removeItem("pc_settings");
      localStorage.setItem(
        "praycalc-session",
        JSON.stringify({
          email: "user@test.com",
          displayName: "Test User",
          initials: "TU",
          isOwner: false,
          isUmmatPlus: false,
        }),
      );
    });
    await page.goto(LONDON);
    await expect(page.locator(".prayer-grid")).toBeVisible({ timeout: 15_000 });
    await page.locator(".settings-gear-btn").click();
    await expect(page.locator(".settings-panel")).toBeVisible();
  });

  test("display toggles are hidden when signed in", async ({ page }) => {
    const panel = page.locator(".settings-panel");
    // These toggle rows should NOT appear when logged in
    await expect(panel.locator(".settings-row").filter({ hasText: "Light Mode" })).not.toBeVisible();
    await expect(panel.locator(".settings-row").filter({ hasText: "Hanafi Asr" })).not.toBeVisible();
    await expect(panel.locator(".settings-row").filter({ hasText: "24-hour" })).not.toBeVisible();
    await expect(panel.locator(".settings-row").filter({ hasText: "Countdown" })).not.toBeVisible();
    await expect(panel.locator(".settings-row").filter({ hasText: "Show Qiyam" })).not.toBeVisible();
  });

  test("shows Account Settings row with Manage link", async ({ page }) => {
    const panel = page.locator(".settings-panel");
    await expect(panel.locator(".settings-manage-link")).toBeVisible();
    await expect(panel.locator(".settings-manage-link")).toContainText(
      "Manage",
    );
  });

  test("shows user name in the auth button", async ({ page }) => {
    const panel = page.locator(".settings-panel");
    await expect(panel.locator(".settings-auth-btn--account")).toContainText(
      "Test User",
    );
  });

  test("shows sign-out link", async ({ page }) => {
    const panel = page.locator(".settings-panel");
    await expect(panel.locator(".settings-signout-link")).toBeVisible();
  });

  test("notification and Home City sections are still visible", async ({
    page,
  }) => {
    const panel = page.locator(".settings-panel");
    await expect(panel).toContainText("Notification");
    await expect(panel).toContainText("Home City");
  });
});
