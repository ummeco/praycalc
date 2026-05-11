import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: [
      "node_modules/**",
      ".next/**",
      "tests/e2e/**",
    ],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "hooks/**/*.ts"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "data/**",
        "tests/**",
        // Server-only files that require Next.js runtime — not testable in jsdom
        "lib/geo-server.ts",
        "lib/data-lookup.ts",
        // Browser geolocation API — requires navigator.geolocation not in jsdom
        "lib/geo.ts",
        // Large prayer calculation engine — server-side only via pray-calc package
        "lib/prayers.ts",
        // Large month-calendar generator — tested indirectly; excluded from threshold
        "lib/prayer-calendar.ts",
        // Audio/Web Audio API hook — requires AudioContext not available in jsdom
        "hooks/useAdhan.ts",
      ],
      reporter: ["text", "json", "html", "lcov"],
      // P7 Q-TEST T01 baseline thresholds (80/80/75/80, perFile).
      // Billing-touching files (Sprint 6 IAP scaffold) get T02 critical-path enforcement
      // via include-narrowing + dedicated coverage:critical script when they land.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: true,
      },
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
