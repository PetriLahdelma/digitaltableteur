# Astryx Roadmap Phase 2: Storybook Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, main thread; per project memory, visual frame work must NOT be delegated to isolated subagents). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the custom Storybook docs frame from `docs/superpowers/specs/2026-07-03-astryx-level-design-system-roadmap.md` section 3.2: 11 DT-styled doc blocks, a custom autodocs page, manager theme and chrome, Astryx-style sidebar regroup with status dots, and a landing gallery, proven end to end on the 8 platinum components (Button, Badge, Icon, Text, Title, Link, Label, Card).

**Architecture:** Two PRs. PR A builds `.storybook/blocks/` (11 blocks + `DtDocsPage` template), registers it via `parameters.docs.page` in `preview.tsx`, adds a `docs.source.transform`, proves the frame on the 8 platinum components (autodocs tags + example-tagged stories), and adds a docs-page smoke gate. PR B does the manager chrome (theme, manager-head CSS, status dots via `sidebar.renderLabel`), the sidebar regroup (retitle component stories to the DOC_TIER_1 category taxonomy, Tier 2 to `Site/`), the baseline re-key that retitling forces, and the `Overview/Components` landing gallery. PR A merges before PR B starts.

**Tech Stack:** Storybook 10.4 (react-vite), `@storybook/addon-docs/blocks`, React 19, TypeScript 6 strict, CSS Modules, vitest, Playwright (docs smoke).

## Global Constraints

- CSS Modules only; design tokens from `nextjs-app/shared/styles/variables.css`; no hardcoded colors in preview-side code. Exception, documented in code comments: `manager.ts` theme values and `manager-head.html` CSS, because the Storybook manager app does not load our token stylesheet. Copy hex values verbatim from `variables.css` with the token name in a comment.
- Doc blocks are dogfooded from DT components (Badge, Card, Icon, Text, Title, Link, Grid, FlexBox) wherever a DT component fits; block-specific chrome may use its own module CSS on tokens.
- Blocks render Storybook-internal chrome (English-only is acceptable there, matching existing Storybook docs pages; no i18n keys required for docs chrome).
- No em dashes in any authored prose.
- Conventional Commits; every task ends with a commit.
- PR gate (local, before merge): `npm run typecheck && npm run lint && npm test && npm run build`, all exit 0, plus `npm run storybook:build` and the new `npm run test:docs-smoke`. Merge with `gh pr merge --admin --squash`. Never wait on GitHub Actions.
- Branch per PR: `DT-XXX-astryx-phase2-docs-frame` (PR A), `DT-XXX-astryx-phase2-manager-chrome` (PR B), each fresh off `main`.
- Every block root element carries `data-doc-block="<kebab-name>"` so the smoke test can count blocks.
- Verification of visual output happens live against the running Storybook (port 6010) with the preview tools before each commit that changes rendering.

**Facts locked during research (do not rediscover):**
- The 8 platinum components and their current story titles: `Atoms/Button`, `Atoms/Badge`, `Atoms/Icon`, `Atoms/Text`, `Atoms/Title`, `Atoms/Link`, `Atoms/Label` (verify Label story title at execution), `Molecules/Card`.
- Contracts are colocated `<Name>/<Name>.contract.json`, schema v2 with `usage{description,bestPractices[{guidance,description}],anatomy[{name,required,description}]}`, `keywords`, `dense`, `playground.defaults`, `props`, `composesWith`, `tokens{colors,spacing,...}`, `a11y{...}`, `figma`, `status`, `group`. `theming.vars` is optional and mostly absent; ThemingSection falls back to `contract.tokens`.
- `.storybook/lib/resolve-figma-from-contract.ts` already builds a browser-safe name-to-contract map via `import.meta.glob` and derives the component name from docs context. Reuse this pattern; extract the shared parts instead of duplicating.
- `.storybook/lib/resolveElements.tsx` exports `resolveValue(value)` for JSON element descriptors (registry: Badge, Icon, Text, Title).
- A11y snapshots are story-id-keyed YAML files colocated per component (`__a11y-snapshots__/atoms-button--default.yaml`); `scripts/design-system/relocate-a11y-snapshots.mjs` exists for re-keying after retitles. Visual baselines are story-id-keyed PNGs under `__visual__/`.
- `smoke-stories.mjs` does not key on titles (verified by grep), but re-verify after retitle.
- Button's meta tags are `["beta", "!autodocs"]` even though the contract says stable; the `beta` tag may have script consumers, so PR A only flips the autodocs tag and PR B reconciles status tags after grepping consumers.
- DOC_TIER_1 (57 names) and categories live in `scripts/design-system/doc-tiers.mjs`.
- Existing sidebar prefixes: Atoms, Molecules, Organisms, Patterns, Templates, Foundations, Docs, Design system, Overview, Testing.

