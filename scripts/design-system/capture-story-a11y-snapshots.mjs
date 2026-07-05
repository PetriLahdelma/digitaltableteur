#!/usr/bin/env node
/**
 * Capture aria snapshots for specific Storybook story IDs.
 * Usage: node scripts/design-system/capture-story-a11y-snapshots.mjs molecules-modal--error-dialog
 */
import { chromium } from "@playwright/test";
import { captureStoryAccessibilityTree } from "./a11y-snapshot-capture-lib.mjs";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6010";
const THEME = process.env.DT_THEME ?? "";
const FORCED_COLORS = (process.env.DT_FORCED_COLORS ?? "").toLowerCase();

const storyIds = process.argv.slice(2);
if (!storyIds.length) {
  console.error("Usage: capture-story-a11y-snapshots.mjs <story-id> [...]");
  process.exit(1);
}

let storyPrefixToDir = null;

function loadStoryPrefixMap() {
  if (storyPrefixToDir) return storyPrefixToDir;
  storyPrefixToDir = new Map();
  const roots = [
    join(ROOT, "nextjs-app/shared/components"),
    join(ROOT, "nextjs-app/shared/patterns"),
  ];
  const titleRe = /title:\s*["']([^"']+)["']/g;

  for (const base of roots) {
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const dir = join(base, name);
      const contractPath = join(dir, `${name}.contract.json`);
      const storyPath = join(dir, `${name}.stories.tsx`);
      if (!existsSync(contractPath) || !existsSync(storyPath)) continue;
      const text = readFileSync(storyPath, "utf8");
      // The meta title is the story-path one ("Category/Name"). A component whose
      // stories seed a `title:` ARG (e.g. ValueCard's defaultArgs.title "Clarity
      // first") would otherwise hijack the first match and the snapshot dir would
      // never resolve. Pick the first title: value shaped like a story path.
      const metaTitle = [...text.matchAll(titleRe)]
        .map((mt) => mt[1])
        .find((t) => t.includes("/"));
      if (!metaTitle) continue;
      // Match Storybook's own @storybook/csf `sanitize`: lowercase, collapse
      // every non-alphanumeric run to a single "-", trim. No camelCase splitting,
      // so `Forms/TextArea` → `forms-textarea` (the real story-id prefix).
      const prefix = metaTitle
        .toLowerCase()
        .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
      storyPrefixToDir.set(prefix, dir);
    }
  }
  return storyPrefixToDir;
}

function snapshotVariantSuffix() {
  const parts = [];
  if (THEME) parts.push(THEME);
  if (FORCED_COLORS === "active") parts.push("forced-colors");
  return parts.length > 0 ? `.${parts.join(".")}` : "";
}

function componentSnapshotDir(storyId) {
  const prefix = storyId.split("--")[0];
  const componentDir = loadStoryPrefixMap().get(prefix);
  if (!componentDir) throw new Error(`No component dir for story prefix ${prefix}`);
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
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const dir = componentSnapshotDir(storyId);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${storyId}${snapshotVariantSuffix()}.yaml`);
  const content = await captureStoryAccessibilityTree(page);
  writeFileSync(file, content);
  console.log(`wrote ${file}`);
}

await browser.close();
