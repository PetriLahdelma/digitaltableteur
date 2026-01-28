import { test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

/**
 * Color Contrast Audit across all themes
 *
 * Tests color contrast compliance for PERC-02 and PERC-06 requirements:
 * - PERC-02: Normal text 4.5:1, Large text 3:1, UI components 3:1
 * - PERC-06: All 4 themes must meet contrast requirements
 *
 * Themes:
 * - Light: Default (no class on html)
 * - Dark: class="themeDark" on html
 * - High Contrast Black: class="themeHCB" on html
 * - High Contrast White: class="themeHCW" on html
 *
 * Run: npx playwright test --config=playwright.config.ts --grep "contrast"
 */

// Theme definitions
const themes = [
  { name: "Light", className: null },
  { name: "Dark", className: "themeDark" },
  { name: "High Contrast Black", className: "themeHCB" },
  { name: "High Contrast White", className: "themeHCW" },
] as const;

// Key pages to test
const pages = [
  { name: "home", url: "/" },
  { name: "about", url: "/about" },
  { name: "contact", url: "/contact" },
  { name: "blog", url: "/blog" },
  { name: "work", url: "/work" },
];

// Contrast-specific rules to focus on
const contrastRules = ["color-contrast", "link-in-text-block"];

// Store results for all themes and pages
interface ContrastViolation {
  id: string;
  impact: string | undefined;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

interface PageResult {
  url: string;
  violations: ContrastViolation[];
  passes: number;
}

interface ThemeResult {
  theme: string;
  pages: Record<string, PageResult>;
  totalViolations: number;
}

const allThemeResults: ThemeResult[] = [];

// Helper to apply theme class
async function applyTheme(
  page: Parameters<Parameters<typeof test>[1]>[0]["page"],
  themeClassName: string | null
) {
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
    await page.waitForTimeout(300);
  } else {
    // Light theme - remove all theme classes
    await page.evaluate(() => {
      document.documentElement.classList.remove(
        "themeDark",
        "themeHCB",
        "themeHCW"
      );
    });
    await page.waitForTimeout(300);
  }
}

// Helper to run contrast audit
async function auditContrastForTheme(
  page: Parameters<Parameters<typeof test>[1]>[0]["page"],
  theme: (typeof themes)[number],
  pageInfo: (typeof pages)[number]
): Promise<PageResult> {
  await page.goto(pageInfo.url);
  await page.waitForLoadState("networkidle");

  // Apply theme
  await applyTheme(page, theme.className);

  // Run axe with contrast rules only
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2aa"])
    .analyze();

  // Filter to only contrast-related violations
  const contrastViolations = results.violations.filter(
    (v) => v.id === "color-contrast" || v.id === "link-in-text-block"
  );

  return {
    url: pageInfo.url,
    violations: contrastViolations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target as string[],
        failureSummary: n.failureSummary,
      })),
    })),
    passes: results.passes.filter(
      (p) => p.id === "color-contrast" || p.id === "link-in-text-block"
    ).length,
  };
}

test.describe("Color Contrast Audit (PERC-02, PERC-06)", () => {
  // Test each theme
  for (const theme of themes) {
    test.describe(`Theme: ${theme.name}`, () => {
      const themePages: Record<string, PageResult> = {};

      for (const pageInfo of pages) {
        test(`${pageInfo.name} - contrast check`, async ({ page }) => {
          const result = await auditContrastForTheme(page, theme, pageInfo);
          themePages[pageInfo.name] = result;

          // Log results
          console.log(
            `[${theme.name}] ${pageInfo.name}: ${result.violations.length} contrast violations`
          );

          // Log specific violations for debugging
          if (result.violations.length > 0) {
            for (const violation of result.violations) {
              console.log(`  - ${violation.id}: ${violation.help}`);
              for (const node of violation.nodes.slice(0, 3)) {
                console.log(`    ${node.target.join(" > ")}`);
              }
            }
          }
        });
      }

      test.afterAll(async () => {
        // Store theme results
        const totalViolations = Object.values(themePages).reduce(
          (sum, p) => sum + p.violations.length,
          0
        );
        allThemeResults.push({
          theme: theme.name,
          pages: themePages,
          totalViolations,
        });
      });
    });
  }

  // Write comprehensive results after all themes tested
  test.afterAll(async () => {
    // Wait a moment to ensure all theme afterAll hooks have run
    await new Promise((resolve) => setTimeout(resolve, 500));

    const outputDir = path.join(
      process.cwd(),
      "tests/a11y/audit-results/contrast"
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "contrast-audit-results.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          auditDate: new Date().toISOString(),
          requirements: ["PERC-02", "PERC-06"],
          themes: allThemeResults,
          summary: {
            totalThemes: themes.length,
            totalPages: pages.length,
            violationsByTheme: allThemeResults.map((t) => ({
              theme: t.theme,
              violations: t.totalViolations,
            })),
          },
        },
        null,
        2
      )
    );

    console.log(`\n=== Color Contrast Audit Summary ===`);
    console.log(`Results written to: ${outputPath}`);
    console.log(`\nViolations by theme:`);
    for (const themeResult of allThemeResults) {
      console.log(`  ${themeResult.theme}: ${themeResult.totalViolations}`);
    }
  });
});
