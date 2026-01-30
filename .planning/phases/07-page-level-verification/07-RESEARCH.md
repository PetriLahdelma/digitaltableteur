# Phase 7: Page-Level Verification - Research

**Researched:** 2026-01-30
**Domain:** Full-page WCAG 2.1 AA accessibility verification
**Confidence:** HIGH

## Summary

This phase verifies that all public pages on the Digitaltableteur website pass complete WCAG 2.1 AA compliance audits, covering both automated (axe-core) and manual testing protocols. The codebase has extensive existing infrastructure from Phases 1-6 that can be leveraged and extended.

The site contains **30 public routes** including 5 core pages, 11 work project pages, 12 blog posts, and several utility/legal pages. Each page must be verified across **4 themes** (Light, Dark, HCB, HCW) and **3 languages** (EN, FI, SV), resulting in approximately **360 unique page-theme-language combinations** requiring automated audit.

**Primary recommendation:** Extend existing `playwright.a11y.spec.ts` pattern to create comprehensive per-page reports with theme/language matrix coverage. Use existing `applyTheme()` helper from `color-contrast-audit.spec.ts` and add language switching via cookie/localStorage manipulation.

## Page Inventory

### Static Pages (19 routes)

| Category | Path | Priority |
|----------|------|----------|
| **Core** | `/` (Home) | Critical |
| **Core** | `/about` | Critical |
| **Core** | `/work` | Critical |
| **Core** | `/blog` | Critical |
| **Core** | `/contact` | Critical |
| **Legal** | `/privacy-policy` | High |
| **Legal** | `/accessibility` | High |
| **Legal** | `/ai-use` | High |
| **pSEO** | `/pseo` | Medium |
| **Tools** | `/tools/email-signature` | Low |
| **Dev** | `/dev/code-window` | Exclude (dev-only) |
| **Dev** | `/dev/tailwind-test` | Exclude (dev-only) |
| **CMS** | `/studio/[[...tool]]` | Exclude (admin) |

### Work Project Pages (11 routes)

| Path | Status |
|------|--------|
| `/work/finnish-transport-agency` | Active |
| `/work/garage-junction` | Active |
| `/work/helsinki-design-system` | Active |
| `/work/illustrations` | Active |
| `/work/intrum` | Active |
| `/work/knobsmith-audio` | Active |
| `/work/new-things-co` | Active |
| `/work/raw-view` | Active |
| `/work/sap-build-apps` | Active |
| `/work/tulli` | Active |
| `/work/vertaaux` | Active |

### Blog Post Pages (12 routes)

From `app/blog/postMetadata.ts`:

| Slug | Published |
|------|-----------|
| `from-tokens-to-thinking-systems-making-ai-native-design-systems-actually-work` | 2025-12-29 |
| `the-evolutionary-difference-between-constructive-and-constrictive-criticism` | 2025-12-03 |
| `branding-design-systems-essay` | 2025-11-26 |
| `design-system-meets-ai-building-the-self-evolving-component-library-pt-2` | 2025-11-23 |
| `design-system-meets-ai-building-the-self-evolving-component-library-pt-1` | 2025-11-20 |
| `petri-lahdelma-bio` | 2025-06-15 |
| `digital-craftsmanship` | 2025-06-10 |
| `figma-mcp-design-systems` | 2025-06-05 |
| `workflow-tips` | 2025-05-12 |
| `in-search-of-impact` | 2025-02-11 |
| `designing-in-2025` | 2025-02-09 |
| `thoughts-on-future-branding` | 2018-06-07 |

### Dynamic pSEO Pages (Variable)

| Route Pattern | Content Source |
|---------------|----------------|
| `/pseo/[slug]` | Dynamic |
| `/pseo/audiences/[slug]` | Dynamic |
| `/pseo/services/[slug]` | Dynamic |
| `/pseo/stacks/[slug]` | Dynamic |

**Note:** pSEO page counts vary based on CMS content. Sample pages should be included.

### Special Pages

| Path | Notes |
|------|-------|
| `/blog/authors/[slug]` | Dynamic author pages |
| 404 page | Test via `/nonexistent-route` |

## Total Page Count Summary

| Category | Count |
|----------|-------|
| Core pages | 5 |
| Legal/utility pages | 3 |
| Work project pages | 11 |
| Blog post pages | 12 |
| pSEO pages | ~10 (variable) |
| Author pages | 1+ |
| **Total public routes** | **~42** |
| Theme variants (x4) | x4 |
| Language variants (x3) | x3 |
| **Total combinations** | **~504** |

## Existing Infrastructure

### Playwright Configuration

