> **Updated 2026-05-26:** In-scope components use `Component.contract.json` + `Component.spec.md` + `Component.mdx`. Scaffold with `npm run new-component`. Stack: Tailwind v4 + CVA + production tokens in `variables.css` (DTCG export is WIP — see `foundations/tokens/README.md`).

# LLM Component Generation Rules for Digitaltableteur

> Comprehensive guidelines for AI-assisted React component generation following project conventions, design system patterns, and accessibility standards.

**Last Updated:** November 23, 2025  
**Version:** 2.0.0 (Next.js Migration)

---

## Table of Contents

1. [Core Architecture & Philosophy](#section-1-core-architecture--philosophy)
2. [Styling & CSS Architecture](#section-2-styling--css-architecture)
3. [Component API Design & Props](#section-3-component-api-design--props)
4. [Internationalization (i18n)](#section-4-internationalization-i18n)
5. [React Best Practices & Performance](#section-5-react-best-practices--performance)
6. [Accessibility (a11y) Requirements](#section-6-accessibility-a11y-requirements)
7. [Testing & Quality Assurance](#section-7-testing--quality-assurance)
8. [Code Quality & Linting](#section-8-code-quality--linting)
9. [Storybook & Documentation](#section-9-storybook--documentation)
10. [Final Checklist & Component Generation Template](#section-10-final-checklist--component-generation-template)

---

## SECTION 1: Core Architecture & Philosophy

### Rule 1.1 - Design System First Approach

**ALWAYS reference the existing design system before creating new patterns:**

- Use design tokens from `variables.css` for spacing, colors, typography
- Check `docs/2026_PRD.md` for feature requirements
- Review existing components in `shared/components/` (cross-platform) or `src/components/` (Vite-only)
- Never hardcode values that should be tokens (colors, spacing, font sizes)
- Token adoption is mandatory - no exceptions

**Next.js Migration Context (November 2025):**

- **Primary platform:** Next.js 16.2.x App Router (repo root `app/`, `next.config.ts`)
- **Vite usage:** Storybook and Vitest tooling only; there is no active Vite app.
- **Shared components:** `nextjs-app/shared/components/` (import via `@dt/*`)
- **Platform-specific code:** Root `app/` for routes/API; `nextjs-app/shared/` for reusable design-system code.

**Example:**

```css
/* ❌ BAD */
.component {
  padding: 16px;
  color: #00f;
}

/* ✅ GOOD */
.component {
  padding: var(--space-layout-16);
  color: var(--color-primary);
}
```

### Rule 1.1.1 - Component Reuse (CRITICAL)

**ALWAYS reuse existing components instead of creating raw HTML elements:**

- **Typography Components:**
  - ❌ NEVER use raw `<h1>`, `<h2>`, `<h3>`, etc.
  - ✅ ALWAYS use `<Title level={1}>`, `<Title level={2}>`, etc.
  - ❌ NEVER use raw `<p>` tags
  - ✅ ALWAYS use `<Text as="p">` or `<Text as="span">`
  - ❌ NEVER use raw `<img>`.
  - ✅ ALWAYS use `NextJS <Image>` with appropriate settings.

- **Other Existing Components:**
  - Check `src/components/index.ts` and `shared/components/` for available components
  - Use `Icon` component instead of raw SVG or emoji
  - Use `Button` component instead of raw `<button>` for styled buttons
  - Use `Card` component for card layouts
  - Prefer composition of existing components over creating new patterns

**Example:**

```tsx
/* ❌ BAD - Raw HTML elements */
<div>
  <h2 className={styles.title}>Title</h2>
  <p className={styles.text}>Body text</p>
  <button className={styles.button}>Click</button>
</div>

/* ✅ GOOD - Reusing design system components */
<Card>
  <Title level={2} terminals="sans">Title</Title>
  <Text as="p" terminals="sans">Body text</Text>
  <Button variant="primary">Click</Button>
</Card>
```

**Benefits of component reuse:**

- Consistent typography and styling across the app
- Automatic theme support (Light, Dark, HC modes)
- Built-in accessibility features
- Reduces CSS duplication
- Ensures design token compliance

### Rule 1.2 - Component Structure (Non-Negotiable)

**Every component MUST include ALL these files:**

```
ComponentName/
├── ComponentName.tsx          # Functional component with TypeScript
├── ComponentName.module.css   # CSS Modules only (never inline styles)
├── ComponentName.stories.tsx  # Storybook with WIP badge by default
├── ComponentName.test.tsx     # Vitest unit tests + accessibility
└── index.ts                   # Re-export: export { default } from './ComponentName'
```

**Component Location Strategy:**

- **Shared components**: Place in `nextjs-app/shared/components/`
- **Shared patterns**: Place in `nextjs-app/shared/patterns/`
- **Next.js pages/routes**: Place in root `app/[route]/page.tsx`
- **Next.js-specific utilities**: Place in root `lib/`, `components/`, or the closest route folder.

**Default: Always use `shared/components/` for new UI components unless there's a platform-specific reason.**

**Never create standalone files. Always create the complete folder structure.**

### Rule 1.3 - TypeScript Strictness

- Use `React.FC<Props>` or `React.forwardRef<Element, Props>`
- Export interface `ComponentNameProps` (always public)
- Never use `any` type - use `unknown` if type is truly unknown
- Use `React.ReactNode` for children
- Complex types go in separate interfaces
- Props should be explicitly typed, not inferred

### Rule 1.4 - Design System Usage Rules

This clarifies how to correctly implement components and styles from the digitaltableteur design system.

**Component Architecture & Styling**

- **Mobile First:** Always consider mobile use first. This consideration saves a lot of hassle later on.
- **Design System First:** Always use existing components from the your-design-system package. Do not rebuild them.
- **Layout Primitives:** Always use layout components from digitaltableteur (e.g., Grid, FlexBox, PageLayout). Do not use raw divs with custom flexbox CSS.
- **Styling with Tokens:** Only use classes that are configured in our design system. Prefer our custom theme utilities (e.g., `color-primary`) over introducing new colors.
- **Icons:** Use the `Icon` component from digitaltableteur, passing the appropriate icon name. Do not import raw SVGs or use system emojis. Digitaltableteur Icon component uses Phosphor icons.
- **Props:** Component props must be defined with a TypeScript interface. When in doubt, use the TypeScript language server MCP as a source of knowledge on TypeScript patterns.

**What to Avoid**

- **No Hardcoded Values:** Do not use hardcoded strings (use translation keys), URLs (use config files), or styling values (use tokens).
- **No Inconsistent Naming:** Follow the project's naming conventions.
- **No Ignoring Errors:** Do not ignore TypeScript errors.
- **No Unnecessary DOM:** Avoid unnecessary div wrappers.

---

## SECTION 2: Styling & CSS Architecture

### Rule 2.1 - CSS Modules Requirements

**MANDATORY CSS practices:**

- Only CSS Modules (`ComponentName.module.css`)
- NEVER use inline styles, styled-components, or CSS-in-JS
- Use logical properties exclusively:
  - ❌ `margin-left/right`, `padding-left/right`, `border-left/right`
  - ✅ `margin-inline`, `padding-inline`, `border-inline-start`
- Always reference design tokens from `variables.css`
- Progressive enhancement with `@supports` when using modern CSS features

**Example structure:**

```css
.component {
  padding-inline: var(--space-layout-16);
  margin-block-end: var(--space-layout-24);
  color: var(--color-text);
}

@supports (backdrop-filter: blur(8px)) {
  .component {
    backdrop-filter: blur(8px);
  }
}
```

### Rule 2.2 - Design Token Usage

**Reference tokens, never hardcode:**

**Typography:**

- Font families: `var(--font-sans)`, `var(--font-serif)`, `var(--primary-heading-font)`
- Sizes: `var(--font-size-text-s/m/l)`, `var(--font-size-title-s/m/l/xl)`
- Line heights: `var(--line-height-tight/snug/normal/relaxed/loose)`

**Spacing:**

- `var(--space-layout-8/16/24/32/48/64/96)`
- Grid gaps: `var(--grid-gap-mobile/tablet/desktop)`
- Page margins: `var(--page-margin-mobile/tablet/desktop/wide)`

**Colors:**

- Functional: `var(--color-primary/success/error/warning/info)`
- Text: `var(--color-text/title)`, `var(--inverted-text-color)`
- Backgrounds: `var(--main-body-background-color)`, `var(--color-light-bg)`
- **Never create new color variables unless specifically requested**
- **CRITICAL:** Never use fallback values in var() - e.g., `var(--color-primary, #00f)` is FORBIDDEN
- Always trust tokens exist: `var(--color-primary)` not `var(--color-primary, blue)`
- If a token is missing, add it to `variables.css`, don't work around it with fallbacks

**Layout:**

- Containers: `var(--container-sm/md/lg/xl)` (640px/960px/1200px/1440px)
- Grid columns: `var(--grid-columns-mobile/tablet/desktop)` (4/8/12)

### Rule 2.3 - Responsive Design

**Use mobile-first approach with logical breakpoints:**

```css
@media (width >= 768px) {
  /* Tablet styles */
}

@media (width >= 1024px) {
  /* Desktop styles */
}

@media (width >= 1440px) {
  /* Wide screens */
}
```

**Use `clamp()` for fluid typography (already in tokens):**

```css
font-size: clamp(1rem, 0.6vw + 0.9rem, 1.25rem);
```

### Rule 2.4 - Theme Support (CRITICAL)

**ALWAYS consider theming at every step of component styling.**

**Supported themes:** Light (default), Dark (`.themeDark`), High Contrast White (`.themeHCW`), High Contrast Black (`.themeHCB`)

**Theme-aware styling:**

- Use CSS custom properties (tokens) that adapt to theme changes
- Test components in all four themes during development
- Never use hardcoded colors - they won't adapt to themes
- Use semantic color tokens (`--color-primary`, `--color-text`) not raw values

**Example theme-safe component:**

```css
.card {
  background-color: var(--main-body-background-color); /* Adapts to theme */
  color: var(--color-text); /* Adapts to theme */
  border: 1px solid var(--color-border); /* Adapts to theme */
}

/* Theme-specific overrides only when absolutely necessary */
.themeDark .card {
  box-shadow: 0 4px 8px rgb(0 0 0 / 40%);
}
```

**Verify theme compatibility:**

1. Check component renders correctly in all 4 themes
2. Ensure text has sufficient contrast in HCW and HCB modes
3. Interactive states (hover, focus) work across all themes
4. Icons and graphics maintain visibility in dark/HC modes

### Rule 2.5 - Accessibility in CSS

**Required accessibility considerations:**

- Maintain 4.5:1 contrast ratio minimum (7:1 for High Contrast themes)
- Support `prefers-reduced-motion`
- Focus-visible states for all interactive elements
- Don't rely on color alone for information
- Use outline, not just background color, for focus indicators

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.interactive:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## SECTION 3: Component API Design & Props

### Rule 3.1 - Props Interface Design

**Follow established patterns from existing components:**

**MANDATORY structure:**

```typescript
export interface ComponentNameProps {
  /** Primary content or children */
  children?: React.ReactNode;

  /** Visual variant */
  variant?: "primary" | "secondary" | "tertiary";

  /** Size variants */
  size?: "s" | "m" | "l" | "xl";

  /** State props */
  disabled?: boolean;
  loading?: boolean;

  /** Event handlers */
  onClick?: (e: React.MouseEvent) => void;
  onChange?: (value: T) => void;

  /** Styling extension */
  className?: string;

  /** Accessibility */
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
}
```

**Guidelines:**

- Document every prop with JSDoc comments
- Use union types for variants, never free-form strings
- Boolean props default to false (don't require explicit false)
- Event handlers use React.SyntheticEvent types
- Size variants: lowercase letters (s/m/l/xl)
- Text size variants: uppercase (S/M/L/XL) for typography components

### Rule 3.2 - Composition Over Configuration

**Prefer composable patterns inspired by your existing components:**

```tsx
/* ❌ BAD (monolithic) */
<Card
  title="Title"
  subtitle="Subtitle"
  headerExtra={<Button />}
  body="Content"
  footer={<Actions />}
/>

/* ✅ GOOD (composable) */
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
    <Card.Extra><Button /></Card.Extra>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer><Actions /></Card.Footer>
</Card>
```

**When configuration is simpler (like your current Card), provide both:**

- Simple props API for common cases
- children for full flexibility

### Rule 3.3 - Prop Validation & Defaults

**Use TypeScript for compile-time validation:**

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "s" | "m" | "l";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary", // Sensible defaults
  size = "m",
  disabled = false,
  ...rest
}) => {
  // Component logic
};
```

**Never use PropTypes - TypeScript is the single source of truth.**

### Rule 3.4 - Advanced Props Patterns

**Support polymorphic components when needed:**

```typescript
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {},
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;
```

**Example from your Title component:**

```typescript
export interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "S" | "M" | "L" | "XL";
  terminals?: "sans" | "serif";
  as?: keyof React.JSX.IntrinsicElements;
}
```

This allows: `<Title as="h1">`, `<Title as="span">`, etc.

### Rule 3.5 - Ref Forwarding

**Always forward refs for interactive components:**

```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button"; // Required for debugging
```

---

## SECTION 4: Internationalization (i18n)

### Rule 4.1 - Translation Requirements

**EVERY user-facing text MUST be internationalized:**

**Supported languages:** English (default), Finnish, Swedish  
**Location:** `nextjs-app/shared/locales/{en,fi,sv}/translation.json`

**MANDATORY for all components:**

```typescript
import { useTranslate } from "../../lib/translation";

const Component = () => {
  const t = useTranslate();

  return <button>{t("componentName.action", "Action")}</button>;
};
```

```tsx
/* ❌ NEVER hardcode user-facing text */
<button>Click me</button>
<p>Welcome to our site</p>

/* ✅ ALWAYS use translation keys */
<button>{t("button.clickMe")}</button>
<p>{t("welcome.message")}</p>
```

### Rule 4.2 - Translation Key Naming

**Use nested object notation with clear hierarchy:**

**Format:** `componentName.element.variant`

**Examples:**

- `"button.submit"`
- `"form.validation.required"`
- `"navigation.home"`
- `"card.loading"`
- `"modal.close"`

**Structure in translation.json:**

```json
{
  "componentName": {
    "title": "Title text",
    "action": "Action text",
    "validation": {
      "required": "This field is required",
      "invalid": "Invalid input"
    }
  }
}
```

### Rule 4.3 - Translation Coverage

**MANDATORY checklist for every component:**

1. All user-visible text uses `t()` function
2. All three language files updated (en, fi, sv)
3. ARIA labels and descriptions translated
4. Alt text for images translated
5. Placeholder text translated
6. Error messages translated
7. Loading states translated

**Test coverage ensures 100% translation:**

- Tests verify translation keys exist
- Tests check all three locales

### Rule 4.4 - Dynamic Translation Values

**Use interpolation for dynamic content:**

```json
{
  "greeting": "Hello, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

```typescript
const name = "User";
const count = 5;

<p>{t("greeting", { name })}</p>
<p>{t("itemCount", { count })}</p>
```

**For pluralization:**

```json
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

```typescript
<p>{t("items", { count })}</p>
```

### Rule 4.5 - Translation in Storybook

**All Storybook stories MUST demonstrate translations:**

```typescript
import { useTranslate } from "../../lib/translation";

export const Default = () => {
  const t = useTranslate();
  return <Component title={t("component.title")} />;
};
```

- Add controls for language switching in stories when relevant
- Document translation keys in story descriptions

---

## SECTION 5: React Best Practices & Performance

### Rule 5.1 - Avoid Unnecessary State (Critical)

```typescript
/* ❌ DON'T create state for derived/computed values */
const [total, setTotal] = useState(0);
const [items, setItems] = useState([]);

useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);

/* ✅ DO compute directly */
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0);
```

```typescript
/* ❌ DON'T use useEffect for synchronous computations */
const [displayName, setDisplayName] = useState("");
useEffect(() => {
  setDisplayName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

/* ✅ DO compute during render */
const displayName = `${firstName} ${lastName}`;
```

### Rule 5.2 - Minimal useEffect Usage

**Only use useEffect for:**

1. Fetching data (or better: use server components/actions)
2. Setting up subscriptions
3. Manual DOM manipulation (rare)
4. Timers/intervals
5. Browser API side effects

**DON'T use useEffect for:**

- Derived state (compute during render)
- Event handlers (use onClick, onChange, etc.)
- Initializing state (use useState initial value)
- Transforming props (do it during render)

**Example of proper useEffect:**

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setTime(new Date());
  }, 1000);

  return () => clearInterval(timer); // Cleanup
}, []);
```

### Rule 5.3 - Memoization Strategy

**Use useMemo and useCallback judiciously:**

**✅ Good candidates for useMemo:**

- Expensive computations (filtering large arrays, complex calculations)
- Object/array literals passed as props to memoized children
- Values used in dependency arrays

```typescript
const expensiveValue = useMemo(() => {
  return items.filter(/* complex logic */).map(/* transformation */);
}, [items]);
```

**✅ Good candidates for useCallback:**

- Functions passed to memoized children
- Functions in dependency arrays
- Event handlers passed through multiple layers

```typescript
const handleSubmit = useCallback(
  (data) => {
    // Submit logic
  },
  [dependencies],
);
```

**❌ DON'T memoize prematurely:**

- Simple computations (basic math, string concatenation)
- Component local functions not passed as props
- Primitive values

### Rule 5.4 - Custom Hooks for Logic Encapsulation

**Extract complex state + logic into custom hooks:**

```typescript
/* ❌ BAD (cluttered component) */
const Component = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(validateEmail(value));
  }, [value]);

  const handleChange = (e) => {
    setValue(e.target.value);
    setError("");
  };
  // ... more logic
};

/* ✅ GOOD (clean component with custom hook) */
const useFormInput = (validator) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const isValid = validator(value);

  const handleChange = (e) => {
    setValue(e.target.value);
    setError("");
  };

  return { value, error, isValid, handleChange, setValue, setError };
};

const Component = () => {
  const email = useFormInput(validateEmail);
  return <input {...email} />;
};
```

### Rule 5.5 - Component Patterns

**Prefer functional patterns from the references:**

1. Server Components when possible (Next.js)
2. Client components only when needed (interactivity, hooks)
3. Suspense for async boundaries
4. Error boundaries for graceful failures

**Next.js App Router: Client vs Server Components**

**Use Server Components (default - NO `"use client"`):**

- Static content rendering
- Data fetching with async/await
- Accessing backend resources directly
- SEO-critical content
- Reducing client-side JavaScript

**Use Client Components (add `"use client"` directive):**

- React hooks (useState, useEffect, useContext, etc.)
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (window, document, localStorage)
- Third-party libraries requiring browser context
- Interactive UI (forms, modals, dropdowns)
- Real-time features (WebSockets, timers)

**Client Component Example:**

```typescript
"use client";

import React, { useState } from "react";
import { useTranslate } from "../../lib/translation";
import styles from "./Component.module.css";

interface ComponentProps {
  initialValue?: string;
}

const Component: React.FC<ComponentProps> = ({ initialValue = "" }) => {
  const t = useTranslate();
  const [value, setValue] = useState(initialValue);

  return (
    <div className={styles.component}>
      <button onClick={() => setValue("clicked")}>
        {t("component.action", "Action")}
      </button>
    </div>
  );
};

Component.displayName = "Component";
export default Component;
```

**Server Component Example (for page routes):**

```typescript
import type { Metadata } from "next";
import { ComponentFromShared } from "../../shared/components/Component/Component";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description for SEO",
};

export default function Page() {
  return <ComponentFromShared />;
}
```

**Shared Components Strategy:**

- Components in `shared/` should be platform-agnostic
- Add `"use client"` if component uses hooks/events (required for Next.js)
- Ensure compatibility with both Vite (react-router) and Next.js patterns

**Component composition:**

```typescript
const Component: React.FC<Props> = ({ children, ...props }) => {
  // Keep render logic simple
  // Extract complex logic to hooks
  // Use early returns for conditional rendering

  if (loading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!data) return null;

  return (
    <div className={styles.component}>
      {children}
    </div>
  );
};

Component.displayName = "Component";
```

---

## SECTION 6: Accessibility (a11y) Requirements

### Rule 6.1 - Semantic HTML First

**ALWAYS use semantic HTML elements to ensure proper document structure, accessibility, and SEO:**

```tsx
/* ❌ BAD */
<div onClick={handleClick}>Click me</div>
<div className={styles.heading}>Title</div>
<div role="list">
  <div role="listitem">Item</div>
</div>

/* ✅ GOOD */
<button onClick={handleClick}>Click me</button>
<h2 className={styles.heading}>Title</h2>
<ul>
  <li>Item</li>
</ul>
```

**Semantic elements to prefer:**

- `<button>` over `<div onClick>` - for interactive actions
- `<nav>` for navigation landmarks
- `<main>` for primary page content (one per page)
- `<article>` for independent, self-contained content
- `<section>` for thematic grouping of related content
- `<header>`, `<footer>` for structural headers/footers
- `<h1>`-`<h6>` for headings (maintain hierarchy, only one `<h1>` per page)
- `<aside>` for tangentially related content (sidebars, callouts)
- `<figure>` and `<figcaption>` for images with captions
- `<time>` for dates and times with `datetime` attribute
- `<address>` for contact information

**Five Real-World Examples:**

**Example 1: Hero Section**

```tsx
/* ❌ BAD - Generic divs everywhere */
<div className={styles.hero}>
  <div className={styles.heroContent}>
    <div className={styles.title}>Welcome</div>
    <div className={styles.description}>Learn more about us</div>
    <div className={styles.cta} onClick={handleClick}>Get Started</div>
  </div>
</div>

/* ✅ GOOD - Semantic structure */
<section className={styles.hero} aria-labelledby="hero-title">
  <header className={styles.heroContent}>
    <h1 id="hero-title" className={styles.title}>Welcome</h1>
    <p className={styles.description}>Learn more about us</p>
    <Button variant="primary" onClick={handleClick}>Get Started</Button>
  </header>
</section>
```

**Example 2: Blog Post Card**

```tsx
/* ❌ BAD - Flat div structure */
<div className={styles.card}>
  <div className={styles.image}>
    <img src={post.image} alt={post.title} />
  </div>
  <div className={styles.title}>{post.title}</div>
  <div className={styles.date}>{post.publishedAt}</div>
  <div className={styles.excerpt}>{post.excerpt}</div>
  <div className={styles.link} onClick={handleRead}>Read More</div>
</div>

/* ✅ GOOD - Article with proper semantics */
<article className={styles.card}>
  <figure className={styles.imageWrapper}>
    <Image src={post.image} alt={post.title} width={400} height={300} />
  </figure>
  <header>
    <h2 className={styles.title}>{post.title}</h2>
    <time dateTime={post.publishedAt} className={styles.date}>
      {formatDate(post.publishedAt)}
    </time>
  </header>
  <p className={styles.excerpt}>{post.excerpt}</p>
  <footer>
    <Button variant="tertiary" href={`/blog/${post.slug}`}>
      Read More
    </Button>
  </footer>
</article>
```

**Example 3: Navigation Menu**

```tsx
/* ❌ BAD - Div-based navigation */
<div className={styles.menu}>
  <div className={styles.menuItem} onClick={goHome}>Home</div>
  <div className={styles.menuItem} onClick={goAbout}>About</div>
  <div className={styles.menuItem} onClick={goContact}>Contact</div>
</div>

/* ✅ GOOD - Semantic nav with list structure */
<nav aria-label="Main navigation">
  <ul className={styles.menu}>
    <li>
      <a href="/" className={styles.menuItem} aria-current={isHome ? "page" : undefined}>
        Home
      </a>
    </li>
    <li>
      <a href="/about" className={styles.menuItem} aria-current={isAbout ? "page" : undefined}>
        About
      </a>
    </li>
    <li>
      <a href="/contact" className={styles.menuItem} aria-current={isContact ? "page" : undefined}>
        Contact
      </a>
    </li>
  </ul>
</nav>
```

**Example 4: Form with Validation**

```tsx
/* ❌ BAD - Non-semantic form structure */
<div className={styles.form}>
  <div className={styles.field}>
    <div className={styles.label}>Email</div>
    <div className={styles.input} contentEditable />
    <div className={styles.error}>{error}</div>
  </div>
  <div className={styles.submit} onClick={handleSubmit}>Submit</div>
</div>

/* ✅ GOOD - Semantic form elements */
<form className={styles.form} onSubmit={handleSubmit}>
  <fieldset className={styles.field}>
    <label htmlFor="email-input" className={styles.label}>
      Email
    </label>
    <input
      id="email-input"
      type="email"
      className={styles.input}
      aria-invalid={!!error}
      aria-describedby={error ? "email-error" : undefined}
      required
    />
    {error && (
      <p id="email-error" className={styles.error} role="alert">
        {error}
      </p>
    )}
  </fieldset>
  <Button type="submit" variant="primary">Submit</Button>
</form>
```

**Example 5: Sidebar with Related Content**

```tsx
/* ❌ BAD - Generic container */
<div className={styles.sidebar}>
  <div className={styles.title}>Related Articles</div>
  <div className={styles.list}>
    <div className={styles.item}>Article 1</div>
    <div className={styles.item}>Article 2</div>
  </div>
</div>

/* ✅ GOOD - Semantic aside with proper structure */
<aside className={styles.sidebar} aria-labelledby="related-title">
  <h2 id="related-title" className={styles.title}>Related Articles</h2>
  <nav aria-label="Related articles">
    <ul className={styles.list}>
      <li>
        <a href="/article-1" className={styles.item}>
          Understanding React Hooks
        </a>
      </li>
      <li>
        <a href="/article-2" className={styles.item}>
          TypeScript Best Practices
        </a>
      </li>
    </ul>
  </nav>
</aside>
```

**Benefits of Semantic HTML:**

1. **Accessibility** - Screen readers understand document structure and landmarks
2. **SEO** - Search engines better understand content hierarchy and relationships
3. **Maintainability** - Code intent is clear without reading implementation
4. **Browser Features** - Native keyboard navigation, form validation, etc.
5. **Performance** - Less CSS needed for styling when using appropriate elements

### Rule 6.2 - ARIA Attributes (When Needed)

**ARIA rules hierarchy:**

1. Use semantic HTML first
2. Add ARIA only when semantic HTML insufficient
3. Never override native semantics with ARIA

**Essential ARIA patterns:**

```tsx
// Current state indication
<Link aria-current="page">Home</Link>

// Expandable sections
<button
  aria-expanded={isOpen}
  aria-controls="content-id"
>
  Toggle
</button>
<div id="content-id" hidden={!isOpen}>Content</div>

// Loading/busy states
<div role="status" aria-busy={loading} aria-live="polite">
  {loading ? t("common.loading") : content}
</div>

// Labels for inputs
<label htmlFor="email-input">{t("form.email")}</label>
<input id="email-input" aria-describedby="email-help" />
<p id="email-help">{t("form.emailHelp")}</p>

// Required fields
<input aria-required="true" required />

// Error states
<input
  aria-invalid={hasError}
  aria-errormessage={hasError ? "error-id" : undefined}
/>
{hasError && <p id="error-id" role="alert">{error}</p>}
```

### Rule 6.3 - Keyboard Navigation

**MANDATORY keyboard support for all interactive elements:**

**1. Tab navigation:**

- All interactive elements must be focusable
- Logical tab order (matches visual order)
- Skip links for long navigation

**2. Focus indicators:**

- Visible focus states (outline, border, shadow)
- Never use `outline: none` without alternative
- Use `:focus-visible` for mouse vs keyboard distinction

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**3. Keyboard shortcuts:**

- Escape closes modals/dropdowns
- Arrow keys for lists/menus
- Space/Enter activates buttons
- Home/End for lists

**4. Focus management:**

- Trap focus in modals
- Return focus after modal closes
- Move focus to new content when appropriate

```typescript
const modal = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    modal.current?.focus();
  }
}, [isOpen]);
```

### Rule 6.4 - Color & Contrast

**MANDATORY contrast requirements:**

**1. Text contrast:**

- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- High contrast themes: 7:1 minimum

**2. Don't rely on color alone:**

- Use icons + color for status
- Use patterns + color for charts
- Provide text labels alongside color indicators

```tsx
/* ✅ GOOD */
<Badge variant="success">
  <Icon name="check" />
  {t("status.complete")}
</Badge>

/* ❌ BAD */
<span style={{ color: 'green' }}>●</span> Complete
```

**3. Test in all themes:**

- Light mode
- Dark mode (`.themeDark`)
- High Contrast White (`.themeHCW`)
- High Contrast Black (`.themeHCB`)

### Rule 6.5 - Screen Reader Support

**Essential patterns for screen readers:**

```tsx
// 1. Descriptive labels
<button aria-label={t("modal.close")}>
  <Icon name="x" aria-hidden="true" />
</button>

// 2. Hide decorative elements
<Icon name="decorative" aria-hidden="true" />
<div className={styles.separator} role="presentation" />

// 3. Live regions for dynamic content
<div role="status" aria-live="polite">
  {t("notification.saved")}
</div>

<div role="alert" aria-live="assertive">
  {t("error.critical")}
</div>

// 4. Skip links
<a href="#main-content" className={styles.skipLink}>
  {t("navigation.skipToContent")}
</a>

// 5. Image alt text
<img src={src} alt={t("image.altText")} />
// For decorative images:
<img src={src} alt="" role="presentation" />
```

### Rule 6.6 - Testing Requirements

**MANDATORY accessibility testing:**

**1. Automated tests:**

```typescript
import { axe } from "jest-axe";

test("has no accessibility violations", async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**2. Manual testing checklist:**

- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus visible on all interactive elements
- [ ] Works in all 4 themes
- [ ] Color contrast sufficient
- [ ] ARIA attributes correct

**3. Run before committing:**

```bash
npm run test:a11y
```

---

## SECTION 7: Testing & Quality Assurance

### Rule 7.1 - Test File Structure

**EVERY component MUST have ComponentName.test.tsx with:**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, test, expect, vi } from "vitest";
import Component from "./Component";

expect.extend(toHaveNoViolations);

describe("Component", () => {
  describe("Rendering", () => {
    // Basic render tests
  });

  describe("Interactions", () => {
    // User interaction tests
  });

  describe("Accessibility", () => {
    // a11y tests
  });

  describe("Props", () => {
    // Props validation tests
  });
});
```

### Rule 7.2 - Essential Test Coverage

**MANDATORY tests for every component:**

```typescript
// 1. Basic rendering
test("renders without crashing", () => {
  render(<Component />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});

// 2. Props handling
test("applies custom className", () => {
  render(<Component className="custom" />);
  expect(screen.getByRole("button")).toHaveClass("custom");
});

// 3. User interactions
test("calls onClick when clicked", async () => {
  const handleClick = vi.fn();
  render(<Component onClick={handleClick} />);
  await userEvent.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

// 4. Accessibility
test("has no accessibility violations", async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// 5. Conditional rendering
test("renders loading state", () => {
  render(<Component loading />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

// 6. Translation coverage
test("uses translation keys", () => {
  render(<Component />);
  expect(screen.getByText(/componentName\./)).toBeInTheDocument();
});
```

### Rule 7.3 - Testing Best Practices

**Follow Testing Library principles:**

**✅ Query priority (in order):**

1. `getByRole` (preferred - accessible)
2. `getByLabelText` (for forms)
3. `getByPlaceholderText` (forms)
4. `getByText` (content)
5. `getByDisplayValue` (form values)
6. `getByAltText` (images)
7. `getByTitle` (last resort)
8. `getByTestId` (avoid - implementation detail)

**❌ AVOID:**

- Querying by className or element type
- Testing implementation details
- Snapshot tests (too brittle)

**✅ DO:**

```typescript
// Query by role (semantic + accessible)
screen.getByRole("button", { name: /submit/i });
screen.getByRole("heading", { level: 2 });

// User interactions via userEvent
await userEvent.click(element);
await userEvent.type(input, "text");
await userEvent.clear(input);

// Async handling
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

### Rule 7.4 - Mock Patterns

**Consistent mocking for common scenarios:**

```typescript
// 1. Translation mocks
vi.mock("@/nextjs-app/shared/lib/translation", () => ({
  useTranslate: () => (key: string, fallback?: string) => fallback ?? key,
  useLocalization: () => ({
    translate: (key: string, fallback?: string) => fallback ?? key,
    language: "en",
    resolvedLanguage: "en",
    changeLanguage: vi.fn(),
    getResourceBundle: vi.fn(),
  }),
}));

// 2. Next navigation mocks
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// 3. API mocks
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: "mock" }),
  }),
);

// 4. IntersectionObserver (for lazy loading)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### Rule 7.5 - Vitest Coverage Requirements

**MINIMUM test coverage tracked by Vitest:**

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Critical paths require 100% coverage:**

- User interactions (clicks, form submissions)
- Error handling
- Accessibility features
- State management logic

**Run tests with coverage:**

```bash
npm test -- --coverage
npm run test:coverage
```

**Coverage exceptions:**

- Type-only files
- Storybook stories
- Configuration files

**Vitest configuration (vitest.config.mts):**

- Coverage provider: v8
- Reporters: html, text, json-summary
- Coverage directory: `coverage/`
- Exclude: stories, tests, config files

---

## SECTION 8: Code Quality & Linting

### Rule 8.1 - ESLint Configuration

**ALL code MUST pass ESLint checks before commit.**

**Enforced rules:**

- TypeScript strict mode (`@typescript-eslint/recommended`)
- React hooks rules (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- Import order and organization
- No unused variables or imports
- Consistent code formatting

**Run linting:**

```bash
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
npm run eslint-fix     # Explicit auto-fix
```

**❌ NEVER disable ESLint rules without justification:**

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

**✅ If you must disable, provide reason:**

```typescript
// TypeScript can't infer this specific generic type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const result: any = complexGenericFunction();
```

**Most common fixable violations:**

- Unused imports (auto-removed)
- Import order (auto-sorted)
- Missing semicolons (auto-added)
- Spacing issues (auto-fixed)

### Rule 8.2 - Stylelint Configuration

**ALL CSS MUST pass Stylelint checks before commit.**

**Enforced rules:**

- Property order (logical grouping)
- No duplicate properties
- Valid color formats
- Logical properties over physical
- No vendor prefixes (autoprefixer handles this)
- Consistent spacing and formatting

**Run style linting:**

```bash
npm run lint:css       # Check CSS issues
npm run lint:css:fix   # Auto-fix CSS issues
```

**Property order enforced:**

1. Position (`position`, `top`, `right`, `bottom`, `left`, `z-index`)
2. Display & Box Model (`display`, `flex`, `grid`, `width`, `height`, `padding`, `margin`)
3. Typography (`font-family`, `font-size`, `line-height`, `color`, `text-align`)
4. Visual (`background`, `border`, `border-radius`, `box-shadow`)
5. Animation (`transition`, `animation`)
6. Misc (`cursor`, `pointer-events`, `user-select`)

```css
/* ❌ BAD order */
.button {
  color: blue;
  display: flex;
  padding: 1rem;
  position: relative;
}

/* ✅ GOOD order */
.button {
  position: relative;
  display: flex;
  padding: 1rem;
  color: blue;
}
```

### Rule 8.3 - TypeScript Compiler Checks

**ALL code MUST pass TypeScript compilation.**

**Strict mode enabled in tsconfig.json:**

- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `strictPropertyInitialization: true`
- `noImplicitThis: true`
- `alwaysStrict: true`

**Run type checking:**

```bash
npm run type-check
tsc --noEmit
```

**Common TypeScript errors to fix:**

1. Implicit any types → Add explicit types
2. Null/undefined access → Add null checks
3. Missing properties → Complete interface definitions
4. Type mismatches → Fix or use proper type assertions

### Rule 8.4 - Pre-commit Quality Gates

**BEFORE committing code, run:**

1. `npm run lint` - ESLint check
2. `npm run lint:css` - Stylelint check
3. `npm test` - Vitest tests
4. `npm run type-check` - TypeScript check
5. `npm run test:a11y` - Accessibility tests

**Automatic checks via Git hooks (if configured):**

- Pre-commit: lint-staged (lint + format changed files)
- Pre-push: run full test suite

**NEVER commit code that fails any of these checks.**  
**NEVER use `--no-verify` to bypass hooks.**

### Rule 8.5 - Code Formatting (Prettier)

**Prettier handles automatic formatting:**

- Line width: 80 characters (configurable)
- Single quotes for strings
- Trailing commas in multi-line
- Semicolons always
- 2-space indentation

**Run formatting:**

```bash
npm run format           # Format all files
npm run format:check     # Check formatting without fixing
```

**Prettier is integrated with ESLint via `eslint-plugin-prettier`.**  
**Formatting happens automatically on save (if editor configured).**

**DO NOT manually format - let Prettier handle it.**

---

## SECTION 9: Storybook & Documentation

### Rule 9.1 - Storybook File Structure

**EVERY component MUST have ComponentName.stories.tsx:**

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import Component from "./Component";

const meta: Meta<typeof Component> = {
  title: "Components/ComponentName",
  component: Component,
  parameters: {
    layout: "centered", // or "fullscreen" or "padded"
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
    },
    size: {
      control: "radio",
      options: ["s", "m", "l"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    children: "Button Text",
    variant: "primary",
    size: "m",
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};
```


### Rule 9.1b - argTypes required at beta promotion

When `contract.status` is **beta** or **stable**, `meta.argTypes` is mandatory and machine-checked:

1. **Coverage** — variant axes from the contract and public props from `<Name>Props` (minus standard skips and `argTypesProxyExempt`).
2. **Documentation** — every control entry needs a `description` string for the Storybook Controls panel.
3. **Defaults** — each contract variant axis needs `table.defaultValue.summary` so consumers see the default at a glance.

Use `{ table: { disable: true } }` only for slots, `className`, or props that must not be edited via Controls. Prefer real controls with descriptions over proxy-exempt lists.

```typescript
variant: {
  control: { type: "select" },
  options: ["primary", "secondary"],
  description: "Visual style variant",
  table: {
    type: { summary: "ButtonVariant" },
    defaultValue: { summary: "primary" },
  },
},
```

### Rule 9.2 - WIP Badge System

**ALL Storybook stories display a persistent WIP badge by default.**  
**Remove ONLY after passing all checks:**

```typescript
// Default behavior (WIP badge shows)
export const MyStory: Story = {
  args: { ... },
};

// Opt-out when component is production-ready
export const MyStory: Story = {
  args: { ... },
  parameters: {
    wip: { disabled: true },
  },
};
```

**Checklist before disabling WIP badge:**

- [ ] All accessibility tests pass (`npm run test:a11y`)
- [ ] Visual regression tests pass (`npm run test:visual`)
- [ ] Translation coverage 100% (all 3 languages)
- [ ] Component tests pass with >80% coverage
- [ ] Manual testing in all 4 themes
- [ ] Keyboard navigation works
- [ ] ESLint + Stylelint pass

### Rule 9.3 - Story Organization

**Create stories for all states and variants:**

```typescript
// 1. Default/Primary state
export const Default: Story = {
  args: { ... },
};

// 2. All variants
export const Secondary: Story = {
  args: { ...Default.args, variant: "secondary" },
};

export const Tertiary: Story = {
  args: { ...Default.args, variant: "tertiary" },
};

// 3. All sizes
export const Small: Story = {
  args: { ...Default.args, size: "s" },
};

export const Large: Story = {
  args: { ...Default.args, size: "l" },
};

// 4. State variations
export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const WithError: Story = {
  args: { ...Default.args, error: "Error message" },
};

// 5. Interactive examples (Kitchen Sink)
export const KitchenSink: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Component variant="primary">Primary</Component>
      <Component variant="secondary">Secondary</Component>
      <Component size="s">Small</Component>
      <Component size="l">Large</Component>
      <Component disabled>Disabled</Component>
    </div>
  ),
};
```

### Rule 9.4 - Visual Regression Testing

**Storybook integrates with visual regression testing:**

**Run visual tests:**

```bash
npm run test:visual                          # Run visual regression tests
npm run test:visual -- --updateSnapshot      # Update baselines
```

**When visual changes are intentional:**

1. Review diffs in `__visual__/diffs/__diff_output__/`
2. Verify changes are correct
3. Update snapshots if approved
4. Commit new baselines

**Visual regression report:**

- Generated at `public/visual-diff/report.json`
- Consumed by Storybook "Overview / Test Health Overview" story
- Shows diff thumbnails when changes detected
- Placeholder message when no diffs

**ALWAYS refresh visual baselines after:**

- Intentional UI changes
- CSS modifications affecting layout
- Theme updates
- Design token changes

### Rule 9.5 - Documentation Best Practices

**Use JSDoc comments for component documentation:**

````typescript
/**
 * Button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="m" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @remarks
 * - Supports all standard button HTML attributes
 * - Automatically forwards refs
 * - Includes loading and disabled states
 */
export interface ButtonProps {
  /** Visual style variant */
  variant?: "primary" | "secondary" | "tertiary";

  /** Button size */
  size?: "s" | "m" | "l";

  /** Disabled state prevents interaction */
  disabled?: boolean;

  /** Shows loading spinner and disables interaction */
  loading?: boolean;
}
````

**Storybook autodocs will generate documentation from:**

1. JSDoc comments on component and props
2. TypeScript types and interfaces
3. Default values in component
4. ArgTypes in meta configuration

### Rule 9.6 - Storybook Commands

**Essential Storybook commands:**

```bash
npm run storybook          # Start Storybook dev server
npm run build-storybook    # Build static Storybook
npm run test:visual        # Run visual regression tests
```

**Storybook runs on http://localhost:6006**

**Deployment:**

- Storybook builds to `storybook-static/`
- Deployed alongside main site
- Visual diff report accessible in stories

---

## SECTION 10: Final Checklist & Component Generation Template

### ⚠️ CRITICAL: MANDATORY TESTING REQUIREMENT

**BEFORE declaring any component work complete, you MUST:**

1. **Verify File Location:**
   - Confirm whether component is in `src/components/` or `shared/components/`
   - Check which location Storybook actually imports from
   - NEVER assume file locations - always verify with `file_search` or `list_dir`

2. **Test in Storybook:**
   - Open Storybook in browser: `http://localhost:6006`
   - Navigate to the component's stories
   - Verify ALL stories render without errors
   - Check browser console for import errors, runtime errors, or warnings
   - Test interactive stories (play functions) work correctly

3. **Run Component Tests:**
   - Execute unit tests: `npm test -- ComponentName` from the repo root
   - Verify all tests pass (100% pass rate required)
   - Check test coverage meets >80% threshold
   - Run accessibility tests if applicable

4. **Check for Errors:**
   - Run `get_errors` tool on component directory
   - Fix any TypeScript, ESLint, or Stylelint errors
   - Address any legitimate warnings (document suppression reasons)

**❌ UNACCEPTABLE WORKFLOW:**

- Editing files without verifying which location is active
- Declaring completion without testing in Storybook
- Ignoring import errors or runtime failures
- Breaking existing functionality

**✅ ACCEPTABLE WORKFLOW:**

1. Identify correct file location
2. Make changes carefully
3. Test immediately in Storybook
4. Run unit tests
5. Fix any errors before moving on
6. Only then declare completion

---

### Rule 10.1 - Component Generation Checklist

**When in doubt:** Refer to 'https://ant.design/components/', 'https://tailwindcss.com/plus/ui-blocks' and 'https://carbondesignsystem.com/components' for best practises, guidance and inspiration.

**When generating a new component, ALWAYS create:**

**✅ ComponentName/ComponentName.tsx**

- TypeScript with strict typing
- Functional component or forwardRef
- Exported interface ComponentNameProps
- Translation support (`useTranslate` / `useLocalization`)
- Proper imports (@dt/ aliases)

**✅ ComponentName/ComponentName.module.css**

- CSS Modules only
- Logical properties (margin-inline, padding-inline)
- Design tokens (no hardcoded values)
- Theme-aware styling
- Responsive with mobile-first
- Accessibility (focus states, contrast)

**✅ ComponentName/ComponentName.stories.tsx**

- Meta configuration
- Default story
- All variants and states
- Kitchen Sink story
- WIP badge (enabled by default)

**✅ ComponentName/ComponentName.test.tsx**

- Vitest + Testing Library
- Rendering tests
- Interaction tests
- Accessibility tests (axe)
- Props validation tests
- > 80% coverage

**✅ ComponentName/index.ts**

- Re-export: `export { default } from './ComponentName';`

**✅ Translation files (all 3 languages)**

- `src/locales/en/translation.json`
- `src/locales/fi/translation.json`
- `src/locales/sv/translation.json`
- Add `componentName.*` keys

### Rule 10.2 - Pre-Commit Validation

**BEFORE committing, verify:**

1. `npm run lint` ✅
2. `npm run lint:css` ✅
3. `npm test` ✅
4. `npm run type-check` ✅
5. `npm run test:a11y` ✅
6. Manual testing in all 4 themes ✅
7. Keyboard navigation works ✅
8. Translation coverage 100% ✅

**Development Servers:**

- **Next.js:** `npm run dev` from repo root (port 3001)
- **Storybook:** `npm run storybook` (port 6010)

**ONLY commit when all checks pass.**

### Rule 10.3 - Example Generation Prompt

**When user requests a component, use this template:**

```
Create a [ComponentName] component with the following:

Requirements:
- [List specific requirements from user]
- Support variants: [primary, secondary, etc.]
- Support sizes: [s, m, l, xl]
- Include [specific features]

Must include:
1. ComponentName.tsx (TypeScript, strict mode, `useTranslate`)
2. ComponentName.module.css (CSS Modules, logical properties, design tokens)
3. ComponentName.stories.tsx (all variants, WIP badge enabled)
4. ComponentName.test.tsx (Vitest, >80% coverage, a11y tests)
5. index.ts (re-export)
6. Translation keys in all 3 languages (en, fi, sv)

Follow all project conventions:
- @dt/ import aliases
- Design tokens from variables.css
- Theme support (Light, Dark, HCW, HCB)
- Accessibility (ARIA, keyboard navigation, focus states)
- Logical CSS properties only
- No hardcoded colors/spacing
```

---

## Summary

These rules ensure every generated component:

1. **Follows project architecture** - Consistent structure, TypeScript, design tokens
2. **Maintains visual consistency** - CSS Modules, logical properties, theme support
3. **Provides great UX** - Proper API design, composition patterns, performance optimization
4. **Works globally** - i18n support in 3 languages
5. **Performs well** - Minimal re-renders, proper memoization, efficient hooks
6. **Is accessible** - Semantic HTML, ARIA, keyboard navigation, screen reader support
7. **Is well-tested** - Vitest tests, accessibility tests, visual regression tests
8. **Passes quality gates** - ESLint, Stylelint, TypeScript, Prettier
9. **Is documented** - Storybook stories, JSDoc comments, visual examples
10. **Is production-ready** - All checks pass before WIP badge removal

---

## ARCHIVED: Vite-Specific Guidance (Pre-November 2025)

> **⚠️ DEPRECATED:** This section documents legacy Vite-specific patterns maintained for Storybook and testing infrastructure. New development should follow Next.js patterns above.

### Vite Configuration & Build

**Vite config location:** `vite.config.ts` (root)

**Key Vite features still in use:**

- React Fast Refresh for Storybook
- MDX support for blog posts
- Static file copying (404.html, robots.txt, etc.)
- Sentry Vite plugin for error tracking
- CSS Modules support

**Vite-specific imports:**

```typescript
// Vite handles these automatically
import Component from "@dt/Component"; // Alias defined in vite.config.ts
import styles from "./Component.module.css";
import icon from "./icon.svg?url"; // Vite asset handling
```

**Deployment (Legacy):**

- `npm run build` - Vite production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run cache-bust` - Manual cache invalidation

**Route handling (Legacy):**

- React Router v6 (`src/App.tsx`)
- Lazy-loaded route components
- `ChunkErrorBoundary` for code-splitting errors

### When to Use Vite vs Next.js

**Use Vite for:**

- Storybook development (runs on Vite)
- Component testing (Vitest)
- Maintaining legacy `src/` codebase

**Use Next.js for:**

- All new pages and routes
- Production deployment
- SEO-critical content
- Server-side rendering needs

---

**Last Updated:** November 23, 2025  
**Maintained by:** Petri Lahdelma  
**Project:** Digitaltableteur

For questions or updates to these rules, please update this document and sync with:

- `.github/copilot-instructions.md`
- `CLAUDE.md`
- `README.md`
