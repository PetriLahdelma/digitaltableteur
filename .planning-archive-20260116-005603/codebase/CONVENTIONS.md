# Conventions

> Code style, naming patterns, and development practices for Digitaltableteur.

**Last Updated**: 2026-01-14

---

## Typography System

### Font Stack

| Role | Font | Source | Variable |
|------|------|--------|----------|
| Heading/Display | Syne | Google Fonts | `--font-heading` |
| Body/Text | Satoshi | Fontshare | `--font-body` |

### Font Loading

Fonts are configured via `next/font` in `app/fonts.ts`:
- **Syne**: Variable font (400-800), imported from Google Fonts
- **Satoshi**: Variable font (300-900), self-hosted from `app/fonts/`

CSS variables `--font-heading` and `--font-body` are applied to `<html>` via `fontVariables` class.

### Tailwind Utilities

| Utility | Font | Usage |
|---------|------|-------|
| `font-heading` | Syne | Display text, headings |
| `font-body` | Satoshi | Body text, UI elements |
| `font-display` | Syne | Alias for heading |
| `font-sans` | Satoshi | Alias for body |
| `font-title` | Syne | Legacy compatibility |
| `font-text` | Satoshi | Legacy compatibility |

### Typography Components

| Component | Purpose | Default Font | Location |
|-----------|---------|--------------|----------|
| `<Display>` | Hero text (80-128px) | Syne | `nextjs-app/shared/components/Display/` |
| `<Heading>` | Section headings | Syne | `nextjs-app/shared/components/Heading/` |
| `<Title>` | Legacy heading | Syne (serif) / Satoshi (sans) | `nextjs-app/shared/components/Title/` |
| `<Text>` | Body text | Satoshi (sans) / Syne (serif) | `nextjs-app/shared/components/Text/` |

### Size Scale

| Token | CSS Variable | Responsive Range |
|-------|--------------|------------------|
| `display` | `--font-size-display` | 80px - 128px |
| `title-xl` | `--font-size-title-xl` | 56px - 88px |
| `title-l` | `--font-size-title-l` | 44px - 68px |
| `title-m` | `--font-size-title-m` | 32px - 48px |
| `title-s` | `--font-size-title-s` | 24px - 36px |
| `text-l` | `--font-size-text-l` | 18px - 24px |
| `text-m` | `--font-size-text-m` | 16px - 20px |
| `text-s` | `--font-size-text-s` | 12px - 17px |

### Usage Examples

```tsx
// Tailwind utilities (new components)
<h1 className="font-heading text-display font-bold">Hero Title</h1>
<p className="font-body text-text-m">Body paragraph text</p>

// New components
<Display>Hero Title</Display>
<Heading level={2} size="lg">Section Title</Heading>

// Legacy components (still supported)
<Title level={1} terminals="serif">Heading</Title>
<Text terminals="sans">Body text</Text>
```

---

## Code Style

### ESLint Configuration

**Files**: `.eslintrc.cjs`, `eslint.config.mjs`

| Rule | Setting |
|------|---------|
| Quotes | Double quotes (`"string"`) |
| Semicolons | None (Prettier handles) |
| React Hooks | Enforced (rules-of-hooks: error) |
| Unused vars | TypeScript handles (disabled in ESLint) |

**Plugins**: eslint:recommended, react/recommended, prettier/recommended, @typescript-eslint

### Prettier

**File**: `.prettierrc`

```json
{
  "singleQuote": false,
  "jsxSingleQuote": false
}
```

### Stylelint (CSS)

**File**: `.stylelintrc.json`

| Rule | Setting |
|------|---------|
| Class naming | camelCase (`^[a-z][a-zA-Z0-9]*$`) |
| ID selectors | Forbidden (`selector-max-id: 0`) |
| Nesting | Max 3 levels (warning) |
| Colors | Must use CSS variables |
| Physical properties | Discouraged (use logical) |

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase folder + file | `Button/Button.tsx` |
| Hooks | camelCase with `use` prefix | `usePersistentTheme.ts` |
| Tests | `.test.tsx` suffix | `Button.test.tsx` |
| Stories | `.stories.tsx` suffix | `Button.stories.tsx` |
| Styles | `.module.css` suffix | `Button.module.css` |
| Exports | `index.ts` | Barrel exports |

### Code

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `ContactForm` |
| Functions | camelCase | `handleSubmit` |
| Variables | camelCase | `isLoading` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Types | PascalCase | `ButtonProps` |
| CSS classes | camelCase | `.buttonPrimary` |

---

## Component Structure

### Mandatory Folder Structure