**File:** `playwright.config.ts`
- Test directory: `./tests/a11y`
- Base URL: `http://localhost:3000`
- Parallel execution enabled
- Web server auto-start configured

### Existing Test Files

| File | Purpose | Reusable Patterns |
|------|---------|-------------------|
| `tests/a11y/playwright.a11y.spec.ts` | Basic page audits | `auditPage()` helper, result collection |
| `tests/a11y/perceivable/color-contrast-audit.spec.ts` | Theme-based contrast | `applyTheme()`, theme definitions, per-theme test loops |
| `tests/a11y/operable/keyboard-navigation.spec.ts` | Keyboard nav | Page list pattern, interactive element detection |
| `tests/a11y/operable/focus-visibility.spec.ts` | Focus ring checks | Theme iteration pattern |
| `tests/a11y/understandable/navigation-consistency.spec.ts` | Language tests | Language switching via button click |

### Key Reusable Code Patterns

**Theme Definitions (from `color-contrast-audit.spec.ts`):**
```typescript
const themes = [
  { name: "Light", className: null },
  { name: "Dark", className: "themeDark" },
  { name: "High Contrast Black", className: "themeHCB" },
  { name: "High Contrast White", className: "themeHCW" },
] as const;
```

**Theme Application Helper:**
```typescript
async function applyTheme(page: Page, themeClassName: string | null) {
  if (themeClassName) {
    await page.evaluate((className) => {
      document.documentElement.classList.remove("themeDark", "themeHCB", "themeHCW");
      document.documentElement.classList.add(className);
    }, themeClassName);
    await page.waitForTimeout(300);
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.remove("themeDark", "themeHCB", "themeHCW");
    });
    await page.waitForTimeout(300);
  }
}
```

**Axe Configuration:**
```typescript
const axeConfig = {
  runOnly: {
    type: "tag" as const,
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
};
```

### Manual Testing Checklist

**File:** `.planning/phases/01-audit-infrastructure/MANUAL-TESTING-CHECKLIST.md`

Comprehensive 550-line checklist covering:
- Keyboard navigation (per-page checklists)
- Screen reader testing (VoiceOver/NVDA)
- Visual inspection (contrast, zoom, motion)
- Cross-cutting verifications (theme matrix, language matrix)
- Issue tracking template

## Theme Testing Mechanism

### How Themes Work

**Provider:** `providers/ThemeProvider.tsx` using `next-themes`

| Theme | CSS Class | Storage Key |
|-------|-----------|-------------|
| Light | `themeLight` | `"light"` |
| Dark | `themeDark` | `"dark"` |
| High Contrast Black | `themeHCB` | `"hcb"` |
| High Contrast White | `themeHCW` | `"hcw"` |

**Applied to:** `<html>` element via class attribute
**Persistence:** localStorage key `"theme"`

### Test Application Methods

**Method 1: DOM Manipulation (Current)**
```typescript
await page.evaluate(() => {
  document.documentElement.classList.add("themeDark");
});
```

**Method 2: localStorage (More Realistic)**
```typescript
await page.addInitScript(() => {
  localStorage.setItem("theme", "dark");
});
await page.goto(url);
```

**Recommendation:** Use Method 1 (DOM manipulation) for test speed, as it allows testing theme changes without page reload.

## Language Testing Mechanism

### How Languages Work

**Provider:** `providers/I18nProvider.tsx` using `i18next`
**Supported:** `en`, `fi`, `sv`
**Storage:** Cookie `i18next` and localStorage `i18nextLng`
**HTML attr:** Updates `<html lang="...">`

### Test Application Methods

**Method 1: Cookie/localStorage (Recommended)**
```typescript
await page.context().addCookies([
  { name: "i18next", value: "fi", domain: "localhost", path: "/" }
]);
await page.goto(url);
```

**Method 2: UI Interaction (Slower)**
```typescript
const finnishButton = page.locator('button:has-text("FI")');
await finnishButton.click();
await page.waitForTimeout(500);
```

**Recommendation:** Use Method 1 for automated tests. Use Method 2 only for manual testing.

### Verification

```typescript
const htmlLang = await page.locator("html").getAttribute("lang");
expect(htmlLang).toMatch(/^fi/);
```

## Test Organization Strategy

### Recommended File Structure

