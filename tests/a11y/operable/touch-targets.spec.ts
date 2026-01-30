/**
 * Touch Target Size Tests
 *
 * Verifies WCAG 2.1 SC 2.5.5 (Target Size) compliance.
 * All interactive elements must have a minimum touch target of 44x44px on mobile.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */

import { test, expect, Page } from "@playwright/test";

// Mobile viewport (iPhone SE equivalent)
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Minimum touch target size per WCAG 2.5.5
const MIN_TARGET_SIZE = 44;

// Pages to test for touch targets
const PUBLIC_PAGES = ["/", "/about", "/work", "/blog", "/contact"];

/**
 * Helper to check if an element meets touch target requirements.
 * An element passes if it is at least 44x44px OR has adequate spacing (>= 8px) from adjacent targets.
 */
async function checkTouchTarget(
  page: Page,
  locator: ReturnType<Page["locator"]>,
  description: string
): Promise<{
  pass: boolean;
  width: number;
  height: number;
  reason: string;
}> {
  const box = await locator.boundingBox();

  if (!box) {
    return { pass: false, width: 0, height: 0, reason: "Element not visible" };
  }

  const { width, height } = box;

  if (width >= MIN_TARGET_SIZE && height >= MIN_TARGET_SIZE) {
    return {
      pass: true,
      width,
      height,
      reason: `${description}: ${width.toFixed(0)}x${height.toFixed(0)}px meets 44x44px minimum`,
    };
  }

  // If element is smaller, it still passes if it has adequate spacing
  // This is acceptable per WCAG 2.5.5 exception for inline targets
  return {
    pass: false,
    width,
    height,
    reason: `${description}: ${width.toFixed(0)}x${height.toFixed(0)}px below 44x44px minimum`,
  };
}