**Deliberate deviations from the spec (record in PR body):**
1. Spec 3.2 A item 1 wants a "since" version in DocHeader; contracts have no such field. DocHeader shows status, group, and Figma link only. Adding a `since` field is a Phase 3 contract-content decision.
2. Spec 3.2 C's "docs-mode stage decorator" is implemented inside `ShowcaseStage`/`ExampleBlock` (each example canvas gets the padded surface) rather than as an eighth global decorator; a global decorator would also restyle non-docs canvas mode, which we do not want.
3. The landing gallery lands in PR B, not PR A, because card links embed story ids that change when PR B retitles stories.
4. Discovered at execution: every platinum component ships a Carbon-style `<Name>.mdx` docs page, and `validate:components` REQUIRES it at beta+, while Storybook hard-errors (500 on /index.json) when a meta has both an attached MDX docs page and the `autodocs` tag. Resolution, consistent with the Phase 1 "contract is the doc source of truth" ratchet: the validator gains a frame-adoption rule (contract `usage` present, the ratchet's own predicate) under which the MDX bar is superseded by the stricter docFieldErrors bar and a colocated MDX becomes an error. Unique MDX prose is migrated into the contract (usage.*, a11y.ariaRequirements, bestPractices don'ts) before the MDX is deleted.
5. Consequence of 4 for Task 5: the remaining 7 platinum components need their contract doc fields authored (migrated from their MDX prose plus stories) before they can adopt the frame; Task 5 is a content-migration task per component, not a tags flip.

---

## PR A: docs frame

### Task 1: Branch, blocks scaffold, StatusPill

**Files:**
- Create: `.storybook/blocks/StatusPill.tsx`
- Create: `.storybook/blocks/StatusPill.module.css`
- Create: `.storybook/blocks/StatusPill.test.tsx`

