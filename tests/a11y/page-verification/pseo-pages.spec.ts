/**
 * PSEO Pages Verification
 *
 * Hub and pilot leaf pages — English-only generated copy, all themes.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  auditPageWithThemeAndLanguage,
  themes,
  type AuditResult,
} from "./helpers/audit-page";
import { generatePageReport } from "./helpers/report-generator";
import { pseoPages } from "./helpers/page-registry";

const REPORT_DIR = "tests/a11y/page-reports/pseo";
const PSEO_LANGUAGES = ["en"] as const;

test.describe("PSEO Pages Verification", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    fs.mkdirSync(path.resolve(REPORT_DIR), { recursive: true });
  });

  for (const pageInfo of pseoPages) {
    test(`should pass audit in all themes (English): ${pageInfo.name}`, async ({
      page,
    }) => {
      const results: AuditResult[] = [];

      for (const theme of themes) {
        for (const language of PSEO_LANGUAGES) {
          const result = await auditPageWithThemeAndLanguage(
            page,
            pageInfo.url,
            theme,
            language
          );
          results.push(result);

          expect(
            result.violations,
            `${pageInfo.name} (${theme.name}/en) should have zero violations`
          ).toHaveLength(0);
        }
      }

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
