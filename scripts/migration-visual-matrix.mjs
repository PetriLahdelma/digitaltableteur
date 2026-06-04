#!/usr/bin/env node
/**
 * Visual + layout guards for shadcn → @dt migration touchpoints.
 * Matrix: themes (light, dark, hcb, hcw) × viewports (desktop, mobile).
 *
 * Usage:
 *   npm run test:migration:visual
 *   npm run test:migration:visual -- --update   # refresh PNG baselines
 *
 * Requires Storybook (6010) and Next dev (3000) unless URLs overridden.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SNAPSHOT_DIR = path.join(ROOT, "__visual__", "snapshots", "migration-matrix");
const REPORT_PATH = path.join(ROOT, "public", "visual-diff", "migration-matrix-report.json");

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6010";
const APP_URL = process.env.APP_URL ?? "http://localhost:3001";
const SKIP_APP = process.env.MIGRATION_VISUAL_SKIP_APP === "1";
const UPDATE = process.argv.includes("--update");
const THRESHOLD = 0.005;

const THEMES = ["light", "dark", "hcb", "hcw"];
const VIEWPORTS = [
  { id: "desktop", width: 1280, height: 720 },
  { id: "mobile", width: 390, height: 844 },
];

/** Storybook story ids for migrated surfaces */
const STORIES = [
  { id: "patterns-siteheader--example", label: "SiteHeader", region: "#storybook-root header, #storybook-root [role=banner]" },
  { id: "atoms-iconbutton--example", label: "IconButton" },
  { id: "molecules-formfield--example", label: "FormField" },
  { id: "molecules-checkboxfield--example", label: "CheckboxField" },
  { id: "organisms-contactformeditorial--example", label: "ContactFormEditorial" },
  { id: "atoms-button-surface-comparison--cta-bands", label: "ButtonSurfaceCtaBands" },
  { id: "atoms-button-surface-comparison--home-hero-band", label: "ButtonSurfaceHomeHero" },
];

const PAGES = [
  { path: "/", label: "home", region: "header" },
  { path: "/contact", label: "contact", region: "main form, main [class*=contact], main" },
];

/** EN / FI / SV menu labels from i18n */
const MENU_BUTTON =
  /open navigation menu|navMenuOpen|Avaa navigointi|Öppna navigerings/i;

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForHttp(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3_000) });
      if (res.ok) return;
    } catch {
      // retry
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function isVisuallyHidden(element) {
  let node = element;
  while (node && node instanceof Element) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return true;
    if (Number.parseFloat(style.opacity) === 0) return true;
    node = node.parentElement;
  }
  const rect = element.getBoundingClientRect();
  return rect.width === 0 && rect.height === 0;
}

async function applyTheme(page, theme) {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("storybook-theme", t);
      localStorage.setItem("theme", t);
    } catch {
      // ignore
    }
  }, theme);
}

