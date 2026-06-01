---
name: frontend-development
description: Expert guidance for React 19+, Next.js 16, TypeScript, CSS Modules, and modern frontend architecture. Use when building components, implementing features, optimizing performance, or working with React hooks, state management, routing, or frontend tooling. Includes accessibility (a11y), internationalization (i18n), and design system integration.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash(npm:*), Bash(npx:*)
---

# Frontend Development Expert

## Core Principles

When building frontend features, always follow these principles:

1. **Component-First Architecture**: Break UI into small, reusable, testable components
2. **Type Safety**: Use TypeScript strict mode with proper interfaces and no `any`
3. **Accessibility by Default**: WCAG 2.1 AA compliance minimum
4. **Performance Optimization**: Code splitting, lazy loading, memoization
5. **Progressive Enhancement**: Works without JS, enhanced with JS

---

## Technology Stack (Digitaltableteur Project)

### Core Framework
- **React 19** with concurrent features
- **Next.js 16.2.x** with App Router (server components)
- **TypeScript 6.x** in strict mode

### Styling
- **CSS Modules** for scoped styling (never inline styles except dynamic `backgroundImage`)
- **Design tokens** from `shared/styles/variables.css`
- **Logical properties** (`margin-inline`, `padding-block`)

### State & Data
- **React hooks** (useState, useEffect, useContext, useMemo, useCallback)
- **Server components** for data fetching in Next.js
- **Client components** (`"use client"`) for interactivity

### Internationalization
- **i18next + react-i18next** for translations
- **3 languages**: EN (default), FI, SV
- **Cookie-based persistence** for language preference

### Testing
- **Vitest** for unit tests
- **Testing Library** for component testing
- **axe-core** for accessibility testing
- **Playwright** for E2E via Storybook

---

## Component Development Workflow

### 1. Before Creating ANY Component

**CRITICAL**: Always read these files first:
- `docs/LLM_COMPONENT_GENERATION_RULES.md` (12,000+ words, comprehensive guide)
- `docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md` (planning requirements)

These documents are **mandatory** and cover:
- Folder structure (`ComponentName/ComponentName.tsx`, `.module.css`, `.test.tsx`, `.stories.tsx`, `index.ts`)
- CSS Modules patterns and design token usage
- Accessibility requirements and testing
- i18n integration (all text must be translatable)
- TypeScript interfaces and props patterns
- Storybook documentation with WIP badge system

### 2. Component Folder Structure

```
shared/components/ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # Scoped styles
├── ComponentName.test.tsx     # Unit + a11y tests
├── ComponentName.stories.tsx  # Storybook documentation
└── index.ts                   # Export barrel
```

**Never** create standalone component files.

### 3. Component Template

```tsx
// ComponentName.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  /** Brief description of what this prop does */
  propName: string;
  /** Optional prop with default value */
  variant?: 'primary' | 'secondary';
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * Component description: what it does and when to use it.
 *
 * @example
 * ```tsx
 * <ComponentName propName="value" variant="primary">
 *   Content
 * </ComponentName>
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  variant = 'primary',
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <h2>{t('componentName.title')}</h2>
      {children}
    </div>
  );
};
```

### 4. CSS Modules Pattern

```css
/* ComponentName.module.css */

/* Base styles - use design tokens */
.container {
  padding: var(--space-layout-24);
  background-color: var(--color-background);
  color: var(--color-text);

  /* Use logical properties */
  margin-inline: auto;
  padding-block: var(--space-layout-16);

  /* Responsive with fluid typography */
  font-size: clamp(1rem, 2vw, 1.25rem);
}

/* Variants */
.primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

/* States */
.container:hover {
  transform: scale(1.02);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: var(--space-layout-16);
  }
}

/* Accessibility - reduced motion */
@media (prefers-reduced-motion: reduce) {
  .container:hover {
    transform: none;
  }
}
```

### 5. Required Tests

```tsx
// ComponentName.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ComponentName } from './ComponentName';

