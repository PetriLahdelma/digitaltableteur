import { test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

/**
 * Image Accessibility Audit (PERC-01)
 *
 * Tests all public pages for image accessibility compliance.
 * Focuses on axe-core rules related to image alt text:
 * - image-alt: Images must have alt attributes
 * - image-redundant-alt: Alt text should not duplicate nearby text
 * - input-image-alt: Image buttons need alternative text
 * - role-img-alt: Elements with role="img" need accessible names
 * - svg-img-alt: SVGs with role="img" need accessible names
 *
 * Run: npm run test:a11y -- --grep "image"
 *
 * BASELINE CAPTURE MODE: Tests don't fail on violations - we capture them to JSON.
 */

// Configure axe for image-specific rules
const axeImageConfig = {
  runOnly: {
    type: "rule" as const,
    values: [
      "image-alt",
      "image-redundant-alt",
      "input-image-alt",
      "role-img-alt",
      "svg-img-alt",
    ],
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

  const results = await new AxeBuilder({ page })
    .withRules([
      "image-alt",
      "image-redundant-alt",
      "input-image-alt",
      "role-img-alt",
      "svg-img-alt",
    ])
    .analyze();

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

test.describe("Image Accessibility Audit - PERC-01", () => {
  // Core Pages
  test("home - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "home", "/");
    console.log(`Home: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("about - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "about", "/about");
    console.log(`About: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("work - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "work", "/work");
    console.log(`Work: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("blog - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "blog", "/blog");
    console.log(`Blog: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("contact - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "contact", "/contact");
    console.log(`Contact: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  // Dynamic Pages
  test("work-sap-build-apps - image accessibility", async ({ page }) => {
    const results = await auditPage(
      page,
      "work-sap-build-apps",
      "/work/sap-build-apps"
    );
    console.log(`Work SAP Build Apps: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("work-helsinki-design-system - image accessibility", async ({ page }) => {
    const results = await auditPage(
      page,
      "work-helsinki-design-system",
      "/work/helsinki-design-system"
    );
    console.log(`Work Helsinki Design System: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  // Legal & Info Pages
  test("privacy - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "privacy", "/privacy-policy");
    console.log(`Privacy: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("accessibility - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "accessibility", "/accessibility");
    console.log(`Accessibility: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  test("ai-use - image accessibility", async ({ page }) => {
    const results = await auditPage(page, "ai-use", "/ai-use");
    console.log(`AI Use: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  // Error Handling
  test("404 - image accessibility", async ({ page }) => {
    const results = await auditPage(
      page,
      "404",
      "/this-page-does-not-exist-404"
    );
    console.log(`404: ${results.violations.length} image violations, ${results.passes.length} passes`);
  });

  // Write results after all tests
  test.afterAll(async () => {
    const outputDir = path.join(process.cwd(), "tests/a11y/audit-results");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "image-alt-audit-results.json");
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    console.log(`\nImage audit results written to: ${outputPath}`);

    // Summary
    const totalViolations = Object.values(allResults).reduce(
      (sum, r) => sum + r.violations.length,
      0
    );
    const totalPasses = Object.values(allResults).reduce(
      (sum, r) => sum + r.passes,
      0
    );
    console.log(
      `\nImage Audit Summary: ${totalViolations} violations, ${totalPasses} passes across ${Object.keys(allResults).length} pages`
    );
  });
});