**Interfaces:**
- Produces: `StatusPill({ status }: { status: "alpha" | "beta" | "stable" | "deprecated" })`, used by DocHeader (Task 2) and ComponentsGallery (Task 12).

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull && git checkout -b DT-XXX-astryx-phase2-docs-frame
```

- [ ] **Step 2: Write the failing test**

`.storybook/blocks/StatusPill.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders the status text with a tone class per status", () => {
    render(<StatusPill status="stable" />);
    const pill = screen.getByText("stable");
    expect(pill.className).toMatch(/stable/);
  });
  it("renders deprecated with the error tone class", () => {
    render(<StatusPill status="deprecated" />);
    expect(screen.getByText("deprecated").className).toMatch(/deprecated/);
  });
});
```

- [ ] **Step 3: Run it, expect module-not-found failure**

Run: `npx vitest run .storybook/blocks/StatusPill.test.tsx`
Expected: FAIL (cannot resolve `./StatusPill`).

- [ ] **Step 4: Implement**

`.storybook/blocks/StatusPill.tsx`: a `<span>` with `styles.pill` and `styles[status]`, text = status. Tone mapping in CSS only: stable = success tokens, beta = info tokens, alpha = warning tokens, deprecated = error tokens (reuse the same `--color-success/info/warning/error` token families WipBadge uses; read `WipBadge.module.css` first and match its tone treatment so the two stay visually consistent). Use Badge from `@dt/Badge` if its API supports tone + size cleanly for this, otherwise a bare span with module CSS; decide by reading `Badge.contract.json` props. Root element gets no `data-doc-block` (it is a fragment of DocHeader, not a block).

- [ ] **Step 5: Test passes, commit**

Run: `npx vitest run .storybook/blocks/StatusPill.test.tsx` (PASS), then:

```bash
git add .storybook/blocks && git commit -m "feat(design-system): storybook docs frame scaffold with StatusPill"
```

---

### Task 2: Contract lookup helper + pure contract blocks (DocHeader, ImportBlock, UsageSection, BestPractices, AnatomySection)

**Files:**
- Create: `.storybook/lib/contracts.ts`
- Modify: `.storybook/lib/resolve-figma-from-contract.ts` (re-export shared name resolution instead of duplicating)
- Create: `.storybook/blocks/DocHeader.tsx` + `.module.css`
- Create: `.storybook/blocks/ImportBlock.tsx` + `.module.css`
- Create: `.storybook/blocks/UsageSection.tsx` + `.module.css`
- Create: `.storybook/blocks/BestPractices.tsx` + `.module.css`
- Create: `.storybook/blocks/AnatomySection.tsx` + `.module.css`
- Test: `.storybook/blocks/contract-blocks.test.tsx`

**Interfaces:**
- Consumes: `StatusPill` (Task 1).
- Produces:
  - `contracts.ts`: `getContractByName(name: string): DtContract | null` and `componentNameFromDocsContext(context): string | null` (moved from resolve-figma-from-contract, which now imports it). `DtContract` is a structural type covering the fields the blocks read (name, displayName, status, group, description, figma, usage, keywords, dense, playground, props, composesWith, tokens, a11y, theming). Type it by hand from `Button.contract.json`; do not codegen.
  - Each block takes `{ contract: DtContract }` and returns `null` when its data slice is absent (graceful degradation is required for the Phase 3 rollout).
  - `ImportBlock` renders `import { <Name> } from "@dt/<Name>";` in a `<pre><code>` with a copy button (native `navigator.clipboard.writeText`, no dependency).
  - `UsageSection` renders `usage.description` through the `Markdown` block from `@storybook/addon-docs/blocks`.
  - `BestPractices` renders two columns (Do = `guidance: true` with a check Icon, Don't = `guidance: false` with an x Icon) using DT Card + Icon + Text, laid out with Grid or FlexBox.
  - `AnatomySection` renders an Element / Required / Description table from `usage.anatomy`.

- [ ] **Step 1: Write the failing tests**

`.storybook/blocks/contract-blocks.test.tsx` renders each block with the real `Button.contract.json` (import it directly) and asserts:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import contract from "../../nextjs-app/shared/components/Button/Button.contract.json";
import { DocHeader } from "./DocHeader";
import { ImportBlock } from "./ImportBlock";
import { UsageSection } from "./UsageSection";
import { BestPractices } from "./BestPractices";
import { AnatomySection } from "./AnatomySection";
import type { DtContract } from "../lib/contracts";

const c = contract as unknown as DtContract;

describe("contract blocks", () => {
  it("DocHeader shows name, status, group, figma link", () => {
    render(<DocHeader contract={c} />);
    expect(screen.getByRole("heading", { name: "Button" })).toBeInTheDocument();
    expect(screen.getByText("stable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /figma/i })).toHaveAttribute("href", c.figma!);
  });
  it("ImportBlock renders the @dt import line", () => {
    render(<ImportBlock contract={c} />);
    expect(screen.getByText(/import { Button } from "@dt\/Button";/)).toBeInTheDocument();
  });
  it("BestPractices splits do and don't", () => {
    render(<BestPractices contract={c} />);
    expect(screen.getByText(/Reserve variant=primary/)).toBeInTheDocument();
    expect(screen.getByText(/Do not place more than one primary/)).toBeInTheDocument();
  });
  it("AnatomySection lists anatomy rows with required marks", () => {
    render(<AnatomySection contract={c} />);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });
  it("blocks return null when their data is missing", () => {
    const bare = { name: "X", status: "alpha" } as DtContract;
    const { container } = render(
      <>
        <UsageSection contract={bare} />
        <BestPractices contract={bare} />
        <AnatomySection contract={bare} />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
```

Note: `UsageSection` uses the addon-docs `Markdown` block, which needs no docs context; if it turns out to require one, fall back to rendering the description as plain paragraphs split on blank lines (contract prose is simple).

- [ ] **Step 2: Run tests, expect failures**

Run: `npx vitest run .storybook/blocks/contract-blocks.test.tsx` (FAIL: modules missing).

- [ ] **Step 3: Implement `contracts.ts`, refactor the figma resolver, implement the five blocks**

`contracts.ts` moves the three `import.meta.glob` calls and `componentNameFromContext` out of `resolve-figma-from-contract.ts`; that file keeps only the design-parameter shaping and imports the shared map. Run the existing lib tests (`npx vitest run .storybook/lib`) to prove the refactor is behavior-preserving.

Blocks structure, all with `data-doc-block` on the root:

- `DocHeader` (`data-doc-block="doc-header"`): Title (as h1) with displayName ?? name, StatusPill, group rendered as Text muted, Link to `contract.figma` labeled "Figma" with an Icon, only when figma is a URL.
- `ImportBlock` (`data-doc-block="import"`).
- `UsageSection` (`data-doc-block="usage"`).
- `BestPractices` (`data-doc-block="best-practices"`).
- `AnatomySection` (`data-doc-block="anatomy"`): plain `<table>` styled by module CSS on tokens (font, borders, spacing); Required column renders "Yes"/"No" (the anatomy.required convention note from the Phase 0/1 merge).

- [ ] **Step 4: Tests pass, commit**

Run: `npx vitest run .storybook/blocks .storybook/lib` (all PASS), `npm run typecheck` (0), then:

```bash
git add .storybook && git commit -m "feat(design-system): contract-driven docs blocks (header, import, usage, best practices, anatomy)"
```

