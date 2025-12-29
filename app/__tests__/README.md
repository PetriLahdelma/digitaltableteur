# Page-Level Accessibility Tests

## Overview

This directory contains comprehensive accessibility (a11y) tests for all major page components in the Digitaltableteur application.

## Test File

- **`accessibility-pages.test.tsx`** - Page-level accessibility tests using axe-core

## What's Tested

### Pages Covered

1. **HomePage** (`/`)
2. **AboutPage** (`/about`)
3. **BlogPage** (`/blog`)
4. **WorkIndexPage** (`/work`)

### Test Categories

#### 1. Axe-Core Violations
- Tests each page for accessibility violations in all three languages (EN, FI, SV)
- Uses jest-axe for automated WCAG 2.1 compliance checking
- Catches common issues like:
  - Missing alt text
  - Insufficient color contrast
  - Missing ARIA labels
  - Invalid heading hierarchy
  - Form accessibility issues

#### 2. Multi-Language Testing
- Verifies accessibility in English (EN)
- Verifies accessibility in Finnish (FI)
- Verifies accessibility in Swedish (SV)
- Ensures structural consistency across all languages

#### 3. Semantic HTML
- **Heading hierarchy** - Ensures proper h1, h2, h3 structure
- **Landmark regions** - Validates section, nav, main elements
- **ARIA attributes** - Checks for proper aria-label, aria-live usage

#### 4. Keyboard Navigation
- Validates focusable interactive elements
- Ensures all CTAs, links, and buttons are keyboard accessible
- Checks for proper tabindex usage

#### 5. Color Contrast
- Dedicated color-contrast rule testing
- Ensures text is readable against backgrounds
- Validates WCAG AA compliance

#### 6. Cross-Language Consistency
- Validates that page structure remains consistent across language changes
- Counts sections, headings, buttons to ensure parity
- Prevents language-specific UI breaking changes

## Running the Tests

### Run All Accessibility Tests

```bash
npm test -- app/__tests__/accessibility-pages.test.tsx
```

### Run Specific Test Suite

```bash
npm test -- app/__tests__/accessibility-pages.test.tsx -t "HomePage"
```

### Run with Coverage

```bash
npm test -- app/__tests__/accessibility-pages.test.tsx --coverage
```

### Watch Mode

```bash
npm test -- app/__tests__/accessibility-pages.test.tsx --watch
```

## Test Structure

Each page has a dedicated test suite with the following tests:

```typescript
describe("PageName", () => {
  it("has no axe violations in English", async () => {
    // Test implementation
  });

  it("has no axe violations in Finnish", async () => {
    // Test implementation
  });

  it("has no axe violations in Swedish", async () => {
    // Test implementation
  });

  it("has proper heading hierarchy", async () => {
    // Test implementation
  });

  // Additional page-specific tests...
});
```

## Mocking Strategy

### Next.js Navigation
- `next/navigation` is mocked to prevent router errors in tests
- Provides mock implementations for `useRouter`, `usePathname`, `useSearchParams`

### Framer Motion
- `motion/react` is mocked to prevent animation issues
- Converts motion components to standard HTML elements

### i18n
- Uses actual i18n configuration from `@/nextjs-app/shared/i18n`
- Allows real language switching for multi-language tests

## Expected Results

All tests should pass with:

- 0 axe violations across all pages
- Consistent structure across all languages
- Proper heading hierarchy
- Valid ARIA attributes
- Focusable interactive elements
- Sufficient color contrast

## Adding New Page Tests

To add a new page to the test suite:

1. Import the page component
2. Create a new describe block
3. Add axe violation tests for all languages
4. Add structural tests (headings, landmarks)
5. Add any page-specific accessibility tests

Example:

```typescript
import { NewPage } from "@dt-pages/NewPage";

describe("NewPage", () => {
  it("has no axe violations in English", async () => {
    await i18n.changeLanguage("en");
    const { container } = render(withI18n(<NewPage />));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Add additional tests...
});
```

## Troubleshooting

### Import Errors

If you see import errors for page components:

1. Check that the page component is exported from its index file
2. Verify the `@dt-pages` alias in `vitest.config.mts`
3. Use absolute imports with `@/` prefix if needed

### Axe Violations

If tests fail with axe violations:

1. Review the violation details in test output
2. Check the component's HTML structure
3. Verify ARIA attributes are properly set
4. Ensure sufficient color contrast
5. Fix the underlying component issue (don't just skip the test)

### Language Tests Failing

If multi-language tests fail:

1. Verify translation keys exist in all language files
2. Check that components use `useTranslation` hook correctly
3. Ensure structural elements aren't conditionally rendered based on language

## Coverage Goals

- 100% of major pages tested
- All three languages (EN/FI/SV) covered
- Zero axe violations
- All critical user paths validated

## Related Documentation

- [Component Generation Rules](/docs/LLM_COMPONENT_GENERATION_RULES.md)
- [Accessibility Guidelines](/docs/ACCESSIBILITY.md)
- [Testing Strategy](/CLAUDE.md#testing-strategy)
- [i18n Configuration](/nextjs-app/shared/i18n.ts)

## Maintenance

This test file should be updated when:

- New pages are added to the application
- Existing pages undergo major structural changes
- New accessibility requirements are identified
- WCAG guidelines are updated

Last updated: 2025-12-28
