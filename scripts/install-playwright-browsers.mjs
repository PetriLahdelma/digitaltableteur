import { spawnSync } from "node:child_process";

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true" ||
  process.env.NOW_REGION !== undefined;

if (!isVercel) {
  process.exit(0);
}

if (
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "1" ||
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "true"
) {
  process.exit(0);
}

// Vitest's Playwright provider needs Playwright browsers present on Vercel.
// Install only Chromium to keep the download smaller.
const result = spawnSync("npx", ["playwright", "install", "chromium"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);

