# Card header/footer slots — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four symmetric, optional slots (`headerStart`/`headerEnd`/`footerStart`/`footerEnd`) to the stable Card so it can render the pictured action card (title, badge, contextual menu, body, destructive action, 1–2 buttons) without breaking the existing minimal API.

**Architecture:** Additive optional `ReactNode` props on the existing `Card` function component. Header and footer become two-region flex rows; Card supplies positions, consumers compose styled primitives (Badge/Menu/Button). `title`/`description` stay as conveniences (`headerStart` defaults to the title block); `extra` becomes a soft-deprecated alias for `headerEnd`. `link` and the action footer are mutually exclusive.

**Tech Stack:** React 19 + TypeScript, CSS Modules, Storybook 10 (test-runner AT snapshots), Vitest + Testing Library + jest-axe, the DT design-system contract/validate/controls toolchain.

## Global Constraints

- CSS Modules only; design tokens from `nextjs-app/shared/styles/variables.css` (`--space-internal-*`). No hardcoded colors, no inline styles.
- Card is **stable** — every change is additive and backward-compatible; existing stories must render identically (their AT snapshots must not move).
- All new props optional, typed `React.ReactNode`.
- Spec: `docs/superpowers/specs/2026-07-05-card-header-footer-slots-design.md`.
- Verify against the running Storybook on `http://127.0.0.1:6010` (attach; do not boot a second instance).
- Pre-PR gate (all exit 0): `npm run validate:components && npm run check:contract-props && npm run check:consumers && npm run typecheck && npm run lint && npm run lint:css && npm test && npm run build`, plus `npm run audit:controls --only Card --effects` (100% / 0 inert) and 4-mode AT compare.

---

### Task 1: Header two-region model (`headerStart` / `headerEnd` + `extra` alias)

**Files:**
- Modify: `nextjs-app/shared/components/Card/Card.tsx`
- Modify: `nextjs-app/shared/components/Card/Card.module.css`
- Test: `nextjs-app/shared/components/Card/Card.test.tsx`

**Interfaces:**
- Produces: `CardProps.headerStart?: React.ReactNode`, `CardProps.headerEnd?: React.ReactNode`; `extra` becomes `@deprecated` alias. Header renders `headerStart ?? titleBlock` in `.headerStart` and `headerEnd ?? extra` in `.headerEnd`.

- [ ] **Step 1: Write the failing tests** — append to `Card.test.tsx` inside the `describe("Card", …)` block:

```tsx
  it("defaults the header-start region to the title heading", () => {
    render(<Card title="Card title" />);
    expect(
      screen.getByRole("heading", { name: "Card title" }),
    ).toBeInTheDocument();
  });

  it("renders custom headerStart instead of the title block", () => {
    render(<Card headerStart={<span>Custom lead</span>} title="Ignored" />);
    expect(screen.getByText("Custom lead")).toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
  });

  it("renders headerEnd content in the trailing region", () => {
    const { container } = render(
      <Card title="T" headerEnd={<span>badge-slot</span>} />,
    );
    expect(screen.getByText("badge-slot")).toBeInTheDocument();
    expect(container.querySelector('[class*="headerEnd"]')).toBeTruthy();
  });

  it("keeps the deprecated extra prop working as a headerEnd alias", () => {
    render(<Card title="T" extra={<span>legacy-extra</span>} />);
    expect(screen.getByText("legacy-extra")).toBeInTheDocument();
  });

  it("prefers headerEnd over extra when both are set", () => {
    render(
      <Card title="T" headerEnd={<span>new-end</span>} extra={<span>old-extra</span>} />,
    );
    expect(screen.getByText("new-end")).toBeInTheDocument();
    expect(screen.queryByText("old-extra")).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run Card.test --root .`
Expected: the 5 new tests FAIL (`headerStart`/`headerEnd` not rendered; `getByText("Custom lead")` not found).

- [ ] **Step 3: Add the props to `CardProps`** — in `Card.tsx`, inside the `CardProps` interface, replace the current `extra` line:

```tsx
  /** Right-aligned slot in the header row (badge, timestamp, action) */
  extra?: React.ReactNode;
```

with:

