import { spawnSync } from "node:child_process";

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  process.env.NOW_REGION !== undefined;
const isCI = process.env.CI === "1" || process.env.CI === "true";
const shouldInstall =
  process.env.INSTALL_PLAYWRIGHT_BROWSERS === "1" ||
  process.env.INSTALL_PLAYWRIGHT_BROWSERS === "true";

// Never download Playwright browsers in Vercel deploy pipelines.
// If you need them (e.g. visual regression runs), set INSTALL_PLAYWRIGHT_BROWSERS=1
// explicitly in the environment where tests are executed.
if (isVercel || isCI || !shouldInstall) {
  process.exit(0);
}

if (
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "1" ||
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "true"
) {
  process.exit(0);
}

// Install only Chromium to keep the download smaller.
const result = spawnSync("npx", ["playwright", "install", "chromium"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
