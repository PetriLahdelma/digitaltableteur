# Testing Patterns

**Analysis Date:** 2026-01-13

## Test Framework

**Runner:**
- Vitest 4.0.16
- Config: `vitest.config.mts` in project root

**Assertion Library:**
- Vitest built-in expect
- jest-dom matchers: `.toBeInTheDocument()`, `.toHaveAttribute()`, etc.
- jest-axe matchers: `.toHaveNoViolations()`

**Run Commands:**
```bash
npm test                              # Run all tests
npm test -- --watch                   # Watch mode
npm test -- path/to/file.test.tsx    # Single file
npm run test:coverage                 # Coverage report
npm run test:ci                       # CI mode (SKIP_STORYBOOK_TESTS=1)
npm run test:visual                   # Visual regression tests
npm run test:a11y                     # Accessibility tests
```

## Test File Organization

**Location:**
- `*.test.tsx` alongside source files (colocated)
- `*.a11y.test.tsx` for accessibility-specific tests
- `*.behavior.test.tsx` for feature-specific tests
- `app/__tests__/` for integration tests

**Naming:**
- `ComponentName.test.tsx` - Unit tests
- `ComponentName.a11y.test.tsx` - Accessibility tests
- `ComponentName.behavior.test.tsx` - Behavior-specific tests
- `ComponentName.endpoint.test.tsx` - API integration tests

**Structure:**
```
nextjs-app/shared/components/
  Button/
    Button.tsx
    Button.test.tsx
    Button.stories.tsx
  ChatWidget/
    ChatWidget.tsx
    ChatWidget.test.tsx
    ChatWidget.behavior.test.tsx
    ChatWidget.endpoint.test.tsx
    ChatWidget.emailWorkflow.test.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

describe("ComponentName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders all items with proper roles", () => {
      // arrange
      render(<Component {...defaultProps} />);

      // act (if needed)

      // assert
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls handler when clicked", () => {
      const mockHandler = vi.fn();
      render(<Component onClick={mockHandler} />);

      fireEvent.click(screen.getByRole("button"));

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Patterns:**
- Use `beforeEach` for per-test setup, avoid `beforeAll`
- Use `afterEach` to restore mocks: `vi.restoreAllMocks()`
- Arrange/Act/Assert pattern in complex tests
- One assertion focus per test (but multiple expects OK)

## Mocking

**Framework:**
- Vitest built-in mocking (`vi`)
- Module mocking via `vi.mock()` at top of file

**Patterns:**
```typescript
import { vi } from "vitest";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
    i18n: { language: "en" },
  }),
}));

// Mock external service
vi.mock("./external-service", () => ({
  fetchData: vi.fn(),
}));

// In test
const mockFn = vi.mocked(fetchData);
mockFn.mockResolvedValue({ data: "test" });
expect(mockFn).toHaveBeenCalledWith("expected arg");
```

**What to Mock:**
- External APIs, database connections
- i18next (`useTranslation`)
- Browser APIs (ResizeObserver, IntersectionObserver, matchMedia)
- File system operations
- Time/dates (`vi.useFakeTimers`)

**What NOT to Mock:**
- Pure functions, utilities
- Internal business logic
- TypeScript types
- Component props

## Fixtures and Factories

**Test Data:**
```typescript
// Factory pattern
function createTestProps(overrides?: Partial<Props>): Props {
  return {
    id: "test-id",
    name: "Test Name",
    isActive: true,
    ...overrides,
  };
}

// Usage
const props = createTestProps({ isActive: false });
```

**Location:**
- Factory functions: Define in test file near usage
- Shared fixtures: `tests/fixtures/` (for multi-file test data)
- Mock data: Inline when simple, factory when complex

## Coverage

**Requirements:**
- Target: 85% statements, 75% branches, 75% functions, 85% lines (vite-app)
- No enforced target for nextjs-app (coverage tracked for awareness)

**Configuration:**
- Provider: `v8` (native code coverage)
- Reporters: `["text", "lcov", "json-summary"]`
- Reports directory: `coverage/`

**Excluded:**
- `**/*.stories.{ts,tsx}` (Storybook files)
- `**/*.test.{ts,tsx}` (Test files)
- `**/index.{ts,tsx}` (Re-export barrels)
- `src-legacy-vite-DO-NOT-USE/**`

**View Coverage:**
```bash
npm run test:coverage
open coverage/index.html
```

## Test Types

**Unit Tests:**
- Scope: Single function/component in isolation
- Mocking: Mock all external dependencies
- Speed: Each test <100ms
- Examples: `Button.test.tsx`, `Tabs.test.tsx`

**Integration Tests:**
- Scope: Multiple modules together
- Mocking: Mock only external boundaries
- Location: `app/__tests__/`
- Examples: `accessibility-pages.test.tsx`

**Visual Regression Tests:**
- Framework: Playwright via Storybook test runner
- Snapshots: `__visual__/snapshots/`
- Diffs: `__visual__/diffs/__diff_output__`
- Report: `public/visual-diff/report.json`
- Script: `scripts/run-visual-tests.mjs`

**Accessibility Tests:**
- Framework: jest-axe (via `vitest-axe`)
- Pattern: `*.a11y.test.tsx` files
- Checks: ARIA attributes, roles, labels
- Example assertions:
  ```typescript
  expect(screen.getByRole("tablist")).toHaveAttribute("aria-label");
  expect(await axe(container)).toHaveNoViolations();
  ```

## Common Patterns

**Async Testing:**
```typescript
it("should handle async operation", async () => {
  render(<AsyncComponent />);

  const result = await screen.findByText("Loaded");
  expect(result).toBeInTheDocument();
});
```

**Error Testing:**
```typescript
it("should throw on invalid input", () => {
  expect(() => validate(null)).toThrow("Invalid input");
});

// Async error
it("should reject on failure", async () => {
  await expect(asyncCall()).rejects.toThrow("error message");
});
```

**Keyboard Navigation:**
```typescript
it("supports keyboard navigation", () => {
  render(<Tabs tabs={defaultTabs} />);
  const tabs = screen.getAllByRole("tab");

  tabs[0].focus();
  fireEvent.keyDown(tabs[0], { key: "ArrowRight" });

  expect(tabs[1]).toHaveFocus();
});
```

**Snapshot Testing:**
- Not used in this codebase
- Prefer explicit assertions for clarity

---

*Testing analysis: 2026-01-13*
*Update when test patterns change*
