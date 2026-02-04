import { test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

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
 *
 * BASELINE CAPTURE MODE: Tests don't fail on violations - we capture them to JSON.
 */

// Configure axe for WCAG 2.1 AA compliance
const axeConfig = {
  runOnly: {
    type: "tag" as const,
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
};

// Store results from all pages
const allResults: Record<
  string,
  {
    url: string;
    violations: Array<{
      id: string;
      impact: string | null | undefined;
      description: string;
      help: string;
      helpUrl: string;
      nodes: Array<{ html: string; target: string[] }>;
    }>;
    passes: number;
    incomplete: number;
  }
> = {};

// Helper to run audit and store results
async function auditPage(
  page: Page,
  pageName: string,
  url: string
) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page }).options(axeConfig).analyze();

  allResults[pageName] = {
    url,
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target as string[],
      })),
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
  };

  return results;
}

test.describe("Accessibility Audit - Baseline Capture", () => {
  // Run tests serially to properly aggregate results into a single JSON file
  // Without this, parallel workers each have their own allResults object and overwrite each other
  test.describe.configure({ mode: "serial" });

  // Core Pages
  test("home", async ({ page }) => {
    const results = await auditPage(page, "home", "/");
    console.log(`Home: ${results.violations.length} violations`);
  });

  test("about", async ({ page }) => {
    const results = await auditPage(page, "about", "/about");
    console.log(`About: ${results.violations.length} violations`);
  });

  test("work", async ({ page }) => {
    const results = await auditPage(page, "work", "/work");
    console.log(`Work: ${results.violations.length} violations`);
  });

  test("blog", async ({ page }) => {
    const results = await auditPage(page, "blog", "/blog");
    console.log(`Blog: ${results.violations.length} violations`);
  });

  test("contact", async ({ page }) => {
    const results = await auditPage(page, "contact", "/contact");
    console.log(`Contact: ${results.violations.length} violations`);
  });

  // Dynamic Pages
  test("work-sap-build-apps", async ({ page }) => {
    const results = await auditPage(
      page,
      "work-sap-build-apps",
      "/work/sap-build-apps"
    );
    console.log(`Work SAP Build Apps: ${results.violations.length} violations`);
  });

  test("work-helsinki-design-system", async ({ page }) => {
    const results = await auditPage(
      page,
      "work-helsinki-design-system",
      "/work/helsinki-design-system"
    );
    console.log(
      `Work Helsinki Design System: ${results.violations.length} violations`
    );
  });

  // Legal & Info Pages
  test("privacy", async ({ page }) => {
    const results = await auditPage(page, "privacy", "/privacy-policy");
    console.log(`Privacy: ${results.violations.length} violations`);
  });

  test("accessibility", async ({ page }) => {
    const results = await auditPage(page, "accessibility", "/accessibility");
    console.log(`Accessibility: ${results.violations.length} violations`);
  });

  test("ai-use", async ({ page }) => {
    const results = await auditPage(page, "ai-use", "/ai-use");
    console.log(`AI Use: ${results.violations.length} violations`);
  });

  // Error Handling
  test("404", async ({ page }) => {
    const results = await auditPage(
      page,
      "404",
      "/this-page-does-not-exist-404"
    );
    console.log(`404: ${results.violations.length} violations`);
  });

  // Write results after all tests
  test.afterAll(async () => {
    const outputDir = path.join(process.cwd(), "tests/a11y/audit-results");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "audit-results.json");
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    console.log(`\nResults written to: ${outputPath}`);

    // Summary
    const totalViolations = Object.values(allResults).reduce(
      (sum, r) => sum + r.violations.length,
      0
    );
    console.log(
      `\nTotal: ${totalViolations} violations across ${Object.keys(allResults).length} pages`
    );
  });
});
