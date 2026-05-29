# Layout patterns

> **Scope:** `nextjs-app/shared/patterns/`  
> **Skill:** [`.claude/skills/dt-design-system/SKILL.md`](../../.claude/skills/dt-design-system/SKILL.md)

---

## Identity

Composed page sections (contact editorial, heroes, footers) built from `@dt` components. Same contract/story/test expectations as components.

---

## Patterns vs components

| | Components (`shared/components/`) | Patterns (`shared/patterns/`) |
|---|-----------------------------------|-------------------------------|
| Purpose | Reusable primitives & molecules | Page-level layouts & editorial blocks |
| Example | `Button`, `Card`, `ContactForm` | `ContactPageContentEditorial` |
| Import | `@dt/<Name>` | `@dt/<Name>` or relative from pages |

---

## Conventions

- Compose with `Title`, `Text`, `Grid`, `FlexBox`, `Container` — no raw typography HTML
- CSS Modules with design tokens; responsive via logical properties and container queries where used
- Page routes in `app/` import pattern components — keep routing thin

---

## Contact editorial (example)

- `ContactPageContentEditorial/` — split layout with portrait + inquiry rows
- Mobile: narrow image column (`~9.5rem`), tighter gap — see module CSS before changing breakpoints

---

## Scaffold

Patterns with contracts follow the same tooling as components:

```bash
npm run validate:components
```

---

## Quick find

```bash
ls nextjs-app/shared/patterns/
rg -n "from.*patterns/" app/ nextjs-app/
```
