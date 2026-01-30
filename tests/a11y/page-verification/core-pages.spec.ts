/**
 * Core Pages Verification Test Suite
 *
 * Verifies the 5 core public pages pass WCAG 2.1 AA automated audit
 * across all theme and language combinations (4 themes x 3 languages = 12 per page).
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-02 (Core Pages Verification)
 *
 * Pages verified:
 * - Home (/)
 * - About (/about)
 * - Work (/work)
 * - Blog (/blog)
 * - Contact (/contact)
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  auditPageWithThemeAndLanguage,
  themes,
  languages,
  AuditResult,
} from "./helpers/audit-page";
import { generatePageReport, generateSummaryReport } from "./helpers/report-generator";
import { corePages } from "./helpers/page-registry";

// Directory for storing reports
const REPORTS_DIR = path.join(__dirname, "..", "page-reports");

// Store all results for summary report
const allPageResults = new Map<string, AuditResult[]>();

test.describe("Core Pages Verification", () => {
  test.describe.configure({ mode: "parallel" });

  for (const pageInfo of corePages) {
    test(`should pass audit in all themes and languages: ${pageInfo.name}`, async ({
      page,
    }) => {
      const results: AuditResult[] = [];

      // Test all theme/language combinations sequentially within this page test
      // (avoids race conditions on DOM manipulation)
      for (const theme of themes) {
        for (const language of languages) {
          const result = await auditPageWithThemeAndLanguage(
            page,
            pageInfo.url,
            theme,
            language
          );
          results.push(result);

          // Assert zero violations for this combination
          expect(
            result.violations,
            `${pageInfo.name} (${theme.name}/${language}) should have zero violations`
          ).toHaveLength(0);
        }
      }

      // Store results for summary
      allPageResults.set(pageInfo.name, results);

      // Generate and save individual page report
      const report = generatePageReport(pageInfo.name, results);
      const pageDirName = pageInfo.name.toLowerCase().replace(/\s+/g, "-");
      const pageReportDir = path.join(REPORTS_DIR, pageDirName);

      // Create directory if needed
      fs.mkdirSync(pageReportDir, { recursive: true });

      // Write report
      const reportPath = path.join(pageReportDir, `${pageDirName}-report.md`);
      fs.writeFileSync(reportPath, report, "utf-8");

      console.log(`Report written: ${reportPath}`);
    });
  }

  test.afterAll(async () => {
    // Generate and save summary report if we have results
    if (allPageResults.size > 0) {
      const summaryReport = generateSummaryReport(allPageResults);
      const summaryPath = path.join(REPORTS_DIR, "core-pages-summary.md");

      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      fs.writeFileSync(summaryPath, summaryReport, "utf-8");

      console.log(`Summary report written: ${summaryPath}`);
    }
  });
});
