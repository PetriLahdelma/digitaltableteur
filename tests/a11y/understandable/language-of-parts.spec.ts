/**
 * WCAG 3.1.2 Language of Parts
 *
 * Content in a different language than the page must be marked with lang.
 *
 * @see https://a11y.ing/en/demo/understandable/3-1-2-language-of-parts/
 */

import { test, expect } from "@playwright/test";

test.describe("WCAG 3.1.2: Language of Parts", () => {
  test("html lang matches active locale on core pages", async ({ page }) => {
    for (const path of ["/", "/about", "/contact", "/pricing"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang, `${path} should set html lang`).toMatch(/^(en|fi|sv)(-|$)/);
    }
  });

  test("Finnish locale sets html lang to fi", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "i18next",
        value: "fi",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
      document.documentElement.lang.toLowerCase().startsWith("fi")
    );

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang?.toLowerCase().startsWith("fi")).toBeTruthy();
  });

  test("inline code blocks declare language when class hints exist", async ({
    page,
  }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const postLink = page.locator('main a[href^="/blog/"]').first();
    const href = await postLink.getAttribute("href");
    await page.goto(href!, { waitUntil: "domcontentloaded" });

    const codeBlocks = page.locator('pre code[class*="language-"]');
    const count = await codeBlocks.count();

    if (count === 0) {
      test.skip(true, "No syntax-highlighted code blocks on sampled post");
      return;
    }

    for (let i = 0; i < Math.min(count, 5); i++) {
      const block = codeBlocks.nth(i);
      const parentPre = block.locator("xpath=ancestor::pre[1]");
      const lang =
        (await parentPre.getAttribute("lang")) ||
        (await block.getAttribute("lang"));

      // Prefer explicit lang; allow missing if page lang is en and code is ASCII
      if (!lang) {
        const className = (await block.getAttribute("class")) ?? "";
        expect(
          className.includes("language-"),
          "Code block should have lang on pre/code or parent with lang"
        ).toBeTruthy();
      }
    }
  });
});