```tsx
  /** Leading header region. Defaults to the `title` heading block when omitted. */
  headerStart?: React.ReactNode;
  /** Trailing header region (badge, metadata, menu). Canonical replacement for `extra`. */
  headerEnd?: React.ReactNode;
  /** @deprecated Use `headerEnd`. Legacy alias feeding the trailing header region. */
  extra?: React.ReactNode;
```

- [ ] **Step 4: Destructure and resolve the regions** — in the `Card` component signature, add `headerStart`, `headerEnd` alongside `extra`:

```tsx
  title,
  titleProps = {},
  description,
  descriptionProps = {},
  headerStart,
  headerEnd,
  extra,
```

Then replace the current header-computation lines:

```tsx
  const hasHeader = Boolean(title || extra);
  const titleLevel = titleProps.level ?? 3;
```

with (note `titleNode` stays defined below it — keep the existing `titleNode` block, then compute the resolved regions after it):

```tsx
  const titleLevel = titleProps.level ?? 3;
```

- [ ] **Step 5: Compute resolved regions after `titleNode`** — immediately after the existing `const titleNode = title ? (…) : null;` block, add:

```tsx
  const leadingHeader = headerStart ?? titleNode;
  const trailingHeader = headerEnd ?? extra;
  const hasHeader = Boolean(leadingHeader || trailingHeader);
```

- [ ] **Step 6: Rewrite the header JSX** — replace the current header block:

```tsx
          {hasHeader && (
            <div className={styles.header}>
              {titleNode}
              {extra && <div className={styles.extra}>{extra}</div>}
            </div>
          )}
```

with:

```tsx
          {hasHeader && (
            <div className={styles.header}>
              {leadingHeader && (
                <div className={styles.headerStart}>{leadingHeader}</div>
              )}
              {trailingHeader && (
                <div className={styles.headerEnd}>{trailingHeader}</div>
              )}
            </div>
          )}
```

- [ ] **Step 7: Update the CSS** — in `Card.module.css`, replace the `.extra` block:

```css
.extra {
  flex-shrink: 0;
}
```

with:

```css
.headerStart {
  flex: 1 1 auto;
  min-width: 0;
}

.headerEnd {
  display: flex;
  align-items: center;
  gap: var(--space-internal-8);
  flex-shrink: 0;
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run Card.test --root .`
Expected: all Card tests PASS (existing + 5 new).

- [ ] **Step 9: Commit**

```bash
git add nextjs-app/shared/components/Card/Card.tsx nextjs-app/shared/components/Card/Card.module.css nextjs-app/shared/components/Card/Card.test.tsx
git commit -m "feat(design-system): Card headerStart/headerEnd slots (extra alias)"
```

---

### Task 2: Footer two-region model (`footerStart` / `footerEnd`)

**Files:**
- Modify: `nextjs-app/shared/components/Card/Card.tsx`
- Modify: `nextjs-app/shared/components/Card/Card.module.css`
- Test: `nextjs-app/shared/components/Card/Card.test.tsx`

**Interfaces:**
- Consumes: the header model from Task 1.
- Produces: `CardProps.footerStart?: React.ReactNode`, `CardProps.footerEnd?: React.ReactNode`. Footer renders when `footerStart || footerEnd`; `.footerEnd` is right-aligned via `margin-inline-start: auto`.

- [ ] **Step 1: Write the failing tests** — append to `Card.test.tsx`:

```tsx
  it("renders footerStart and footerEnd regions", () => {
    const { container } = render(
      <Card
        title="T"
        footerStart={<button type="button">Destroy</button>}
        footerEnd={<button type="button">Yes</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Destroy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(container.querySelector('[class*="footerStart"]')).toBeTruthy();
    expect(container.querySelector('[class*="footerEnd"]')).toBeTruthy();
  });

  it("renders no footer when neither footer slot is set", () => {
    const { container } = render(<Card title="T">body</Card>);
    expect(container.querySelector('[class*="footer"]')).toBeNull();
  });

  it("renders footerEnd alone (buttons-only footer)", () => {
    const { container } = render(
      <Card title="T" footerEnd={<button type="button">Only</button>} />,
    );
    expect(container.querySelector('[class*="footerEnd"]')).toBeTruthy();
    expect(container.querySelector('[class*="footerStart"]')).toBeNull();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run Card.test --root .`