```
tests/a11y/
├── page-reports/              # Generated reports (gitignored)
│   ├── home/
│   │   ├── home-light-en.md
│   │   ├── home-light-fi.md
│   │   └── ...
│   ├── about/
│   └── ...
├── page-verification/         # New test files for Phase 7
│   ├── page-verification.spec.ts      # Main orchestration
│   ├── core-pages.spec.ts             # Core 5 pages
│   ├── work-pages.spec.ts             # Work project pages
│   ├── blog-pages.spec.ts             # Blog post pages
│   ├── legal-pages.spec.ts            # Legal/utility pages
│   └── helpers/
│       ├── audit-page.ts              # Shared audit function
│       ├── report-generator.ts        # Markdown report generation
│       └── page-registry.ts           # All pages with metadata
└── ...existing files...
```

### Parallelization Strategy

**Playwright supports parallel test execution:**
- Each spec file runs in parallel by default
- Tests within a file can be parallelized with `test.describe.parallel()`

**Recommended approach:**
1. Group pages by category in separate spec files
2. Run page categories in parallel
3. Theme/language combinations within a page run sequentially (to avoid race conditions on DOM)

**Example structure for max parallelism:**
```typescript
// core-pages.spec.ts
test.describe.parallel("Core Pages", () => {
  test("home", async ({ page }) => { ... });
  test("about", async ({ page }) => { ... });
  test("work", async ({ page }) => { ... });
  test("blog", async ({ page }) => { ... });
  test("contact", async ({ page }) => { ... });
});
```

### Report Generation Pattern

Each page audit should produce:
1. **JSON result** (machine-readable, for CI/tracking)
2. **Markdown report** (human-readable, for documentation)

**Recommended markdown format:**
```markdown
# Page Verification Report: Home

**URL:** /
**Verified:** 2026-01-30T10:00:00Z
**Status:** PASS | FAIL

## Automated Audit (axe-core)

### Light Theme
| Language | Violations | Passes | Status |
|----------|------------|--------|--------|
| English  | 0          | 45     | PASS   |
| Finnish  | 0          | 45     | PASS   |
| Swedish  | 0          | 45     | PASS   |

### Dark Theme
...

## Manual Checklist

- [x] Skip link present and functional
- [x] All interactive elements keyboard accessible
- [x] Focus indicators visible in all themes
...

## Screen Reader Testing

### VoiceOver (macOS/Safari)
- [x] Page title announced
- [x] Landmarks navigable
- [x] Heading hierarchy logical
...

### NVDA (Windows/Firefox)
- [ ] Pending

## Exceptions

None documented.
```

## Verification Flow

### Automated Verification Steps

1. **Load page** with `networkidle` wait
2. **Apply theme** via DOM class manipulation
3. **Set language** via cookie (optional, can test default only for automated)
4. **Run axe-core** with WCAG 2.1 AA tags
5. **Collect results** (violations, passes, incomplete)
6. **Assert zero violations** (or document exceptions)
7. **Generate report** in markdown format

### Manual Verification Steps

Use existing checklist from `MANUAL-TESTING-CHECKLIST.md`:
1. Keyboard navigation (Tab through, Shift+Tab, Enter/Space activation)
2. Screen reader testing (VoiceOver primary, NVDA secondary)
3. Focus visibility across all themes
4. Reflow at 320px
5. Zoom to 200%
6. Text spacing override

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Axe scanning | Custom DOM walker | `@axe-core/playwright` | Industry standard, maintained |
| Theme switching | Custom CSS injection | Existing `applyTheme()` | Already tested, matches production |
| Language switching | URL params | Cookie-based i18n | Matches production behavior |
| Report templating | String concatenation | Template literals + file write | Maintainable |
| Test parallelization | Manual process spawning | Playwright built-in | Handles browser contexts |

## Common Pitfalls

### Pitfall 1: Incomplete Page List

**What goes wrong:** Missing pages in audit, especially dynamic routes
**Why it happens:** Hardcoded page lists get stale
**How to avoid:** Generate page list from filesystem + CMS data at test runtime
**Warning signs:** Test count doesn't match expected routes

### Pitfall 2: Theme Not Applied Before Scan

**What goes wrong:** Axe scans Light theme even when "testing Dark"
**Why it happens:** Race condition between class application and scan
**How to avoid:** Always `waitForTimeout(300)` after theme application
**Warning signs:** All themes show identical results

### Pitfall 3: Language Content Not Switched

**What goes wrong:** Page renders English content despite `lang="fi"` attribute
**Why it happens:** i18n library needs cookie set before page load
**How to avoid:** Set cookie before `page.goto()`, not after
**Warning signs:** Same violations in all language variants

### Pitfall 4: Test Flakiness from Animations

**What goes wrong:** Axe scan races with CSS transitions
**Why it happens:** `networkidle` doesn't wait for animations
**How to avoid:** Use `prefers-reduced-motion` in test browser OR add explicit wait
**Warning signs:** Intermittent "element not in viewport" errors

