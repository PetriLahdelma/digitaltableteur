#!/usr/bin/env node
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  LANGUAGES,
  VIEWPORTS,
  createReviewContext,
  createRowsSummary,
  ensureDir,
  gotoAndStabilize,
  pageSummary,
  relativePath,
  stabilizePage,
  startNextServer,
  writeJson,
} from "./browser-review-utils.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/site-package-dogfood");
const OUT_JSON = join(OUT_DIR, "latest.json");
const TRANSLATION_DIR = join(ROOT, "nextjs-app/shared/locales");
const DESKTOP = VIEWPORTS.find((viewport) => viewport.id === "desktop") ?? VIEWPORTS[0];
const PSEO_ROUTE = "/pseo/design-system-audit-react-startups";
const WORK_ROUTE = "/work/helsinki-design-system";
const BLOG_ROUTE = "/blog/petri-lahdelma-bio";

function readTranslations(language) {
  return JSON.parse(
    readFileSync(join(TRANSLATION_DIR, language, "translation.json"), "utf8"),
  );
}

const translations = Object.fromEntries(
  LANGUAGES.map((language) => [language, readTranslations(language)]),
);

function tr(language, key, fallback = key) {
  const value = key.split(".").reduce((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return current[part];
    }
    return undefined;
  }, translations[language]);
  return typeof value === "string" ? value : fallback;
}

function textPattern(value) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function makeRow(meta, checks, errors, details = {}) {
  return {
    ...meta,
    ok: errors.length === 0,
    checks,
    errors,
    ...details,
  };
}

async function runRow(rows, meta, fn) {
  const checks = [];
  const errors = [];
  const assert = (condition, message) => {
    checks.push(message);
    if (!condition) errors.push(message);
  };

  console.log(`  checking ${meta.language}/${meta.target}`);
  try {
    const details = (await fn({ assert, checks })) ?? {};
    rows.push(makeRow(meta, checks, errors, details));
  } catch (error) {
    rows.push(
      makeRow(meta, checks, [
        error instanceof Error ? error.message : String(error),
      ]),
    );
  }
}

async function selectedWorkImagesLoaded(page) {
  await page.locator("#work").scrollIntoViewIfNeeded({ timeout: 10_000 });
  await page.waitForFunction(() => {
    const assets = Array.from(
      document.querySelectorAll("[data-project-card-asset]"),
    );
    return (
      assets.length >= 3 &&
      assets.every((asset) => {
        if (asset instanceof HTMLImageElement) {
          return asset.complete && asset.naturalWidth > 0 && asset.naturalHeight > 0;
        }
        if (asset instanceof HTMLVideoElement) {
          return asset.readyState >= 1;
        }
        return false;
      })
    );
  }, null, { timeout: 20_000 });

  return await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-project-card-asset]")).map(
      (asset) => {
        if (asset instanceof HTMLImageElement) {
          return {
            tag: "img",
            src: asset.currentSrc || asset.src,
            width: asset.naturalWidth,
            height: asset.naturalHeight,
          };
        }
        if (asset instanceof HTMLVideoElement) {
          return {
            tag: "video",
            src: asset.currentSrc || asset.src,
            readyState: asset.readyState,
          };
        }
        return { tag: asset.tagName.toLowerCase() };
      },
    ),
  );
}