Expected: the 3 new tests FAIL (no footer rendered).

- [ ] **Step 3: Add the footer props to `CardProps`** — in `Card.tsx`, directly after the `extra?` line added in Task 1:

```tsx
  /** Leading footer region — the special/destructive action, pinned left. */
  footerStart?: React.ReactNode;
  /** Trailing footer region — 1–2 action buttons, pinned right. */
  footerEnd?: React.ReactNode;
```

- [ ] **Step 4: Destructure and compute `hasFooter`** — add `footerStart`, `footerEnd` to the destructure (after `extra`), and after the `hasHeader` line add:

```tsx
  const hasFooter = Boolean(footerStart || footerEnd);
```

- [ ] **Step 5: Render the footer** — in the JSX, immediately after `{children}` and before the link-overlay line (`{link && !title && …}`), add:

```tsx
          {hasFooter && (
            <div className={styles.footer}>
              {footerStart && (
                <div className={styles.footerStart}>{footerStart}</div>
              )}
              {footerEnd && (
                <div className={styles.footerEnd}>{footerEnd}</div>
              )}
            </div>
          )}
```

- [ ] **Step 6: Add the footer CSS** — append to `Card.module.css`:

```css
/* Footer row: special/destructive action left, action buttons right */

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-internal-8);
  margin-block-start: var(--space-internal-16);
}

.footerStart {
  display: flex;
  align-items: center;
  gap: var(--space-internal-8);
}

.footerEnd {
  display: flex;
  align-items: center;
  gap: var(--space-internal-8);
  margin-inline-start: auto;
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run Card.test --root .`
Expected: all Card tests PASS.

- [ ] **Step 8: Commit**

```bash
git add nextjs-app/shared/components/Card/Card.tsx nextjs-app/shared/components/Card/Card.module.css nextjs-app/shared/components/Card/Card.test.tsx
git commit -m "feat(design-system): Card footerStart/footerEnd action row"
```

---

### Task 3: `link` × action-footer mutual-exclusion guard

**Files:**
- Modify: `nextjs-app/shared/components/Card/Card.tsx`
- Test: `nextjs-app/shared/components/Card/Card.test.tsx`

**Interfaces:**
- Consumes: `hasFooter` (Task 2), the existing `link`/`titleNode`/link-overlay logic.
- Produces: `effectiveLink` — `undefined` when `link` is set together with a footer slot; a dev `console.warn` fires in that case.

- [ ] **Step 1: Write the failing tests** — append to `Card.test.tsx`:

```tsx
  it("suppresses the stretched link and warns when a footer slot is present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Card
        title="T"
        link="/somewhere"
        footerEnd={<button type="button">Go</button>}
      />,
    );
    // Title is plain text, not a link.
    expect(screen.queryByRole("link")).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("`link` is ignored"),
    );
    warn.mockRestore();
  });

  it("still renders the stretched link when there is no footer", () => {
    render(<Card title="T" link="/somewhere" />);
    expect(screen.getByRole("link", { name: "T" })).toHaveAttribute(
      "href",
      "/somewhere",
    );
  });
```

Add `vi` to the vitest import at the top of `Card.test.tsx` (change `import { describe, expect, it } from "vitest";` to include `vi`):

```tsx
import { describe, expect, it, vi } from "vitest";
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run Card.test --root .`
Expected: the "suppresses" test FAILS (the title still renders a link; no warn).

- [ ] **Step 3: Compute `effectiveLink`** — in `Card.tsx`, immediately after the `const hasFooter = …` line, add:

```tsx
  // A stretched anchor cannot wrap interactive footer controls, so link mode
  // and the action footer are mutually exclusive (documented forbiddenUse).
  const linkSuppressed = Boolean(link) && hasFooter;
  if (process.env.NODE_ENV !== "production" && linkSuppressed) {
    console.warn(
      "Card: `link` is ignored when `footerStart`/`footerEnd` are set — a stretched anchor cannot wrap interactive footer controls. Use a plain card with buttons instead.",
    );
  }
  const effectiveLink = linkSuppressed ? undefined : link;
```

