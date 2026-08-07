# Automation Scripts - Quick Reference

## Package Identity

**Purpose**: Automation tools for Linear, Sentry, visual regression, deployment  
**Location**: Project root `/scripts/`

---

## Available Scripts

### Linear Automation

**`scripts/linear/create-issue.ts`**

- Interactive CLI wizard for issue creation
- Run: `npx tsx scripts/linear/create-issue.ts`

**`scripts/linear/update-issue.ts`**

- Update issue state, labels, add comments
- Run: `npx tsx scripts/linear/update-issue.ts --issue DIG-16 --state "Done"`

**`scripts/linear/check-issue.ts`**

- Display issue details (state, assignee, labels, URL)
- Run: `npx tsx scripts/linear/check-issue.ts DIG-16`

**`scripts/linear/seed-labels.ts`**

- Seed project with standard labels
- Run: `npx tsx scripts/linear/seed-labels.ts`

**Library**: `lib/linear/createIssue.ts`

- Reusable `createLinearIssue()` function
- Supports: title, description, priority, labels, assignee, state, project

### Sentry MCP

**`scripts/sentry-mcp.js`**

- Query Sentry issues and releases via MCP
- Run: `node scripts/sentry-mcp.js issues [project] [limit] [--unresolved] [--environment=name]`

**`scripts/generate-sentry-summary.mjs`**

- Generate summary JSON for dashboard consumption
- Run: `npm run generate-sentry-summary`
- Output: `public/observability/sentry-summary.json`

### Visual Regression

**Storybook Test Runner**

- Run: `npm run test:visual`
- Update baselines: `npm run test:visual -- --updateSnapshot`
- Diffs: `__visual__/diffs/__diff_output__/`
- Report: `public/visual-diff/report.json`

**Migration matrix (shadcn → @dt)**

- Run: `npm run test:migration:visual` (Storybook `:6010` + Next dev `:3001`)
- Update baselines: `npm run test:migration:visual:update`
- Report: `public/visual-diff/migration-matrix-report.json`
- Optional CI: `.github/workflows/ds-migration-visual.yml` (workflow_dispatch)

**DS health (CI-safe aggregate)**

- Run: `npm run ds:health`
- Output: `public/ds-health/report.json`, `public/ds-health/summary.md`
- Includes: `lint:dt-usage`, `lint:composition`, `lint:dt-responsive-visibility`, shadcn inventory, last matrix result

**Responsive visibility lint**

- Run: `npm run lint:dt-responsive-visibility -- --strict`
- Prevents `lg:hidden` (etc.) on `@dt/Button` — use wrapper pattern (see IconButton)

### Security Testing

**`tests/security/run-security-tests.mjs`**

- Red-team security test runner for Donny AI
- Run: `npm run test:security`
- Verbose: `npm run test:security:verbose`
- Single category: `npm run test:security:category prompt_injection`
- Output: `test-results/security/security-report.json`

**`tests/security/donny-security-tests.yaml`**

- YAML test suite with 50+ attack patterns
- Categories: prompt_injection, data_exfiltration, indirect_injection, tool_abuse, memory_poisoning, output_rendering, abuse_dos, social_engineering

**Documentation**: `docs/DONNY_SECURITY_TEST_SPEC.md`

### Deployment

**`scripts/deploy-hybrid.sh`**

- Hybrid deployment (Vite + Next.js)

**`scripts/generate-sitemap.js`**

- Generate `sitemap.xml`
- Run: `npm run generate-sitemap`

**Cache Busting**

- Run: `npm run cache-bust`
- Adds version metadata and `.nojekyll`

### Agent Benchmark (design-system, Astryx-gap Phase 3)

**`scripts/design-system/agent-bench/`**

- A/B benchmark: does the DS affordance layer (dt CLI + contracts) change
  what a coding agent builds? Five task categories (table, tree, migration,
  repair, forced-colors) with affordance-neutral machine acceptance.
- `npm run agent:bench:selftest` — null/oracle grader integrity, no model
  spend. Run before any paid run.
- `npm run agent:bench -- --task all --arm both --agent claude --reps 3`
  — a real benchmark run (spends tokens; pinned model + turn budget).
- Methodology and fairness design: `docs/AGENT_BENCH_METHODOLOGY.md`.
- Results land in `scripts/design-system/agent-bench/results/` (gitignored).
  Publish with `aggregate.mjs --out public/ds-health/agent-bench.json
  [--note ...] <result files>` — the agent page renders that artifact
  verbatim (numbers are generated, never hand-written); commit the
  regenerated artifact with the run's caveats as notes.

### Compat/perf evidence (design-system, Astryx-gap Phase 4)

- `npm run audit:bundle-evidence` — measures per-component minified+gzip
  cost of the built `@digitaltableteur/react` dist (two honest numbers:
  `self` = package code only, all deps external; `withDeps` = marginal cost
  to a consumer that satisfies the peer contract). Requires a built dist;
  pass `-- --build` to rebuild first. Output:
  `public/ds-health/bundle-evidence.json` (provenance-stamped, byte-stable
  on unchanged substance).
- `npm run audit:compatibility` — writes the per-publish compatibility
  manifest: toolchain combinations ACTUALLY exercised by the gates
  (resolved versions, never ranges), declared peer ranges vs the single
  exercised version, and a summary of the latest recorded publish
  preflight. Output: `public/ds-health/compatibility-manifest.json`.
