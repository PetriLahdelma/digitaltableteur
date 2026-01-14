# Testing

> Test structure, coverage, and practices for Digitaltableteur.

**Last Updated**: 2026-01-14

---

## Test Framework

### Primary: Vitest 4.0.16

**Configuration**: `vitest.config.mts`

| Setting | Value |
|---------|-------|
| Environment | jsdom |
| Globals | `true` (describe, it, expect) |
| Coverage | v8 provider |
| Setup | `vitest.setup.ts` |

---

## Test Types

### 1. Unit Tests

**Pattern**: `ComponentName.test.tsx`
**Framework**: Vitest + Testing Library

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "@dt/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### 2. Accessibility Tests

**Pattern**: `ComponentName.a11y.test.tsx`
**Framework**: jest-axe + vitest-axe

```typescript
import { axe } from "jest-axe";

it("has no accessibility violations", async () => {
  const { container } = render(<Button>Accessible</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 3. Behavioral Tests

**Pattern**: `ComponentName.behavior.test.tsx`

Tests specific workflows:
- State transitions
- User interaction flows
- Complex prop combinations

### 4. Visual Regression Tests

**Framework**: Playwright + pixelmatch
**Command**: `npm run test:visual`

| Location | Purpose |
|----------|---------|
| `__visual__/snapshots/` | Baseline images |
| `__visual__/diffs/` | Failed comparisons |

### 5. Storybook Tests

**Framework**: @storybook/addon-vitest

- Runs stories as tests automatically
- Validates component rendering
- Skip in CI: `SKIP_STORYBOOK_TESTS=1`

---

## Test Structure

### Colocated Tests (Same Folder)

```
Button/
├── Button.tsx
├── Button.test.tsx          # Unit tests
├── Button.a11y.test.tsx     # A11y tests (optional)
├── Button.stories.tsx
└── Button.module.css
```

### Hook Tests

```typescript
import { renderHook, act } from "@testing-library/react";
import { usePersistentTheme } from "./usePersistentTheme";

describe("usePersistentTheme", () => {
  it("reads theme from cookie", () => {
    document.cookie = "dt_theme=dark";
    const { result } = renderHook(() => usePersistentTheme());
    expect(result.current.theme).toBe("dark");
  });
});
```

---

## Coverage

### Configuration

**Provider**: v8
**Target**: >80%

### Include Paths

- `shared/components/**/*.{ts,tsx}`
- `app/**/*.{ts,tsx}`
- `nextjs-app/shared/components/**/*.{ts,tsx}`
- `nextjs-app/shared/patterns/**/*.{ts,tsx}`
- `nextjs-app/shared/utils/**/*.{ts,tsx}`

### Exclude

- `**/*.stories.{ts,tsx}`
- `**/*.test.{ts,tsx}`
- `**/index.{ts,tsx}`
- Legacy folders

### Reports

- `coverage/` directory
- Formats: text, lcov, json-summary

---

## Testing Utilities

### Testing Library Methods

| Method | Purpose |
|--------|---------|
| `render()` | Render component |
| `screen.getByRole()` | Query by semantic role |
| `screen.getByText()` | Query by text |
| `screen.getByTestId()` | Query by data-testid |
| `fireEvent.click()` | Simulate click |
| `within()` | Scope queries |

### Vitest Utilities

| Utility | Purpose |
|---------|---------|
| `vi.fn()` | Mock function |
| `vi.spyOn()` | Spy on function |
| `beforeEach()` | Setup before test |
| `afterEach()` | Cleanup after test |

### Global Mocks

**File**: `vitest.setup.ts`

```typescript
// ResizeObserver
globalThis.ResizeObserver = ResizeObserverMock;

// IntersectionObserver
globalThis.IntersectionObserver = IntersectionObserverMock;

// window.matchMedia
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation(...)
});

// navigator.share
Object.defineProperty(navigator, "share", {
  value: vi.fn().mockImplementation(() => Promise.resolve())
});
```

---

## i18n in Tests

```typescript
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

// Usage
render(withI18n(<Card title="Test" />));
```

---

## Test Commands

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (skip Storybook)
npm run test:ci

# Visual regression
npm run test:visual

# Update visual snapshots
npm run test:visual:update

# Accessibility focused
npm run test:a11y

# Lighthouse audit
npm run lighthouse:a11y:ci
```

---

## CI Integration

### GitHub Actions

**File**: `.github/workflows/pr-validation.yml`

```yaml
steps:
  - run: npm ci
  - run: npm run typecheck
  - run: npm run lint
  - run: npm test
```

### Environment Variables

| Variable | Effect |
|----------|--------|
| `CI=true` | Enables CI mode |
| `SKIP_STORYBOOK_TESTS=1` | Skip Storybook tests |
| `VERCEL=1` | Vercel environment detection |

---

## Best Practices

### Do

- Test user interactions over implementation
- Use semantic queries (getByRole, getByText)
- Test accessibility with axe
- Mock external dependencies
- Clean up after each test

### Don't

- Test implementation details
- Use brittle selectors
- Skip accessibility tests
- Leave console.log in tests
- Couple tests to each other

---

## Test Quality Checklist

- [ ] All components have unit tests
- [ ] Accessibility tests for interactive components
- [ ] Visual regression for key UI
- [ ] Coverage >80%
- [ ] Tests pass in CI
- [ ] No flaky tests