---

### Task 3: Data blocks (ThemingSection, A11ySection, RelatedSection)

**Files:**
- Create: `.storybook/blocks/ThemingSection.tsx` + `.module.css`
- Create: `.storybook/blocks/A11ySection.tsx` + `.module.css`
- Create: `.storybook/blocks/RelatedSection.tsx` + `.module.css`
- Test: `.storybook/blocks/data-blocks.test.tsx`

**Interfaces:**
- Consumes: `DtContract` from Task 2.
- Produces:
  - `ThemingSection({ contract })` (`data-doc-block="theming"`): table of CSS custom properties the component consumes. Source order: `contract.theming.vars` if present, else flatten `contract.tokens` (colors, spacing, radii, shadows, zIndex, typography) into rows of (token, category). The spec's build-step grep of `.module.css` against token-catalog.json is explicitly deferred to Phase 4 registry work; contracts already carry the token list and drift is guarded by existing contract checks. Record this scoping in the PR body.
  - `A11ySection({ contract })` (`data-doc-block="a11y"`): definition list from `contract.a11y`: keyboard keys as kbd chips, ariaRequirements as a list, verification badges (forcedColorsVerified, accessibilityTreeVerified, reducedMotion, reviewed with reviewedNote as title attr). Null when contract.a11y is absent.
  - `RelatedSection({ contract, hrefForComponent })` (`data-doc-block="related"`): chip per `composesWith` entry. `hrefForComponent(name)` is injected by the template (Task 4) so the block stays pure; chips render as DT Link when an href resolves, plain Badge text otherwise.

- [ ] **Step 1: Failing tests** in `data-blocks.test.tsx`: ThemingSection with Button contract shows `--color-primary` and `--space-internal-8`; A11ySection shows "Enter" and "aria-busy when loading"; RelatedSection with `hrefForComponent={() => "#x"}` renders 6 links; all three return null on a bare `{ name, status }` contract.

- [ ] **Step 2: Run, FAIL, implement, PASS**

Run: `npx vitest run .storybook/blocks/data-blocks.test.tsx`

- [ ] **Step 3: Commit**

```bash
git add .storybook/blocks && git commit -m "feat(design-system): theming, a11y and related docs blocks"
```

---

### Task 4: Story-context blocks + DtDocsPage template, wired into preview (spike on Button)

This is the integration task; do it against the live Storybook, exemplar-first on Button, before generalizing.

**Files:**
- Create: `.storybook/blocks/ShowcaseStage.tsx` + `.module.css`
- Create: `.storybook/blocks/ExamplesSection.tsx` + `.module.css`
- Create: `.storybook/blocks/PropsSection.tsx` + `.module.css`
- Create: `.storybook/blocks/DtDocsPage.tsx` + `.module.css`
- Create: `.storybook/blocks/index.ts` (barrel exporting all blocks + DtDocsPage)
- Modify: `.storybook/preview.tsx` (register `parameters.docs.page` and `docs.source.transform`)
- Modify: `nextjs-app/shared/components/Button/Button.stories.tsx` (tags + example tagging, see steps)

**Interfaces:**
- Consumes: all Task 1-3 blocks; `getContractByName` + `componentNameFromDocsContext` from `contracts.ts`; `@storybook/addon-docs/blocks` exports (`DocsContext`, `Controls`, `Canvas`/`DocsStory`, `Source`, `Markdown`, `AnchorMdx` as available in SB 10.4; verify exact export names against `node_modules/@storybook/addon-docs/dist/blocks.d.ts` before writing imports and adjust to what actually exists).
- Produces: `DtDocsPage`, the component registered as the global autodocs page. It must render the 11 blocks in spec order and skip gracefully:
  1. DocHeader, 2. ShowcaseStage, 3. ImportBlock, 4. UsageSection, 5. BestPractices, 6. AnatomySection, 7. ExamplesSection, 8. PropsSection, 9. ThemingSection, 10. A11ySection, 11. RelatedSection.

- [ ] **Step 1: Implement ShowcaseStage**

`ShowcaseStage` (`data-doc-block="showcase"`): renders the primary story (first story, our `Default`) full width inside a token-surfaced card: `min-height: clamp(160px, 45vw, 420px)` (spec: 16:9 feel desktop, 160px floor mobile), centered content, `background: var(--main-body-background-color)` inside a bordered rounded stage so theme toolbar switches show through. Wrap the story render in an error boundary class component that renders the error message in a `<pre>` (docs page must never white-screen). Implementation: accept `{ children }` and let DtDocsPage pass the rendered primary story (via `DocsStory`/`Canvas` of the first story, `sourceState="none"`, toolbar off).