- `npm run audit:ssr-evidence` — server-renders every renderable export in
  plain Node (no DOM globals, the real server condition) and hydrates the
  captured HTML in a jsdom worker with the unit suite's browser stubs;
  records ssr pass/error, hydration clean/mismatch, and HTML bytes as
  deterministic substance (timings informational). Fragment elements
  (td/tr/li) hydrate inside a valid ancestor chain from their contract
  `element`. Requires a built dist; `-- --build` rebuilds first. Output:
  `public/ds-health/ssr-evidence.json`.
- `npm run audit:override-evidence` — override-precedence gate
  (docs/OVERRIDE_EVIDENCE_SPEC.md, increment A): renders every contracted
  export from the built dist in real Chromium (esbuild harness + Playwright,
  reduced motion, tokens-css + entry CSS like a registry consumer) and
  asserts a consumer's single-class className override wins for the probed
  properties (className-override-wins is the contract, owner decision
  2026-08-07); also probes contract theming.vars for liveness. Exit 2 on
  failures not in `override-evidence-baseline.json` (dated entries, never
  blanket-updated). Requires a built dist; `-- --build` rebuilds first.
  Output: `public/ds-health/override-evidence.json`. The encapsulation
  section holds the universal-selector container scan + container × child
  interference matrix on child-pinned properties (direct children and
  sub-slot recipes; `-- --containers Name` exercises the machinery ad hoc).
  Since increment C, NEW affected matrix pairs gate against dated
  `encapsulation` baseline entries alongside component failures.
- All four run automatically inside `check:react-publish-preflight` (after
  `react-public-api` rebuilds the dist), so every publish regenerates its
  evidence; commit the regenerated artifacts with the publish PR.

---

## Key Patterns

### Linear Issue Creation (Programmatic)

```typescript
import { createLinearIssue } from "../../lib/linear/createIssue";

const result = await createLinearIssue({
  title: "Implement X component",
  description: "Detailed description...",
  priority: 1, // P2 (High)
  labelNames: ["design-system", "Improvement"],
  assigneeEmail: "petri@digitaltableteur.com",
  stateName: "In Progress",
});

console.log(`Created: ${result.identifier} - ${result.url}`);
```

### Sentry Query

```bash
# Get unresolved production issues
node scripts/sentry-mcp.js issues digitaltableteur 10 --unresolved --environment=production

# Get recent releases
node scripts/sentry-mcp.js releases digitaltableteur 5
```

### Visual Regression Workflow

```bash
# 1. Make UI changes
# 2. Update baselines
npm run test:visual -- --updateSnapshot

# 3. Review diffs
open __visual__/diffs/__diff_output__/

# 4. Generate report
npm run generate-visual-report

# 5. Commit baselines
git add __visual__/snapshots/
git commit -m "chore: update visual regression baselines"
```

---

## Quick Find Commands

### Find Scripts

```bash
# List all scripts
find scripts -name "*.ts" -o -name "*.js" -o -name "*.mjs" -o -name "*.sh"

# Find Linear scripts
find scripts/linear -name "*.ts"

# Find MCP scripts
rg -n "mcp" scripts/
```

### Find Script Usage

```bash
# Find npm scripts
rg -n "\"scripts\":" package.json -A 50

# Find script calls in codebase
rg -n "npx tsx scripts/" .
```

---

## Environment Variables

### Required for Linear

```bash
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...
LINEAR_PROJECT_ID=...  # Optional
```

### Required for Sentry

```bash
VITE_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=digitaltableteur
SENTRY_PROJECT=frontend
```

### Required for Deployment

```bash
VITE_GA_ID=...
GITHUB_TOKEN=...  # For gh-pages deployment
```

---

## Common Use Cases

### Create Linear Issue

```bash
# Interactive
npx tsx scripts/linear/create-issue.ts

# Programmatic (create custom script)
# See lib/linear/createIssue.ts for API
```

### Update Linear Issue

```bash
# Change state
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --state "Done"

# Add label
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --add-label "ui-app-bug"

# Add comment
npx tsx scripts/linear/update-issue.ts --issue DIG-16 --comment "Fixed in PR #123"
```

### Query Sentry

```bash
# Get issues
node scripts/sentry-mcp.js issues digitaltableteur 10 --unresolved

# Generate summary
npm run generate-sentry-summary
```

### Visual Regression

```bash
# Run tests
npm run test:visual

# Update baselines (after intentional UI changes)
npm run test:visual -- --updateSnapshot

# Generate report
npm run generate-visual-report
```

---

## Troubleshooting

### Linear

- **"labels not found"**: Check spelling in `docs/LINEAR_LABELS.md` (case-insensitive)
- **"Argument Validation Error"**: Omit `projectId` to use env default
- **Assignee not set**: Verify email matches Linear workspace user

### Sentry

- **Missing credentials**: Set `SENTRY_AUTH_TOKEN` in `.env.local`
- **Stub data**: Run `npm run generate-sentry-summary` to generate real data
- **API errors**: Check token permissions in Sentry dashboard

### Visual Regression

- **Snapshot mismatches**: Review diffs in `__visual__/diffs/__diff_output__/`
- **Update baselines**: Run with `--updateSnapshot` flag
- **Flaky tests**: Increase timeout or disable animations

---

**End of scripts/AGENTS.md**
