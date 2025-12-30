import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  process.env.NOW_REGION !== undefined;
const isCI = process.env.CI === "1" || process.env.CI === "true";
const shouldSkipStorybookTests =
  // Vercel deploy builds shouldn't run Storybook/Vitest addon projects.
  // They rely on Storybook config + (optionally) Playwright browsers, and are
  // both slow and flaky in that environment.
  isVercel ||
  isCI ||
  process.env.SKIP_STORYBOOK_TESTS === "1" ||
  process.env.SKIP_STORYBOOK_TESTS === "true";
const shouldEnableStorybookBrowserTests =
  process.env.DISABLE_STORYBOOK_BROWSER_TESTS !== "1" &&
  process.env.DISABLE_STORYBOOK_BROWSER_TESTS !== "true";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@testing-library/jest-dom",
      "@testing-library/react",
      "jest-axe",
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    include: [
      "shared/components/**/*.test.{ts,tsx}",
      "app/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "nextjs-app/shared/components/**/*.test.{ts,tsx}",
      "nextjs-app/shared/patterns/**/*.test.{ts,tsx}",
      "nextjs-app/shared/utils/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src-legacy-vite-DO-NOT-USE/**",
      "vite-app/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "shared/components/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "nextjs-app/shared/components/**/*.{ts,tsx}",
        "nextjs-app/shared/patterns/**/*.{ts,tsx}",
        "nextjs-app/shared/utils/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.stories.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/index.{ts,tsx}",
        "src-legacy-vite-DO-NOT-USE/**",
        "vite-app/**",
      ],
    },
    projects: shouldSkipStorybookTests
      ? undefined
      : [
          {
            extends: true,
            plugins: [
              // The plugin will run tests for the stories defined in your Storybook config
              // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
              storybookTest({
                configDir: path.join(dirname, ".storybook"),
                // Disable tags to avoid import.meta.env issues in browser mode
                tags: {
                  skip: [],
                },
              }),
            ],
            test: {
              name: "storybook",
              browser: {
                enabled: shouldEnableStorybookBrowserTests,
                ...(shouldEnableStorybookBrowserTests
                  ? {
                      headless: true,
                      provider: playwright({}),
                      instances: [
                        {
                          browser: "chromium",
                        },
                      ],
                    }
                  : {}),
              },
              setupFiles: [".storybook/vitest.setup.ts"],
              // Prevent import.meta.env cloning issues
              isolate: false,
              // Don't specify include here - let Storybook plugin handle story discovery
            },
          },
        ],
  },
  resolve: {
    alias: {
      "@dt": resolve(dirname, "nextjs-app/shared/components"),
      "@dt-pages": resolve(dirname, "nextjs-app/shared/components/pages"),
      "@": resolve(dirname, "."),
    },
  },
});
