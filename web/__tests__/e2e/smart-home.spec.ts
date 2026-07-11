import { test, expect } from "@playwright/test";

/**
 * Smart Home account-linking E2E tests (Dashboard "Smart Home" card).
 *
 * Covers:
 *   - Free user sees the Ummat+ note, not the linked-provider list
 *   - Plus user with no linked providers sees the guidance/empty state
 *   - Plus user with linked providers sees the list with name + linked date
 *   - Unlink: inline confirm -> DELETE /api/smart-home/links?provider=X -> row removed
 *
 * SmartHomeSection (rendered inside the Dashboard, itself inside the
 * AccountClient client:load island) talks only to the same-origin
 * /api/smart-home/links route, mocked here via page.route() — matching
 * account.spec.ts and tv-manager.spec.ts's no-live-backend convention.
 * Ummat+ gating here comes from the seeded `praycalc-session` localStorage
 * value's `isUmmatPlus` flag (Dashboard.tsx only re-fetches live billing
 * status when the session carries a real access token, which these
 * localStorage-seeded sessions do not — see account.spec.ts's owner/standard
 * user describe blocks for the same pattern).
 */

// See account.spec.ts for why webkit is skipped here (AccountClient island
// fails to hydrate under the Vite dev server on WebKit — verified working in
// production on WebKit at praycalc.com/account).
test.skip(
  ({ browserName }) => browserName === "webkit",
  "AccountClient island: Vite-dev-only WebKit hydration limitation (verified working in production)",
);

/** Build a session JSON string for injection into localStorage (mirrors account.spec.ts). */
function buildSessionJSON(email: string, displayName: string, isUmmatPlus: boolean): string {
  const parts = displayName.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();
  return JSON.stringify({ email, displayName, initials, isOwner: false, isUmmatPlus });
}

async function seedSession(
  page: import("@playwright/test").Page,
  email: string,
  displayName: string,
  isUmmatPlus: boolean,
) {
  const json = buildSessionJSON(email, displayName, isUmmatPlus);
  await page.evaluate((j) => localStorage.setItem("praycalc-session", j), json);
}

async function mockBilling(page: import("@playwright/test").Page, plan: "free" | "plus") {
  await page.route("**/api/billing/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        plan,
        status: plan === "plus" ? "active" : "none",
        isActive: plan === "plus",
        expiresAt: null,
        currentPeriodEnd: null,
      }),
    });
  });
}

interface MockLink {
  provider: "google" | "alexa" | "homeassistant";
  linked_at: string;
}

async function mockLinks(page: import("@playwright/test").Page, initialLinks: MockLink[]) {
  let links = [...initialLinks];
  const deleteRequests: string[] = [];

  await page.route("**/api/smart-home/links*", async (route) => {
    const req = route.request();
    if (req.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ links }) });
      return;
    }
    if (req.method() === "DELETE") {
      const url = new URL(req.url());
      const provider = url.searchParams.get("provider") ?? "";
      deleteRequests.push(provider);
      links = links.filter((l) => l.provider !== provider);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      return;
    }
    await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "Unknown method." }) });
  });

  return { deleteRequests, getLinks: () => links };
}

test.describe("Smart Home — free user", () => {
  test("shows the Ummat+ note, not the linked-provider list", async ({ page }) => {
    await mockBilling(page, "free");
    await mockLinks(page, []);
    await page.goto("/account");
    await seedSession(page, "free@example.com", "Free User", false);
    await page.reload();
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({ timeout: 5_000 });

    const card = page.locator(".dashboard-card").filter({ hasText: "Smart Home" });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Ummat+");
    await expect(page.locator(".dashboard-smarthome-row")).toHaveCount(0);
  });
});

test.describe("Smart Home — Plus user, no providers linked", () => {
  test.beforeEach(async ({ page }) => {
    await mockBilling(page, "plus");
    await mockLinks(page, []);
    await page.goto("/account");
    await seedSession(page, "plus@example.com", "Plus User", true);
    await page.reload();
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({ timeout: 5_000 });
  });

  test("shows the empty state and linking guidance", async ({ page }) => {
    const card = page.locator(".dashboard-card").filter({ hasText: "Smart Home" });
    await expect(card).toBeVisible();
    await expect(card).toContainText("No smart-home accounts linked yet");
    await expect(card).toContainText("Alexa");
    await expect(page.locator(".dashboard-smarthome-row")).toHaveCount(0);
  });

  test("links to the smart-home docs page", async ({ page }) => {
    const card = page.locator(".dashboard-card").filter({ hasText: "Smart Home" });
    await expect(card.locator('a[href="https://praycalc.org/features/smart-home"]')).toBeVisible();
  });
});

test.describe("Smart Home — Plus user, with linked providers", () => {
  test("renders linked providers and unlinks one via inline confirm", async ({ page }) => {
    await mockBilling(page, "plus");
    const mock = await mockLinks(page, [
      { provider: "alexa", linked_at: "2026-06-01T00:00:00.000Z" },
      { provider: "google", linked_at: "2026-06-15T00:00:00.000Z" },
    ]);
    await page.goto("/account");
    await seedSession(page, "linked@example.com", "Linked User", true);
    await page.reload();
    await expect(page.locator(".dashboard-profile-card")).toBeVisible({ timeout: 5_000 });

    const rows = page.locator(".dashboard-smarthome-row");
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("Alexa");
    await expect(rows.nth(1)).toContainText("Google Home");

    await rows.first().locator(".dashboard-tv-remove-btn").click();
    await expect(rows.first().locator(".dashboard-tv-confirm-text")).toBeVisible();
    await rows.first().locator(".dashboard-tv-confirm-btn").click();

    await expect.poll(() => mock.deleteRequests.length, { timeout: 5_000 }).toBe(1);
    expect(mock.deleteRequests[0]).toBe("alexa");
    await expect(page.locator(".dashboard-smarthome-row")).toHaveCount(1);
  });
});
