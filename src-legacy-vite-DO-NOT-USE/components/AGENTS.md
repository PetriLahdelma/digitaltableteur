# Shared Components - Quick Reference

## Package Identity

**Purpose**: Design system & shared component library  
**Technology**: React 18, TypeScript 5.8, CSS Modules

---

## Setup & Run

```bash
npm run storybook       # Component development at http://localhost:6012
npm test               # Run all tests
npm run test:a11y      # Accessibility tests
npm run test:visual    # Visual regression
```

---

## Patterns & Conventions

### Component Structure (MANDATORY)

**Every component MUST have 5 files:**

```
ComponentName/
├── ComponentName.tsx          # Functional component
├── ComponentName.module.css   # CSS Modules only
├── ComponentName.stories.tsx  # Storybook (WIP badge by default)
├── ComponentName.test.tsx     # Vitest + accessibility tests
└── index.ts                   # Re-export
```

### Key Patterns

✅ **DO**: Define TypeScript interfaces with JSDoc

- Example: `shared/components/Button/Button.tsx`

✅ **DO**: Use CSS Modules with design tokens from `src/styles/variables.css`

- Example: `shared/components/Card/Card.module.css`

✅ **DO**: Use logical properties (`margin-inline`, `padding-block`)

- Never use physical directions (`margin-left`, `padding-right`)

✅ **DO**: Wrap user-facing text with `useTranslation()`

- Example: `shared/components/ContactForm/ContactForm.tsx`

✅ **DO**: Test accessibility with axe-core

- Example: `shared/components/Button/Button.test.tsx`

✅ **DO**: Create Storybook stories (WIP badge by default)

- Example: `shared/components/Card/Card.stories.tsx`

❌ **DON'T**: Hardcode colors (use `var(--color-*)`)
❌ **DON'T**: Skip any of the 5 required files
❌ **DON'T**: Remove WIP badge without verification
❌ **DON'T**: Use inline styles (except dynamic `backgroundImage`)

---

## Touch Points / Key Files

- **Design tokens**: `src/styles/variables.css`
- **Global styles**: `src/index.css`
- **Component index**: `src/components/index.ts`
- **Button pattern**: `shared/components/Button/Button.tsx`
- **Form pattern**: `shared/components/ContactForm/ContactForm.tsx`
- **Layout**: `shared/components/PageLayout/PageLayout.tsx`
- **Typography**: `shared/components/Title/`, `shared/components/Text/`
- **Card**: `shared/components/Card/Card.tsx` (design system primitive)

---

## JIT Index Hints

### Find Components

```bash
find shared/components -name "*.tsx" -not -name "*.test.tsx" -not -name "*.stories.tsx"
rg -n "export (function|const|default).*ComponentName" shared/components/
```

### Find Missing Tests

```bash
./check_missing_tests.sh
```

### Find Missing Stories

```bash
for f in $(find shared/components -name "*.tsx" -not -name "*.test.tsx" -not -name "*.stories.tsx"); do
  test -f "${f%.tsx}.stories.tsx" || echo "$f";
done
```

### Find Translation Usage

```bash
rg -n "useTranslation" shared/components/
rg -n "t\(\"" shared/components/ | grep -v ".test.tsx"
```

---

## Common Gotchas

- **Logical properties**: Use `margin-inline`, not `margin-left`
- **Design tokens**: Use `var(--color-primary)`, not `#007bff`
- **Exports**: Import via `@dt/ComponentName`, not relative paths
- **Accessibility**: Always include `aria-label` for icon-only buttons
- **WIP badge**: Don't remove without a11y + visual + translation verification

---

## Pre-PR Checks

```bash
npm run typecheck && npm run lint && npm test && npm run test:visual && npm run test:a11y
```

---

**See [app/AGENTS.md](../../app/AGENTS.md) for Next.js integration patterns.**
