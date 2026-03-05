import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for PrayCalc.
 *
 * baseURL: override with BASE_URL env var for CI/staging environments.
 * Example: BASE_URL=https://staging.praycalc.com pnpm test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Mock geolocation for all tests to prevent browser GPS prompts
    geolocation: { latitude: 51.5074, longitude: -0.1278 },
    permissions: ["geolocation"],
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start the server automatically.
  // In CI: use `pnpm start` (production build, already compiled by the build step).
  // Locally: use `pnpm dev` and reuse an already-running server.
  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
