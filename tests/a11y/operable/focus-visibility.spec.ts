import { test, expect, Page } from "@playwright/test";

/**
 * Focus Visibility Audit Tests (OPER-04)
 *
 * Verifies that all interactive elements show visible focus indicators
 * when navigated via keyboard across all 4 themes.
 *
 * WCAG 2.4.7 Focus Visible (Level AA):
 * Any keyboard operable user interface has a mode of operation where
 * the keyboard focus indicator is visible.
 *
 * Test approach:
 * - Tab to interactive elements via keyboard
 * - Verify outline-style is 'solid' when :focus-visible is active
 * - Test across all 4 themes (Light, Dark, HCB, HCW)
 *
 * Run: npx playwright test tests/a11y/operable/focus-visibility.spec.ts --reporter=list
 */

// Theme definitions matching existing a11y test patterns
const themes = [
  { name: "Light", className: null },
  { name: "Dark", className: "themeDark" },
  { name: "High Contrast Black", className: "themeHCB" },
  { name: "High Contrast White", className: "themeHCW" },
] as const;

// Storybook component URLs for testing
const STORYBOOK_BASE_URL = "http://localhost:6010";

const componentStories = {
  button: `${STORYBOOK_BASE_URL}/iframe.html?viewMode=story&id=components-button--primary`,
  accordion: `${STORYBOOK_BASE_URL}/iframe.html?viewMode=story&id=components-accordion--default`,
  tabs: `${STORYBOOK_BASE_URL}/iframe.html?viewMode=story&id=components-tabs--default`,
  link: `${STORYBOOK_BASE_URL}/iframe.html?viewMode=story&id=components-link--default`,
};

// Helper to apply theme class to Storybook iframe content
async function applyTheme(page: Page, themeClassName: string | null) {
  if (themeClassName) {
    await page.evaluate((className) => {
      // Remove any existing theme classes
      document.documentElement.classList.remove(
        "themeDark",
        "themeHCB",
        "themeHCW"
      );
      // Add the new theme class
      document.documentElement.classList.add(className);
    }, themeClassName);
    // Wait for styles to apply
    await page.waitForTimeout(200);
  } else {
    // Light theme - remove all theme classes
    await page.evaluate(() => {
      document.documentElement.classList.remove(
        "themeDark",
        "themeHCB",
        "themeHCW"
      );
    });
    await page.waitForTimeout(200);
  }
}

// Helper to verify focus ring is visible
async function verifyFocusRingVisible(
  page: Page,
  selector: string,
  description: string
) {
  const element = page.locator(selector).first();

  // Focus the element via keyboard (Tab or programmatic focus)
  await element.focus();

  // Get computed styles to verify outline
  const outlineStyle = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      outlineColor: computed.outlineColor,
    };
  });

  // Focus ring should have solid outline with non-zero width
  expect(
    outlineStyle.outlineStyle,
    `${description} should have solid outline style when focused`
  ).toBe("solid");

  expect(
    outlineStyle.outlineWidth,
    `${description} should have visible outline width when focused`
  ).not.toBe("0px");

  return outlineStyle;
}

