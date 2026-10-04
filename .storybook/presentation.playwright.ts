import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "presentation.spec.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 1,
  outputDir: "../test-results/storybook-presentation",
  reporter: "list",
  use: {
    baseURL:
      process.env.STORYBOOK_PREVIEW_URL || "http://127.0.0.1:6020/storybook/",
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  },
});