Every UI component MUST have:

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # CSS Modules
├── ComponentName.stories.tsx  # Storybook
├── ComponentName.test.tsx     # Unit tests
└── index.ts                   # Barrel export
```

### Optional Files

```
├── ComponentName.a11y.test.tsx      # Accessibility tests
├── ComponentName.behavior.test.tsx  # Behavioral tests
├── SubComponent.tsx                 # Variants
└── schema.json                      # LLM generation schema
```

### Barrel Export Pattern

```typescript
// Button/index.ts
export { default } from "./Button";
export type { ButtonProps } from "./Button";
export { default as SplitButton } from "./SplitButton";
```

---

## CSS Approach

### Hybrid Styling (CSS Modules + Tailwind + shadcn/ui)

**Migration Status** (as of Phase 01):
- **Existing Components**: CSS Modules (77+ components)
- **New Components**: Tailwind CSS utilities + shadcn/ui primitives
- **Design Tokens**: CSS custom properties (source of truth in `variables.css`)

#### Component Library Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Primitives | shadcn/ui + Radix UI | Accessible, unstyled base components |
| Styling | Tailwind CSS 4.x | Utility-first CSS |
| Tokens | CSS custom properties | Design system values |
| Legacy | CSS Modules | Existing components |

#### When to Use What

| Scenario | Approach |
|----------|----------|
| Existing component modification | CSS Modules (match existing style) |
| New accessible primitive | shadcn/ui component |
| New component styling | Tailwind CSS utilities |
| Design token values | Always use CSS variables via Tailwind |
| Complex animations | CSS Modules or GSAP (Phase 03) |

#### shadcn/ui Components Available

- `Button` - Primary, secondary, outline, ghost, destructive variants
- `Dialog` - Accessible modal with focus trap
- `DropdownMenu` - Accessible dropdown
- `Tooltip` - Accessible tooltip
- `Tabs` - Accessible tab interface
- `Accordion` - Accessible accordion
- `Input` - Styled text input
- `Textarea` - Styled textarea
- `Select` - Accessible select dropdown
- `Checkbox` - Accessible checkbox
- `Switch` - Accessible toggle switch
- `Label` - Form label with accessibility

#### Example: New Component with shadcn/ui

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function MyComponent() {
  return (
    <div className="p-8 bg-background">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <p className="text-foreground">Content here</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

#### Theme-Aware Utilities

- `dark:` - Dark theme variant (via Tailwind)
- `hcb:` - High Contrast Black variant (custom)
- `hcw:` - High Contrast White variant (custom)

```tsx
<div className="bg-background dark:bg-background hcb:bg-black hcw:bg-white">
  Theme-aware background
</div>
```

### CSS Modules (Existing Components)

For existing components, continue using CSS Modules:

- **No inline styles** (except `backgroundImage`)
- All styles in `.module.css` files

```typescript
import styles from "./Button.module.css";

<button className={styles.button} />
```

### Design Tokens

Use CSS custom properties from `variables.css`:

```css
/* GOOD */
.button {
  padding-inline: var(--space-internal-16);
  color: var(--color-primary);
  font-family: var(--font-text);
}

/* BAD */
.button {
  padding-left: 16px;
  color: #007bff;
  font-family: Arial;
}
```

### Logical Properties (Required)

| Physical (Avoid) | Logical (Use) |
|------------------|---------------|
| `margin-left/right` | `margin-inline` |
| `padding-top/bottom` | `padding-block` |
| `left/right` | `inset-inline` |
| `top/bottom` | `inset-block` |

---

## TypeScript Practices

### Strict Mode

- `strict: true` in `tsconfig.json`
- No `any` without justification
- All props typed via interfaces

### Type Organization

```typescript
// Props interface with JSDoc
export interface ButtonProps {
  /** Visual style variant */
  variant?: "primary" | "secondary" | "tertiary";

  /** Button label content */
  children?: React.ReactNode;

  /** Shows loading state */
  isLoading?: boolean;
}

// Union types for variants
export type ButtonSeverity = "error" | "warning" | "success" | "info";
```

### Exclusions

Test and story files excluded from type checking in `tsconfig.json`.

---

## Import Patterns

### Path Aliases

```typescript
// Components
import Button from "@dt/Button";
import { SplitButton } from "@dt/Button";
import type { ButtonProps } from "@dt/Button";

// Page components
import AboutPage from "@dt-pages/AboutPage";
```

### Import Order

1. React/vendor libraries
2. Local components (`@dt/*`)
3. Utilities and hooks
4. Styles (last)

---

## Comment Style

### JSDoc for Props

```typescript
export interface CardProps {
  /** Card title displayed in header */
  title?: string;

  /** Elevation on hover interaction */
  hoverable?: boolean;
}
```

### Function Documentation

```typescript
/**
 * Normalizes size prop from multiple formats
 * @param size - Size value (sm/md/lg or s/m/l)
 * @returns Normalized size string
 */
function normalizeSizeProp(size: unknown): SizeUnified
```

### Inline Comments

- **Minimal** - code should be self-documenting
- **Explain WHY**, not what
- Used only for non-obvious logic

---

## Git Conventions

### Branch Naming

```
DT-XXX-feat-description    # Feature
DT-XXX-fix-description     # Bug fix
DT-XXX-docs-description    # Documentation
```

### Commit Format (Conventional Commits)

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify form validation
test: add accessibility tests for Modal
```

### PR Requirements

- All tests passing
- Type checks passing
- Lint clean
- 1 approval required
- Squash on merge

---

## Deprecated Patterns

### Props (Planned for v2.0.0 removal)

```typescript
/** @deprecated Use isDisabled instead */
disabled?: boolean;

/** @deprecated Use isLoading instead */
isSubmitting?: boolean;

/** @deprecated Use isInverse instead */
inverse?: boolean;
```

### Code Locations

| Location | Status |
|----------|--------|
| `vite-app/` | Legacy, being phased out |
| `api-legacy-vercel-functions/` | Use `app/api/` instead |
| Physical CSS properties | Use logical properties |

---

## Quality Gates

### Pre-commit (Required)

```bash
npm run typecheck && npm test && npm run lint
```

### CI/CD Checks

- TypeScript validation
- ESLint + Stylelint
- Vitest tests
- Coverage threshold (>80%)
