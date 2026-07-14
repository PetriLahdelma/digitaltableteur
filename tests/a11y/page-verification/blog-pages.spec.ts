/**
 * Blog Post Pages Accessibility Verification
 *
 * Tests every publicly visible blog post for WCAG 2.1 AA compliance.
 * The post list is derived from generated metadata (see `blogPages` in
 * page-registry), so coverage tracks published content automatically.
 * Blog posts are English-only MDX content with code blocks, images,
 * and potentially embedded content.
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-04 (Blog Pages)
 *
 * Test matrix:
 * - Every visible blog post (derived, not hardcoded)
 * - 4 themes (Light, Dark, HCB, HCW)
 * - English only (MDX content is English)
 *
 * Run: npx playwright test tests/a11y/page-verification/blog-pages.spec.ts
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

import {
  auditPageWithThemeAndLanguage,
  themes,
  type AuditResult,
} from "./helpers/audit-page";
import { blogPages } from "./helpers/page-registry";

/**
 * Known exceptions for third-party content that we cannot control.
 * These are documented but do not cause test failures.
 */
interface KnownException {
  type: "youtube" | "external-image" | "syntax-highlighting" | "third-party";
  description: string;
  violationId?: string;
}

const knownExceptions: KnownException[] = [
  {
    type: "youtube",
    description:
      "YouTube iframe embeds are third-party content with limited accessibility control",
  },
  {
    type: "external-image",
    description:
      "External images may lack alt text (author responsibility for content review)",
  },
  {
    type: "syntax-highlighting",
    description:
      "Code block syntax highlighting may have contrast issues in certain themes",
    violationId: "color-contrast",
  },
];

/**
 * Directory for storing individual test results (for cross-worker aggregation).
 */
const RESULTS_DIR = path.join(
  process.cwd(),
  "tests/a11y/page-reports/blog-posts/.results"
);

/**
 * Check if a violation matches a known exception.
 */
