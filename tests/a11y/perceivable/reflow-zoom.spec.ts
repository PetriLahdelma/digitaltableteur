import { test, expect } from "@playwright/test";

/**
 * Reflow and Zoom Accessibility Tests
 *
 * Verifies WCAG 2.1 AA requirements:
 * - 1.4.4 Resize Text: Text can be resized to 200% without loss of functionality
 * - 1.4.10 Reflow: Content reflows at 320px width without horizontal scroll
 * - 1.4.12 Text Spacing: Content remains visible with increased text spacing
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/reflow.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html
 */

// Increase timeout for these tests due to page loads
test.setTimeout(60000);

// Public pages to test
const pages = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Work", path: "/work" },
  { name: "Blog", path: "/blog" },
  { name: "Privacy", path: "/privacy-policy" },
  { name: "Accessibility", path: "/accessibility" },
  { name: "AI Use", path: "/ai-use" },
];

// Store results for summary
const reflowResults: Array<{
  page: string;
  hasHorizontalScroll: boolean;
  scrollWidth: number;
  viewportWidth: number;
}> = [];

const zoomResults: Array<{
  page: string;
  hasHorizontalScroll: boolean;
  scrollWidth: number;
  viewportWidth: number;
}> = [];

const textSpacingResults: Array<{
  page: string;
  hasOverflow: boolean;
  scrollWidth: number;
  viewportWidth: number;
}> = [];

test.describe("PERC-05: Reflow at 320px", () => {
  for (const { name, path } of pages) {
    test(`${name} page reflows at 320px without horizontal scroll`, async ({
      page,
    }) => {
      // Set viewport to 320px width (iPhone SE equivalent)
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Wait for layout to stabilize
      await page.waitForTimeout(1000);

      // Check for horizontal scroll
      const scrollInfo = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      const hasHorizontalScroll =
        scrollInfo.scrollWidth > scrollInfo.viewportWidth;

      // Store result
      reflowResults.push({
        page: name,
        hasHorizontalScroll,
        scrollWidth: scrollInfo.scrollWidth,
        viewportWidth: scrollInfo.viewportWidth,
      });

      // Log for visibility
      if (hasHorizontalScroll) {
        console.log(
          `[WARN] ${name}: Horizontal scroll detected at 320px (scrollWidth: ${scrollInfo.scrollWidth}px, viewport: ${scrollInfo.viewportWidth}px)`
        );

        // Capture screenshot for review
        await page.screenshot({
          path: `test-results/reflow-${name.toLowerCase()}-320px.png`,
          fullPage: true,
        });
      }

      // Assert no horizontal scroll
      expect(
        hasHorizontalScroll,
        `${name} page should not have horizontal scroll at 320px width`
      ).toBe(false);
    });
  }
});

test.describe("PERC-04: 200% Zoom Simulation", () => {
  for (const { name, path } of pages) {
    test(`${name} page is usable at 200% zoom`, async ({ page }) => {
      // 200% zoom on a 1280px screen = 640px effective viewport
      await page.setViewportSize({ width: 640, height: 480 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Wait for layout to stabilize
      await page.waitForTimeout(1000);

      // Check for horizontal scroll
      const scrollInfo = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      const hasHorizontalScroll =
        scrollInfo.scrollWidth > scrollInfo.viewportWidth;

      // Store result
      zoomResults.push({
        page: name,
        hasHorizontalScroll,
        scrollWidth: scrollInfo.scrollWidth,
        viewportWidth: scrollInfo.viewportWidth,
      });

      // Log for visibility
      if (hasHorizontalScroll) {
        console.log(
          `[WARN] ${name}: Horizontal scroll detected at 640px/200% zoom (scrollWidth: ${scrollInfo.scrollWidth}px, viewport: ${scrollInfo.viewportWidth}px)`
        );

        // Capture screenshot for review
        await page.screenshot({
          path: `test-results/zoom-${name.toLowerCase()}-200pct.png`,
          fullPage: true,
        });
      }

      // Assert no horizontal scroll
      expect(
        hasHorizontalScroll,
        `${name} page should not have horizontal scroll at 200% zoom`
      ).toBe(false);
    });
  }
});

test.describe("WCAG 1.4.12: Text Spacing", () => {
  // WCAG 1.4.12 Text Spacing requirements:
  // - Line height at least 1.5 times font size
  // - Spacing following paragraphs at least 2 times font size
  // - Letter spacing at least 0.12 times font size
  // - Word spacing at least 0.16 times font size
  const textSpacingCSS = `
    * {
      line-height: 1.5 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }
    p, li, dd, dt {
      margin-bottom: 2em !important;
    }
  `;

  for (const { name, path } of pages) {
    test(`${name} page works with WCAG text spacing`, async ({ page }) => {
      // Use standard viewport for text spacing test
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Wait for layout to stabilize
      await page.waitForTimeout(1000);

      // Apply WCAG text spacing override
      await page.addStyleTag({ content: textSpacingCSS });

      // Wait for styles to apply
      await page.waitForTimeout(500);

      // Check for overflow (content clipped or horizontal scroll)
      const scrollInfo = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      const hasOverflow = scrollInfo.scrollWidth > scrollInfo.viewportWidth;

      // Store result
      textSpacingResults.push({
        page: name,
        hasOverflow,
        scrollWidth: scrollInfo.scrollWidth,
        viewportWidth: scrollInfo.viewportWidth,
      });

      // Log for visibility
      if (hasOverflow) {
        console.log(
          `[WARN] ${name}: Content overflow with text spacing applied (scrollWidth: ${scrollInfo.scrollWidth}px, viewport: ${scrollInfo.viewportWidth}px)`
        );

        // Capture screenshot for review
        await page.screenshot({
          path: `test-results/textspacing-${name.toLowerCase()}.png`,
          fullPage: true,
        });
      }

      // Assert no overflow
      expect(
        hasOverflow,
        `${name} page should not have content overflow with WCAG text spacing`
      ).toBe(false);
    });
  }
});

test.describe("Summary", () => {
  test("Print test results summary", async () => {
    console.log("\n========================================");
    console.log("REFLOW AND ZOOM TEST RESULTS SUMMARY");
    console.log("========================================\n");

    console.log("320px Reflow (PERC-05):");
    console.log("------------------------");
    reflowResults.forEach((r) => {
      const status = r.hasHorizontalScroll ? "FAIL" : "PASS";
      console.log(`  ${r.page}: ${status}`);
    });

    console.log("\n200% Zoom (PERC-04):");
    console.log("---------------------");
    zoomResults.forEach((r) => {
      const status = r.hasHorizontalScroll ? "FAIL" : "PASS";
      console.log(`  ${r.page}: ${status}`);
    });

    console.log("\nText Spacing (1.4.12):");
    console.log("-----------------------");
    textSpacingResults.forEach((r) => {
      const status = r.hasOverflow ? "FAIL" : "PASS";
      console.log(`  ${r.page}: ${status}`);
    });

    console.log("\n========================================\n");
  });
});
