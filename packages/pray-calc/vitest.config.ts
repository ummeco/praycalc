import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      include: ["src/algorithms/**/*.ts"],
      exclude: ["src/types/**"],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 70,
        statements: 95,
      },
      reporter: ["text", "lcov"],
    },
  },
});
