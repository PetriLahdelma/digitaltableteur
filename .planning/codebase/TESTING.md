# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Runner:**
- Vitest 4.0.16
- Config: `vitest.config.mts`

**Assertion Library:**
- Vitest built-in expect
- Matchers: toBe, toEqual, toThrow, toMatchObject
- Extended with jest-dom matchers

**Run Commands:**
```bash
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm test -- path/to/file      # Single file
npm run test:coverage         # Coverage report
npm run test:ci               # CI mode (skip Storybook)
```

## Test File Organization

**Location:**
- Colocated with source: `ComponentName.test.tsx` alongside `ComponentName.tsx`
- No separate `__tests__/` directory

**Naming:**
- Unit tests: `ComponentName.test.tsx`
- Accessibility tests: `ComponentName.a11y.test.tsx`
- Behavior tests: `ComponentName.behavior.test.tsx`

**Structure:**
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx           # Unit tests
├── ComponentName.a11y.test.tsx      # Accessibility tests
└── ComponentName.module.css
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("ComponentName", () => {
  describe("functionName", () => {
    it("should handle valid input", () => {
      // arrange
      const props = { value: "test" };

      // act
      render(<Component {...props} />);

      // assert
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should handle error case", () => {
      expect(() => functionName(null)).toThrow("Invalid input");
    });
  });
});
```

**Patterns:**
- Use `beforeEach` for per-test setup
- Use `afterEach` to restore mocks: `vi.restoreAllMocks()`
- Arrange/Act/Assert pattern
- One focus per test (multiple expects OK)

## Mocking

**Framework:**
- Vitest built-in mocking (`vi`)
- Module mocking via `vi.mock()`

**Patterns:**
```typescript
import { vi } from "vitest";

// Mock module
vi.mock("./external", () => ({
  externalFunction: vi.fn()
}));

describe("test suite", () => {
  it("mocks function", () => {
    const mockFn = vi.mocked(externalFunction);
    mockFn.mockReturnValue("mocked result");

    // test code

    expect(mockFn).toHaveBeenCalledWith("expected arg");
  });
});
```

**What to Mock:**
- External APIs, fetch calls
- File system operations
- Database connections
- Browser APIs (window, document)

**What NOT to Mock:**
- Internal pure functions
- Simple utilities
- TypeScript types

## Fixtures and Factories

**Test Data:**
```typescript
// Factory function
function createTestProps(overrides?: Partial<Props>): Props {
  return {
    id: "test-id",
    name: "Test Name",
    ...overrides
  };
}

// Usage
it("renders with custom name", () => {
  const props = createTestProps({ name: "Custom" });
  render(<Component {...props} />);
});
```

**Location:**
- Factory functions: Define in test file near usage
- Shared fixtures: `tests/fixtures/` (if needed)

## Coverage

**Requirements:**
- Target: >80% line coverage
- All components must have unit + accessibility tests

**Configuration:**
- Provider: v8
- Reporters: text, lcov, json-summary
- Excludes: story files, test files, index files

**View Coverage:**
```bash
npm run test:coverage
open coverage/index.html
```

## Test Types

**Unit Tests:**
- Scope: Single function/component in isolation
- Mocking: Mock all external dependencies
- Speed: <100ms per test
- Location: `ComponentName.test.tsx`

**Accessibility Tests:**
- Scope: WCAG 2.1 AA compliance
- Tools: jest-axe, axe-core
- Checks: Automated violations, ARIA attributes, focus management
- Location: `ComponentName.a11y.test.tsx`

**Visual Regression:**
- Framework: Playwright + pixelmatch
- Command: `npm run test:visual`
- Snapshots: `__visual__/snapshots/`
- Update: `npm run test:visual:update`

**E2E Tests:**
- Framework: Playwright
- Location: `e2e/`
- Scope: Full user flows

## Common Patterns

**Async Testing:**
```typescript
it("should handle async operation", async () => {
  const result = await asyncFunction();
  expect(result).toBe("expected");
});
```

**Error Testing:**
```typescript
// Sync error
it("should throw on invalid input", () => {
  expect(() => functionCall()).toThrow("error message");
});

// Async error
it("should reject on failure", async () => {
  await expect(asyncCall()).rejects.toThrow("error message");
});
```

**Accessibility Testing:**
```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Component Rendering:**
```typescript
import { render, screen } from "@testing-library/react";

it("renders children", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});
```

**User Interactions:**
```typescript
import { fireEvent, screen } from "@testing-library/react";

it("calls onClick when clicked", () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByText("Click"));
  expect(onClick).toHaveBeenCalled();
});
```

## Setup & Mocks

**Global Setup:** `vitest.setup.ts`

Mocked APIs:
- `ResizeObserver` - Class-based mock
- `IntersectionObserver` - Class-based mock
- `window.matchMedia` - vi.fn() with proper API
- `navigator.share` - Promise resolver
- `console` - Silenced (warn, error)

**Test Environment:**
```typescript
// vitest.setup.ts
import "@testing-library/jest-dom";
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);
```

## Pre-commit Quality Gates

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

*Testing analysis: 2026-01-16*
*Update when test patterns change*