### Pitfall 5: Stale Snapshots from Dynamic Content

**What goes wrong:** Blog list page fails due to new post changing DOM
**Why it happens:** Tests depend on exact content structure
**How to avoid:** Test rules/patterns, not exact content
**Warning signs:** Tests fail after content updates

## Code Examples

### Complete Page Audit Function

```typescript
// Source: Extended from existing tests/a11y/playwright.a11y.spec.ts
import { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

interface AuditResult {
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

async function auditPageWithThemeAndLanguage(
  page: Page,
  url: string,
  theme: { name: string; className: string | null },
  language: string
): Promise<AuditResult> {
  // Set language cookie before navigation
  await page.context().addCookies([
    { name: "i18next", value: language, domain: "localhost", path: "/" }
  ]);

  await page.goto(url);
  await page.waitForLoadState("networkidle");

  // Apply theme
  if (theme.className) {
    await page.evaluate((cls) => {
      document.documentElement.classList.remove("themeDark", "themeHCB", "themeHCW");
      document.documentElement.classList.add(cls);
    }, theme.className);
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.remove("themeDark", "themeHCB", "themeHCW");
    });
  }
  await page.waitForTimeout(300);

  // Run axe audit
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  return {
    page: url,
    theme: theme.name,
    language,
    url,
    timestamp: new Date().toISOString(),
    violations: results.violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    status: results.violations.length === 0 ? "PASS" : "FAIL",
  };
}
```

### Markdown Report Generator

```typescript
// Source: New helper for Phase 7
function generateMarkdownReport(
  pageName: string,
  results: AuditResult[]
): string {
  const themes = [...new Set(results.map(r => r.theme))];
  const languages = [...new Set(results.map(r => r.language))];

  let md = `# Page Verification Report: ${pageName}\n\n`;
  md += `**URL:** ${results[0]?.url || "N/A"}\n`;
  md += `**Verified:** ${new Date().toISOString()}\n`;
  md += `**Status:** ${results.every(r => r.status === "PASS") ? "PASS" : "FAIL"}\n\n`;

  md += `## Automated Audit (axe-core)\n\n`;

  for (const theme of themes) {
    md += `### ${theme} Theme\n\n`;
    md += `| Language | Violations | Passes | Status |\n`;
    md += `|----------|------------|--------|--------|\n`;

    for (const lang of languages) {
      const result = results.find(r => r.theme === theme && r.language === lang);
      if (result) {
        md += `| ${lang.toUpperCase()} | ${result.violations.length} | ${result.passes} | ${result.status} |\n`;
      }
    }
    md += `\n`;
  }

  return md;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest + jsdom axe | Playwright + real browser | 2024 | More accurate DOM testing |
| Manual theme testing | Automated theme matrix | Phase 2-6 | Comprehensive coverage |
| English-only testing | Multi-language matrix | Phase 4 | i18n compliance |

**Deprecated/outdated:**
- Testing in jsdom without real browser rendering misses CSS-dependent issues
- Testing single theme misses theme-specific contrast failures

## Open Questions

1. **pSEO page enumeration**
   - What we know: Dynamic routes exist at `/pseo/[slug]`, `/pseo/audiences/[slug]`, etc.
   - What's unclear: How to enumerate all valid slugs at test time
   - Recommendation: Fetch from CMS or use sample pages only

2. **CI runtime budget**
   - What we know: ~504 combinations to test
   - What's unclear: Acceptable CI time limit
   - Recommendation: Parallel execution + selective language coverage (EN required, FI/SV sampled)

3. **NVDA testing automation**
   - What we know: NVDA requires Windows
   - What's unclear: Is Windows CI available?
   - Recommendation: Manual NVDA testing for critical pages only

## Sources

### Primary (HIGH confidence)
- Existing codebase: `tests/a11y/` directory (verified patterns)
- Existing codebase: `providers/ThemeProvider.tsx` (theme mechanism)
- Existing codebase: `providers/I18nProvider.tsx` (language mechanism)
- Existing codebase: `app/blog/postMetadata.ts` (blog post inventory)
- Existing checklist: `.planning/phases/01-audit-infrastructure/MANUAL-TESTING-CHECKLIST.md`

### Secondary (MEDIUM confidence)
- Playwright documentation for parallel execution
- axe-core/playwright documentation

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Page inventory: HIGH - direct filesystem enumeration
- Existing infrastructure: HIGH - read from codebase
- Theme mechanism: HIGH - read from provider code
- Language mechanism: HIGH - read from provider code
- Test organization: MEDIUM - based on Playwright best practices

**Research date:** 2026-01-30
**Valid until:** 2026-02-28 (30 days - stable domain)
