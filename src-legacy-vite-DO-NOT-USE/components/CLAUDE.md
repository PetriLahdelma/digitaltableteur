# Shared Components - Claude Code Instructions

## Package Identity

**Purpose**: Design system and shared component library  
**Technology**: React 18, TypeScript 5.8, CSS Modules, i18next  
**Location**: Symlinked from `src/components/`  
**Parent Context**: Extends [../../CLAUDE.md](../../CLAUDE.md)

---

## ⚠️ CRITICAL: Component Creation Rules

**BEFORE creating ANY new component, read:**

- **`docs/LLM_COMPONENT_GENERATION_RULES.md`** (12,000+ words, authoritative)
- **`docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`**

---

## Development Commands

### This Package

```bash
# From project root
npm run storybook       # Component development at http://localhost:6012
npm test               # Run all tests (includes component tests)
npm run test:watch     # Watch mode
npm run test:a11y      # Accessibility tests (axe-core)
npm run test:visual    # Visual regression (Playwright)
```

### Pre-PR Checklist

```bash
npm run typecheck && npm run lint && npm test && npm run test:visual && npm run test:a11y
```

---

## Architecture

### Component Structure (MANDATORY)

**Every component MUST include ALL these files:**

```
ComponentName/
├── ComponentName.tsx          # Functional component with TypeScript
├── ComponentName.module.css   # CSS Modules only (never inline styles)
├── ComponentName.stories.tsx  # Storybook with WIP badge by default
├── ComponentName.test.tsx     # Vitest unit tests + accessibility
└── index.ts                   # Re-export: export { default } from './ComponentName'
```

**Never create standalone files. Always create the complete folder structure.**

---

## Code Organization Patterns

### Component API Design

✅ **DO**: Define clear TypeScript interfaces

```tsx
// shared/components/Button/Button.tsx
export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: "primary" | "secondary" | "ghost";
  /** Size preset */
  size?: "s" | "m" | "l";
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Optional icon before text */
  icon?: React.ReactNode;
  /** Optional icon after text */
  endIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "m",
  onClick,
  disabled = false,
  icon,
  endIcon,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
    </button>
  );
}
```

❌ **DON'T**: Use `any` types or skip prop documentation

### CSS Modules & Styling

✅ **DO**: Use CSS Modules with design tokens

```css
/* ComponentName.module.css */
.button {
  padding-inline: var(--space-layout-8);
  padding-block: var(--space-layout-4);
  border-radius: var(--radius-round);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-heading);
}

.primary {
  background-color: var(--color-primary);
}

.secondary {
  background-color: var(--color-secondary);
}
```

❌ **DON'T**: Hardcode colors, use design tokens from `src/styles/variables.css`

❌ **DON'T**: Use physical properties (`margin-left`, `padding-right`)

✅ **DO**: Use logical properties (`margin-inline-start`, `padding-block`)

### Internationalization

✅ **DO**: Wrap all user-facing text with `useTranslation()`

```tsx
import { useTranslation } from "react-i18next";

export default function ContactForm() {
  const { t } = useTranslation();

  return (
    <form>
      <label>{t("contact.nameLabel")}</label>
      <button>{t("contact.submitButton")}</button>
    </form>
  );
}
```

❌ **DON'T**: Hardcode user-visible strings (except Storybook demo stories)

### Testing

✅ **DO**: Test user behavior, not implementation

```tsx
// ComponentName.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Click</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

❌ **DON'T**: Test implementation details (class names, internal state)

### Storybook

✅ **DO**: Create comprehensive stories with WIP badge

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  // WIP badge shown by default - remove only after a11y + visual + translation verification
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Click me",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Click me",
    variant: "secondary",
  },
};

export const WithIcon: Story = {
  args: {
    children: "Send",
    icon: <Icon name="PaperPlane" />,
  },
};

// Remove WIP badge after verification
export const ProductionReady: Story = {
  args: {
    children: "Verified",
  },
  parameters: {
    wip: { disabled: true },
  },
};
```

❌ **DON'T**: Remove WIP badge without completing verification checklist

---

## Key Files & Touch Points

### Design System Core

- **Design tokens**: `src/styles/variables.css` (colors, spacing, typography, radius)
- **Global styles**: `src/index.css` (CSS resets, base styles)
- **Component index**: `src/components/index.ts` (exports all components)

### Common Patterns (copy these)

- **Buttons**: `shared/components/Button/Button.tsx`
- **Forms**: `shared/components/ContactForm/ContactForm.tsx`
- **Layout**: `shared/components/PageLayout/PageLayout.tsx`
- **Typography**: `shared/components/Title/Title.tsx`, `shared/components/Text/Text.tsx`
- **Cards**: `shared/components/Card/Card.tsx` (design system primitive)
- **Modals**: `shared/components/Modal/Modal.tsx`
- **Navigation**: `shared/components/NavMenuList/NavMenuList.tsx`

