import type { Page, Locator } from "@playwright/test";

/**
 * Normalize text for WCAG 2.5.3 Label in Name comparisons.
 * Visible label text must be a substring of the accessible name.
 */
export function normalizeAccessibleText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Approximate accessible name using common ARIA/text sources.
 * Mirrors enough of accname for automated 2.5.3 checks in Chromium.
 */
export async function getAccessibleName(locator: Locator): Promise<string> {
  return locator.evaluate((el) => {
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel?.trim()) return ariaLabel.trim();

    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const parts = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean);
      if (parts.length) return parts.join(" ");
    }

    if (el instanceof HTMLInputElement) {
      const labelled = el.labels?.[0]?.textContent?.trim();
      if (labelled) return labelled;
      if (el.placeholder) return el.placeholder;
    }

    if (el instanceof HTMLImageElement && el.alt) return el.alt;

    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  });
}

/**
 * Collect visible text used as the visual label (direct text nodes + img alt in control).
 */
export async function getVisibleLabelText(locator: Locator): Promise<string> {
  return locator.evaluate((el) => {
    const heading = el.querySelector("h1,h2,h3,h4,h5,h6");
    if (heading?.textContent?.trim()) {
      return heading.textContent.replace(/\s+/g, " ").trim();
    }

    const clone = el.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('[aria-hidden="true"], .sr-only, .visually-hidden, p')
      .forEach((node) => node.remove());

    const text = (clone.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text) return text;

    const img = el.querySelector("img[alt]");
    return img?.getAttribute("alt")?.trim() ?? "";
  });
}

export interface LabelInNameIssue {
  selector: string;
  visible: string;
  accessible: string;
}

/**
 * Find interactive controls where visible label text is not contained in accessible name.
 * WCAG 2.5.3 Label in Name (Level A).
 */
export async function findLabelInNameMismatches(
  page: Page,
  roots: string[] = ["main", "header", "footer", '[role="dialog"]']
): Promise<LabelInNameIssue[]> {
  const issues: LabelInNameIssue[] = [];

  const controlSelectors = roots
    .flatMap((root) => [
      `${root} a[href]`,
      `${root} button`,
      `${root} [role="button"]`,
      `${root} input:not([type="hidden"])`,
      `${root} summary`,
    ])
    .join(", ");

  const controls = page.locator(controlSelectors);

  const count = await controls.count();
  for (let i = 0; i < count; i++) {
    const control = controls.nth(i);
    if (!(await control.isVisible())) continue;

    const visible = await getVisibleLabelText(control);
    if (!visible || visible.length < 2) continue;

    const accessible = await getAccessibleName(control);
    if (!accessible) continue;

    const normVisible = normalizeAccessibleText(visible);
    const normAccessible = normalizeAccessibleText(accessible);

    if (!normAccessible.includes(normVisible)) {
      const selector = await control.evaluate((el) => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : "";
        const testId = el.getAttribute("data-testid");
        return testId ? `${tag}[data-testid="${testId}"]` : `${tag}${id}`;
      });
      issues.push({ selector, visible, accessible });
    }
  }

  return issues;
}
