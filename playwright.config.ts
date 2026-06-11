import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for page-level accessibility testing
 * Uses @axe-core/playwright to audit all public pages against WCAG 2.1 AA
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/a11y",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }]],
  timeout: 30000, // 30 seconds per test (axe scans can be slow)
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "a11y",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Revenue-critical user journeys and API contracts (chat, contact,
      // CV download, GDPR). Run with: npx playwright test --project=e2e
      name: "e2e",
      testDir: "./e2e",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