- [ ] **Step 4: Route link usage through `effectiveLink`** — replace all three `link` references in the render with `effectiveLink`:
  1. In `titleNode`, the anchor condition `{link ? (` → `{effectiveLink ? (`, and `href={link}` → `href={effectiveLink}`.
  2. In the `<Tag>` className array, `link ? styles.linked : ""` → `effectiveLink ? styles.linked : ""`.
  3. The link-overlay line `{link && !title && (<a href={link} …/>)}` → `{effectiveLink && !title && (<a href={effectiveLink} …/>)}` (also `aria-label={linkLabel ?? link}` → `aria-label={linkLabel ?? effectiveLink}`).

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run Card.test --root .`
Expected: all Card tests PASS.

- [ ] **Step 6: Commit**

```bash
git add nextjs-app/shared/components/Card/Card.tsx nextjs-app/shared/components/Card/Card.test.tsx
git commit -m "feat(design-system): Card link is mutually exclusive with the action footer"
```

---

### Task 4: Contract, `ActionCard` story, and Controls operability

**Files:**
- Modify: `nextjs-app/shared/components/Card/Card.contract.json`
- Modify: `nextjs-app/shared/components/Card/Card.stories.tsx`

**Interfaces:**
- Consumes: the props from Tasks 1–3.
- Produces: contract props for the four slots; `slots` array includes them; a new `ActionCard` story exercising header + footer; mapped-preset `argTypes` keeping all Card controls operable.

- [ ] **Step 1: Add the four props to the contract** — in `Card.contract.json`, inside `"props"`, after the existing `"extra"` entry add:

```json
        "headerStart": {
            "optional": true,
            "type": "React.ReactNode"
        },
        "headerEnd": {
            "optional": true,
            "type": "React.ReactNode"
        },
        "footerStart": {
            "optional": true,
            "type": "React.ReactNode"
        },
        "footerEnd": {
            "optional": true,
            "type": "React.ReactNode"
        },
```

- [ ] **Step 2: Update the `slots` array** — change `"slots": ["extra"],` to:

```json
    "slots": [
        "headerStart",
        "headerEnd",
        "footerStart",
        "footerEnd",
        "extra"
    ],
```

- [ ] **Step 3: Extend anatomy and usage** — in `usage.anatomy`, replace the "Header row" entry's description and add a Footer entry after "Body":

Replace the `"Header row"` object's `description` with:
```json
                "description": "Two regions: headerStart (leading — the title heading by default, or custom content) and headerEnd (trailing — badge/metadata/menu), right-aligned."
```

Add after the "Body" anatomy object:
```json
            {
                "name": "Footer row",
                "required": false,
                "description": "Renders when footerStart or footerEnd is set: footerStart (special/destructive action) left, footerEnd (1–2 action buttons) right; wraps on narrow cards. No divider."
            },
```

Add to `usage.bestPractices` (append two guidance entries):
```json
            {
                "guidance": true,
                "description": "Put the destructive/special action in footerStart and the confirm/cancel buttons in footerEnd; footerEnd hugs the right even when footerStart is empty."
            },
            {
                "guidance": true,
                "description": "When you replace the title with custom headerStart content, keep a real heading inside it so the document outline stays honest."
            }
```

Add to `usage.forbiddenUse` (append one entry) — this maps to the existing `forbiddenUse` array in the contract usage block:
```json
            {
                "guidance": false,
                "description": "Do not combine link mode with the action footer or an interactive menu — a stretched anchor cannot wrap buttons; Card drops the link and warns in dev."
            }
```

- [ ] **Step 4: Add the `ActionCard` story** — in `Card.stories.tsx`, add the Menu + Icon imports at the top (after the existing `import Text from "@dt/Text";`):

```tsx
import Icon from "@dt/Icon";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@dt/Menu";
```

Then add this story at the end of the file:

```tsx
/** The action card: title + info Badge + overflow Menu in the header, body copy,
 *  and a footer with a destructive action left of the confirm/cancel buttons. */
