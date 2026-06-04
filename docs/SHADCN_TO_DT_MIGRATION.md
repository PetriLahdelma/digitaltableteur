# Shadcn → @dt migration (human review workflow)

Strategy context: [`DS_AUTOMATION_STRATEGY.md`](DS_AUTOMATION_STRATEGY.md)

Production dogfooding uses the same loop as the Button surface board:

1. Open the **Storybook decision board** (Today / Wrong / Proposed per band).
2. Approve the green **Proposed** row for each context.
3. Only then swap the production call site.

## Review hub

Storybook → **Design system / Migration boards → Review hub**

Shared UI lives in `nextjs-app/shared/stories/MigrationDecisionBoard/` (`MigrationDecisionPage`, `MigrationDecisionBand`, `MigrationDecisionBlock`, `MigrationReviewHub`).

| Board | Storybook path | Production touchpoints | Status |
|-------|----------------|------------------------|--------|
| Button surfaces | `Atoms/Button/Surface comparison` (Cta Bands + Home Hero Band) | `CTASection`, `HomeHero` | Approved |
| Button contexts | `Migration boards/Button contexts` | `StudioMap`, `IconButton`, `ContactFormSuccess` | Migrated |
| Contact flow | `Migration boards/Contact flow` | `ContactFormEditorial`, `ContactFormSuccessEditorial` | Migrated |
| Form primitives | `Migration boards/Form primitives` | `FormField`, `CheckboxField` | Migrated |
| Dialogs | `Migration boards/Dialogs` | `AnimatedDialog`, `Lightbox`, `EnhancedContactForm` | **Blocked** — `@dt/Modal` needs design/API work before swap |

Restart Storybook after adding or renaming board files so hub `storyId` links resolve.

## Programmatic visual check (migration matrix)

With Storybook on **6010** and `npm run dev` on **3001**:

```bash
npm run test:migration:visual
```

Runs **4 themes** × **2 viewports** (desktop 1280px, mobile 390px) against:

- Production: `/`, `/contact` (header + layout guards)
- Storybook: SiteHeader, IconButton, FormField, CheckboxField, ContactFormEditorial, Button surface boards

**Desktop guard:** hamburger / “Open navigation menu” must be **hidden** (catches `lg:hidden` vs CSS-module `display` clashes).

**Pixel baselines:** `__visual__/snapshots/migration-matrix/` — first run or intentional refresh:

```bash
npm run test:migration:visual:update
```

Report: `public/visual-diff/migration-matrix-report.json`

## Deferred (no @dt primitive yet)

- **SkillsGrid** — shadcn Tooltip only
- **Lightbox** — full-bleed gallery; needs spec vs `@dt/Modal`
- **EnhancedContactForm** — migrate after primitives + dialog boards approved
- **TailwindTest**, **`interactive/index`**, **`ui/index`** — dev/barrel only

## API decisions (locked)

- **`Button.surface`**: `default` on light hero; `onDark` / `onBrand` on tinted CTA bands only.
- **Do not** use `isInverse` on `primary` over transparent/gradient parents.
- **`Modal`** replaces alert-style shadcn `Dialog`; composable Radix triggers stay shadcn until wrapped.