function isKnownException(
  violation: AuditResult["violations"][0],
  _pageUrl: string
): boolean {
  // Check for YouTube iframe violations
  if (violation.nodes.some((n) => n.html.includes("youtube"))) {
    return true;
  }

  // Check for external image violations
  if (
    violation.id === "image-alt" &&
    violation.nodes.some(
      (n) => n.html.includes("http://") || n.html.includes("https://")
    )
  ) {
    return true;
  }

  // Syntax highlighting contrast in code blocks
  if (
    violation.id === "color-contrast" &&
    violation.nodes.some(
      (n) =>
        n.target.some(
          (t) =>
            t.includes("pre") || t.includes("code") || t.includes("hljs")
        ) || n.html.includes("<code") || n.html.includes("<pre")
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Filter violations to exclude known exceptions.
 * Returns only violations that are actionable (not third-party).
 */
function getActionableViolations(
  result: AuditResult
): AuditResult["violations"] {
  return result.violations.filter((v) => !isKnownException(v, result.url));
}

/**
 * Save an individual test result to a JSON file for later aggregation.
 */
function saveResultToFile(pageName: string, theme: string, result: AuditResult): void {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  // Use a sanitized filename
  const safeName = pageName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeTheme = theme.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${safeName}_${safeTheme}.json`;
  const filepath = path.join(RESULTS_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify({ pageName, result }, null, 2));
}

/**
 * Load all results from the results directory.
 */
function loadAllResults(): Map<string, AuditResult[]> {
  const resultsMap = new Map<string, AuditResult[]>();

  if (!fs.existsSync(RESULTS_DIR)) {
    return resultsMap;
  }

  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    try {
      const filepath = path.join(RESULTS_DIR, file);
      const content = fs.readFileSync(filepath, "utf-8");
      const data = JSON.parse(content) as { pageName: string; result: AuditResult };

      const existing = resultsMap.get(data.pageName) || [];
      existing.push(data.result);
      resultsMap.set(data.pageName, existing);
    } catch {
      // Ignore malformed files
    }
  }

  return resultsMap;
}

/**
 * Clean up individual result files.
 */
function cleanupResultFiles(): void {
  if (fs.existsSync(RESULTS_DIR)) {
    const files = fs.readdirSync(RESULTS_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(RESULTS_DIR, file));
    }
    fs.rmdirSync(RESULTS_DIR);
  }
}

/**
 * Generate consolidated markdown report for all blog posts.
 */
function generateBlogPostsReport(results: Map<string, AuditResult[]>): string {
  const timestamp = new Date().toISOString();
  const totalPages = results.size;
  let totalCombinations = 0;
  let passingCombinations = 0;
  let totalViolations = 0;
  let totalExceptions = 0;

  // Calculate statistics
  for (const pageResults of Array.from(results.values())) {
    for (const result of pageResults) {
      totalCombinations++;
      const actionable = getActionableViolations(result);
      const exceptions = result.violations.length - actionable.length;
      totalExceptions += exceptions;
      totalViolations += actionable.length;
      if (actionable.length === 0) {
        passingCombinations++;
      }
    }
  }

  const overallStatus = totalViolations === 0 ? "PASS" : "FAIL";

  let md = `# Blog Post Pages Verification Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Overall Status:** ${overallStatus}\n`;
  md += `**Requirement:** PAGE-04 (Blog pages pass WCAG 2.1 AA)\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Blog Posts Tested | ${totalPages} |\n`;
  md += `| Themes Tested | ${themes.length} |\n`;
  md += `| Total Combinations | ${totalCombinations} |\n`;
  md += `| Passing Combinations | ${passingCombinations} |\n`;
  md += `| Actionable Violations | ${totalViolations} |\n`;
  md += `| Third-Party Exceptions | ${totalExceptions} |\n`;
  md += `| Pass Rate | ${((passingCombinations / totalCombinations) * 100).toFixed(1)}% |\n\n`;

  md += `## Results by Blog Post\n\n`;
  md += `| Blog Post | Light | Dark | HCB | HCW |\n`;
  md += `|-----------|-------|------|-----|-----|\n`;

  // Sort by name and create results table
  const sortedEntries = Array.from(results.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [pageName, pageResults] of sortedEntries) {
    // Truncate name to 40 chars
    const displayName =
      pageName.length > 40 ? pageName.substring(0, 37) + "..." : pageName;

    const themeStatuses: Record<string, string> = {};
    for (const result of pageResults) {
      const actionable = getActionableViolations(result);
      const exceptions = result.violations.length - actionable.length;
      let status =
        actionable.length === 0 ? "PASS" : `FAIL (${actionable.length})`;
      if (exceptions > 0) {
        status += ` [${exceptions}*]`;
      }
      themeStatuses[result.theme] = status;
    }

    md += `| ${displayName} | ${themeStatuses["Light"] || "-"} | ${themeStatuses["Dark"] || "-"} | ${themeStatuses["High Contrast Black"] || "-"} | ${themeStatuses["High Contrast White"] || "-"} |\n`;
  }

  md += `\n*[N*] = Third-party exceptions documented but not counted as failures*\n\n`;

  // Document known exceptions
  md += `## Known Exceptions (Third-Party Content)\n\n`;
  md += `These violations are from third-party content we cannot directly control:\n\n`;
  for (const exception of knownExceptions) {
    md += `- **${exception.type}**: ${exception.description}\n`;
  }
  md += `\n`;

  // Document any violations found
  const allViolations: Array<{
    violation: AuditResult["violations"][0];
    page: string;
    theme: string;
    isException: boolean;
  }> = [];

  for (const [pageName, pageResults] of sortedEntries) {
    for (const result of pageResults) {
      for (const violation of result.violations) {
        allViolations.push({
          violation,
          page: pageName,
          theme: result.theme,
          isException: isKnownException(violation, result.url),
        });
      }
    }
  }

  if (allViolations.length > 0) {
    // Group by violation type
    const violationsByType = new Map<
      string,
      Array<{
        violation: AuditResult["violations"][0];
        page: string;
        theme: string;
        isException: boolean;
      }>
    >();

    for (const v of allViolations) {
      const existing = violationsByType.get(v.violation.id) || [];
      existing.push(v);
      violationsByType.set(v.violation.id, existing);
    }

    md += `## Violations Detail\n\n`;

    for (const [violationId, violations] of Array.from(
      violationsByType.entries()
    )) {
      const first = violations[0].violation;
      const actionableCount = violations.filter((v) => !v.isException).length;
      const exceptionCount = violations.filter((v) => v.isException).length;

      md += `### ${violationId}\n\n`;
      md += `**Impact:** ${first.impact || "unknown"}\n`;
      md += `**Description:** ${first.description}\n`;
      md += `**Actionable:** ${actionableCount} | **Exceptions:** ${exceptionCount}\n\n`;

      if (actionableCount > 0) {
        md += `**Actionable Occurrences:**\n`;
        const actionable = violations.filter((v) => !v.isException);
        for (const v of actionable.slice(0, 5)) {
          md += `- ${v.page} (${v.theme})\n`;
        }
        if (actionable.length > 5) {
          md += `- ... and ${actionable.length - 5} more\n`;
        }
        md += `\n`;
      }

      if (exceptionCount > 0) {
        md += `**Exception Occurrences (third-party):**\n`;
        const exceptions = violations.filter((v) => v.isException);
        for (const v of exceptions.slice(0, 3)) {
          md += `- ${v.page} (${v.theme})\n`;
        }
        if (exceptions.length > 3) {
          md += `- ... and ${exceptions.length - 3} more\n`;
        }
        md += `\n`;
      }
    }
  } else {
    md += `## Violations Detail\n\nNo violations found - all blog posts pass automated checks.\n\n`;
  }

  md += `---\n*Generated by Phase 7 page-level verification (07-04)*\n`;

  return md;
}

// Configure test to run sequentially to avoid file write race conditions
test.describe.configure({ mode: "serial" });

test.describe("Blog Post Pages Verification (PAGE-04)", () => {
  // Clean up any previous result files before starting
  test.beforeAll(() => {
    cleanupResultFiles();
  });

  // Test each blog post across all themes
  for (const blogPost of blogPages) {
    test.describe(`Blog: ${blogPost.name}`, () => {
      // Blog posts are English-only MDX content
      const language = "en" as const;

      for (const theme of themes) {
        test(`${theme.name} theme`, async ({ page }) => {
          // Run audit
          const result = await auditPageWithThemeAndLanguage(
            page,
            blogPost.url,
            theme,
            language
          );

          // Save result to file for aggregation
          saveResultToFile(blogPost.name, theme.name, result);

          // Get actionable violations (excluding known exceptions)
          const actionableViolations = getActionableViolations(result);
          const exceptionCount =
            result.violations.length - actionableViolations.length;

          // Log results
          console.log(
            `[${theme.name}] ${blogPost.name}: ${actionableViolations.length} violations` +
              (exceptionCount > 0 ? ` (${exceptionCount} exceptions)` : "")
          );

          // Log specific violations for debugging
          if (actionableViolations.length > 0) {
            for (const violation of actionableViolations) {
              console.log(`  - ${violation.id}: ${violation.help}`);
              for (const node of violation.nodes.slice(0, 2)) {
                console.log(`    ${node.target.join(" > ")}`);
              }
            }
          }

          // Assert no actionable violations
          // Exceptions are documented but do not fail the test
          expect(
            actionableViolations.length,
            `Expected 0 actionable violations for ${blogPost.name} in ${theme.name} theme, ` +
              `found ${actionableViolations.length}: ${actionableViolations.map((v) => v.id).join(", ")}`
          ).toBe(0);
        });
      }
    });
  }

  // Generate consolidated report after all tests
  test.afterAll(() => {
    // Load all results from files
    const resultsMap = loadAllResults();

    // Generate report
    const report = generateBlogPostsReport(resultsMap);

    // Write report to file
    const outputPath = path.join(
      process.cwd(),
      "tests/a11y/page-reports/blog-posts/blog-posts-report.md"
    );

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, report);

    console.log(`\n=== Blog Post Pages Verification Summary ===`);
    console.log(`Report written to: ${outputPath}`);
    console.log(`Total blog posts tested: ${resultsMap.size}`);
    console.log(`Total combinations: ${blogPages.length * themes.length}`);

    // Clean up result files
    cleanupResultFiles();
  });
});