export const ActionCard: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Header regions carry the badge and the overflow menu; the footer pins a destructive action left and the confirm/cancel buttons right.",
      },
    },
  },
  render: () => (
    <Card
      title="Card title"
      headerEnd={
        <>
          <Badge tone="info" size="sm" icon={<Icon name="info" ariaLabel="" size="sm" />}>
            Badge
          </Badge>
          <Menu>
            <MenuTrigger asChild>
              <Button
                variant="tertiary"
                icon={<Icon name="dots-three-vertical" ariaLabel="More options" />}
              />
            </MenuTrigger>
            <MenuContent>
              <MenuItem onSelect={() => {}}>Edit</MenuItem>
              <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
              <MenuSeparator />
              <MenuItem onSelect={() => {}}>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </>
      }
      description="Supporting copy that explains the card's content in a sentence or two."
      footerStart={
        <Button
          variant="primary"
          tone="error"
          icon={<Icon name="x-circle" ariaLabel="" />}
        >
          Destructive
        </Button>
      }
      footerEnd={
        <>
          <Button variant="secondary">No</Button>
          <Button variant="primary">Yes</Button>
        </>
      }
    />
  ),
};
```

- [ ] **Step 5: Add mapped-preset argTypes for the four slots** — in the `meta.argTypes` object (next to the existing `extra` entry), add operable presets so `audit:controls` stays 100%:

```tsx
    headerStart: {
      control: { type: "select" },
      options: ["default", "customLead"],
      mapping: {
        default: undefined,
        customLead: <Text as="span">Custom lead</Text>,
      },
      description:
        "Leading header region (defaults to the title heading). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    headerEnd: {
      control: { type: "select" },
      options: ["none", "badgeAndMenu"],
      mapping: {
        none: undefined,
        badgeAndMenu: (
          <>
            <Badge tone="info" size="sm">
              Badge
            </Badge>
          </>
        ),
      },
      description:
        "Trailing header region (badge, metadata, menu). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    footerStart: {
      control: { type: "select" },
      options: ["none", "destructive"],
      mapping: {
        none: undefined,
        destructive: (
          <Button variant="primary" tone="error">
            Destructive
          </Button>
        ),
      },
      description:
        "Leading footer region — the special/destructive action. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
    footerEnd: {
      control: { type: "select" },
      options: ["none", "confirmCancel"],
      mapping: {
        none: undefined,
        confirmCancel: (
          <>
            <Button variant="secondary">No</Button>
            <Button variant="primary">Yes</Button>
          </>
        ),
      },
      description:
        "Trailing footer region — 1–2 action buttons. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
```

- [ ] **Step 6: Regenerate artifacts and validate the contract**

Run: `npm run build:tokens && npm run build:zod-catalog && npm run validate:components && npm run check:contract-props`
Expected: `✓ All component contracts valid.` and `✓ Beta/stable contract props and semantic fields match agent blocks`. If `check:contract-props` reports the four new props as stale/missing, confirm they are declared on the `CardProps` interface (Task 1/2) and re-run `build:tokens`.

- [ ] **Step 7: Verify Controls operability (Storybook must be running on 6010)**

Run: `node scripts/design-system/audit-controls.mjs --only Card --effects`
Expected: `CONTROLS_OPERABLE_PCT=100` and `CONTROLS_INERT_PROPS=0`. If a new slot reads inert, confirm its preset actually changes the canvas (mapped select renders visibly).

- [ ] **Step 8: Commit**

```bash
git add nextjs-app/shared/components/Card/Card.contract.json nextjs-app/shared/components/Card/Card.stories.tsx nextjs-app/shared/foundations/dist/docs-registry.json
git commit -m "feat(design-system): Card action-card story + contract slots + controls presets"
```

---

### Task 5: AT snapshots, stable re-verify, gates, and PR

**Files:**
- Create: `nextjs-app/shared/components/Card/__a11y-snapshots__/layout-card--action-card.yaml`
- Modify: `nextjs-app/shared/lib/design-system-mcp/__snapshots__/docs-registry.test.ts.snap` (if the per-stable shape changed)

**Interfaces:**
- Consumes: everything from Tasks 1–4.
- Produces: a committed AT snapshot for `ActionCard`; a green stable gate.

- [ ] **Step 1: Confirm existing snapshots did not move** — with Storybook running on 6010:

Run: `DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 --testTimeout=60000 "Card/Card.stories"`
Expected: all Card stories PASS in compare mode (existing snapshots unchanged — proves the header restructure is a11y-invisible).

- [ ] **Step 2: Bootstrap the ActionCard snapshot (plain) + verify axe in all 4 modes**

Run (twice, to clear the first-run HMR self-poison):
```bash
DT_UPDATE_A11Y_SNAPSHOTS=1 DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 --testTimeout=60000 "Card/Card.stories"
```
Then axe in each themed mode (compare, no update):
```bash
DT_THEME=light DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 --testTimeout=60000 "Card/Card.stories"
DT_THEME=dark DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 --testTimeout=60000 "Card/Card.stories"
DT_FORCED_COLORS=active DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 --testTimeout=60000 "Card/Card.stories"
```
Expected: all PASS; a new `layout-card--action-card.yaml` exists and is non-empty. `git status` should show only the new ActionCard snapshot added (existing snapshots unchanged).

- [ ] **Step 3: Screenshot ActionCard in light + dark** — write `./_shot.mjs` at the repo root (Playwright only resolves from repo node_modules), run it, read both PNGs, delete the script:

```js
import { chromium } from 'playwright';
const OUT = process.env.SCR;
const b = await chromium.launch();
for (const theme of ['light','dark']) {
  const p = await b.newPage({ viewport: { width: 940, height: 560 } });
  await p.goto(`http://127.0.0.1:6010/iframe.html?id=layout-card--action-card&globals=theme:${theme}&viewMode=story`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/card-action-${theme}.png` });
}
await b.close();
```
Expected: the card matches the mock (title + info badge + three-dot menu in the header; destructive left, No/Yes right) and reads correctly in dark. If the menu floats high against the title, switch `.header { align-items: flex-start }` to `center` in `Card.module.css` and re-verify.

- [ ] **Step 4: Update the docs-registry per-stable snapshot if needed**

Run: `npx vitest run docs-registry -u`
Expected: PASS. Commit the `.snap` only if it changed (Card gained props/slots in its shape).

- [ ] **Step 5: Run the full pre-PR gate**

Run:
```bash
npm run validate:components && npm run check:contract-props && npm run check:consumers && npm run typecheck && npm run lint && npm run lint:css && npm test && npm run build && npm run check:generated
```
Expected: every command exits 0; vitest count = previous + the new Card tests.

- [ ] **Step 6: Commit the snapshots + generated artifacts**

```bash
git add nextjs-app/shared/components/Card/__a11y-snapshots__/ nextjs-app/shared/foundations/dist/docs-registry.json nextjs-app/shared/lib/design-system-mcp/__snapshots__/docs-registry.test.ts.snap
git commit -m "test(design-system): Card ActionCard AT snapshot + docs-registry refresh"
```

- [ ] **Step 7: Push, open the PR, and merge**

```bash
git push -u origin DT-879-feat-card-header-footer-slots
gh pr create --title "feat(design-system): Card header/footer slots (action card)" --body "Implements docs/superpowers/specs/2026-07-05-card-header-footer-slots-design.md. Adds headerStart/headerEnd/footerStart/footerEnd; extra soft-deprecated; link ⊥ action footer. Card stays stable; existing snapshots unchanged. New ActionCard story reproduces the mock."
gh pr merge --admin --squash --delete-branch
```
Expected: merged; `git checkout main && git pull` shows the four new props in `Card.contract.json`.

---

## Self-Review

**Spec coverage:** headerStart/headerEnd (Task 1), footerStart/footerEnd (Task 2), extra alias + precedence (Task 1), title default into headerStart (Task 1), link⊥footer guard + dev warn (Task 3), contract/slots/anatomy/usage (Task 4), ActionCard story reproducing the mock (Task 4), controls 100% via presets (Task 4), AT snapshots + 4-mode + light/dark/forced screenshot + full gates (Task 5), backward-compat (existing snapshots unchanged — Task 5 Step 1). No footer divider, no menu corner slot, no destructive concept (out of scope, honored).

**Placeholder scan:** none — every step has exact file paths, code, commands, expected output.

**Type consistency:** `headerStart`/`headerEnd`/`footerStart`/`footerEnd` are `React.ReactNode` in the interface (Task 1/2), the contract (Task 4), and the story presets (Task 4). `effectiveLink` defined in Task 3 is used by the same-file render lines. `leadingHeader`/`trailingHeader`/`hasFooter` names are consistent across tasks.