expect.extend(toHaveNoViolations);

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName propName="test" />);
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ComponentName propName="test" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('applies variant styles correctly', () => {
    const { container } = render(
      <ComponentName propName="test" variant="secondary" />
    );
    expect(container.firstChild).toHaveClass('secondary');
  });
});
```

### 6. Storybook Story

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Description of what this component does.',
      },
    },
  },
  tags: ['autodocs', 'wip'], // Add 'wip' badge until fully tested
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Primary: Story = {
  args: {
    propName: 'Example text',
    variant: 'primary',
    children: 'Content here',
  },
};

export const Secondary: Story = {
  args: {
    propName: 'Example text',
    variant: 'secondary',
    children: 'Content here',
  },
};
```

---

## Next.js 16 App Router Patterns

### Server Components (Default)

```tsx
// app/page.tsx
import { ComponentName } from '@/shared/components/ComponentName';

// Server component - can fetch data directly
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();

  return (
    <main>
      <ComponentName propName={json.title} />
    </main>
  );
}
```

### Client Components (Interactive)

```tsx
// app/components/InteractiveWidget.tsx
"use client";

import { useState } from 'react';

export function InteractiveWidget() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Metadata for SEO

```tsx
// app/about/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About | Digitaltableteur',
    description: 'Learn about our design systems expertise',
    openGraph: {
      title: 'About | Digitaltableteur',
      description: 'Learn about our design systems expertise',
      images: ['/og-image.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About | Digitaltableteur',
      description: 'Learn about our design systems expertise',
      images: ['/og-image.png'],
    },
  };
}

export default function AboutPage() {
  return <div>About content</div>;
}
```

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable SSR for client-only components
});
```

### Memoization

```tsx
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }: { items: Item[] }) {
  // Memoize expensive calculations
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Memoize callbacks
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return <div>{/* Use sortedItems */}</div>;
}
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Descriptive alt text"
  width={1200}
  height={630}
  priority // For above-the-fold images
  quality={85}
/>
```

---

## Accessibility Checklist

Before marking any component complete, verify:

- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- [ ] ARIA labels where needed (`aria-label`, `aria-describedby`)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible and clear
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Screen reader testing (run with VoiceOver/NVDA)
- [ ] No accessibility violations in axe-core tests

---

## Internationalization (i18n)

### Adding Translation Keys

```json
// shared/locales/en/translation.json
{
  "componentName": {
    "title": "Component Title",
    "description": "Component description text",
    "button": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  }
}
```

### Using Translations

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('componentName.title')}</h1>
      <p>{t('componentName.description')}</p>
      <button>{t('componentName.button.submit')}</button>
    </div>
  );
}
```

**MUST**: Ensure 100% translation coverage in EN, FI, SV.

---

## Common Patterns

### Form Handling

```tsx
"use client";
import { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Handle success
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Context for Global State

```tsx
// contexts/ThemeContext.tsx
"use client";
import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'light', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## Anti-Patterns to Avoid

❌ **DON'T**:
- Use `@ts-ignore` or `any` types
- Create inline styles (except dynamic `backgroundImage`)
- Hardcode colors (use CSS custom properties)
- Bypass ESLint errors
- Skip accessibility testing
- Forget responsive design
- Create standalone component files
- Use class components (use functional components)

✅ **DO**:
- Use TypeScript strict mode
- Follow folder structure pattern
- Write tests for all components
- Use design tokens from `variables.css`
- Test with reduced motion preferences
- Ensure keyboard navigation
- Keep functions under 50 lines
- Extract complex logic to custom hooks

---

## Quality Gates (Run Before Commit)

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm test

# Build verification
npm run build

# All together
npm run typecheck && npm run lint && npm test && npm run build
```

---

## Additional Resources

For detailed component generation rules, always refer to:
- `docs/LLM_COMPONENT_GENERATION_RULES.md` - Complete component architecture guide
- `shared/components/CLAUDE.md` - Component library specific instructions
- `app/CLAUDE.md` - Next.js App Router patterns

For critical planning steps:
- `docs/LLM-CRITICAL-REASONING-AND-PLANNING-INSTRUCTIONS.md`

---

## When to Use This Skill

Activate this skill when:
- Building React components
- Implementing Next.js features
- Working with TypeScript interfaces
- Styling with CSS Modules
- Adding i18n translations
- Optimizing performance
- Debugging frontend issues
- Writing component tests
- Creating Storybook stories
- Implementing accessibility features

**Remember**: Always read the component generation rules before creating new components.
