/**
 * WCAG 2.5.3 Label in Name
 *
 * Visible label text must be included in the accessible name so voice control
 * and screen reader users can activate controls by what they see.
 *
 * @see https://a11y.ing/en/demo/operable/2-5-3-label-in-name/
 * @see https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { findLabelInNameMismatches } from "../helpers/accessible-name";

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
  { name: "Pricing", path: "/pricing" },
  { name: "PSEO hub", path: "/pseo" },
  {
    name: "PSEO leaf",
    path: "/pseo/design-system-audit-nextjs-startups",
  },
];

test.describe("WCAG 2.5.3: Label in Name", () => {
  for (const { name, path } of PAGES) {
    test(`${name} controls include visible text in accessible name`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      const mismatches = await findLabelInNameMismatches(page);

      expect(
        mismatches,
        `Label in Name mismatches on ${path}:\n${mismatches
          .map(
            (m) =>
              `  ${m.selector}: visible="${m.visible}" accessible="${m.accessible}"`
          )
          .join("\n")}`
      ).toEqual([]);
    });
  }

  test("axe label-content-name-mismatch passes on key pages", async ({
    page,
  }) => {
    for (const { path } of PAGES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const results = await new AxeBuilder({ page })
        .withRules(["label-content-name-mismatch"])
        .analyze();

      expect(
        results.violations,
        `axe label-content-name-mismatch on ${path}`
      ).toEqual([]);
    }
  });
});