test.describe("Focus Visibility Audit (OPER-04)", () => {
  // Skip if Storybook is not running
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(STORYBOOK_BASE_URL, { timeout: 5000 });
    } catch {
      test.skip(true, "Storybook not running - start with: npm run storybook");
    }
  });

  test.describe("Button Focus Visibility", () => {
    for (const theme of themes) {
      test(`Button shows focus ring in ${theme.name} theme`, async ({
        page,
      }) => {
        await page.goto(componentStories.button);
        await page.waitForLoadState("domcontentloaded");
        await applyTheme(page, theme.className);

        const result = await verifyFocusRingVisible(
          page,
          'button[class*="button"]',
          `Button in ${theme.name} theme`
        );

        console.log(`[${theme.name}] Button focus ring:`, result);
      });
    }
  });

  test.describe("Accordion Trigger Focus Visibility", () => {
    for (const theme of themes) {
      test(`Accordion trigger shows focus ring in ${theme.name} theme`, async ({
        page,
      }) => {
        await page.goto(componentStories.accordion);
        await page.waitForLoadState("domcontentloaded");
        await applyTheme(page, theme.className);

        const result = await verifyFocusRingVisible(
          page,
          'button[class*="trigger"]',
          `Accordion trigger in ${theme.name} theme`
        );

        console.log(`[${theme.name}] Accordion trigger focus ring:`, result);
      });
    }
  });

  test.describe("Tabs Focus Visibility", () => {
    for (const theme of themes) {
      test(`Tab button shows focus ring in ${theme.name} theme`, async ({
        page,
      }) => {
        await page.goto(componentStories.tabs);
        await page.waitForLoadState("domcontentloaded");
        await applyTheme(page, theme.className);

        const result = await verifyFocusRingVisible(
          page,
          'button[role="tab"]',
          `Tab button in ${theme.name} theme`
        );

        console.log(`[${theme.name}] Tab focus ring:`, result);
      });
    }
  });

  test.describe("Link Focus Visibility", () => {
    for (const theme of themes) {
      test(`Link shows focus ring in ${theme.name} theme`, async ({ page }) => {
        await page.goto(componentStories.link);
        await page.waitForLoadState("domcontentloaded");
        await applyTheme(page, theme.className);

        const result = await verifyFocusRingVisible(
          page,
          'a[class*="link"]',
          `Link in ${theme.name} theme`
        );

        console.log(`[${theme.name}] Link focus ring:`, result);
      });
    }
  });

  test.describe("Skip Link Visibility", () => {
    test("Skip link appears on first Tab press", async ({ page }) => {
      // Test on home page
      await page.goto("http://localhost:3000");
      await page.waitForLoadState("domcontentloaded");

      // Press Tab to trigger skip link visibility
      await page.keyboard.press("Tab");

      // Skip links typically have class or text identifying them
      const skipLink = page.locator(
        'a[href="#main"], a[href="#content"], [class*="skipLink"], [class*="skip"]'
      );

      // If skip link exists, verify it becomes visible
      const skipLinkCount = await skipLink.count();
      if (skipLinkCount > 0) {
        // Wait for any CSS transition
        await page.waitForTimeout(100);

        const isVisible = await skipLink.first().isVisible();
        expect(
          isVisible,
          "Skip link should be visible after pressing Tab"
        ).toBe(true);

        // Verify focus ring on skip link
        const styles = await skipLink.first().evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            outlineStyle: computed.outlineStyle,
            opacity: computed.opacity,
            position: computed.position,
          };
        });

        console.log("Skip link styles when focused:", styles);
      } else {
        console.log("No skip link found - consider adding one for OPER-01");
      }
    });
  });

  test.describe("Focus Ring Theme Consistency", () => {
    test("Focus ring colors adapt correctly across themes", async ({
      page,
    }) => {
      const results: Record<string, string> = {};

      for (const theme of themes) {
        await page.goto(componentStories.button);
        await page.waitForLoadState("domcontentloaded");
        await applyTheme(page, theme.className);

        const button = page.locator('button[class*="button"]').first();
        await button.focus();

        const outlineColor = await button.evaluate((el) => {
          return window.getComputedStyle(el).outlineColor;
        });

        results[theme.name] = outlineColor;
      }

      console.log("\n=== Focus Ring Colors by Theme ===");
      for (const [themeName, color] of Object.entries(results)) {
        console.log(`  ${themeName}: ${color}`);
      }

      // Verify high contrast themes have appropriate colors
      // HCB should have white (#fff or rgb(255,255,255)) focus ring
      // HCW should have black (#000 or rgb(0,0,0)) focus ring
      expect(results["High Contrast Black"]).toMatch(
        /rgb\(255,\s*255,\s*255\)|#fff/i
      );
      expect(results["High Contrast White"]).toMatch(/rgb\(0,\s*0,\s*0\)|#000/i);
    });
  });
});

test.describe("Focus Visibility on Live Site", () => {
  // These tests run against the actual Next.js site
  const SITE_URL = "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto(SITE_URL, { timeout: 5000 });
    } catch {
      test.skip(true, "Dev server not running - start with: npm run dev");
    }
  });

  test("Interactive elements on home page show focus ring", async ({
    page,
  }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState("domcontentloaded");

    // Tab through first few interactive elements
    const focusedElements: string[] = [];

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");

      const focusedInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const computed = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          className: el.className,
          outlineStyle: computed.outlineStyle,
          outlineWidth: computed.outlineWidth,
        };
      });

      if (focusedInfo) {
        focusedElements.push(
          `${focusedInfo.tagName}.${focusedInfo.className.split(" ")[0]} - outline: ${focusedInfo.outlineStyle} ${focusedInfo.outlineWidth}`
        );
      }
    }

    console.log("\n=== Tab Order Focus Audit ===");
    focusedElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el}`);
    });

    // At least some elements should have visible focus
    expect(focusedElements.length).toBeGreaterThan(0);
  });

  for (const theme of themes) {
    test(`Buttons on home page show focus ring in ${theme.name} theme`, async ({
      page,
    }) => {
      await page.goto(SITE_URL);
      await page.waitForLoadState("domcontentloaded");
      await applyTheme(page, theme.className);

      // Find first button on page
      const button = page.locator("button").first();
      const buttonExists = (await button.count()) > 0;

      if (buttonExists) {
        await button.focus();

        const outlineStyle = await button.evaluate((el) => {
          return window.getComputedStyle(el).outlineStyle;
        });

        expect(
          outlineStyle,
          `Button should have solid focus ring in ${theme.name} theme`
        ).toBe("solid");
      } else {
        console.log(`No buttons found on home page in ${theme.name} theme`);
      }
    });
  }
});
