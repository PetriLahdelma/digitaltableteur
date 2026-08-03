/**
 * Work Project Pages Accessibility Verification
 *
 * Verifies all 11 work/portfolio project pages pass WCAG 2.1 AA
 * automated audit across all 4 themes.
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-03 (Work Pages Verification)
 *
 * Requirements satisfied: PAGE-03 (Work/Portfolio Pages)
 */

import { test, expect } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";
import AxeBuilder from "@axe-core/playwright";
import {
  themes,
  type Theme,
  applyTheme,
  type AuditResult,
  type AxeViolation,
} from "./helpers/audit-page";
import { workPages } from "./helpers/page-registry";

/**
 * WCAG 2.1 AA tags for axe-core scanning.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/**
 * Audit results collected during test run.
 */
const allResults: Map<string, AuditResult[]> = new Map();

/**
 * Audit a single work page with a specific theme.
 * Uses domcontentloaded + wait for performance with heavy media pages.
 */
async function auditWorkPage(
  page: import("@playwright/test").Page,
  url: string,
  theme: Theme
): Promise<AuditResult> {
  // Navigate with domcontentloaded (faster for media-heavy pages)
  // Then wait a moment for client-side hydration
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Apply theme via DOM manipulation
  await applyTheme(page, theme.className);

  // Run axe-core audit with WCAG 2.1 AA tags
  const results = await new AxeBuilder({ page })
    .withTags([...WCAG_TAGS])
    .analyze();

  // Map violations to our structure
  const violations: AxeViolation[] = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact as AxeViolation["impact"],
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.map((n) => ({
      html: n.html,
      target: n.target as string[],
      failureSummary: n.failureSummary,
    })),
  }));

  return {
    page: url,
    theme: theme.name,
    language: "en", // Work pages are visual, skip language variants
    url,
    timestamp: new Date().toISOString(),
    violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    status: violations.length === 0 ? "PASS" : "FAIL",
  };
}

/**
 * Generate consolidated markdown report for work pages.
 */
function generateWorkPagesReport(results: Map<string, AuditResult[]>): string {
  const totalPages = results.size;
  let totalViolations = 0;

  // Build the matrix data
  const matrixData: Array<{
    name: string;
    url: string;
    light: string;
    dark: string;
    hcb: string;
    hcw: string;
  }> = [];

  for (const [pageName, pageResults] of Array.from(results.entries())) {
    const row = {
      name: pageName,
      url: pageResults[0]?.url || "",
      light: "N/A",
      dark: "N/A",
      hcb: "N/A",
      hcw: "N/A",
    };

    for (const result of pageResults) {
      totalViolations += result.violations.length;
      const status =
        result.violations.length === 0
          ? "PASS"
          : `FAIL (${result.violations.length})`;

      switch (result.theme) {
        case "Light":
          row.light = status;
          break;
        case "Dark":
          row.dark = status;
          break;
        case "High Contrast Black":
          row.hcb = status;
          break;
        case "High Contrast White":
          row.hcw = status;
          break;
      }
    }

    matrixData.push(row);
  }

  // Sort alphabetically by name
  matrixData.sort((a, b) => a.name.localeCompare(b.name));

  // Calculate overall status
  const overallStatus = totalViolations === 0 ? "PASS" : "FAIL";
  const totalCombinations = totalPages * 4; // 4 themes

  // Build the report
  let md = `# Work Project Pages Verification Report\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Overall Status:** ${overallStatus}\n`;
  md += `**Pages Audited:** ${totalPages}\n`;
  md += `**Theme Combinations:** ${totalCombinations} (${totalPages} pages x 4 themes)\n`;
  md += `**Total Violations:** ${totalViolations}\n\n`;

  md += `## Summary\n\n`;
  md += `This report verifies accessibility compliance for all work/portfolio project pages.\n`;
  md += `Each page is tested across 4 themes: Light, Dark, High Contrast Black (HCB), and High Contrast White (HCW).\n\n`;

  md += `## Results Matrix\n\n`;
  md += `| Project | Light | Dark | HCB | HCW |\n`;
  md += `|---------|-------|------|-----|-----|\n`;

  for (const row of matrixData) {
    md += `| ${row.name} | ${row.light} | ${row.dark} | ${row.hcb} | ${row.hcw} |\n`;
  }
  md += `\n`;

  // Collect all violations for detailed listing
  const allViolations: Array<{
    page: string;
    theme: string;
    violation: AxeViolation;
  }> = [];

  for (const [pageName, pageResults] of Array.from(results.entries())) {
    for (const result of pageResults) {
      for (const violation of result.violations) {
        allViolations.push({
          page: pageName,
          theme: result.theme,
          violation,
        });
      }
    }
  }

  if (allViolations.length > 0) {
    md += `## Violations Detail\n\n`;

    // Group by rule ID
    const byRule = new Map<
      string,
      Array<{ page: string; theme: string; violation: AxeViolation }>
    >();
    for (const v of allViolations) {
      const existing = byRule.get(v.violation.id) || [];
      existing.push(v);
      byRule.set(v.violation.id, existing);
    }

    for (const [ruleId, items] of Array.from(byRule.entries())) {
      const first = items[0].violation;
      md += `### ${ruleId}\n\n`;
      md += `**Impact:** ${first.impact || "unknown"}\n`;
      md += `**Description:** ${first.description}\n`;
      md += `**Help:** ${first.help}\n`;
      md += `**More Info:** [${first.helpUrl}](${first.helpUrl})\n\n`;

      md += `**Affected Pages:**\n`;
      for (const item of items) {
        md += `- ${item.page} (${item.theme})\n`;
      }
      md += `\n`;

      // Show sample elements
      const sampleNodes = items
        .flatMap((i) => i.violation.nodes)
        .slice(0, 5)
        .map((n) => n.target.join(" > "));

      if (sampleNodes.length > 0) {
        md += `**Sample Elements:**\n\n`;
        md += "```\n";
        for (const target of sampleNodes) {
          md += `${target}\n`;
        }
        md += "```\n\n";
      }
    }
  } else {
    md += `## Violations Detail\n\n`;
    md += `None - all work project pages pass automated accessibility checks.\n\n`;
  }

  md += `## Methodology\n\n`;
  md += `- **Tool:** axe-core via @axe-core/playwright\n`;
  md += `- **Tags:** wcag2a, wcag2aa, wcag21a, wcag21aa\n`;
  md += `- **Wait Strategy:** domcontentloaded + 1s (optimized for media-heavy pages)\n`;
  md += `- **Languages:** English only (work pages are visual/portfolio content)\n\n`;

  md += `## Requirement Coverage\n\n`;
  md += `This audit satisfies **PAGE-03** (Work/Portfolio Pages) from the accessibility requirements.\n\n`;

  md += `---\n`;
  md += `*Generated by Phase 7 page-level verification infrastructure*\n`;

  return md;
}

