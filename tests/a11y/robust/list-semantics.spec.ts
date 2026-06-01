/**
 * List semantics after list-style: none
 *
 * Safari + VoiceOver can lose list semantics when bullets are removed without
 * the CSS space-character fix recommended on a11y.ing.
 *
 * @see https://a11y.ing/en/demo/other/removing-list-style-from-a-list-element/
 */

import { test, expect } from "@playwright/test";
import { findBrokenListSemantics } from "../helpers/list-semantics";

const PAGES = [
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

test.describe("List semantics (a11y.ing Safari VO fix)", () => {
  for (const path of PAGES) {
    test(`lists retain semantics fix on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);

      const issues = await findBrokenListSemantics(page);

      expect(
        issues,
        `Lists with list-style-type:none need list-style-type:" " or role="list":\n${issues
          .map((i) => `  ${i.selector} (${i.tagName})`)
          .join("\n")}`
      ).toEqual([]);
    });
  }
});