async function main() {
  ensureDir(OUT_DIR);
  const server = await startNextServer(ROOT);
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  const errors = [];

  try {
    for (const language of LANGUAGES) {
      const context = await createReviewContext(browser, server.baseUrl, language, DESKTOP);
      const page = await context.newPage();

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "i18n",
          kind: "browser",
          target: "home-copy",
          path: "/",
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, "/");
          const homeSelectedWork = tr(language, "homeSelectedWork");
          const navHome = tr(language, "navHome");
          assert(
            (await page.getByRole("heading", { name: textPattern(homeSelectedWork) }).count()) > 0,
            `home selected-work heading is localized: ${homeSelectedWork}`,
          );
          // Since NavLink 0.1.9 the active same-path item renders as a
          // non-interactive <span aria-current="page">, so on "/" the Home
          // label is a current-page marker, not a link.
          const headerNav = page.getByRole("navigation", {
            name: textPattern(tr(language, "navMenuAccessibleLabel")),
          });
          const homeAsLink = await headerNav
            .getByRole("link", { name: textPattern(navHome) })
            .count();
          const homeAsCurrent = await headerNav
            .locator('[aria-current="page"]')
            .filter({ hasText: textPattern(navHome) })
            .count();
          assert(
            homeAsLink + homeAsCurrent > 0,
            `site header home label is localized: ${navHome}`,
          );
          return { summary: await pageSummary(page) };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "i18n",
          kind: "browser",
          target: "contact-copy",
          path: "/contact",
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, "/contact");
          const contactHeadline = tr(language, "contactHeadline");
          const contactIntro = tr(language, "contactIntro");
          assert(
            (await page.getByRole("heading", { name: textPattern(contactHeadline) }).count()) > 0,
            `contact headline is localized: ${contactHeadline}`,
          );
          assert(
            (await page.getByText(contactIntro, { exact: false }).count()) > 0,
            "contact intro text is localized",
          );
          return { summary: await pageSummary(page) };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "navigation",
          kind: "browser",
          target: "site-header-routing",
          path: "/",
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, "/");
          const navWork = tr(language, "navWork");
          const nav = page.getByRole("navigation", {
            name: textPattern(tr(language, "navMenuAccessibleLabel")),
          });
          await nav.getByRole("link", { name: textPattern(navWork) }).click();
          await page.waitForURL("**/work", { timeout: 15_000 });
          // Since NavLink 0.1.9 the now-active Work item re-renders as a
          // non-interactive <span aria-current="page"> instead of a link.
          const activeWork = nav
            .locator('[aria-current="page"]')
            .filter({ hasText: textPattern(navWork) });
          assert(
            (await activeWork.count()) > 0,
            "SiteHeader Work link routes through the injected link runtime and marks the current page",
          );
          return { summary: await pageSummary(page) };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "navigation",
          kind: "browser",
          target: "work-nav",
          path: WORK_ROUTE,
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, WORK_ROUTE);
          // Work detail routes render WorkNav (via NextWorkNav) since #1228;
          // its back control is labeled workNavBackToWork, not the old
          // ProjectNav projectBackToWork.
          const back = tr(language, "workNavBackToWork");
          const prev = tr(language, "workNavPrev");
          const next = tr(language, "workNavNext");
          assert(
            (await page.getByRole("button", { name: textPattern(back) }).count()) > 0,
            `WorkNav back label is localized: ${back}`,
          );
          assert(
            (await page.getByRole("button", { name: textPattern(prev) }).count()) > 0,
            `WorkNav previous label is localized: ${prev}`,
          );
          assert(
            (await page.getByRole("button", { name: textPattern(next) }).count()) > 0,
            `WorkNav next label is localized: ${next}`,
          );
          await page.getByRole("button", { name: textPattern(back) }).click();
          await page.waitForURL("**/work", { timeout: 15_000 });
          assert(page.url().endsWith("/work"), "WorkNav back button routes to /work");
          return { summary: await pageSummary(page) };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "navigation",
          kind: "browser",
          target: "blog-nav",
          path: BLOG_ROUTE,
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, BLOG_ROUTE);
          const articles = tr(language, "blogNavBackToArticles");
          const prev = tr(language, "blogNavPrev");
          const next = tr(language, "blogNavNext");
          assert(
            (await page.getByRole("button", { name: textPattern(articles) }).count()) > 0,
            `BlogNav articles label is localized: ${articles}`,
          );
          assert(
            (await page.getByRole("button", { name: textPattern(prev) }).count()) > 0,
            `BlogNav previous label is localized: ${prev}`,
          );
          assert(
            (await page.getByRole("button", { name: textPattern(next) }).count()) > 0,
            `BlogNav next label is localized: ${next}`,
          );
          await page.getByRole("button", { name: textPattern(articles) }).click();
          await page.waitForURL((url) => url.pathname === "/blog", { timeout: 15_000 });
          assert(page.url().endsWith("/blog"), "BlogNav articles button routes to /blog");
          return { summary: await pageSummary(page) };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "media",
          kind: "browser",
          target: "selected-work-direct-load",
          path: "/",
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, "/");
          const assets = await selectedWorkImagesLoaded(page);
          assert(assets.length >= 3, "Selected work renders at least three media assets on direct home load");
          return { assets };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "media",
          kind: "browser",
          target: "selected-work-client-return",
          path: "/work -> /",
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, "/work");
          await page.getByRole("link", { name: /Digitaltableteur/i }).first().click();
          await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
          await stabilizePage(page);
          const assets = await selectedWorkImagesLoaded(page);
          assert(assets.length >= 3, "Selected work media loads after client navigation back home");
          return { assets };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "content-language-notice",
          kind: "browser",
          target: "english-only-blog-notice",
          path: BLOG_ROUTE,
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, BLOG_ROUTE);
          const inlineNotice = tr(language, "contentLanguageNotice", "")
            .replace("{{language}}", "")
            .trim();
          if (language === "en") {
            assert(
              (await page.getByText(/available in .* only/i).count()) === 0,
              "English UI does not show an English-only content notice",
            );
          } else {
            await page
              .waitForFunction(() => {
                return Array.from(document.querySelectorAll('[role="status"]')).some(
                  (node) => /only|vain|endast/i.test(node.textContent ?? ""),
                );
              }, null, { timeout: 8_000 })
              .catch(() => undefined);
            assert(
              inlineNotice.length === 0 ||
                (await page.locator("main").getByText(textPattern(inlineNotice)).count()) === 0,
              "English-only notice is not printed inline in article content",
            );
            assert(
              (await page.getByRole("status").filter({ hasText: /only|vain|endast/i }).count()) > 0,
              "English-only notice is announced through the toast runtime",
            );
          }
          return { summary: await pageSummary(page) };
        },
      );

      await runRow(
        rows,
        {
          language,
          viewport: DESKTOP.id,
          category: "production-consumer",
          kind: "browser",
          target: "pseo-breadcrumb",
          path: PSEO_ROUTE,
        },
        async ({ assert }) => {
          await gotoAndStabilize(page, PSEO_ROUTE);
          const breadcrumb = page.getByRole("navigation", { name: /breadcrumb/i }).first();
          assert((await breadcrumb.count()) > 0, "PSEO leaf route renders a Breadcrumb navigation landmark");
          assert(
            (await breadcrumb.getByRole("link", { name: /Playbooks/i }).count()) > 0,
            "Breadcrumb contains the Playbooks parent link",
          );
          const currentText = await breadcrumb.textContent();
          assert(
            /startup teams/i.test(currentText ?? ""),
            "Breadcrumb renders the current audience item",
          );
          return { summary: await pageSummary(page) };
        },
      );

      await context.close();
    }
  } finally {
    await browser.close();
    await server.stop();
  }

  const summary = createRowsSummary(rows);
  if (summary.failed > 0) {
    errors.push(
      ...rows
        .filter((row) => row.ok !== true)
        .map((row) => `${row.language}/${row.target}: ${row.errors.join("; ")}`),
    );
  }

  const report = {
    generatedAt: new Date().toISOString(),
    status: errors.length === 0 ? "passed" : "failed",
    baseUrl: server.baseUrl,
    reusedServer: server.reused,
    summary,
    rows,
    errors,
  };

  writeJson(OUT_JSON, report);

  if (errors.length) {
    console.error("Site package dogfood failed:");
    for (const error of errors) console.error(`- ${error}`);
    console.error(`Report: ${relativePath(ROOT, OUT_JSON)}`);
    process.exit(1);
  }

  console.log(
    `✓ site package dogfood verified (${summary.passed}/${summary.total} checks across ${summary.languages.join("/")}; categories ${summary.categories.join(", ")})`,
  );
  console.log(`  Report: ${relativePath(ROOT, OUT_JSON)}`);
}

await main();
