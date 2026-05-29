# React context providers

> **Scope:** `providers/`  
> **Parent:** [`app/AGENTS.md`](../app/AGENTS.md)

---

## Providers

| File | Purpose |
|------|---------|
| `I18nProvider.tsx` | i18next + react-i18next |
| `NextThemeProvider.tsx` | Theme (light/dark/system) |
| `ToastProvider.tsx` | Toast notifications |
| `CookieConsentProvider.tsx` | GDPR cookie consent state |

Wired in `app/layout.tsx` — order matters for hydration.

---

## Conventions

- Client components (`"use client"`) — providers use hooks and browser APIs
- Keep provider trees shallow; avoid nesting duplicate theme/i18n wrappers
- Cookie consent integrates with `nextjs-app/shared/components/CookieConsent/`

---

## Hydration

Theme and language apply client-side → root `<html suppressHydrationWarning>` in layout.

---

## i18n

Translation files: `nextjs-app/shared/locales/{en,fi,sv}/translation.json`  
Provider must wrap any component calling `useTranslation()`.

---

## Quick find

```bash
rg -n "Provider" app/layout.tsx providers/
rg -n "useTranslation|useTheme" app/ providers/
```
