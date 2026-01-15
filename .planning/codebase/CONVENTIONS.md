# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**
- PascalCase for components: `Button.tsx`, `ContactForm.tsx`
- camelCase for utilities: `sanitize.ts`, `mongodb.ts`
- kebab-case for routes: `download-cv/route.ts`
- `.module.css` suffix for CSS Modules
- `.test.tsx` suffix for tests (colocated)
- `.stories.tsx` suffix for Storybook

**Functions:**
- camelCase for all functions: `handleSubmit`, `validateInput`
- `handle` prefix for event handlers: `handleClick`, `handleChange`
- `use` prefix for hooks: `usePersistentTheme`, `useTranslation`

**Variables:**
- camelCase for variables: `isLoading`, `userData`
- UPPER_SNAKE_CASE for constants: `MAX_RETRIES`, `API_BASE_URL`
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces: `ButtonProps`, `ContactFormData`
- PascalCase for type aliases: `ButtonVariant`, `TextSize`
- No `I` prefix for interfaces (use `ButtonProps` not `IButtonProps`)

## Code Style

**Formatting:**
- Prettier with `.prettierrc`
- Double quotes for strings
- 2 space indentation
- No trailing semicolons optional

**Linting:**
- ESLint with `.eslintrc.cjs`
- Extends: eslint:recommended, plugin:react/recommended
- Rules: `quotes: ["error", "double"]`, `jsx-quotes: ["error", "prefer-double"]`
- Run: `npm run lint`

**CSS:**
- Stylelint with `.stylelintrc.json`
- CSS logical properties enforced (`padding-inline` not `padding-left`)
- Class names: camelCase (`selector-class-pattern: "^[a-z][a-zA-Z0-9]*$"`)
- Design tokens required for colors, spacing, fonts

## Import Organization

**Order:**
1. React imports (`import React from "react"`)
2. External packages (`import { useTranslation } from "react-i18next"`)
3. Internal modules (`import { Button } from "@dt/Button"`)
4. Relative imports (`import styles from "./Component.module.css"`)
5. Type imports (`import type { ButtonProps } from "./Button"`)

**Grouping:**
- Blank line between groups
- Alphabetical within groups (optional)

**Path Aliases:**
- `@/*` - Root directory
- `@dt/*` - `nextjs-app/shared/components/*`
- `@dt-pages/*` - `nextjs-app/shared/components/pages/*`

## Error Handling

**Patterns:**
- try/catch at API boundaries
- Zod schemas for validation
- Generic error messages to clients (no internal details)

**Error Types:**
- Throw on invalid input, missing data
- Return structured error responses from API
- Log errors to Sentry in production

**Example:**
```typescript
try {
  const data = schema.parse(await req.json());
  // ... process data
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  console.error("Unexpected error:", error);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
```

## Logging

**Framework:**
- Sentry for production errors (`@sentry/nextjs`)
- console.log/warn/error for development

**Patterns:**
- Log at API boundaries
- Include context (userId, action) when relevant
- No console.log in committed production code (use Sentry)

## Comments

**When to Comment:**
- Explain "why" not "what"
- Document business logic and edge cases
- Avoid obvious comments

**JSDoc:**
- Required for exported functions
- Include @param, @returns descriptions
- Example:
```typescript
/**
 * Sanitizes user input for MongoDB storage
 * @param input - Raw user input string
 * @returns Sanitized string safe for database
 */
export function sanitize(input: string): string { ... }
```

**TODO Comments:**
- Format: `// TODO: description`
- Link to issue if available: `// TODO: Fix race condition (#123)`

## Function Design

**Size:**
- Keep under 50 lines
- Extract helpers for complex logic

**Parameters:**
- Max 3 parameters
- Use options object for 4+ parameters
- Destructure in parameter list

**Return Values:**
- Explicit returns
- Return early for guard clauses
- Use Result type for expected failures

## Module Design

**Exports:**
- Named exports preferred
- Default export for React components
- Barrel exports via `index.ts`

**Component Structure:**
```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # Styles
├── ComponentName.stories.tsx  # Storybook
├── ComponentName.test.tsx     # Tests
└── index.ts                   # Barrel export
```

**Barrel Pattern:**
```typescript
// index.ts
export { default } from "./Button";
export type { ButtonProps, ButtonVariant } from "./Button";
```

## CSS Conventions

**CSS Modules Only:**
- `import styles from "./Component.module.css"`
- `className={styles.className}`
- No inline styles except dynamic `backgroundImage`

**Design Tokens:**
- Colors: `var(--color-primary)`, `var(--color-text)`
- Spacing: `var(--space-internal-16)`, `var(--space-layout-24)`
- Fonts: `var(--font-sans)`, `var(--font-heading)`

**Logical Properties:**
- ✅ `padding-inline`, `margin-block`
- ❌ `padding-left`, `margin-top`

**Property Order (enforced by stylelint):**
1. Display & positioning
2. Spacing (margin, padding)
3. Size (width, height)
4. Flexbox/Grid
5. Border & outline
6. Background & shadows
7. Typography
8. Animations

## Component Reuse

**Required Components:**
- `<Title level={n}>` instead of `<h1>`, `<h2>`, etc.
- `<Text as="p">` instead of `<p>`
- `<Button>` instead of `<button>`
- `<Card>` for card layouts
- `<Icon>` instead of raw SVG

**Example:**
```tsx
// ❌ BAD
<div>
  <h2>Title</h2>
  <p>Body text</p>
  <button>Click</button>
</div>

// ✅ GOOD
<Card>
  <Title level={2}>Title</Title>
  <Text as="p">Body text</Text>
  <Button variant="primary">Click</Button>
</Card>
```

---

*Convention analysis: 2026-01-16*
*Update when patterns change*
