# Prose quality (anti–AI-slop)

Use when drafting or editing blog MDX, case studies, or long-form content in this repo.

## Before writing

Read `docs/WRITING_STYLE.md` (voice, banned words, structure).

## After editing

```bash
npm run prose:fix-em-dashes    # if em dashes present
npm run prose:check            # must pass for content/posts
```

## Rules of thumb

- No em dashes (—). Use a comma, period, or colon in headings.
- No banned filler (`delve`, `leverage`, `unlock`, `seamless`, …).
- At most one “not X, it’s Y” contrast per article.
- Open with a specific observation, not “In today’s landscape…”
- Prose-first paragraphs; lists for tools/checklists only.

## Drafts

`npm run prose:check -- --include-drafts` before publishing from `content/drafts/`.
