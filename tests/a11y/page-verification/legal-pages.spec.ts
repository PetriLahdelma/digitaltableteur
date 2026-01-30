/**
 * Legal Pages Verification
 *
 * Verifies that all 3 legal/utility pages pass WCAG 2.1 AA automated audit
 * across all theme and language combinations.
 *
 * Pages tested:
 * - /privacy-policy
 * - /accessibility
 * - /ai-use
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-05
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  auditPageWithThemeAndLanguage,
  themes,
  languages,
  type AuditResult,
} from "./helpers/audit-page";
import { generatePageReport } from "./helpers/report-generator";
import { legalPages, type PageInfo } from "./helpers/page-registry";

// Store all results for summary report
const allResults = new Map<string, AuditResult[]>();

// Report output directory
const REPORT_DIR = "tests/a11y/page-reports/legal";

test.describe("Legal Pages Verification", () => {
  test.beforeAll(async () => {
    // Ensure report directory exists
    const absoluteReportDir = path.resolve(REPORT_DIR);
    if (!fs.existsSync(absoluteReportDir)) {
      fs.mkdirSync(absoluteReportDir, { recursive: true });
    }
  });

  // Test each legal page
  for (const pageInfo of legalPages) {
    test(`should pass audit in all themes and languages: ${pageInfo.name}`, async ({
      page,
    }) => {
      const results: AuditResult[] = [];

      // Test all theme/language combinations sequentially
      for (const theme of themes) {
        for (const language of languages) {
          const result = await auditPageWithThemeAndLanguage(
            page,
            pageInfo.url,
            theme,
            language
          );
          results.push(result);

          // Assert zero violations for each combination
          expect(
            result.violations,
            `${pageInfo.name} should have zero violations in ${theme.name} theme with ${language.toUpperCase()} language`
          ).toHaveLength(0);
        }
      }

      // Store results for summary
      allResults.set(pageInfo.name, results);

      // Generate individual page report
      const report = generatePageReport(pageInfo.name, results);
      const reportPath = path.resolve(
        REPORT_DIR,
        `${pageInfo.name.toLowerCase().replace(/\s+/g, "-")}-report.md`
      );
      fs.writeFileSync(reportPath, report);
    });
  }

  test.afterAll(async () => {
    // Generate combined legal pages report
    if (allResults.size > 0) {
      const combinedReport = generateLegalPagesReport(allResults);
      const reportPath = path.resolve(REPORT_DIR, "legal-pages-report.md");
      fs.writeFileSync(reportPath, combinedReport);
    }
  });
});

/**
 * Generate a combined report for all legal pages.
 */
function generateLegalPagesReport(
  results: Map<string, AuditResult[]>
): string {
  const timestamp = new Date().toISOString();
  const totalPages = results.size;
  let totalCombinations = 0;
  let totalViolations = 0;
  let passingCombinations = 0;

  // Calculate statistics
  for (const pageResults of Array.from(results.values())) {
    totalCombinations += pageResults.length;
    for (const result of pageResults) {
      totalViolations += result.violations.length;
      if (result.status === "PASS") {
        passingCombinations++;
      }
    }
  }

  const overallStatus = totalViolations === 0 ? "PASS" : "FAIL";
  const passRate = ((passingCombinations / totalCombinations) * 100).toFixed(1);

  let md = `# Legal Pages Verification Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Overall Status:** ${overallStatus}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Pages Tested | ${totalPages} |\n`;
  md += `| Total Combinations | ${totalCombinations} |\n`;
  md += `| Passing Combinations | ${passingCombinations} |\n`;
  md += `| Total Violations | ${totalViolations} |\n`;
  md += `| Pass Rate | ${passRate}% |\n\n`;

  md += `## Pages Tested\n\n`;
  md += `| Page | URL | Combinations | Violations | Status |\n`;
  md += `|------|-----|--------------|------------|--------|\n`;

  for (const [pageName, pageResults] of Array.from(results.entries())) {
    const pageViolations = pageResults.reduce(
      (sum, r) => sum + r.violations.length,
      0
    );
    const pageStatus = pageViolations === 0 ? "PASS" : "FAIL";
    const url = pageResults[0]?.url || "N/A";
    md += `| ${pageName} | ${url} | ${pageResults.length} | ${pageViolations} | ${pageStatus} |\n`;
  }

  md += `\n`;

  md += `## Theme/Language Matrix\n\n`;

  for (const [pageName, pageResults] of Array.from(results.entries())) {
    md += `### ${pageName}\n\n`;
    md += `| Theme | EN | FI | SV |\n`;
    md += `|-------|----|----|----|\n`;

    for (const theme of themes) {
      let row = `| ${theme.name} |`;
      for (const lang of languages) {
        const result = pageResults.find(
          (r) => r.theme === theme.name && r.language === lang
        );
        const status = result?.status === "PASS" ? "PASS" : "FAIL";
        row += ` ${status} |`;
      }
      md += `${row}\n`;
    }
    md += `\n`;
  }

  // Document violations if any
  const allViolations: Array<{
    page: string;
    theme: string;
    language: string;
    violation: { id: string; impact: string; description: string };
  }> = [];

  for (const [pageName, pageResults] of Array.from(results.entries())) {
    for (const result of pageResults) {
      for (const v of result.violations) {
        allViolations.push({
          page: pageName,
          theme: result.theme,
          language: result.language,
          violation: {
            id: v.id,
            impact: v.impact || "unknown",
            description: v.description,
          },
        });
      }
    }
  }

  if (allViolations.length > 0) {
    md += `## Violations Found\n\n`;
    for (const item of allViolations) {
      md += `### ${item.violation.id} (${item.page})\n\n`;
      md += `**Impact:** ${item.violation.impact}\n`;
      md += `**Context:** ${item.theme} / ${item.language.toUpperCase()}\n`;
      md += `**Description:** ${item.violation.description}\n\n`;
    }
  } else {
    md += `## Violations\n\nNone - all legal pages pass automated accessibility audit.\n\n`;
  }

  md += `## Notes\n\n`;
  md += `Legal pages are text-heavy documents with minimal interactivity. Key focus areas:\n`;
  md += `- Text contrast across all themes\n`;
  md += `- Link visibility and differentiation\n`;
  md += `- Heading structure and document outline\n`;
  md += `- Language attribute correctness\n\n`;

  md += `---\n`;
  md += `*Generated by Phase 7 page-level verification (Plan 07-05)*\n`;

  return md;
}
