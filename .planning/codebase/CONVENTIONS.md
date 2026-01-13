# Coding Conventions

**Analysis Date:** 2026-01-13

## Naming Patterns

**Files:**
- `ComponentName.tsx` - React components (PascalCase)
- `ComponentName.module.css` - CSS Modules (matching component name)
- `ComponentName.test.tsx` - Test files (colocated)
- `ComponentName.stories.tsx` - Storybook stories
- `utility-name.ts` - Utility modules (kebab-case)
- `index.ts` - Barrel exports

**Functions:**
- camelCase for all functions: `normalizeSizeProp()`, `getSemanticIcon()`
- No special prefix for async functions
- Handler prefix: `handleEventName` for event handlers
- Type guards: `isSomething()` pattern

**Variables:**
- camelCase for variables: `effectiveActiveTab`, `normalizedSize`
- UPPER_SNAKE_CASE for constants: `SIZE_MAP`, `STATUS_ICON_NAMES`
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces, no I prefix: `User`, `TabsProps`, `ButtonVariant`
- PascalCase for type aliases: `SizeUnified`, `TitleSizeLegacy`
- Props suffix for component props: `ButtonProps`, `CardProps`
- Version comments: `// v1.1.0 PROPS`, `// NEW PROPS (v2.0.0)`

## Code Style

**Formatting:**
- Prettier with `.prettierrc`
- Double quotes for strings: `"singleQuote": false`
- Double quotes for JSX: `"jsxSingleQuote": false`
- 2 space indentation
- Semicolons required

**Linting:**
- ESLint with `eslint.config.mjs` (flat config)
- Extends: `eslint:recommended`, `plugin:react/recommended`, `plugin:prettier/recommended`
- `quotes: ["error", "double"]`
- `jsx-quotes: ["error", "prefer-double"]`
- `react-hooks/rules-of-hooks: "error"`
- Run: `npm run lint`

**CSS Linting:**
- Stylelint with `.stylelintrc.json`
- Extends: `stylelint-config-standard`
- Selector pattern: `^[a-z][a-zA-Z0-9]*$` (camelCase for CSS Modules)
- Property order: Display → Position → Margins → Padding → Colors → Typography
- Disallowed: `margin-left`, `margin-right`, `padding-left`, `padding-right` (use logical properties)

## Import Organization

**Order:**
1. External packages (react, next, etc.)
2. Internal modules (@/lib, @dt/*)
3. Relative imports (./utils, ../types)
4. Type imports (import type {})

**Grouping:**
- Blank line between groups
- Alphabetical within each group

**Path Aliases:**
- `@/*` - Root directory (`./`)
- `@dt/*` - Shared components (`./nextjs-app/shared/components/*`)
- `@dt-pages/*` - Page components (`./nextjs-app/shared/components/pages/*`)

## Error Handling

**Patterns:**
- Try/catch at API route boundaries
- Log via `SecurityLogger` before returning error
- Return JSON with `error` field and appropriate status code
- Use `instanceof Error` check before accessing `message`

**Error Types:**
- Throw on invalid input, missing dependencies
- Return early with 400 for validation errors
- Return 500 with generic message for server errors
- Include `cause` for error chains: `new Error('Failed', { cause: originalError })`

## Logging

**Framework:**
- `SecurityLogger` class in `app/lib/security-logger.ts`
- Methods: `logAuthAttempt()`, `logDataAccess()`, `logRateLimitExceeded()`

**Patterns:**
- Structured logging with context: `{ ip, userAgent, endpoint, success, details }`
- Log at API boundaries, not in utilities
- Log state transitions, external calls, security events
- No console.log in production (use SecurityLogger or Sentry)

## Comments

**When to Comment:**
- Explain why, not what: `// Retry 3 times because API has transient failures`
- Document business rules: `// Rate limit: 3 submissions per 15 minutes`
- Complex algorithms or workarounds
- Avoid obvious comments

**JSDoc/TSDoc:**
- Required for public API functions
- Use `@param`, `@returns`, `@example`, `@since` tags
- Document deprecated features with `@deprecated`

**Section Headers:**
```typescript
// ===================
// Section Name
// ===================
```

**TODO Comments:**
- Format: `// TODO: description`
- Link to issue if exists: `// TODO: Fix race condition (issue #123)`

## Function Design

**Size:**
- Keep under 50 lines
- Extract helpers for complex logic
- One level of abstraction per function

**Parameters:**
- Max 3 parameters
- Use options object for 4+: `function create(options: CreateOptions)`
- Destructure in parameter list: `function process({ id, name }: ProcessParams)`

**Return Values:**
- Explicit return statements
- Return early for guard clauses
- Use Result<T, E> type for expected failures (where applicable)

## Module Design

**Exports:**
- Named exports preferred
- Default exports for main component in folder
- Export types alongside components

**Barrel Files:**
- `index.ts` re-exports public API:
  ```typescript
  export { Button } from "./Button";
  export type { ButtonProps } from "./Button";
  ```
- Keep internal helpers private (don't export from index)

## CSS Conventions

**CSS Modules:**
- camelCase class names: `.container`, `.buttonPrimary`
- BEM-style modifiers via separate classes: `.isActive`, `.isDisabled`
- No global styles except `globals.css`

**Logical Properties:**
- Use `margin-inline`, `padding-block`, `inset` instead of directional
- Enables RTL support and internationalization

**Design Tokens:**
- All colors: `var(--color-primary)`, `var(--color-border)`
- Spacing: `var(--space-internal-8)`, `var(--space-layout-16)`
- Typography: `var(--font-size-button-s)`, `var(--font-weight-medium)`
- Radii: `var(--radius-m)`, `var(--radius-l)`

**No Hardcoded Values:**
- Never hardcode colors, use CSS custom properties
- Never use inline styles except `backgroundImage` for dynamic content

---

*Convention analysis: 2026-01-13*
*Update when patterns change*
