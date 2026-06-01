/**
 * Utility Pages Verification
 *
 * Verifies colophon and HTML sitemap pages pass WCAG 2.1 AA automated audit
 * across theme and language combinations.
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
import { utilityPages } from "./helpers/page-registry";

const REPORT_DIR = "tests/a11y/page-reports/utility";
const allResults = new Map<string, AuditResult[]>();

test.describe("Utility Pages Verification", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    fs.mkdirSync(path.resolve(REPORT_DIR), { recursive: true });
  });

  for (const pageInfo of utilityPages) {
    test(`should pass audit in all themes and languages: ${pageInfo.name}`, async ({
      page,
    }) => {
      const results: AuditResult[] = [];

      for (const theme of themes) {
        for (const language of languages) {
          const result = await auditPageWithThemeAndLanguage(
            page,
            pageInfo.url,
            theme,
            language
          );
          results.push(result);

          expect(
            result.violations,
            `${pageInfo.name} (${theme.name}/${language}) should have zero violations`
          ).toHaveLength(0);
        }
      }

      allResults.set(pageInfo.name, results);
      const report = generatePageReport(pageInfo.name, results);
      fs.writeFileSync(
        path.resolve(
          REPORT_DIR,
          `${pageInfo.name.toLowerCase().replace(/\s+/g, "-")}-report.md`
        ),
        report
      );
    });
  }
});
