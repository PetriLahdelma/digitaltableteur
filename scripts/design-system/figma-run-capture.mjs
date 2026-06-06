#!/usr/bin/env node
/**
 * Open a route capture in Playwright Chromium at 1728px viewport.
 * Do NOT use the Cursor IDE browser (~538px) — layouts will be wrong.
 *
 * Prereqs: npm run dev:figma-capture (FIGMA_HTML_CAPTURE=1 on :3001)
 *
 * Usage:
 *   npm run figma:run-capture -- --route work --capture-id <uuid>
 *
 * After the page loads, poll generate_figma_design MCP with the same captureId.
 */
import { chromium } from "playwright";
import {
  buildCaptureUrl,
  CAPTURE_DELAY_MS,
  CAPTURE_VIEWPORT_HEIGHT,
  CAPTURE_VIEWPORT_WIDTH,
  resolveRoute,
} from "./figma-html-capture-lib.mjs";

function parseArgs() {
  const routeIdx = process.argv.indexOf("--route");
  const captureIdx = process.argv.indexOf("--capture-id");
  const routeKey = routeIdx >= 0 ? process.argv[routeIdx + 1] : undefined;
  const captureId = captureIdx >= 0 ? process.argv[captureIdx + 1] : undefined;
  if (!routeKey || !captureId) {
    console.error(
      "Usage: npm run figma:run-capture -- --route <key> --capture-id <uuid>",
    );
    process.exit(1);
  }
  return { routeKey, captureId };
}

async function main() {
  const { routeKey, captureId } = parseArgs();
  const route = resolveRoute(routeKey);
  const url = buildCaptureUrl(route.path, captureId);

  console.log(`Capture viewport: ${CAPTURE_VIEWPORT_WIDTH}×${CAPTURE_VIEWPORT_HEIGHT}px`);
  console.log(`Route: ${routeKey} (${route.label})`);
  console.log(`URL: ${url}\n`);

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: CAPTURE_VIEWPORT_WIDTH,
        height: CAPTURE_VIEWPORT_HEIGHT,
      },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });

    const waitMs = CAPTURE_DELAY_MS + 2000;
    console.log(`Waiting ${waitMs}ms for html-to-design capture…`);
    await page.waitForTimeout(waitMs);

    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`Document innerWidth: ${innerWidth}px`);
    if (innerWidth !== CAPTURE_VIEWPORT_WIDTH) {
      console.warn(
        `Warning: innerWidth ${innerWidth} !== target ${CAPTURE_VIEWPORT_WIDTH}. Check browser zoom and dev server.`,
      );
    }
    console.log(
      "\nCapture submitted. Poll generate_figma_design with this captureId until completed.",
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