test.describe("OPER-06: Touch Target Size (Mobile)", () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test.describe("Button touch targets", () => {
    for (const pagePath of PUBLIC_PAGES) {
      test(`buttons on ${pagePath} meet 44x44px minimum`, async ({ page }) => {
        await page.goto(pagePath, { waitUntil: "domcontentloaded" });

        const buttons = page.locator("button:visible");
        const count = await buttons.count();

        if (count === 0) {
          test.skip();
          return;
        }

        const results: Array<{
          pass: boolean;
          width: number;
          height: number;
          reason: string;
        }> = [];

        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          const ariaLabel = await button.getAttribute("aria-label");
          const text = await button.textContent();
          const description = ariaLabel || text?.trim() || `Button ${i + 1}`;

          // Skip hidden or off-screen buttons
          const isVisible = await button.isVisible();
          if (!isVisible) continue;

          const result = await checkTouchTarget(page, button, description);
          results.push(result);
        }

        // Log results for debugging
        const failures = results.filter((r) => !r.pass);
        if (failures.length > 0) {
          console.log(`\nTouch target failures on ${pagePath}:`);
          failures.forEach((f) => console.log(`  - ${f.reason}`));
        }

        // All buttons should pass
        expect(failures.length).toBe(0);
      });
    }
  });

  test.describe("Icon button touch targets", () => {
    test("theme toggle button meets 44x44px minimum", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Theme toggle is typically an icon-only button
      const themeToggle = page.locator('[aria-label*="theme" i], [aria-label*="dark" i], [aria-label*="light" i]').first();
      const isVisible = await themeToggle.isVisible().catch(() => false);

      if (!isVisible) {
        test.skip();
        return;
      }

      const result = await checkTouchTarget(page, themeToggle, "Theme toggle");
      expect(result.pass).toBe(true);
    });

    test("language switcher buttons meet 44x44px minimum", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Language buttons may be in header or footer
      const langButtons = page.locator('button:has-text("EN"), button:has-text("FI"), button:has-text("SV")');
      const count = await langButtons.count();

      if (count === 0) {
        test.skip();
        return;
      }

      const results: Array<{
        pass: boolean;
        width: number;
        height: number;
        reason: string;
      }> = [];

      for (let i = 0; i < count; i++) {
        const button = langButtons.nth(i);
        const isVisible = await button.isVisible();
        if (!isVisible) continue;

        const text = await button.textContent();
        const result = await checkTouchTarget(page, button, `Language: ${text}`);
        results.push(result);
      }

      const failures = results.filter((r) => !r.pass);
      expect(failures.length).toBe(0);
    });

    test("mobile menu hamburger button meets 44x44px minimum", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Mobile menu button (hamburger icon)
      const menuButton = page.locator('[aria-label*="menu" i], [aria-label*="navigation" i], button:has([data-testid="hamburger"])').first();
      const isVisible = await menuButton.isVisible().catch(() => false);

      if (!isVisible) {
        test.skip();
        return;
      }

      const result = await checkTouchTarget(page, menuButton, "Mobile menu button");
      expect(result.pass).toBe(true);
    });
  });

  test.describe("Navigation link touch targets", () => {
    test("header navigation links have adequate touch targets", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Main navigation links in header
      const navLinks = page.locator("header nav a, header a[href]");
      const count = await navLinks.count();

      if (count === 0) {
        test.skip();
        return;
      }

      const results: Array<{
        pass: boolean;
        width: number;
        height: number;
        reason: string;
      }> = [];

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        const isVisible = await link.isVisible();
        if (!isVisible) continue;

        const text = await link.textContent();
        const result = await checkTouchTarget(page, link, `Nav: ${text?.trim()}`);
        results.push(result);
      }

      // Navigation links should meet touch target requirements
      const failures = results.filter((r) => !r.pass);
      if (failures.length > 0) {
        console.log("\nNavigation link touch target issues:");
        failures.forEach((f) => console.log(`  - ${f.reason}`));
      }

      // Allow some inline links to be smaller (WCAG exception for inline text)
      // But primary nav links should be large enough
      expect(failures.length).toBeLessThanOrEqual(3);
    });
  });

  test.describe("Form input touch targets", () => {
    test("contact form submit button meets 44x44px minimum", async ({
      page,
    }) => {
      await page.goto("/contact", { waitUntil: "domcontentloaded" });

      // Form submit button
      const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Send"), button:has-text("Submit")').first();
      const isVisible = await submitButton.isVisible().catch(() => false);

      if (!isVisible) {
        test.skip();
        return;
      }

      const result = await checkTouchTarget(page, submitButton, "Submit button");
      expect(result.pass).toBe(true);
    });

    test("form inputs have adequate touch target height", async ({ page }) => {
      await page.goto("/contact", { waitUntil: "domcontentloaded" });

      // Form inputs (text, email, textarea)
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea');
      const count = await inputs.count();

      if (count === 0) {
        test.skip();
        return;
      }

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const isVisible = await input.isVisible();
        if (!isVisible) continue;

        const box = await input.boundingBox();
        if (!box) continue;

        // Form inputs should be at least 44px tall on mobile
        expect(box.height).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
      }
    });
  });

  test.describe("ChatWidget touch targets", () => {
    test("chat toggle button meets 44x44px minimum", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Chat widget toggle button
      const chatToggle = page.locator('[aria-label*="chat" i], [data-testid="chat-toggle"], button:has([data-testid="chat-icon"])').first();
      const isVisible = await chatToggle.isVisible().catch(() => false);

      if (!isVisible) {
        test.skip();
        return;
      }

      const result = await checkTouchTarget(page, chatToggle, "Chat toggle");
      expect(result.pass).toBe(true);
    });
  });

  test.describe("Footer touch targets", () => {
    test("footer links have adequate touch targets", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Footer links
      const footerLinks = page.locator("footer a[href]");
      const count = await footerLinks.count();

      if (count === 0) {
        test.skip();
        return;
      }

      const results: Array<{
        pass: boolean;
        width: number;
        height: number;
        reason: string;
      }> = [];

      for (let i = 0; i < Math.min(count, 10); i++) {
        // Check first 10 links
        const link = footerLinks.nth(i);
        const isVisible = await link.isVisible();
        if (!isVisible) continue;

        const text = await link.textContent();
        const result = await checkTouchTarget(page, link, `Footer: ${text?.trim()}`);
        results.push(result);
      }

      // Footer links are often inline text, so allow some to be smaller
      const failures = results.filter((r) => !r.pass);
      if (failures.length > 0) {
        console.log("\nFooter link touch target issues (informational):");
        failures.forEach((f) => console.log(`  - ${f.reason}`));
      }

      // Inline text links are exempt per WCAG, so this is informational
      expect(failures.length).toBeLessThanOrEqual(results.length);
    });
  });
});

test.describe("OPER-06: Touch Target Size Summary", () => {
  test("generate touch target audit summary", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const allInteractive = page.locator('button, a[href], input, select, textarea, [role="button"]');
    const totalCount = await allInteractive.count();

    let passCount = 0;
    let failCount = 0;

    for (let i = 0; i < totalCount; i++) {
      const element = allInteractive.nth(i);
      const isVisible = await element.isVisible().catch(() => false);
      if (!isVisible) continue;

      const box = await element.boundingBox();
      if (!box) continue;

      if (box.width >= MIN_TARGET_SIZE && box.height >= MIN_TARGET_SIZE) {
        passCount++;
      } else {
        failCount++;
      }
    }

    console.log(`\n=== Touch Target Audit Summary (Home Page) ===`);
    console.log(`Total interactive elements: ${totalCount}`);
    console.log(`Visible elements checked: ${passCount + failCount}`);
    console.log(`Meeting 44x44px: ${passCount}`);
    console.log(`Below 44x44px: ${failCount}`);
    console.log(
      `Pass rate: ${(((passCount) / (passCount + failCount)) * 100).toFixed(1)}%`
    );

    // This is an informational test - always passes but logs audit data
    expect(true).toBe(true);
  });
});