### Specialized Components

- **Chat**: `shared/components/ChatWidget/` (AI chat interface)
- **Email workflow**: `shared/components/ChatWidget/emailWorkflow/` (reducer-driven)
- **Markdown**: `shared/components/MarkdownMessage/` (react-markdown + remark-gfm)
- **Observability**: `shared/components/SentrySummaryCard/` (Sentry integration)

---

## Quick Search Commands

### Find Components

```bash
# All components
find shared/components -name "*.tsx" -not -name "*.test.tsx" -not -name "*.stories.tsx"

# Find component by name
rg -n "export (function|const|default).*ComponentName" shared/components/

# Find components with specific prop
rg -n "interface.*Props.*variant" shared/components/
```

### Find Missing Tests

```bash
# Run check script
./check_missing_tests.sh

# Find untested components
for f in $(find shared/components -name "*.tsx" -not -name "*.test.tsx" -not -name "*.stories.tsx"); do
  test -f "${f%.tsx}.test.tsx" || echo "$f";
done
```

### Find Missing Stories

```bash
# Find components without stories
for f in $(find shared/components -name "*.tsx" -not -name "*.test.tsx" -not -name "*.stories.tsx"); do
  test -f "${f%.tsx}.stories.tsx" || echo "$f";
done
```

### Find Translation Usage

```bash
# Find components using translations
rg -n "useTranslation" shared/components/

# Find translation keys
rg -n "t\(\"" shared/components/ | grep -v ".test.tsx"
```

---

## Common Gotchas

### Logical Properties

**Issue**: Using physical directions breaks RTL support

```css
/* ❌ DON'T */
.element {
  margin-left: 1rem;
  padding-right: 2rem;
  border-right: 1px solid;
}

/* ✅ DO */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
  border-inline-end: 1px solid;
}
```

### Design Tokens

**Issue**: Hardcoded colors break theming

```css
/* ❌ DON'T */
.button {
  background-color: #007bff;
  color: #ffffff;
}

/* ✅ DO */
.button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
```

### Component Exports

**Issue**: Missing barrel exports cause import errors

```tsx
// ❌ DON'T
import Button from "../shared/components/Button/Button";

// ✅ DO
import { Button } from "@dt/Button";

// Requires index.ts:
export { default } from "./Button";
```

### Accessibility

**Issue**: Missing ARIA labels or semantic HTML

```tsx
// ❌ DON'T
<div onClick={handleClick}>Submit</div>

// ✅ DO
<button type="submit" aria-label={t('submit')}>
  {t('submit')}
</button>
```

### Storybook WIP Badge

**Issue**: Removing badge prematurely

```tsx
// ❌ DON'T remove without verification
export const MyStory: Story = {
  parameters: {
    wip: { disabled: true }, // Removed too early
  },
};

// ✅ DO verify checklist first:
// - Accessibility tests pass (axe-core)
// - Visual regression baselines reviewed
// - Translation coverage verified
// Then remove badge
```

---

## Pre-PR Checks

Run before creating a PR:

```bash
npm run typecheck && npm run lint && npm test && npm run test:visual && npm run test:a11y
```

Ensure:

- ✅ Component folder structure complete (5 files)
- ✅ TypeScript interfaces documented
- ✅ CSS uses design tokens (no hardcoded colors)
- ✅ Logical properties (no physical directions)
- ✅ Translation keys added to EN/FI/SV
- ✅ Unit tests pass (including accessibility)
- ✅ Storybook story created (WIP badge present)
- ✅ Visual regression baselines reviewed
- ✅ No console errors or warnings

---

## Component Generation Checklist

Before creating a new component:

1. **Read** `docs/LLM_COMPONENT_GENERATION_RULES.md`
2. **Create folder** `shared/components/ComponentName/`
3. **Create 5 files**: `.tsx`, `.module.css`, `.stories.tsx`, `.test.tsx`, `index.ts`
4. **Define TypeScript interface** with JSDoc comments
5. **Use design tokens** in CSS (no hardcoded values)
6. **Use logical properties** (margin-inline, padding-block)
7. **Add translations** to EN/FI/SV locale files
8. **Write unit tests** including accessibility (axe-core)
9. **Create Storybook stories** with WIP badge
10. **Export** in `src/components/index.ts`
11. **Run tests** `npm test -- ComponentName`
12. **Run visual regression** `npm run test:visual`
13. **Commit** all 5 files together

---

**End of shared/components/CLAUDE.md** — For Next.js integration, see [app/CLAUDE.md](../../app/CLAUDE.md)