async function stabilizePage(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
      }
    `,
  });
  await page.evaluate(async () => {
    if ("fonts" in document) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore
      }
    }
  });
  await page.waitForTimeout(400);
}

function snapshotPath(kind, theme, viewport, name) {
  return path.join(SNAPSHOT_DIR, kind, theme, viewport, `${name}.png`);
}

function comparePng(baseline, actual) {
  const baselineImage = PNG.sync.read(fs.readFileSync(baseline));
  const actualImage = PNG.sync.read(actual);
  if (
    baselineImage.width !== actualImage.width ||
    baselineImage.height !== actualImage.height
  ) {
    return {
      ok: false,
      reason: `size ${baselineImage.width}x${baselineImage.height} → ${actualImage.width}x${actualImage.height}`,
      ratio: 1,
    };
  }
  const { width, height } = baselineImage;
  const diffImage = new PNG({ width, height });
  const diffPixels = pixelmatch(
    baselineImage.data,
    actualImage.data,
    diffImage.data,
    width,
    height,
    { threshold: 0.1, includeAA: true },
  );
  const ratio = diffPixels / (width * height);
  return {
    ok: ratio <= THRESHOLD,
    reason: `${(ratio * 100).toFixed(2)}% pixels differ`,
    ratio,
    diff: ratio > THRESHOLD ? PNG.sync.write(diffImage) : null,
  };
}

async function captureRegion(page, selector) {
  if (selector) {
    const loc = page.locator(selector).first();
    if ((await loc.count()) > 0) {
      return loc.screenshot({ animations: "disabled" });
    }
  }
  const root = page.locator("#storybook-root").first();
  if ((await root.count()) > 0) {
    return root.screenshot({ animations: "disabled" });
  }
  return page.screenshot({ animations: "disabled", fullPage: false });
}

async function locateMobileMenuControl(page) {
  const wrapped = page.locator(
    "#storybook-root header span.lg\\:hidden button, header span.lg\\:hidden button, header .lg\\:hidden button",
  );
  if ((await wrapped.count()) > 0) {
    return wrapped.first();
  }
  const byRole = page.getByRole("button", { name: MENU_BUTTON });
  if ((await byRole.count()) > 0) {
    return byRole.first();
  }
  return byRole;
}

async function checkMenuButtonVisibility(page, expectVisible, meta) {
  const btn = await locateMobileMenuControl(page);
  if ((await btn.count()) === 0) {
    return {
      ok: false,
      detail: "menu button not in DOM (expected present, hidden on desktop only)",
      ...meta,
    };
  }
  const hidden = await btn.evaluate(isVisuallyHidden);
  const ok = expectVisible ? !hidden : hidden;
  return {
    ok,
    detail: ok
      ? expectVisible
        ? "menu button visible"
        : "menu button hidden on desktop"
      : expectVisible
        ? "menu button should be visible but is hidden"
        : "REGRESSION: menu button visible on desktop",
    ...meta,
  };
}

async function runPixelCheck(page, meta, buffer) {
  const file = snapshotPath(meta.kind, meta.theme, meta.viewport, meta.name);
  ensureDir(path.dirname(file));
  if (UPDATE || !fs.existsSync(file)) {
    fs.writeFileSync(file, buffer);
    return { ok: true, detail: UPDATE ? "baseline updated" : "baseline created" };
  }
  const result = comparePng(file, buffer);
  if (!result.ok && result.diff) {
    const diffFile = file.replace(/\.png$/, ".diff.png");
    fs.writeFileSync(diffFile, result.diff);
  }
  return { ok: result.ok, detail: result.reason };
}

async function main() {
  ensureDir(SNAPSHOT_DIR);
  ensureDir(path.dirname(REPORT_PATH));

  await waitForHttp(`${STORYBOOK_URL}/index.json`);
  let skipApp = SKIP_APP;
  if (!skipApp) {
    skipApp = !(await fetch(APP_URL, { signal: AbortSignal.timeout(3_000) })
      .then((r) => r.ok)
      .catch(() => false));
    if (skipApp) {
      console.warn(
        `App not reachable at ${APP_URL} — skipping page checks. Start \`npm run dev\` for full matrix.`,
      );
    }
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();
        await applyTheme(page, theme);
        await stabilizePage(page);

        const expectMenuVisible = viewport.id === "mobile";

        // —— App pages ——
        if (!skipApp) {
          for (const pg of PAGES) {
            const url = `${APP_URL}${pg.path}`;
            await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
            await stabilizePage(page);

            const guard = await checkMenuButtonVisibility(page, expectMenuVisible, {
              target: pg.label,
              theme,
              viewport: viewport.id,
            });
            results.push({ type: "guard", ...guard });

            let buffer;
            try {
              buffer = await page.locator(pg.region).first().screenshot({
                animations: "disabled",
              });
            } catch {
              buffer = await page.screenshot({ animations: "disabled" });
            }

            const pixel = await runPixelCheck(
              page,
              {
                kind: "app",
                theme,
                viewport: viewport.id,
                name: pg.label,
              },
              buffer,
            );
            results.push({
              type: "pixel",
              target: pg.label,
              theme,
              viewport: viewport.id,
              ...pixel,
            });
          }
        }

        // —— Storybook stories ——
        for (const story of STORIES) {
          const iframe = `${STORYBOOK_URL}/iframe.html?id=${story.id}&viewMode=story`;
          await page.goto(iframe, { waitUntil: "networkidle", timeout: 60_000 });
          await stabilizePage(page);
          if (story.id.startsWith("patterns-siteheader")) {
            await page
              .locator("header span.lg\\:hidden button, header .lg\\:hidden button")
              .first()
              .waitFor({ state: "attached", timeout: 10_000 })
              .catch(() => {});
          }

          if (story.id.startsWith("patterns-siteheader")) {
            const guard = await checkMenuButtonVisibility(page, expectMenuVisible, {
              target: story.label,
              theme,
              viewport: viewport.id,
            });
            results.push({ type: "guard", ...guard });
          }

          const buffer = await captureRegion(page, story.region);
          const pixel = await runPixelCheck(page, {
            kind: "story",
            theme,
            viewport: viewport.id,
            name: story.label,
          }, buffer);
          results.push({
            type: "pixel",
            target: story.label,
            theme,
            viewport: viewport.id,
            ...pixel,
          });
        }

        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const failures = results.filter((r) => !r.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    storybookUrl: STORYBOOK_URL,
    appUrl: APP_URL,
    updateMode: UPDATE,
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    failures,
    results,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("\nMigration visual matrix");
  console.log(`  ${report.passed}/${report.total} checks passed`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const f of failures) {
      console.log(
        `  - [${f.type}] ${f.target} @ ${f.theme}/${f.viewport}: ${f.detail}`,
      );
    }
    console.log(`\nReport: ${REPORT_PATH}`);
    process.exit(1);
  }
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
