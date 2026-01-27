import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Page-level accessibility audit using @axe-core/playwright
 *
 * Tests all public pages against WCAG 2.1 AA standards.
 * This captures violations that component-level tests miss:
 * - Landmark structure issues
 * - Navigation flow problems
 * - Heading hierarchy across full DOM
 * - Layout-level contrast issues
 *
 * Run: npm run test:a11y:pages
 * Report: npm run test:a11y:pages:report
 */

// Configure axe for WCAG 2.1 AA compliance
const axeConfig = {
  runOnly: {
    type: "tag" as const,
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
};

/**
 * Helper to log violations for debugging
 */
function logViolations(
  pageName: string,
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]
) {
  if (violations.length > 0) {
    console.log(`\n--- ${pageName} violations (${violations.length}) ---`);
    violations.forEach((v, i) => {
      console.log(`${i + 1}. [${v.impact}] ${v.id}: ${v.description}`);
      console.log(`   Help: ${v.helpUrl}`);
      console.log(`   Nodes: ${v.nodes.length} elements affected`);
    });
  }
}

test.describe("Accessibility Audit - Core Pages", () => {
  test("home page has no accessibility violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Home", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("about page has no accessibility violations", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("About", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("work page has no accessibility violations", async ({ page }) => {
    await page.goto("/work");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Work", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("blog page has no accessibility violations", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Blog", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("contact page has no accessibility violations", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Contact", results.violations);
    expect(results.violations).toEqual([]);
  });
});

test.describe("Accessibility Audit - Dynamic Pages", () => {
  test("work/sap-build-apps has no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/work/sap-build-apps");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Work: SAP Build Apps", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("work/helsinki-design-system has no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/work/helsinki-design-system");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Work: Helsinki Design System", results.violations);
    expect(results.violations).toEqual([]);
  });
});

test.describe("Accessibility Audit - Legal & Info Pages", () => {
  test("privacy-policy page has no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/privacy-policy");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Privacy Policy", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("accessibility page has no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/accessibility");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("Accessibility", results.violations);
    expect(results.violations).toEqual([]);
  });

  test("ai-use page has no accessibility violations", async ({ page }) => {
    await page.goto("/ai-use");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("AI Use", results.violations);
    expect(results.violations).toEqual([]);
  });
});

test.describe("Accessibility Audit - Error Handling", () => {
  test("404 page has no accessibility violations", async ({ page }) => {
    // Navigate to a non-existent page to trigger 404
    await page.goto("/this-page-does-not-exist-404");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

    logViolations("404 Not Found", results.violations);
    expect(results.violations).toEqual([]);
  });
});
