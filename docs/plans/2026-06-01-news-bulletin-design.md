# Home news bulletin — design

**Branch:** `DT-feat-home-news-bulletin`  
**Status:** MVP in progress

## Purpose

A static three-slot “news bulletin” band on the homepage, sitting directly above the site footer. Each slot surfaces a topical snippet (award, launch, article, note). Slots are always exactly three.

Reference layout: dark full-width strip, subtle top border, three equal cards with a badge/mark on the left and copy on the right.

## Data model (`nextjs-app/shared/data/news-bulletin.ts`)

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Stable slug for skill commands (`replace go-24 …`) |
| `badge` | yes | `{ src, alt, width, height }` — SVG/PNG from Figma (see `public/images/news-bulletin/`) |
| `body` | yes | Snippet text |
| `link` | no | Discriminated union (see below) |

**Link kinds**

- `internal` — `{ kind: "internal", href: "/blog/foo" }` → Next.js `Link`
- `external` — `{ kind: "external", href: "https://…" }` → `<a target="_blank" rel="noopener noreferrer">`
- `static` — `{ kind: "static" }` or omit `link` — non-interactive card

Exactly three items in `NEWS_BULLETIN_ITEMS`; export `assertNewsBulletinCount()` for tests/scripts.

## UI

- **Pattern:** `NewsBulletin` under `nextjs-app/shared/patterns/NewsBulletin/`
- **Placement:** end of `HomePage`, after `CTASection`, before layout `SiteFooter`
- **a11y:** `<section aria-label={t("newsBulletinAriaLabel")}>`, whole card is one focus target when linked; static cards use `<article>` without fake links

## Agent skill (`.claude/skills/news-bulletin/SKILL.md`)

Source of truth is the TypeScript data file (git-reviewed). Skill documents:

| Intent | Action |
|--------|--------|
| List | Read `news-bulletin.ts`, print ids + summaries |
| Add / rotate in | Replace oldest or user-specified id; keep length 3 |
| Replace | `replace <id>` — patch one item by id |
| Remove | Must end with 3 items — “remove” = replace with new content |

No CMS in v1. Optional later: `node scripts/news-bulletin-cli.mjs validate`.

## Alternatives considered

1. **JSON + CMS** — heavier; rejected for v1.  
2. **i18n keys per slot** — good for FI/SV later; start EN in data file, wrap section chrome only.  
3. **Sanity document type** — overkill until editorial workflow is needed.

## Follow-ups

- Localized `body` / `badge` via translation keys or per-locale data files  
- Badge images (WebP) instead of text marks  
- Storybook + visual regression for dark theme / HCB / HCW
