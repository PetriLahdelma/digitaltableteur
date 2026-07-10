#!/usr/bin/env node
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
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
  startNextServer,
  writeJson,
} from "./browser-review-utils.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, ".omx/state/design-system/i18n-navigation-review/latest");
const SCREENSHOT_DIR = join(OUT_DIR, "screenshots");
const OUT_JSON = join(OUT_DIR, "report.json");
const OUT_MD = join(OUT_DIR, "review.md");
const TRANSLATION_DIR = join(ROOT, "nextjs-app/shared/locales");

const ROUTES = [
  { id: "home", path: "/", expectedKey: "homeSelectedWork" },
  { id: "contact", path: "/contact", expectedKey: "contactHeadline" },
  { id: "work-detail", path: "/work/helsinki-design-system", expectedText: "Helsinki Design System" },
  { id: "blog-detail", path: "/blog/petri-lahdelma-bio", expectedText: "Petri Lahdelma" },
];

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

async function screenshot(page, filename) {
  const path = join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path, fullPage: false, animations: "disabled" });
  return relativePath(ROOT, path);
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

  console.log(`  checking ${meta.language}/${meta.viewport}/${meta.route}`);
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

function buildReviewMarkdown(report) {
  const routeRows = report.rows.filter((row) => row.kind === "route");
  const navRows = report.rows.filter((row) => row.kind === "navigation");
  const lines = [
    "# I18n and Navigation Review",
    "",
    `Generated: ${report.generatedAt}`,
    `Base URL: ${report.baseUrl}`,
    `Status: ${report.status}`,
    "",
    `Route screenshots: ${routeRows.filter((row) => row.screenshot).length}`,
    `Navigation checks: ${navRows.length}`,
    "",
    "## Route Matrix",
    "",
    "| Language | Viewport | Route | Result | Screenshot |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const row of routeRows) {
    lines.push(
      `| ${row.language} | ${row.viewport} | ${row.route} | ${row.ok ? "pass" : "fail"} | ${row.screenshot ?? ""} |`,
    );
  }

  lines.push("", "## Navigation Checks", "");
  for (const row of navRows) {
    lines.push(
      `- ${row.language}/${row.viewport}: ${row.ok ? "pass" : "fail"} - ${(row.checks ?? []).join("; ")}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  ensureDir(SCREENSHOT_DIR);
  const server = await startNextServer(ROOT);
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  const errors = [];

  try {
    for (const language of LANGUAGES) {
      for (const viewport of VIEWPORTS) {
        const context = await createReviewContext(browser, server.baseUrl, language, viewport);
        const page = await context.newPage();

        for (const route of ROUTES) {
          await runRow(
            rows,
            {
              kind: "route",
              category: "i18n",
              language,
              viewport: viewport.id,
              route: route.id,
              path: route.path,
            },
            async ({ assert }) => {
              await gotoAndStabilize(page, route.path);
              const expected = route.expectedKey
                ? tr(language, route.expectedKey)
                : route.expectedText;
              assert(
                (await page.getByText(textPattern(expected)).count()) > 0,
                `route contains expected text: ${expected}`,
              );
              const shot = await screenshot(
                page,
                `${language}-${viewport.id}-${route.id}.png`,
              );
              return {
                screenshot: shot,
                summary: await pageSummary(page),
              };
            },
          );
        }

        await context.close();
      }

      const context = await createReviewContext(browser, server.baseUrl, language, VIEWPORTS[0]);
      const page = await context.newPage();

      await runRow(
        rows,
        {
          kind: "navigation",
          category: "navigation",
          language,
          viewport: "desktop",
          route: "site-header-work-nav-blog-nav",
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
          assert(page.url().endsWith("/work"), "SiteHeader Work link routes to /work");

          await gotoAndStabilize(page, "/work/helsinki-design-system");
          const workBack = tr(language, "projectBackToWork");
          assert(
            (await page.getByRole("button", { name: textPattern(workBack) }).count()) > 0,
            `WorkNav back label is localized: ${workBack}`,
          );

          await gotoAndStabilize(page, "/blog/petri-lahdelma-bio");
          const blogArticles = tr(language, "blogNavBackToArticles");
          assert(
            (await page.getByRole("button", { name: textPattern(blogArticles) }).count()) > 0,
            `BlogNav articles label is localized: ${blogArticles}`,
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
        .map((row) => `${row.language}/${row.viewport}/${row.route}: ${row.errors.join("; ")}`),
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
  writeFileSync(OUT_MD, buildReviewMarkdown(report));

  if (errors.length) {
    console.error("I18n/navigation visual matrix failed:");
    for (const error of errors) console.error(`- ${error}`);
    console.error(`Report: ${relativePath(ROOT, OUT_JSON)}`);
    process.exit(1);
  }

  console.log(
    `✓ i18n/navigation matrix verified (${summary.passed}/${summary.total} checks, ${rows.filter((row) => row.screenshot).length} screenshots)`,
  );
  console.log(`  Report: ${relativePath(ROOT, OUT_JSON)}`);
  console.log(`  Review: ${relativePath(ROOT, OUT_MD)}`);
}

await main();