- [ ] **Step 2: Implement ExamplesSection**

`ExamplesSection` (`data-doc-block="examples"`): from docs context, `const stories = context.componentStories().filter(s => s.tags?.includes("example") && !["Default","Playground","ForcedColors"].includes(s.name))`. Render each as an ExampleBlock: story name as Title h3, `parameters.docs.description.story` markdown when present, the live story canvas, a collapsible Code section using the `Source` block bound to the story id, and an "Open in canvas" Link to `?path=/story/<storyId>`. If SB 10's exported blocks make per-story `Source`/`Canvas` binding from a template awkward, use the internal `DocsStory` component (it is exported by addon-docs for exactly this composition); the acceptance bar is live render + code toggle + canvas link per tagged story.

- [ ] **Step 3: Implement PropsSection**

`PropsSection` (`data-doc-block="props"`): `Controls` bound to the `Playground` story: resolve `const playground = context.componentStories().find(s => s.name === "Playground")` and render `<Controls of={playground.moduleExport} />`; if `moduleExport` is not exposed on prepared stories in SB 10.4, fall back to `<Controls />` scoped by an `<Anchor storyId={playground.id} />` preceding it, and if that still binds to the primary story, render `<Controls />` bound to primary and log the deviation in the PR body (knobs still work; binding target is a nice-to-have). Required-props-first ordering comes from existing argTypes categories; do not re-sort in Phase 2.

- [ ] **Step 4: Compose DtDocsPage and register it**

`DtDocsPage`: reads docs context via `useContext(DocsContext)`, derives the component name with `componentNameFromDocsContext`, looks up the contract with `getContractByName`. When no contract resolves, render the Storybook default autodocs composition (Title, Subtitle, Description, Primary, Controls, Stories from addon-docs blocks) so non-contract stories (patterns, site blocks, foundations) keep working docs. `hrefForComponent(name)` maps a composesWith name to `?path=/docs/<current-group-prefix>` by looking up that component's story id from `context.storyIdByName`? No: compute from the target contract's current story title via a static map built in `contracts.ts` from `import.meta.glob` on `*.stories.tsx` being unavailable; instead resolve lazily: href = `/?path=/docs/${storyIdFromTitle(titleByComponentName(name))}` where `titleByComponentName` is a small exported map in `contracts.ts` seeded for the 8 platinum components in PR A (`Atoms/Button` etc.) and regenerated to category titles in PR B. Chips for unmapped names render as plain Badge (RelatedSection already handles that).

In `preview.tsx`:

```tsx
import { DtDocsPage } from "./blocks";
// inside preview.parameters:
docs: {
  page: DtDocsPage,
  source: { transform: dtSourceTransform },
},
```

`dtSourceTransform(code: string)` in `.storybook/blocks/sourceTransform.ts` (pure, unit-testable): replaces `<Label tKey="<k>" />` with the English translation string for `<k>` (import `en/translation.json`), strips `{...args}`-only template wrappers of the exact form `(args) => <X {...args} />`, and dedents. Add `.storybook/blocks/sourceTransform.test.ts` with those three cases before implementing (TDD).

- [ ] **Step 5: Enable autodocs on Button and tag examples**

In `Button.stories.tsx` meta: `tags: ["beta", "!autodocs"]` becomes `tags: ["beta", "autodocs"]` (leave the `beta` tag; PR B reconciles status tags). Tag the curated gallery stories with `tags: ["example"]` and one-line `parameters: { docs: { description: { story: "..." } } }`: Tones, DestructiveActions, Sizes, IconLeft, IconRight, IconOnly, States, AsyncAction, LongLabel, Surfaces, AsLink. Keep Secondary/Tertiary/Loading untagged (redundant with States).

- [ ] **Step 6: Verify live on Button (the spike gate)**

Start Storybook via preview tooling (`.claude/launch.json` storybook config, port 6010), open `/?path=/docs/atoms-button--docs`, and verify: all 11 `data-doc-block` roots present, showcase renders Button, knobs edit args, examples show live canvases with code toggles, theme toolbar flips the docs page surfaces, no console errors. Fix until clean; this step is expected to surface blocks-API adjustments, do them here.

- [ ] **Step 7: Tests + commit**

Run: `npx vitest run .storybook`, `npm run typecheck`, `npm run lint` (all 0), then:

```bash
git add .storybook nextjs-app/shared/components/Button
git commit -m "feat(design-system): DtDocsPage autodocs template proven on Button"
```

---

### Task 5: Roll the frame out to the remaining 7 platinum components

**Files:**
- Modify: `nextjs-app/shared/components/{Badge,Icon,Text,Title,Link,Label,Card}/<Name>.stories.tsx`
- Modify: `.storybook/lib/contracts.ts` (complete the 8-entry `titleByComponentName` map)

