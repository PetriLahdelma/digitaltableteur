---
name: dt-scripts
description: >-
  Runs and modifies Digitaltableteur automation under scripts/ including Linear,
  Sentry, visual regression, design-system CLI, blog manifest, and deployment.
  Use when the user says "Linear issue", "Sentry summary", "visual regression",
  "test:visual", "generate manifest", "pseo generate", "design-system script",
  or edits files under scripts/. Do NOT use for app/ pages (dt-nextjs-app) or
  component styling (dt-design-system).
metadata:
  version: 1.1.0
  category: automation
---

# Scripts workflow

## Instructions

### Step 1: Load context

Read [`references/area-guide.md`](references/area-guide.md) and [`scripts/AGENTS.md`](../../scripts/AGENTS.md).

Prefer extending existing scripts in `scripts/` or `lib/` over duplicating logic.

### Step 2: Run or edit script

| Task | Command |
|------|---------|
| Linear issue | `npx tsx scripts/linear/create-issue.ts` |
| Sentry summary | `npm run generate-sentry-summary` |
| Visual regression | `npm run test:visual` |
| Blog manifest | `node scripts/generate-blog-manifest.mjs` |
| Component scaffold | `npm run new-component Name` |
| PSEO copy | `npm run pseo:generate` |

TypeScript: `npx tsx`. Node utilities: `.mjs`. Exit non-zero on failure.

### Step 3: Post-edit validation

Design-system scripts (`scripts/design-system/`):

```bash
npm run validate:components    # if component-related
npm run check:generated        # if generated artifacts change
npm run validate:agent-docs      # if agent docs/skills changed
```

CRITICAL: never print secrets or tokens in script output.

### Step 4: Deploy scripts

Ask user before running production deploy scripts (`scripts/deploy-hybrid.sh`, `vercel --prod`).

---

## Examples

### Example 1: Regenerate Sentry dashboard JSON

User says: "Refresh the Sentry summary for observability"

Actions:

1. Run `npm run generate-sentry-summary`
2. Verify output at `public/observability/sentry-summary.json`
3. Commit if intentional artifact update

### Example 2: Add design-system check

User says: "Add validation for missing spec.md files"

Actions:

1. Extend `scripts/design-system/validate-components.ts`
2. Wire npm script if needed in `package.json`
3. Run `npm run validate:components` locally
4. Add to PR validation workflow if merge gate

---

## Troubleshooting

### Script exits 1 with no clear message

Cause: unhandled exception or missing env var.

Solution: run with `node --trace-uncaught` or add explicit error messages; check required env vars in script header.

### Visual test flaky locally

Cause: Storybook not ready or port conflict.

Solution: use `npm run test:visual` (handles Storybook lifecycle) not raw test-storybook.

### Generated file drift in CI

Cause: script output differs from committed artifact.

Solution: run generator locally, commit diff, or fix `npm run check:generated` failure output.

---

## Boundaries

- Ask before production deploys
- Do not commit secrets
- Commit generated artifacts only when repo convention expects it (manifest, tokens, agent-manifest)
