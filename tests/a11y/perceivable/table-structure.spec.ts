/**
 * WCAG 1.3.1 Info and Relationships — tables
 *
 * When HTML tables appear on public pages, header cells must use scope.
 *
 * @see https://a11y.ing/en/demo/perceivable/1-3-1-tables/
 */

import { test, expect } from "@playwright/test";

const PAGES_TO_SCAN = [
  "/",
  "/about",
  "/work",
  "/blog",
  "/contact",
  "/pricing",
  "/colophon",
  "/pseo",
  "/pseo/design-system-audit-nextjs-startups",
];

test.describe("WCAG 1.3.1: Table structure", () => {
  for (const path of PAGES_TO_SCAN) {
    test(`tables on ${path} expose scoped headers when present`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const tables = page.locator("table");
      const count = await tables.count();

      if (count === 0) {
        test.info().annotations.push({
          type: "note",
          description: `No tables on ${path}`,
        });
        return;
      }

      for (let i = 0; i < count; i++) {
        const table = tables.nth(i);
        const headers = table.locator("th");
        const headerCount = await headers.count();

        expect(
          headerCount,
          `Table ${i + 1} on ${path} should have th elements`
        ).toBeGreaterThan(0);

        for (let h = 0; h < headerCount; h++) {
          const scope = await headers.nth(h).getAttribute("scope");
          expect(
            scope === "col" ||
              scope === "row" ||
              scope === "colgroup" ||
              scope === "rowgroup",
            `Table ${i + 1} header ${h + 1} on ${path} needs scope`
          ).toBeTruthy();
        }
      }
    });
  }
});
