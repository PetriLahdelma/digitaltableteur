/**
 * UNDR-01, UNDR-06: Navigation Consistency and Page Language Tests
 *
 * Tests for WCAG 3.2.3 (Consistent Navigation) and WCAG 3.1.1 (Language of Page)
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html
 */
import { test, expect } from "@playwright/test";

test.describe("UNDR-06: Navigation Consistency", () => {
  const pages = ["/", "/about", "/work", "/blog", "/contact"];

  test("desktop navigation order is consistent across pages", async ({
    page,
  }) => {
    const navOrders: string[][] = [];

    for (const url of pages) {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Get desktop nav items (visible on desktop)
      const navItems = await page
        .locator('header nav[aria-label="Main navigation"] a')
        .allTextContents();
      navOrders.push(navItems.filter(Boolean).map((s) => s.trim()));
    }

    // All pages should have same nav order
    const firstOrder = navOrders[0];
    expect(firstOrder.length).toBeGreaterThan(0);

    for (let i = 1; i < navOrders.length; i++) {
      expect(navOrders[i]).toEqual(firstOrder);
    }
  });

  test("mobile and desktop navigation have same items in same order", async ({
    page,
  }) => {
    // Set desktop viewport first to get desktop nav
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const desktopNavItems = await page
      .locator('header nav[aria-label="Main navigation"] a')
      .allTextContents();
    const desktopCleaned = desktopNavItems.filter(Boolean).map((s) => s.trim());

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Open mobile menu
    const menuButton = page
      .locator(
        'button[aria-label*="menu" i], button[aria-label*="navigation" i]'
      )
      .first();
    await menuButton.click();

    // Wait for mobile menu to appear
    await page.waitForSelector('[role="dialog"]', {
      state: "visible",
      timeout: 5000,
    });

    // Get mobile nav items
    const mobileNavItems = await page
      .locator('[role="dialog"] nav a')
      .allTextContents();
    const mobileCleaned = mobileNavItems.filter(Boolean).map((s) => s.trim());

    // Compare - mobile should have at least the same main nav items
    expect(mobileCleaned).toEqual(desktopCleaned);
  });

  test("active page has aria-current in desktop nav", async ({ page }) => {
    for (const url of pages) {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Check that exactly one nav link has aria-current="page"
      const activeLinks = page.locator('header nav a[aria-current="page"]');
      await expect(activeLinks).toHaveCount(1);
    }
  });

  test("active page has aria-current in mobile nav", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    for (const url of pages) {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Open mobile menu
      const menuButton = page
        .locator(
          'button[aria-label*="menu" i], button[aria-label*="navigation" i]'
        )
        .first();
      await menuButton.click();
      await page.waitForSelector('[role="dialog"]', {
        state: "visible",
        timeout: 5000,
      });

      // Check aria-current
      const activeLinks = page.locator(
        '[role="dialog"] nav a[aria-current="page"]'
      );
      await expect(activeLinks).toHaveCount(1);

      // Close menu for next iteration
      await page.keyboard.press("Escape");
      // Wait for menu to close
      await page.waitForSelector('[role="dialog"]', {
        state: "hidden",
        timeout: 3000,
      });
    }
  });

  test("footer navigation is consistent across pages", async ({ page }) => {
    const footerOrders: string[][] = [];

    for (const url of pages) {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Get footer nav items
      const footerItems = await page.locator("footer a").allTextContents();
      footerOrders.push(footerItems.filter(Boolean).map((s) => s.trim()));
    }

    // All pages should have same footer order
    const firstOrder = footerOrders[0];
    expect(firstOrder.length).toBeGreaterThan(0);

    for (let i = 1; i < footerOrders.length; i++) {
      expect(footerOrders[i]).toEqual(firstOrder);
    }
  });
});

test.describe("UNDR-01: Page Language", () => {
  test("HTML lang attribute is set", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // HTML element should have lang attribute
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBeTruthy();
    // Should be a valid language code (starts with 2-letter code)
    expect(htmlLang).toMatch(/^[a-z]{2}/i);
  });

  test("HTML lang matches selected language - English", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Default should be English
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toMatch(/^en/);
  });

  test("language can be changed and updates HTML lang", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Find a language switcher button that's not the current language
    const finnishButton = page.locator(
      'button:has-text("FI"), button:has-text("Suomi")'
    );

    // If Finnish button exists and is not disabled
    const finnishButtonExists = (await finnishButton.count()) > 0;

    if (finnishButtonExists) {
      const isDisabled = await finnishButton.first().isDisabled();
      if (!isDisabled) {
        await finnishButton.first().click();

        // Wait for language to change
        await page.waitForTimeout(500);

        // Check that HTML lang updated to Finnish
        const htmlLang = await page.locator("html").getAttribute("lang");
        expect(htmlLang).toMatch(/^fi/);
      }
    }
  });

  test("all pages have valid lang attribute", async ({ page }) => {
    const pages = ["/", "/about", "/work", "/blog", "/contact"];

    for (const url of pages) {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}/i);
    }
  });
});
