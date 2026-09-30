import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { allPages } from "../page-verification/helpers/page-registry";

test.setTimeout(120_000);
test.use({ reducedMotion: "reduce" });

const routes = [
  ...new Set([
    ...allPages
      .filter(
        (p) =>
          p.category !== "work" ||
          existsSync(path.join(process.cwd(), "app", p.url, "page.tsx")),
      )
      .map((p) => p.url),
    "/imprint",
    "/sitemap",
  ]),
];

async function ready(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("#donny-panel")).toBeAttached();
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const route of routes) {
  test(`published page AA: ${route}`, async ({ page }, info) => {
    await ready(page, route);
    await expect(page.locator("main")).toHaveCount(1);
    const result = await new AxeBuilder({ page })
      .options({ rules: { "target-size": { enabled: true } } })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    await info.attach("axe-evidence", {
      body: JSON.stringify(
        { violations: result.violations, incomplete: result.incomplete },
        null,
        2,
      ),
      contentType: "application/json",
    });
    expect(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          reason: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

for (const route of ["/", "/contact", "/pricing", "/work/knobsmith-audio"]) {
  for (const language of ["en", "fi", "sv"]) {
    for (const theme of ["light", "dark", "hcb", "hcw"] as const) {
      test(`theme/locale AA: ${route} ${theme} ${language}`, async ({
        page,
        context,
      }, info) => {
        await context.addCookies([
          { name: "i18next", value: language, domain: "localhost", path: "/" },
        ]);
        await ready(page, route);
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await page.evaluate((themeName) => {
          const classes = {
            light: "themeLight",
            dark: "themeDark",
            hcb: "themeHCB",
            hcw: "themeHCW",
          };
          for (const element of [document.documentElement, document.body]) {
            element.classList.remove(...Object.values(classes));
            element.classList.add(classes[themeName]);
            element.setAttribute("data-theme", themeName);
          }
        }, theme);
        // Disable transition interpolation only for the contrast measurement.
        // Motion behavior is tested separately under both preference settings.
        await page.addStyleTag({
          content: "*, *::before, *::after { transition: none !important; }",
        });
        const result = await new AxeBuilder({ page })
          .options({ rules: { "target-size": { enabled: true } } })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        await info.attach("axe-evidence", {
          body: JSON.stringify(
            { violations: result.violations, incomplete: result.incomplete },
            null,
            2,
          ),
          contentType: "application/json",
        });
        expect(
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              reason: n.failureSummary,
            })),
          })),
        ).toEqual([]);
      });
    }
  }
}