**Interfaces:**
- Consumes: DtDocsPage (global, no per-story wiring needed beyond tags).
- Produces: 8 components with `autodocs` enabled and example-tagged stories.

- [ ] **Step 1: Per component (7 iterations, one commit each or one batch commit at the end):** flip `"!autodocs"` to `"autodocs"` in meta tags (add `"autodocs"` if no autodocs tag exists), tag 3+ representative existing stories `["example"]` with one-line story descriptions, confirm a `Playground` story exists (all 8 have one via requiredStories). Do not author new prose beyond the one-liners; deep content is Phase 3.

- [ ] **Step 2: Live-verify each docs page** (8 URLs, same checklist as Task 4 step 6; contracts differ in richness, so this also proves graceful degradation: Title has no playground defaults, Card is a molecule with subParts).

- [ ] **Step 3: Commit**

```bash
git add nextjs-app/shared/components .storybook/lib/contracts.ts
git commit -m "feat(design-system): autodocs frame enabled for the 8 platinum components"
```

---

### Task 6: Docs-page smoke gate

**Files:**
- Create: `scripts/design-system/docs-smoke.mjs`
- Modify: `package.json` (script `test:docs-smoke`)

**Interfaces:**
- Consumes: built or dev Storybook; the `data-doc-block` attributes.
- Produces: `npm run test:docs-smoke` exits non-zero if any proven component's docs page misses a required block.

- [ ] **Step 1: Implement** `docs-smoke.mjs`: Playwright (already a dependency) launches chromium, serves `storybook-static/` if present else targets `TARGET_URL` (default `http://localhost:6010`), and for each name in a `PROVEN` list (the 8 platinum components, with their docs ids derived from a title map kept in this script) visits `iframe.html?viewMode=docs&id=<id>`, waits for `[data-doc-block="doc-header"]`, then asserts the full set of 11 `data-doc-block` values is present, except entries listed in a per-component `allowMissing` map (seed: `Title: ["props-playground-binding-none"]` style exceptions only if live verification in Task 5 justified them; target is empty). Print a per-component pass/fail table.

- [ ] **Step 2: Wire and run**

`package.json`: `"test:docs-smoke": "node scripts/design-system/docs-smoke.mjs"`. Run against the dev server: PASS 8/8.

- [ ] **Step 3: Commit**

```bash
git add scripts/design-system/docs-smoke.mjs package.json
git commit -m "test(design-system): docs-page smoke gate for the platinum docs frame"
```

---

### Task 7: PR A gate and merge

- [ ] **Step 1: Full local gate**

Run: `npm run typecheck && npm run lint && npm test && npm run build` (all 0), `npm run storybook:build` (0), `npm run test:docs-smoke` against the static build (0), `npm run validate:components` (0).

- [ ] **Step 2: Check open PRs touching the same files**

Run: `gh pr list` and inspect for overlaps with `.storybook/` or the 8 component dirs.

- [ ] **Step 3: PR + merge**

```bash
git push -u origin DT-XXX-astryx-phase2-docs-frame
gh pr create --title "feat(design-system): Astryx phase 2 PR A, custom docs frame proven on platinum components" --body "<summary, deviations 1-3 from plan header, smoke output>"
gh pr merge --admin --squash
```

---

## PR B: manager chrome, sidebar regroup, landing gallery

### Task 8: Manager theme + manager-head CSS

**Files:**
- Modify: `.storybook/manager.ts`
- Modify: `.storybook/manager-head.html` (currently empty)

