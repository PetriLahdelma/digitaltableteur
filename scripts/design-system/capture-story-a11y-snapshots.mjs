#!/usr/bin/env node
/**
 * Capture aria snapshots for specific Storybook story IDs.
 * Usage: node scripts/design-system/capture-story-a11y-snapshots.mjs molecules-modal--error-dialog
 */
import { chromium } from "@playwright/test";
import { captureStoryAccessibilityTree } from "./a11y-snapshot-capture-lib.mjs";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6010";
const THEME = process.env.DT_THEME ?? "";
const FORCED_COLORS = (process.env.DT_FORCED_COLORS ?? "").toLowerCase();
const NAVIGATION_WAIT_UNTIL = resolveNavigationWaitUntil(
  process.env.STORYBOOK_WAIT_UNTIL,
);
const NAVIGATION_TIMEOUT_MS = Number.parseInt(
  process.env.STORYBOOK_NAVIGATION_TIMEOUT_MS ?? "120000",
  10,
);

const storyIds = process.argv.slice(2);
if (!storyIds.length) {
  console.error("Usage: capture-story-a11y-snapshots.mjs <story-id> [...]");
  process.exit(1);
}

let storyPrefixToDir = null;

function resolveNavigationWaitUntil(value) {
  if (
    value === "commit" ||
    value === "domcontentloaded" ||
    value === "load" ||
    value === "networkidle"
  ) {
    return value;
  }
  return "load";
}

/**
 * Map story id -> component directory, from Storybook's own index.
 *
 * Kept deliberately identical to the resolver in `.storybook/test-runner.ts`;
 * see the long comment there for the four silent-failure classes that scraping
 * `title:` out of story sources produced (nested dirs, the missing `templates/`
 * root, a second component sharing a directory, and an arg `title:` containing
 * a slash hijacking the meta title). `importPath` makes the directory a fact.
 *
 * A capture tool that resolves the wrong directory is worse than one that
 * fails, so an unresolvable story id still throws at the call site below.
 */
async function loadStoryDirMap() {
  if (storyPrefixToDir) return storyPrefixToDir;
  const res = await fetch(new URL("index.json", STORYBOOK_URL).toString());
  if (!res.ok) {
    throw new Error(`Storybook index fetch failed: ${res.status} ${res.statusText}`);
  }
  const index = await res.json();
  const map = new Map();
  const dirHasContract = new Map();

  for (const [id, entry] of Object.entries(index.entries ?? {})) {
    if (!entry.importPath) continue;
    const dir = dirname(join(ROOT, entry.importPath));
    let hasContract = dirHasContract.get(dir);
    if (hasContract === undefined) {
      hasContract =
        existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(".contract.json"));
      dirHasContract.set(dir, hasContract);
    }
    if (hasContract) map.set(id, dir);
  }
  storyPrefixToDir = map;
  return storyPrefixToDir;
}

function snapshotVariantSuffix() {
  const parts = [];
  if (THEME) parts.push(THEME);
  if (FORCED_COLORS === "active") parts.push("forced-colors");
  return parts.length > 0 ? `.${parts.join(".")}` : "";
}

async function componentSnapshotDir(storyId) {
  const componentDir = (await loadStoryDirMap()).get(storyId);
  if (!componentDir) throw new Error(`No component dir for story ${storyId}`);
  return join(componentDir, "__a11y-snapshots__");
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

if (FORCED_COLORS === "active") {
  await page.emulateMedia({ forcedColors: "active" });
}

if (THEME) {
  await page.addInitScript((theme) => {
    try {
      window.localStorage.setItem("storybook-theme", theme);
      window.localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, THEME);
}

for (const storyId of storyIds) {
  const url = `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, {
    waitUntil: NAVIGATION_WAIT_UNTIL,
    timeout: Number.isFinite(NAVIGATION_TIMEOUT_MS)
      ? NAVIGATION_TIMEOUT_MS
      : 120000,
  });
  await page.waitForTimeout(800);

  const dir = await componentSnapshotDir(storyId);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${storyId}${snapshotVariantSuffix()}.yaml`);
  const content = await captureStoryAccessibilityTree(page);
  writeFileSync(file, content);
  console.log(`wrote ${file}`);
}

await browser.close();