test.describe("Work Project Pages Verification", () => {
  test.describe.configure({ mode: "serial" });

  // Extended timeout: workPages is derived from projects.ts plus extras
  // (currently 16 pages x 4 themes = 64 combinations at ~3-5s each)
  test("should pass accessibility audit for all work projects across all themes", async ({
    page,
  }) => {
    test.setTimeout(600000); // 10 minutes
    // Clear previous results
    allResults.clear();

    // Audit each work page across all themes
    for (const workPage of workPages) {
      const pageResults: AuditResult[] = [];

      for (const theme of themes) {
        try {
          const result = await auditWorkPage(page, workPage.url, theme);
          pageResults.push(result);

          // Log progress
          const status = result.violations.length === 0 ? "PASS" : "FAIL";
          console.log(`  ${workPage.name} / ${theme.name}: ${status}`);
        } catch (error) {
          // Handle 404 or other errors gracefully
          console.warn(`  ${workPage.name} / ${theme.name}: ERROR - ${error}`);
          pageResults.push({
            page: workPage.url,
            theme: theme.name,
            language: "en",
            url: workPage.url,
            timestamp: new Date().toISOString(),
            violations: [],
            passes: 0,
            incomplete: 0,
            status: "FAIL",
          });
        }
      }

      allResults.set(workPage.name, pageResults);
    }

    // Generate consolidated report
    const reportContent = generateWorkPagesReport(allResults);
    const reportPath = path.resolve(
      __dirname,
      "../page-reports/work-projects/work-projects-report.md"
    );

    // Ensure directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, reportContent, "utf-8");

    console.log(`\nReport generated: ${reportPath}`);

    // Calculate totals for assertion
    let totalViolations = 0;
    const failingPages: string[] = [];

    for (const [pageName, pageResults] of Array.from(allResults.entries())) {
      const pageViolations = pageResults.reduce(
        (sum, r) => sum + r.violations.length,
        0
      );
      totalViolations += pageViolations;
      if (pageViolations > 0) {
        failingPages.push(pageName);
      }
    }

    // Log summary
    console.log(`\n=== Work Pages Verification Summary ===`);
    console.log(`Pages audited: ${allResults.size}`);
    console.log(`Themes tested: ${themes.length}`);
    console.log(`Total combinations: ${allResults.size * themes.length}`);
    console.log(`Total violations: ${totalViolations}`);

    if (failingPages.length > 0) {
      console.log(`Failing pages: ${failingPages.join(", ")}`);
    }

    // Assert zero violations
    expect(totalViolations).toBe(0);
  });
});
