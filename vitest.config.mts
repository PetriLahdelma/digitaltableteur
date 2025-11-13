import { defineConfig } from "vitest/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    include: ["src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/setupTests.ts",
        "src/reportWebVitals.ts",
        "src/pages/posts/**/*.tsx",
        "src/pages/work/**/*.tsx",
        "src/pages/CookiePolicy-*.tsx",
        "src/pages/AiUsage.tsx",
        "src/pages/UnderDevelopment.tsx",
        "src/components/*/index.ts",
        "src/App.tsx",
      ],
      thresholds: {
        statements: 65,
        branches: 75,
        functions: 65,
        lines: 65,
      },
    },
  },
  resolve: {
    alias: {
      "@dt": resolve(__dirname, "src/components"),
    },
  },
});
