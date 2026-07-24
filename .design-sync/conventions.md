# Building with @digitaltableteur/react

Import components from `@digitaltableteur/react` and render `window.DigitaltableteurReact.<Name>`. Every component ships its styles in the bound stylesheet — no per-component CSS import needed.

## Setup / wrapping

Most components render correctly with **no provider** — the design tokens live at `:root`, so the light theme is always active. Add providers only when you need their behavior:

- `ThemeProvider` — wrap the app root to enable dark / high-contrast themes (it toggles the `.themeDark` / `.themeHCB` class that re-points the color tokens). Not needed for the default light theme.
- `TranslationProvider` — only if you render components that call the translation hook; for normal use, pass literal strings as `children` and skip it.

```jsx
<ThemeProvider>
  <YourApp />
</ThemeProvider>
```

## Styling idiom — props first, tokens for glue

This system is **not** a utility-class kit. Do not write Tailwind-style classes and do not invent class names — the component classes are scoped (hashed) and internal. Style in two ways only:

1. **Component props carry the design language.** The recurring axes, consistent across controls:
   - `variant`: `"primary" | "secondary" | "tertiary"` (visual weight)
   - `tone`: `"neutral" | "error" | "warning" | "success" | "info"` (semantic color)
   - `size`: `"sm" | "md" | "lg"`
   - `surface`: `"default" | "onDark" | "onBrand"` (contrast-safe on tinted bands)
   Reach for these before any custom CSS.

2. **Design tokens (`var(--*)`) for your own layout glue.** Real names:
   - Color: `--color-text`, `--color-muted`, `--color-primary`, `--color-border`, `--color-surface` (+ `--color-error/-warning/-success/-info`)
   - Radius: `--radius-sm` (2) `--radius-md` (4) `--radius-lg` (8) `--radius-xl` (16) `--radius-full`
   - Elevation: `--shadow-sm` `--shadow-md` `--shadow-lg` `--shadow-xl`
   - Type: `--font-body`, `--font-size-text-xs/-s/-m`
   - Spacing: `--space-internal-{2,6,8,12,16,24}`

## Where the truth lives

Read `styles.css` (and its `@import` closure) for the full token set before styling, and each component's `<Name>.prompt.md` (usage) and `<Name>.d.ts` (prop contract) before composing it.

## Idiomatic example

```jsx
import { Card, Stack, Title, Text, Button } from "@digitaltableteur/react";

<Card>
  <Stack gap="md">
    <Title size="lg">Project spine</Title>
    <Text tone="muted">A governed, AI-native component library.</Text>
    <div style={{ display: "flex", gap: "var(--space-internal-8)" }}>
      <Button variant="primary">Get started</Button>
      <Button variant="secondary">Docs</Button>
    </div>
  </Stack>
</Card>
```

Library components for the controls; the DS tokens (`var(--space-internal-8)`) for your own layout — never hardcoded pixels or hex.
