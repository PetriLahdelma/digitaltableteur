/**
 * Page-Level Accessibility Audit Helper
 *
 * Provides shared infrastructure for running axe-core audits across
 * all page, theme, and language combinations.
 *
 * Phase 7: Page-Level Verification
 * Plan: 07-01 (Infrastructure Setup)
 */

import { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Theme definitions matching the application's theme system.
 * Applied via class on <html> element.
 */
export const themes = [
  { name: "Light", className: null },
  { name: "Dark", className: "themeDark" },
  { name: "High Contrast Black", className: "themeHCB" },
  { name: "High Contrast White", className: "themeHCW" },
] as const;

export type Theme = (typeof themes)[number];

/**
 * Supported language codes for i18n testing.
 * Set via i18next cookie before page navigation.
 */
export const languages = ["en", "fi", "sv"] as const;

export type Language = (typeof languages)[number];

/**
 * Axe-core violation structure (simplified for our use case)
 */
export interface AxeViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical" | undefined;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

/**
 * Result of a single page audit with specific theme and language.
 */
export interface AuditResult {
  page: string;
  theme: string;
  language: string;
  url: string;
  timestamp: string;
  violations: AxeViolation[];
  passes: number;
  incomplete: number;
  status: "PASS" | "FAIL";
}

/**
 * Apply a theme to the page by manipulating the <html> element's class list.
 *
 * @param page - Playwright Page object
 * @param themeClassName - CSS class name to apply, or null for Light theme
 */
export async function applyTheme(
  page: Page,
  themeClassName: string | null
): Promise<void> {
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
  } else {
    // Light theme - remove all theme classes
    await page.evaluate(() => {
      document.documentElement.classList.remove(
        "themeDark",
        "themeHCB",
        "themeHCW"
      );
    });
  }
  // Wait for styles to apply. The site transitions colors over 0.3s when the
  // theme class changes; auditing before the transition settles makes axe
  // compute contrast on mid-blend colors and fail flakily (observed as 8
  // phantom color-contrast violations across 5 work pages, 2026-08-03).
  await page.waitForTimeout(1000);
}

/**
 * WCAG 2.1 AA tags for axe-core scanning.
 * Includes all Level A and AA success criteria.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/**
 * Audit a page with a specific theme and language combination.
 *
 * Process:
 * 1. Set language cookie BEFORE navigation (critical for i18n)
 * 2. Navigate to page with networkidle wait
 * 3. Apply theme via DOM manipulation
 * 4. Run axe-core with WCAG 2.1 AA tags
 * 5. Return structured AuditResult
 *
 * @param page - Playwright Page object
 * @param url - Page URL to audit (relative, e.g., "/about")
 * @param theme - Theme to apply
 * @param language - Language to set via cookie
 * @returns AuditResult with violations, passes, and status
 */
export async function auditPageWithThemeAndLanguage(
  page: Page,
  url: string,
  theme: Theme,
  language: Language
): Promise<AuditResult> {
  // Set language cookie BEFORE navigation (critical for i18n to work)
  await page.context().addCookies([
    { name: "i18next", value: language, domain: "localhost", path: "/" },
  ]);

  // Navigate with networkidle wait for complete page load
  await page.goto(url, { waitUntil: "networkidle" });

  // Apply theme via DOM manipulation
  await applyTheme(page, theme.className);

  // Run axe-core audit with WCAG 2.1 AA tags
  const results = await new AxeBuilder({ page })
    .withTags([...WCAG_TAGS])
    .analyze();

  // Map violations to our simplified structure
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
    language,
    url,
    timestamp: new Date().toISOString(),
    violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    status: violations.length === 0 ? "PASS" : "FAIL",
  };
}

/**
 * Audit a page across all theme and language combinations.
 *
 * @param page - Playwright Page object
 * @param url - Page URL to audit
 * @returns Array of AuditResults (4 themes x 3 languages = 12 results)
 */
export async function auditPageAllCombinations(
  page: Page,
  url: string
): Promise<AuditResult[]> {
  const results: AuditResult[] = [];

  for (const theme of themes) {
    for (const language of languages) {
      const result = await auditPageWithThemeAndLanguage(
        page,
        url,
        theme,
        language
      );
      results.push(result);
    }
  }

  return results;
}