**Interfaces:**
- Produces: DT-branded manager. Theme via `create()` from `storybook/theming`: keep `base: "dark"`, set `fontBase` to the Satoshi stack (`"Satoshi", ...` matching `preview-head.html`'s font-family declaration; also add `@font-face` for Satoshi in `manager-head.html` pointing at the same `/fonts/...` files `preview-head.html` uses, since the manager does not load preview-head), `colorPrimary`/`colorSecondary`/`barSelectedColor`/`appBg`/`appContentBg`/`barBg`/`textColor`/`inputBg` etc. copied as hex from `variables.css` dark theme values with token names in comments. `manager-head.html` CSS covers what the theme API cannot: sidebar item density (tighter line-height/padding), group header letter-spacing + smallcaps treatment, and the status-dot styles for Task 9 (classes `.dt-status-dot`, `.dt-status-dot--stable|beta|alpha|deprecated`: solid, hollow (border only), muted, struck).

- [ ] **Step 1: Branch off fresh main** (after PR A merged): `git checkout main && git pull && git checkout -b DT-XXX-astryx-phase2-manager-chrome`

- [ ] **Step 2: Implement theme + CSS, verify live** (manager reload required; check sidebar, toolbar, panel chrome in the browser, confirm Satoshi renders and contrast is sane in both the manager dark chrome and docs light content).

- [ ] **Step 3: Commit**

```bash
git add .storybook/manager.ts .storybook/manager-head.html
git commit -m "feat(design-system): DT manager theme (Satoshi + tokens) and sidebar chrome CSS"
```

---

### Task 9: Status dots via sidebar.renderLabel + status-tag reconciliation

**Files:**
- Modify: `.storybook/manager.ts` (`addons.setConfig({ sidebar: { renderLabel } })`)
- Modify: the 8 platinum `*.stories.tsx` metas (status tags)

**Interfaces:**
- Consumes: story index item tags in the manager (`item.tags` on component/docs entries).
- Produces: component sidebar entries append a status dot span; status source is the meta tag (`stable`/`beta`/`alpha`/`deprecated`).

- [ ] **Step 1: Grep tag consumers before retagging**

Run: `grep -rn '"beta"\|"alpha"\|"stable"' scripts .storybook --include="*.mjs" --include="*.ts" | grep -v node_modules | grep -iv "beta-matrix"` and read hits. Decide per consumer whether the component-level `beta` tag is load-bearing (the `beta-matrix` STORY tag is, and is untouched). Record findings in the commit body.

- [ ] **Step 2: Reconcile the 8 platinum metas** to `tags: ["<contract.status>", "autodocs"]` (Button: `stable`). If step 1 found a consumer that requires the old `beta` component tag, keep both tags and note it.

- [ ] **Step 3: Implement renderLabel**

```ts
sidebar: {
  renderLabel: (item) => {
    if (item.type !== "component" && item.type !== "docs") return item.name;
    const tags: string[] = (item as { tags?: string[] }).tags ?? [];
    const status = ["stable", "beta", "alpha", "deprecated"].find((s) => tags.includes(s));
    if (!status) return item.name;
    return React.createElement("span", { className: "dt-sidebar-label" },
      item.name,
      React.createElement("span", { className: `dt-status-dot dt-status-dot--${status}`, "aria-hidden": "true" }));
  },
},
```

(manager.ts becomes `.tsx` if JSX is preferred; `React.createElement` avoids the rename. Verify `item.tags` exists in SB 10.4's HashEntry; if not, fall back to a name-keyed map imported from a small generated JSON of contract statuses, generated inline in manager.ts via import of the 8 contracts.)

- [ ] **Step 4: Verify live, commit**

```bash
git add .storybook nextjs-app/shared/components
git commit -m "feat(design-system): sidebar status dots driven by component status tags"
```

---

### Task 10: Sidebar regroup (retitle sweep)

**Files:**
- Modify: every `*.stories.tsx` under `nextjs-app/shared/components/` (title only)
- Modify: `.storybook/preview.tsx` (storySort order)
- Modify: `.storybook/lib/contracts.ts` (`titleByComponentName` regenerated to new titles)
- Modify: `scripts/design-system/docs-smoke.mjs` (id map)

**Interfaces:**
- Produces: titles per mapping: DOC_TIER_1 members get `<Category>/<Name>` with Category from `doc-tiers.mjs` groups renamed for the sidebar: Actions, Content (the "Typography & content" group), Forms, Feedback (the "Feedback & status" group), Navigation, Layout (the "Layout & structure" group). Non-Tier-1 component stories get `Site/<Name>`. Patterns, Templates, Foundations, Docs, Overview, Testing titles unchanged.

- [ ] **Step 1: Generate the mapping** with a throwaway node script that reads `DOC_TIER_1` from `doc-tiers.mjs` (write the category association inline in the script from the doc-tiers source layout) and prints old-title to new-title pairs by scanning `title: "` lines in component stories. Review the printed table by hand before applying (multi-story components like Card have several story files; ALL retitle to the same `Layout/Card` prefix with their existing sub-path preserved, e.g. `Molecules/Card/Playground` style sub-titles if any exist).

- [ ] **Step 2: Apply with sed per mapping row**, then update `storySort` order in preview.tsx to: Overview, Docs, Foundations, Actions, Content, Forms, Feedback, Navigation, Layout, Site, Patterns, Templates, Testing (keep the existing Foundations sub-order block).

- [ ] **Step 3: Typecheck + storybook boots + index sanity**

Run: `npm run typecheck`; boot Storybook; verify the sidebar shows the new groups, no orphan `Atoms/`/`Molecules/`/`Organisms/` entries remain for component stories (`grep -rn 'title: "Atoms/\|title: "Molecules/\|title: "Organisms/' nextjs-app/shared/components --include="*.stories.tsx"` returns nothing).

- [ ] **Step 4: Commit** (title sweep only, no baselines yet):

```bash
git add nextjs-app/shared/components .storybook scripts/design-system/docs-smoke.mjs
git commit -m "refactor(design-system): sidebar regrouped to Astryx category taxonomy"
```

---

### Task 11: Re-key story-id-derived baselines

**Files:**
- Modify/rename: `__a11y-snapshots__/*.yaml` across retitled components (via `scripts/design-system/relocate-a11y-snapshots.mjs`)
- Modify/rename: story-id-keyed visual baselines under `__visual__/` and any `*-baseline.png` naming
- Modify: farm CI axe baseline file (locate via `grep -rn "baseline" .github/workflows/ scripts/ tests/ --include="*.yml" --include="*.mjs" -l`, then re-key entries whose story ids changed)

- [ ] **Step 1: Read `relocate-a11y-snapshots.mjs` usage header and run it** with the old-to-new title mapping from Task 10 step 1. Verify with `git status` that YAMLs moved rather than being orphaned; `find nextjs-app -name "atoms-*--*.yaml" | head` should show only files whose components kept an Atoms title (expected: none under components/).

- [ ] **Step 2: Visual + axe baselines:** rename story-id-keyed PNGs per the same map; re-key the farm axe baseline entries. Where a rename map is ambiguous, delete the stale baseline and regenerate: `npm run test:stories:smoke` and the a11y bootstrap (`npm run a11y-snapshot:bootstrap`) for affected components.

- [ ] **Step 3: Prove the runner agrees:** run `npm run test:stories:smoke` (0) and a targeted test-runner pass on two retitled components (one Tier 1, one Site/) with a11y snapshots required; expect zero "missing baseline" errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore(design-system): re-key a11y/visual/axe baselines after sidebar regroup"
```

---

### Task 12: Landing gallery (Overview/Components)

**Files:**
- Create: `.storybook/blocks/ComponentsGallery.tsx` + `.module.css`
- Create: `nextjs-app/shared/foundations/components-gallery.mdx`
- Test: `.storybook/blocks/ComponentsGallery.test.tsx`

**Interfaces:**
- Consumes: contract map from `contracts.ts`, `DOC_TIER_1` + `docTierFor` from `scripts/design-system/doc-tiers.mjs`, `resolveValue` from `resolveElements.tsx`, `StatusPill`, new title map (Task 10).
- Produces: `<ComponentsGallery />` rendering one card per DOC_TIER_1 component grouped by category: name, `dense` one-liner (fallback: `description`), StatusPill, link to `?path=/docs/<id>`; mini live preview rendered from `playground.defaults` through `resolveValue` inside a non-interactive (`pointer-events: none`, `aria-hidden`) stage when defaults exist, a typographic monogram tile otherwise. The mdx is one `<Meta title="Overview/Components" />` plus the block.

- [ ] **Step 1: Failing test:** ComponentsGallery renders one card per DOC_TIER_1 entry (assert `cards.length === DOC_TIER_1.length`), the Button card links to the `actions-button--docs` id, and a component without playground defaults gets the monogram tile.
- [ ] **Step 2: Implement, verify live** (gallery loads under Overview, cards navigate, no console errors, acceptable initial render time; if live minis are heavy, cap live previews to contracts with defaults, which is already the design).
- [ ] **Step 3: Run** `npx vitest run .storybook/blocks/ComponentsGallery.test.tsx` (PASS).
- [ ] **Step 4: Commit**

```bash
git add .storybook/blocks nextjs-app/shared/foundations/components-gallery.mdx
git commit -m "feat(design-system): Overview/Components landing gallery"
```

---

### Task 13: PR B gate and merge

- [ ] **Step 1: Full gate:** `npm run typecheck && npm run lint && npm test && npm run build`, `npm run storybook:build`, `npm run test:docs-smoke` (ids updated in Task 10), `npm run validate:components`, `npm run test:stories:smoke`, all 0.
- [ ] **Step 2:** `gh pr list` overlap check.
- [ ] **Step 3: PR + merge:**

```bash
git push -u origin DT-XXX-astryx-phase2-manager-chrome
gh pr create --title "feat(design-system): Astryx phase 2 PR B, manager chrome, category sidebar, landing gallery" --body "<summary, tag-consumer findings, baseline re-key notes>"
gh pr merge --admin --squash
```

- [ ] **Step 4: Post-merge:** update `project_astryx_roadmap` memory (Phase 2 done, deviations, next = Phase 3 content sweep) and capture durable gotchas to the LLM wiki per repo CLAUDE.md.
