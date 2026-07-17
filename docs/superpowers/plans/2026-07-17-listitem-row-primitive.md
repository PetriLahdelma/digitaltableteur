# ListItem Row Primitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the standalone presentational `ListItem` row primitive (React + `dt-list-item` native twin), and recompose Menu, dt-menu, and dt-split-button rows onto it, under the rendered-parity ratchet.

**Architecture:** `ListItem` renders row visuals only (icon / label / meta / trailingIcon / selected check, state x tone matrix); consumers own semantics. React `MenuItem` wraps it inside Radix `DropdownMenu.Item`; the native `dt-menu` and `dt-split-button` compose `dt-list-item` inside their panel rows. Menu and SplitButton are enforced in `scripts/design-system/rendered-parity.roster.mjs`, so every visual-touching task ends with a parity re-verify.

**Tech Stack:** React 19, TypeScript strict, CSS Modules, Radix dropdown-menu, native custom elements (shadow DOM), Vitest, Playwright parity gate.

**Spec:** `docs/superpowers/specs/2026-07-17-listitem-design.md` (approved).

## Global Constraints

- Branch: `DT-listitem-row-primitive` (already created; spec committed as 7c77253eb).
- TypeScript strict; CSS Modules only; design tokens from `nextjs-app/shared/styles/variables.css`; no hardcoded colors; no `@ts-ignore`.
- Disabled state uses `--color-disabled-placeholder` (canonical disabled tokens, never opacity).
- Additive API only: `MenuItem.trailing` stays working as a deprecated alias of `meta`.
- Storybook: WIP badge stays on ListItem stories (beta); canonical showcase story must be named exactly `Example` (parity pairing is exact-name); native stories replicate React args/content/canvas per `docs/design-system/rendered-parity.md`.
- Native story canvas: React ListItem meta uses `layout: "centered"`; the native meta must set the same layout explicitly (nativeStoryParameters already defaults to centered).
- Every task that touches Menu/SplitButton/ListItem visuals ends with `node scripts/design-system/check-rendered-parity.mjs --component=<X>` against Storybook on port 6010 and must report 5/5 visual + geometry for enforced components.
- Local gate before merge: `npm run typecheck && npm run lint && npm test && npm run build` plus `npm run build:tokens && npm run check:contract-props && npm run check:consumers`. Merge with `gh pr merge --squash --admin` (CI is quota-dead; verification is local).
- Commits: Conventional Commits, one commit per task step-group as written in each task.

---

### Task 1: React ListItem component (scaffold, styles, implementation, tests)

**Files:**
- Create (via scaffolder): `nextjs-app/shared/components/ListItem/ListItem.tsx`, `ListItem.module.css`, `ListItem.stories.tsx`, `ListItem.test.tsx`, `ListItem.contract.json`, `ListItem.spec.md`, `index.ts`
- Test: `nextjs-app/shared/components/ListItem/ListItem.test.tsx`

**Interfaces:**
- Consumes: `@dt/Icon` (`<Icon name="check" ariaLabel="" />`).
- Produces: `ListItem` default export and named export, `ListItemProps { children, icon?, meta?, trailingIcon?, selected?, tone?: "neutral" | "destructive", disabled?, highlighted?, className? }`. CSS classes `.root`, `.icon`, `.label`, `.meta`, `.trailingIcon`, `.destructive`, `.disabled`, `.highlighted`. Data slots: `data-slot="icon" | "meta" | "trailing-icon" | "check"`. Later tasks (Menu, native twin) rely on these exact names.

- [ ] **Step 1: Scaffold**

Run: `npm run new-component ListItem`
Expected: folder `nextjs-app/shared/components/ListItem/` with the full file set.

- [ ] **Step 2: Write the failing tests** (replace the scaffolded `ListItem.test.tsx` body)

```tsx
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import ListItem from "./ListItem";

describe("ListItem", () => {
  it("renders the label", () => {
    render(<ListItem>Rename</ListItem>);
    expect(screen.getByText("Rename")).toBeInTheDocument();
  });

  it("renders icon and trailingIcon as decorative", () => {
    const { container } = render(
      <ListItem icon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>
        Open
      </ListItem>,
    );
    const lead = container.querySelector('[data-slot="icon"]');
    const trail = container.querySelector('[data-slot="trailing-icon"]');
    expect(lead).toHaveAttribute("aria-hidden", "true");
    expect(trail).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes meta content to AT (no aria-hidden)", () => {
    const { container } = render(<ListItem meta="⌘K">Search</ListItem>);
    const meta = container.querySelector('[data-slot="meta"]');
    expect(meta).not.toHaveAttribute("aria-hidden");
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("renders the selected check as decorative", () => {
    const { container } = render(<ListItem selected>Finnish</ListItem>);
    const check = container.querySelector('[data-slot="check"]');
    expect(check).toBeTruthy();
    expect(check).toHaveAttribute("aria-hidden", "true");
  });

  it("applies tone and state classes", () => {
    const { container, rerender } = render(<ListItem tone="destructive">Delete</ListItem>);
    expect(container.firstElementChild!.className).toMatch(/destructive/);
    rerender(<ListItem highlighted>Row</ListItem>);
    expect(container.firstElementChild!.className).toMatch(/highlighted/);
    rerender(<ListItem disabled>Row</ListItem>);
    expect(container.firstElementChild!.className).toMatch(/disabled/);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ul>
        <li>
          <ListItem icon={<svg />} meta="Value" trailingIcon={<svg />} selected>
            Label
          </ListItem>
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run nextjs-app/shared/components/ListItem`
Expected: FAIL (scaffold stub does not implement the API).

- [ ] **Step 4: Implement `ListItem.tsx`**

```tsx
"use client";

import React from "react";
import Icon from "@dt/Icon";
import styles from "./ListItem.module.css";

const cx = (...classes: Array<string | false | undefined>): string =>
  classes.filter(Boolean).join(" ");

export interface ListItemProps {
  /** Primary label. Truncates with an ellipsis; never wraps. */
  children: React.ReactNode;
  /** Leading icon node; rendered in a fixed gutter so labels column-align. */
  icon?: React.ReactNode;
  /** End-aligned secondary content: muted small text, Badge, Kbd, StatusDot, or a value. Exposed to AT. */
  meta?: React.ReactNode;
  /** Trailing icon after meta (chevron, external-link). Decorative. */
  trailingIcon?: React.ReactNode;
  /** Renders the check indicator in the trailing position. Visual only; semantic selection belongs to the consumer. */
  selected?: boolean;
  /** Destructive rows (deletions) use the error color treatment. */
  tone?: "neutral" | "destructive";
  /** Visual disabled treatment via the canonical disabled tokens. The consumer carries aria-disabled. */
  disabled?: boolean;
  /** Parent-driven active row (combobox/palette). Radix menus work without it via [data-highlighted]. */
  highlighted?: boolean;
  className?: string;
}

/**
 * Presentational row for menus, selects, palettes, and lists. Renders visuals
 * only; the interactive wrapper (Radix Item, button, li, option) owns role,
 * focus, and events.
 */
export const ListItem: React.FC<ListItemProps> = ({
  children,
  icon,
  meta,
  trailingIcon,
  selected = false,
  tone = "neutral",
  disabled = false,
  highlighted = false,
  className,
}) => (
  <span
    className={cx(
      styles.root,
      tone === "destructive" && styles.destructive,
      highlighted && styles.highlighted,
      disabled && styles.disabled,
      className,
    )}
    data-tone={tone}
  >
    {icon != null ? (
      <span className={styles.icon} aria-hidden="true" data-slot="icon">
        {icon}
      </span>
    ) : null}
    <span className={styles.label}>{children}</span>
    {meta != null ? (
      <span className={styles.meta} data-slot="meta">
        {meta}
      </span>
    ) : null}
    {trailingIcon != null ? (
      <span className={styles.trailingIcon} aria-hidden="true" data-slot="trailing-icon">
        {trailingIcon}
      </span>
    ) : null}
    {selected ? (
      <span className={styles.trailingIcon} aria-hidden="true" data-slot="check">
        <Icon name="check" ariaLabel="" />
      </span>
    ) : null}
  </span>
);

export default ListItem;
```

- [ ] **Step 5: Implement `ListItem.module.css`**

Derived from the Menu row family (`Menu.module.css` `.item`/`.itemIcon`/`.itemLabel`/`.itemTrailing`) so Menu adoption in Task 3 is pixel-neutral.

```css
.root {
  display: flex;
  min-block-size: 2.5rem;
  padding-block: var(--space-internal-8);
  padding-inline: var(--space-internal-12);
  align-items: center;
  gap: var(--space-internal-8);
  border-radius: var(--radius-md);
  font-family: var(--font-text, system-ui, sans-serif);
  font-size: var(--font-size-text-s);
  line-height: var(--line-height-normal);
  text-align: left;
  color: var(--color-dark);
  user-select: none;
}

/* States: hover, press, and parent-driven highlight share one treatment.
   Radix menus highlight via [data-highlighted] on the wrapping item. */
.root:hover,
.root:active,
.root.highlighted,
:global([data-highlighted]) > .root {
  background-color: var(--color-neutral-bg);
}

.icon {
  display: inline-flex;
  flex: 0 0 1.25rem;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  line-height: 1;
  color: var(--color-primary);
}

/* Clamp consumer glyphs to the 16px row size so labels column-align. */
.icon svg {
  block-size: 1rem;
  inline-size: 1rem;
}

.label {
  min-inline-size: 0;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.meta {
  display: inline-flex;
  margin-inline-start: auto;
  align-items: center;
  gap: var(--space-internal-4);
  font-size: var(--font-size-text-xs, 0.75rem);
  color: var(--color-muted);
}

.trailingIcon {
  display: inline-flex;
  margin-inline-start: auto;
  align-items: center;
  color: var(--color-muted);
}

/* When meta is present it owns the end-alignment; trailing sits after it. */
.meta ~ .trailingIcon {
  margin-inline-start: 0;
}

/* Clamp trailing glyphs to the compact hint size, mirroring the leading icon. */
.trailingIcon svg {
  block-size: 0.875rem;
  inline-size: 0.875rem;
}

/* Destructive tone: error label/icons, error-tinted hover/highlight. */
.destructive,
.destructive .icon,
.destructive .trailingIcon {
  color: var(--color-error);
}

.destructive:hover,
.destructive:active,
.destructive.highlighted,
:global([data-highlighted]) > .destructive {
  background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
}

/* Disabled: canonical disabled tokens, never opacity. */
.disabled,
.disabled .icon,
.disabled .meta,
.disabled .trailingIcon {
  color: var(--color-disabled-placeholder);
}

.disabled:hover,
.disabled:active {
  background-color: transparent;
}

@media (forced-colors: active) {
  .root {
    color: CanvasText;
  }

  .root.highlighted,
  :global([data-highlighted]) > .root {
    background-color: Highlight;
    color: HighlightText;
  }

  .root.highlighted .icon,
  .root.highlighted .meta,
  .root.highlighted .trailingIcon,
  :global([data-highlighted]) > .root .icon,
  :global([data-highlighted]) > .root .meta,
  :global([data-highlighted]) > .root .trailingIcon {
    color: HighlightText;
  }

  .disabled,
  .disabled .icon,
  .disabled .meta,
  .disabled .trailingIcon {
    color: GrayText;
  }
}
```

- [ ] **Step 6: Update `index.ts`**

```ts
export { default, ListItem } from "./ListItem";
export type { ListItemProps } from "./ListItem";
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run nextjs-app/shared/components/ListItem`
Expected: PASS (6 tests).

- [ ] **Step 8: Commit**

```bash
git add nextjs-app/shared/components/ListItem
git commit -m "feat(design-system): ListItem presentational row primitive"
```

---

### Task 2: ListItem contract, stories, validation, react-package export

**Files:**
- Modify: `nextjs-app/shared/components/ListItem/ListItem.contract.json`, `ListItem.spec.md`, `ListItem.stories.tsx`
- Modify: `packages/react/src/content.ts`, `packages/react/src/index.ts` (append exports)

**Interfaces:**
- Consumes: `ListItem` from Task 1; `@dt/Badge`, `@dt/Kbd`, `@dt/StatusDot`, `@dt/Icon` for story content.
- Produces: story names `Default`, `Playground`, `Slots`, `Destructive`, `States`, `Example`, `ForcedColors` (native replicas in Task 5 must use these exact names); contract `ListItem` with `tone` variant.

- [ ] **Step 1: Fill the contract** (edit the scaffolded `ListItem.contract.json`; keep scaffolded fields not listed here)

Key fields to set, matching `Kbd.contract.json` conventions (schema v2):

```json
{
  "name": "ListItem",
  "tier": "atom",
  "group": "display",
  "status": "beta",
  "description": "Presentational row for menus, selects, palettes, and lists: leading icon, truncating label, end-aligned meta (text, Badge, Kbd, StatusDot, value), trailing icon, selection check, and a destructive tone. Consumers own semantics.",
  "element": "span",
  "radixPrimitive": null,
  "variants": {
    "tone": { "values": ["neutral", "destructive"], "default": "neutral", "propSourced": true }
  },
  "requiredStories": ["Default", "Playground", "Example", "ForcedColors"]
}
```

Rewrite `ListItem.spec.md` stub prose to describe the anatomy, the consumer-owns-semantics contract, the meta-is-exposed-to-AT decision, and the disabled-token rule (no placeholder text; validate:components fails on stub prose at beta).

- [ ] **Step 2: Write the stories** (replace scaffolded `ListItem.stories.tsx`)

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import ListItem from "./ListItem";
import Badge from "@dt/Badge";
import Kbd from "@dt/Kbd";
import StatusDot from "@dt/StatusDot";
import Icon from "@dt/Icon";
import contract from "./ListItem.contract.json";

const meta = {
  title: "Content/ListItem",
  component: ListItem,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  args: {
    children: "Rename",
    tone: "neutral",
    selected: false,
    disabled: false,
    highlighted: false,
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "destructive"] },
    icon: { table: { disable: true } },
    meta: { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
    children: { control: "text" },
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const column: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  inlineSize: "16rem",
};

export const Default: Story = { tags: ["beta-matrix"] };

export const Playground: Story = { tags: ["beta-matrix"] };

export const Slots: Story = {
  render: () => (
    <div style={column}>
      <ListItem icon={<Icon name="pencil" ariaLabel="" />}>Rename</ListItem>
      <ListItem meta="⌘K">Search</ListItem>
      <ListItem meta={<Kbd size="sm">⌘S</Kbd>}>Save</ListItem>
      <ListItem meta={<Badge size="sm" tone="info">New</Badge>}>Inbox</ListItem>
      <ListItem meta={<StatusDot tone="success" label="Online" />}>Server</ListItem>
      <ListItem meta="1.4 GB">Storage</ListItem>
      <ListItem trailingIcon={<Icon name="caret-right" ariaLabel="" />}>Share</ListItem>
      <ListItem selected>Finnish</ListItem>
    </div>
  ),
};

export const Destructive: Story = {
  render: () => (
    <div style={column}>
      <ListItem tone="destructive" icon={<Icon name="trash" ariaLabel="" />}>
        Delete project
      </ListItem>
      <ListItem tone="destructive" highlighted icon={<Icon name="trash" ariaLabel="" />}>
        Delete project
      </ListItem>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={column}>
      <ListItem>Default</ListItem>
      <ListItem highlighted>Highlighted</ListItem>
      <ListItem disabled>Disabled</ListItem>
      <ListItem disabled meta="⌘X">Disabled with meta</ListItem>
    </div>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={column}>
      <ListItem icon={<Icon name="pencil" ariaLabel="" />} meta={<Kbd size="sm">⌘R</Kbd>}>
        Rename
      </ListItem>
      <ListItem icon={<Icon name="copy-simple" ariaLabel="" />}>Duplicate</ListItem>
      <ListItem icon={<Icon name="share-network" ariaLabel="" />} trailingIcon={<Icon name="caret-right" ariaLabel="" />}>
        Share
      </ListItem>
      <ListItem selected>English</ListItem>
      <ListItem meta={<StatusDot tone="success" label="Synced" />}>Workspace</ListItem>
      <ListItem tone="destructive" icon={<Icon name="trash" ariaLabel="" />}>
        Delete
      </ListItem>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Example,
};
```

Note: `ForcedColors` spreads `Example` — an OBJECT here, so the spread is safe (the Testimonial trap applies only to StoryFn functions).

- [ ] **Step 3: Export from the react package**

Append to `packages/react/src/content.ts` and `packages/react/src/index.ts` (both files, same two lines, matching the List export pattern at `packages/react/src/index.ts:178`):

```ts
export { default as ListItem } from "../../../nextjs-app/shared/components/ListItem/ListItem";
export type { ListItemProps } from "../../../nextjs-app/shared/components/ListItem/ListItem";
```

- [ ] **Step 4: Validate**

Run: `npm run validate:components && npx vitest run nextjs-app/shared/components/ListItem`
Expected: both PASS. Fix any contract/spec findings before proceeding.

Run: `npm run build:tokens && npm run check:contract-props && npm run check:consumers`
Expected: PASS (contract props match the exported interface).

- [ ] **Step 5: Capture a11y snapshots** (Storybook running on 6010)

```bash
DT_THEME=light DT_UPDATE_A11Y_SNAPSHOTS=1 DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 nextjs-app/shared/components/ListItem
```

Expected: yaml files under `nextjs-app/shared/components/ListItem/__a11y-snapshots__/` (no trailing newline; do not hand-edit).

- [ ] **Step 6: Commit**

```bash
git add nextjs-app/shared/components/ListItem packages/react/src
git commit -m "feat(design-system): ListItem contract, stories, react-package export"
```

---

### Task 3: Menu adoption (MenuItem + MenuSubTrigger render ListItem)

**Files:**
- Modify: `nextjs-app/shared/components/Menu/Menu.tsx` (ItemBody at lines ~126-149, MenuItemProps at ~151, MenuItem, MenuSubTrigger)
- Modify: `nextjs-app/shared/components/Menu/Menu.module.css` (`.item` family at lines ~49-121)
- Test: `nextjs-app/shared/components/Menu/Menu.test.tsx` (add cases)

**Interfaces:**
- Consumes: `ListItem`, `ListItemProps` from `@dt/ListItem`.
- Produces: `MenuItemProps` gains `meta?: React.ReactNode`, `trailingIcon?: React.ReactNode`, `selected?: boolean`, `tone?: "neutral" | "destructive"`; `trailing` kept, documented deprecated, mapped onto `meta`.

- [ ] **Step 1: Write failing tests** (append to `Menu.test.tsx`, inside the existing open-menu test helpers used there — follow the file's existing render/open pattern)

```tsx
it("renders meta content exposed to AT and maps deprecated trailing onto meta", async () => {
  // open a menu containing:
  //   <MenuItem meta="⌘K">Search</MenuItem>
  //   <MenuItem trailing="legacy">Old</MenuItem>
  // assert: screen.getByText("⌘K") is visible and its [data-slot="meta"]
  // wrapper has no aria-hidden; "legacy" renders inside [data-slot="meta"].
});

it("applies destructive tone and selected check through MenuItem", async () => {
  // open a menu containing:
  //   <MenuItem tone="destructive">Delete</MenuItem>
  //   <MenuItem selected>Finnish</MenuItem>
  // assert: the Delete item contains an element with class matching /destructive/;
  // the Finnish item contains [data-slot="check"] with aria-hidden="true".
});
```

Write them as real tests using the file's existing utilities (it already opens menus in tests); the assertions above are the required expectations.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run nextjs-app/shared/components/Menu`
Expected: new tests FAIL (props not implemented).

- [ ] **Step 3: Implement**

In `Menu.tsx`:

1. Import ListItem: `import ListItem from "@dt/ListItem";`
2. Delete the private `ItemBody` component.
3. Extend `MenuItemProps`:

```ts
export interface MenuItemProps {
  children: React.ReactNode;
  /** Leading icon node; rendered in a fixed gutter so labels align in a column. */
  icon?: React.ReactNode;
  /** @deprecated Use `meta` (exposed to AT) or `trailingIcon`. Maps onto `meta`. */
  trailing?: React.ReactNode;
  /** End-aligned secondary content: muted text, Badge, Kbd, StatusDot, value. */
  meta?: React.ReactNode;
  /** Trailing icon after meta (chevron, external-link). */
  trailingIcon?: React.ReactNode;
  /** Renders the check indicator; pair with your own aria semantics if needed. */
  selected?: boolean;
  /** Destructive actions (deletions) get the error treatment. */
  tone?: "neutral" | "destructive";
  disabled?: boolean;
  onSelect?: () => void | Promise<void>;
  href?: string;
  className?: string;
}
```

4. In `MenuItem`, build the body with ListItem (identical for the href and button branches):

```tsx
const body = (
  <ListItem
    icon={icon}
    meta={meta ?? trailing}
    trailingIcon={trailingIcon}
    selected={selected}
    tone={tone}
  >
    {children}
  </ListItem>
);
```

`disabled` visual state comes from Radix's `[data-disabled]` on the item (see CSS below), so it is NOT passed to ListItem here; Radix owns disabled semantics.

5. In `MenuSubTrigger`, render the chevron through ListItem:

```tsx
<ListItem icon={icon} trailingIcon={<Icon name="caret-right" ariaLabel="" />}>
  {children}
</ListItem>
```

(match the existing chevron icon name used by MenuSubTrigger today; if it differs from `caret-right`, keep the existing name).

In `Menu.module.css`, slim `.item` to the interactive shell and let ListItem carry the row visuals. ListItem's `.root` must fill the item:

```css
.item {
  display: flex;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  outline: none;
  background: none;
  text-decoration: none;
  cursor: pointer;
}

.item > * {
  flex: 1;
  min-inline-size: 0;
}

.item[data-disabled] {
  cursor: not-allowed;
  pointer-events: none;
}

/* ListItem renders the disabled colors when Radix marks the item. */
.item[data-disabled] > * {
  color: var(--color-disabled-placeholder);
}
```

Remove `.itemIcon`, `.itemLabel`, `.itemTrailing` rules and the `.item[data-highlighted]` background rule (ListItem's `:global([data-highlighted]) > .root` selector now provides the highlight bg; `[data-highlighted]` remains on the Radix item element, which is ListItem's direct parent). Keep `.subTrigger[data-state="open"]` but change it to target the child: `.subTrigger[data-state="open"] > *` with the same `background-color: var(--color-neutral-bg)`. Update the forced-colors block: drop the removed selectors; ListItem's own forced-colors rules take over.

- [ ] **Step 4: Run tests**

Run: `npx vitest run nextjs-app/shared/components/Menu tests/web-components`
Expected: PASS, including pre-existing Menu tests.

- [ ] **Step 5: Rendered-parity re-verify (CRITICAL ratchet gate)**

Storybook dev server must be running on 6010 (Vite picks up the edits).

```bash
node scripts/design-system/check-rendered-parity.mjs --component=Menu
node scripts/design-system/check-rendered-parity.mjs --component=SplitButton
```

Expected: 5/5 visual + 5/5 geometry for BOTH. The adoption must be pixel-neutral: ListItem's tokens were copied from the Menu row exactly for this reason. If any pair fails, read the `-diff.png` artifacts in `.omx/state/design-system/rendered-parity/` and fix ListItem.module.css or the `.item` shell until 0.0000 — do NOT touch the native side in this task.

- [ ] **Step 6: Update Menu a11y snapshots** (trailing slot content is now exposed to AT, so yamls change)

```bash
DT_THEME=light DT_UPDATE_A11Y_SNAPSHOTS=1 DT_REQUIRE_A11Y_SNAPSHOTS=1 npx test-storybook --url http://127.0.0.1:6010 --maxWorkers=2 nextjs-app/shared/components/Menu
```

Inspect the yaml diff: the ONLY acceptable change class is trailing/meta text becoming visible to AT. Match existing per-theme yaml variants (update only the variants that already exist for Menu).

- [ ] **Step 7: Commit**

```bash
git add nextjs-app/shared/components/Menu
git commit -m "feat(design-system): Menu rows compose ListItem (meta, trailingIcon, selected, destructive tone)"
```

---

### Task 4: Native dt-list-item element

**Files:**
- Create: `packages/web-components/src/native/list-item.ts`
- Modify: `packages/web-components/src/index.ts`, `packages/web-components/src/register.ts` (follow the existing per-element export/registration pattern in each file, e.g. how `DtKbdElement` appears)
- Modify: `packages/web-components/web-components.config.mjs` (new element definition)
- Test: `tests/web-components/list-item.test.ts`

**Interfaces:**
- Consumes: `DigitaltableteurElement`, `stringAttribute`, `enumAttribute`, `reflectAttribute`, `reflectBooleanAttribute`, `hasNamedSlot`, `hasDefaultSlotContent` from `packages/web-components/src/native/base.ts`; `dt-icon` for the check glyph.
- Produces: `DtListItemElement`, tag `dt-list-item`; attributes `label`, `icon` (Phosphor name), `meta` (text), `trailing-icon` (Phosphor name), `selected`, `tone` (`neutral | destructive`), `disabled`, `highlighted`; slots `icon`, default, `meta`, `trailing-icon` overriding the string attributes; parts `root`, `icon`, `label`, `meta`, `trailing-icon`, `check`. Tasks 6-7 compose this element inside dt-menu and dt-split-button.

- [ ] **Step 1: Write failing tests** (`tests/web-components/list-item.test.ts`, follow the register/JSDOM pattern of the sibling files in `tests/web-components/`)

```ts
// Cases (write with this suite's existing helpers):
// 1. renders label attribute into the shadow label part
// 2. icon attribute renders a dt-icon in the icon part; absent icon renders no gutter
// 3. meta attribute renders text in the meta part WITHOUT aria-hidden
// 4. selected attribute renders the check part with aria-hidden="true"
// 5. tone="destructive" reflects on the shadow root element class
// 6. slotted meta content (light DOM [slot="meta"]) wins over the meta attribute
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/web-components/list-item.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `list-item.ts`**

```ts
import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TONES = ["neutral", "destructive"] as const;
export type DtListItemTone = (typeof TONES)[number];

/**
 * Shadow styles mirror ListItem.module.css 1:1. Shadow DOM gets no global
 * reset, so box-sizing and typography are restated here.
 */
const styles = `
  :host { display: flex; }
  :host([hidden]) { display: none; }
  .root {
    box-sizing: border-box;
    display: flex;
    min-block-size: 2.5rem;
    inline-size: 100%;
    padding-block: var(--space-internal-8, 0.5rem);
    padding-inline: var(--space-internal-12, 0.75rem);
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
    border-radius: var(--radius-md, 0.375rem);
    font-family: var(--font-text, system-ui, sans-serif);
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: var(--line-height-normal, 1.5);
    text-align: left;
    color: var(--color-dark, CanvasText);
    user-select: none;
  }
  :host(:hover) .root,
  :host(:active) .root,
  :host([highlighted]) .root {
    background-color: var(--color-neutral-bg, #f0f0f0);
  }
  .icon {
    display: inline-flex;
    flex: 0 0 1.25rem;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    line-height: 1;
    color: var(--color-primary, LinkText);
  }
  .icon dt-icon, .icon ::slotted(*) { inline-size: 1rem; block-size: 1rem; }
  .label {
    min-inline-size: 0;
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .meta {
    display: inline-flex;
    margin-inline-start: auto;
    align-items: center;
    gap: var(--space-internal-4, 0.25rem);
    font-size: var(--font-size-text-xs, 0.75rem);
    color: var(--color-muted, GrayText);
  }
  .trailingIcon {
    display: inline-flex;
    margin-inline-start: auto;
    align-items: center;
    color: var(--color-muted, GrayText);
  }
  .meta ~ .trailingIcon { margin-inline-start: 0; }
  .trailingIcon dt-icon, .trailingIcon ::slotted(*) { inline-size: 0.875rem; block-size: 0.875rem; }
  :host([tone="destructive"]) .root,
  :host([tone="destructive"]) .icon,
  :host([tone="destructive"]) .trailingIcon {
    color: var(--color-error, #b3261e);
  }
  :host([tone="destructive"]:hover) .root,
  :host([tone="destructive"]:active) .root,
  :host([tone="destructive"][highlighted]) .root {
    background-color: color-mix(in srgb, var(--color-error, #b3261e) 10%, transparent);
  }
  :host([disabled]) .root,
  :host([disabled]) .icon,
  :host([disabled]) .meta,
  :host([disabled]) .trailingIcon {
    color: var(--color-disabled-placeholder, GrayText);
  }
  :host([disabled]:hover) .root,
  :host([disabled]:active) .root {
    background-color: transparent;
  }
  @media (forced-colors: active) {
    .root { color: CanvasText; }
    :host([highlighted]) .root { background-color: Highlight; color: HighlightText; }
    :host([highlighted]) .icon,
    :host([highlighted]) .meta,
    :host([highlighted]) .trailingIcon { color: HighlightText; }
    :host([disabled]) .root,
    :host([disabled]) .icon,
    :host([disabled]) .meta,
    :host([disabled]) .trailingIcon { color: GrayText; }
  }
`;

export class DtListItemElement extends DigitaltableteurElement {
  static observedAttributes = [
    "label",
    "icon",
    "meta",
    "trailing-icon",
    "selected",
    "tone",
    "disabled",
    "highlighted",
  ];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get icon(): string {
    return stringAttribute(this, "icon");
  }
  set icon(value: string) {
    reflectAttribute(this, "icon", value || null);
  }
  get meta(): string {
    return stringAttribute(this, "meta");
  }
  set meta(value: string) {
    reflectAttribute(this, "meta", value || null);
  }
  get trailingIcon(): string {
    return stringAttribute(this, "trailing-icon");
  }
  set trailingIcon(value: string) {
    reflectAttribute(this, "trailing-icon", value || null);
  }
  get selected(): boolean {
    return this.hasAttribute("selected");
  }
  set selected(value: boolean) {
    reflectBooleanAttribute(this, "selected", value);
  }
  get tone(): DtListItemTone {
    return enumAttribute(this, "tone", TONES, "neutral");
  }
  set tone(value: DtListItemTone) {
    reflectAttribute(this, "tone", value === "neutral" ? null : value);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
  }
  set highlighted(value: boolean) {
    reflectBooleanAttribute(this, "highlighted", value);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("span");
    root.className = "root";
    root.setAttribute("part", "root");

    const iconName = this.icon;
    if (hasNamedSlot(this, "icon") || iconName) {
      const icon = this.ownerDocument.createElement("span");
      icon.className = "icon";
      icon.setAttribute("part", "icon");
      icon.setAttribute("aria-hidden", "true");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "icon";
      if (!hasNamedSlot(this, "icon") && iconName) {
        const glyph = this.ownerDocument.createElement("dt-icon");
        glyph.setAttribute("name", iconName);
        glyph.setAttribute("aria-hidden", "true");
        slot.append(glyph);
      }
      icon.append(slot);
      root.append(icon);
    }

    const label = this.ownerDocument.createElement("span");
    label.className = "label";
    label.setAttribute("part", "label");
    const labelSlot = this.ownerDocument.createElement("slot");
    if (!hasDefaultSlotContent(this) && this.label) {
      labelSlot.textContent = this.label;
    }
    label.append(labelSlot);
    root.append(label);

    if (hasNamedSlot(this, "meta") || this.meta) {
      const meta = this.ownerDocument.createElement("span");
      meta.className = "meta";
      meta.setAttribute("part", "meta");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "meta";
      if (!hasNamedSlot(this, "meta") && this.meta) {
        slot.textContent = this.meta;
      }
      meta.append(slot);
      root.append(meta);
    }

    if (hasNamedSlot(this, "trailing-icon") || this.trailingIcon) {
      const trailing = this.ownerDocument.createElement("span");
      trailing.className = "trailingIcon";
      trailing.setAttribute("part", "trailing-icon");
      trailing.setAttribute("aria-hidden", "true");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "trailing-icon";
      if (!hasNamedSlot(this, "trailing-icon") && this.trailingIcon) {
        const glyph = this.ownerDocument.createElement("dt-icon");
        glyph.setAttribute("name", this.trailingIcon);
        glyph.setAttribute("aria-hidden", "true");
        slot.append(glyph);
      }
      trailing.append(slot);
      root.append(trailing);
    }

    if (this.selected) {
      const check = this.ownerDocument.createElement("span");
      check.className = "trailingIcon";
      check.setAttribute("part", "check");
      check.setAttribute("aria-hidden", "true");
      const glyph = this.ownerDocument.createElement("dt-icon");
      glyph.setAttribute("name", "check");
      glyph.setAttribute("aria-hidden", "true");
      check.append(glyph);
      root.append(check);
    }

    this.replaceShadow(styles, root);
  }
}
```

If `replaceShadow`/`observeLightDom` signatures differ from this sketch, follow `packages/web-components/src/native/badge.ts` exactly (it uses the same lifecycle).

- [ ] **Step 4: Register the element**

Add to `packages/web-components/src/index.ts` and `packages/web-components/src/register.ts` following the existing pattern for other native elements (export the class; include the tag in the defineElements list).

- [ ] **Step 5: Config entry** (append to `elementDefinitions` in `packages/web-components/web-components.config.mjs`, after the dt-kbd entry at ~line 1200; use the file's existing prop helpers)

```js
{
  tagName: "dt-list-item",
  sourceComponent: "ListItem",
  contract: "ListItem",
  defaultBackend: "native",
  nativeClassName: "DtListItemElement",
  description:
    "Presentational row: leading icon, truncating label, end-aligned meta, trailing icon, selection check, destructive tone.",
  storyParity: storyParity(),
  props: [
    stringProp("label"),
    stringProp("icon"),
    stringProp("meta"),
    stringProp("trailingIcon", "trailing-icon"),
    stringProp("tone"),
    booleanProp("selected"),
    booleanProp("disabled"),
    booleanProp("highlighted"),
  ],
  slots: [
    slot("", "Primary label (overrides the label attribute)."),
    slot("icon", "Leading icon (overrides the icon attribute)."),
    slot("meta", "End-aligned secondary content (overrides the meta attribute)."),
    slot("trailing-icon", "Trailing icon (overrides the trailing-icon attribute)."),
  ],
  events: [],
},
```

Check `stringProp`'s actual signature in the config before using the two-argument attribute-mapping form (the `dialogTitle`/`title` bridge elsewhere in the file shows the pattern).

- [ ] **Step 6: Run tests + package checks**

Run: `npx vitest run tests/web-components && npm run check:web-components`
Expected: PASS. The tarball/tag-count ceilings in `check-package-tarball-contents.mjs` may need a deliberate +1 bump (85 tags); bump exactly to the new true value if the check reports it.

- [ ] **Step 7: Commit**

```bash
git add packages/web-components tests/web-components/list-item.test.ts
git commit -m "feat(wc): dt-list-item native row element"
```

---

### Task 5: Native ListItem stories (replica) + parity enrollment for ListItem

**Files:**
- Create: `nextjs-app/shared/stories/WebComponents/ListItem/ListItem.stories.tsx`

**Interfaces:**
- Consumes: `DtListItemElement`; `NativeElement`, `assertNative`, `exampleStory`, `forcedColorsStory`, `nativeStoryParameters` from `../NativeStory`; story names from Task 2.
- Produces: native stories `Default`, `Playground`, `Slots`, `Destructive`, `States`, `Example`, `ForcedColors` paired 1:1 with the React stories.

- [ ] **Step 1: Write the native stories as exact replicas**

Mirror the React stories from Task 2 with identical content, wrapper (`16rem` column), and canvas. Layout: React meta uses `layout: "centered"`; nativeStoryParameters is already centered, so do NOT override layout. Compose rich meta via slots:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { DtListItemElement } from "../../../../../packages/web-components/src/native/list-item";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-list-item")) {
  customElements.define("dt-list-item", DtListItemElement);
}

type Args = {
  label: string;
  tone: "neutral" | "destructive";
  selected: boolean;
  disabled: boolean;
  highlighted: boolean;
};

function NativeListItem(args: Args) {
  return (
    <NativeElement
      tagName="dt-list-item"
      attributes={{
        label: args.label,
        tone: args.tone === "neutral" ? undefined : args.tone,
        selected: args.selected || undefined,
        disabled: args.disabled || undefined,
        highlighted: args.highlighted || undefined,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Content/ListItem",
  component: NativeListItem,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native dt-list-item presentational row. Consumers own semantics; dt-menu and dt-split-button compose it inside their panels.",
      },
    },
  },
  args: {
    label: "Rename",
    tone: "neutral",
    selected: false,
    disabled: false,
    highlighted: false,
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "destructive"] },
  },
} satisfies Meta<typeof NativeListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const column: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  inlineSize: "16rem",
};

export const Default: Story = { play: assertNative("dt-list-item") };
export const Playground: Story = {};
```

Then add `Slots`, `Destructive`, `States`, `Example`, `ForcedColors` mirroring the React renders 1:1. In the native `Example`, express the same rows: `icon="pencil"` with a slotted `<dt-kbd slot="meta" size="sm">⌘R</dt-kbd>`-equivalent (use the registered dt-kbd element via NativeElement with `slot="meta"`), `icon="copy-simple"`, `icon="share-network" trailing-icon="caret-right"`, `selected label="English"`, a slotted native status dot equivalent for "Workspace" (if no dt-status-dot exists, use the same StatusDot rendering the React story used via `meta` slot markup that visually matches; check the fleet config for a status-dot tag first), and `tone="destructive" icon="trash" label="Delete"`.

- [ ] **Step 2: Story-name parity + smoke**

Run: `node scripts/design-system/check-web-component-stories.mjs`
Expected: PASS, ListItem folder verified with declared story parity.

- [ ] **Step 3: Rendered-parity verify for ListItem**

Run: `node scripts/design-system/check-rendered-parity.mjs --component=ListItem`
Expected: 5/5 visual + 5/5 geometry (0.0000 target). Iterate on `list-item.ts` shadow styles using the diff artifacts until identical (watch for the catalogued drift classes: box-sizing, inherited line-height, icon glyph sizes, subpixel canvas offsets).

- [ ] **Step 4: Commit**

```bash
git add nextjs-app/shared/stories/WebComponents/ListItem
git commit -m "feat(wc): dt-list-item stories paired with React ListItem"
```

---

### Task 6: dt-menu composes dt-list-item

**Files:**
- Modify: `packages/web-components/src/native/menu.ts` (`renderItemBody` at ~line 940, `highlightControl` near line 600, styles `.item`/`.itemIcon`/`.itemLabel`/`.itemTrailing`, `DtMenuItem` type at line 21)
- Test: `tests/web-components/menu-split-button.test.ts` (extend)

**Interfaces:**
- Consumes: `DtListItemElement` (register import inside menu.ts, same pattern as its dt-icon usage).
- Produces: `DtMenuItem` gains optional `tone?: "neutral" | "destructive"` and `meta?: string` (alias for existing `trailing`); rows render `<dt-list-item>` inside the existing control button.

- [ ] **Step 1: Write failing tests** (extend the menu suite)

```ts
// 1. items JSON [{label:"Delete", tone:"destructive"}] renders a dt-list-item
//    with tone="destructive" inside the menu row control
// 2. items JSON [{label:"Search", trailing:"⌘K"}] renders the trailing text
//    inside the dt-list-item meta part (not aria-hidden)
// 3. highlighting a row (open menu, ArrowDown) sets highlighted on the row's
//    dt-list-item
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/web-components/menu-split-button.test.ts`
Expected: new cases FAIL.

- [ ] **Step 3: Implement**

1. `DtMenuItem` gains `tone?: "neutral" | "destructive"` (and document `trailing` as the meta text).
2. Replace `renderItemBody` to build a composed row:

```ts
private renderItemBody(
  item: DtMenuItem,
  trailingOverride?: Node,
): HTMLElement {
  const row = this.ownerDocument.createElement("dt-list-item");
  row.setAttribute("data-menu-row", "true");
  if (item.label) row.setAttribute("label", item.label);
  if (item.icon) row.setAttribute("icon", item.icon);
  if (item.tone === "destructive") row.setAttribute("tone", "destructive");
  if (item.disabled) row.setAttribute("disabled", "");
  if (trailingOverride) {
    // Submenu chevron: place the node into the trailing-icon slot.
    const trailing = trailingOverride instanceof HTMLElement
      ? trailingOverride
      : this.ownerDocument.createElement("span");
    if (!(trailingOverride instanceof HTMLElement)) trailing.append(trailingOverride);
    trailing.setAttribute("slot", "trailing-icon");
    row.append(trailing);
  } else if (item.trailing) {
    row.setAttribute("meta", item.trailing);
  }
  return row;
}
```

Callers that appended the returned fragment keep working (it returns a single element now; adjust call sites' types accordingly).

3. The control button keeps role/tabindex/data attributes; give it `padding: 0` and make the row fill it. In the styles: replace the `.item` visual declarations (padding, min-block-size, gap, font, colors, data-highlighted background) with the shell treatment, mirroring the React Task 3 CSS:

```css
.item {
  display: flex;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  outline: none;
  background: none;
  text-align: left;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  user-select: none;
}
.item > dt-list-item { flex: 1 1 auto; inline-size: 100%; min-inline-size: 0; }
.item[aria-disabled="true"] { cursor: not-allowed; }
```

Keep the slotted-item selectors (`.slotHost::slotted([data-dt-menu-item])`) untouched: slotted consumer items are not part of this refactor.

4. In `highlightControl`, forward the highlight to the composed row wherever the method toggles `data-highlighted` on a control:

```ts
control.querySelector("dt-list-item")?.toggleAttribute(
  "highlighted",
  control.getAttribute("data-highlighted") === "true",
);
```

(and clear it on the previously highlighted control the same way).

5. Ensure dt-list-item is registered before dt-menu renders: import and define it at the top of `menu.ts` exactly the way `defineElements`/dt-icon registration is handled in the file.

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/web-components`
Expected: PASS including the 3 new cases.

- [ ] **Step 5: Rendered-parity re-verify (ratchet gate)**

```bash
node scripts/design-system/check-rendered-parity.mjs --component=Menu
```

Expected: 5/5 + 5/5. The composed row must land on the exact same pixels as before (Menu Default renders an OPEN panel, so row visuals are fully exercised). Debug with diff artifacts; typical traps: double padding (shell + row), lost `box-sizing`, icon gutter width, forced-colors.

- [ ] **Step 6: Commit**

```bash
git add packages/web-components/src/native/menu.ts tests/web-components
git commit -m "refactor(wc): dt-menu rows compose dt-list-item"
```

---

### Task 7: dt-split-button composes dt-list-item

**Files:**
- Modify: `packages/web-components/src/native/split-button.ts` (menu-item construction around the `renderMenuPanel`/menuItem code at ~line 690-712, `.menuItem` styles at ~line 207)
- Test: `tests/web-components/menu-split-button.test.ts` (extend)

**Interfaces:**
- Consumes: `DtListItemElement`; `DtSplitButtonOption` gains `tone?: "neutral" | "destructive"`.
- Produces: split-button menu rows rendered as `<dt-list-item>` inside the existing `.menuItem` controls; `trailingIcon` option field maps to the row's `trailing-icon` attribute; `icon` maps to `icon`.

- [ ] **Step 1: Write failing test**

```ts
// options JSON [{id:"del", label:"Delete", tone:"destructive"}] renders a
// dt-list-item with tone="destructive" inside the split-button menu row;
// [{id:"pdf", label:"Export PDF", trailingIcon:"file-text"}] renders
// trailing-icon="file-text" on the row.
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/web-components/menu-split-button.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Mirror Task 6: the option row builder creates `<dt-list-item label icon trailing-icon tone disabled>`; `.menuItem` becomes the interactive shell (padding 0, row fills); the highlight-forwarding hook mirrors Task 6's `highlightControl` change (split-button has its own highlight path; find it via `data-highlighted` in the file). Submenu chevron (`caret-right` trailing) rides the `trailing-icon` attribute.

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/web-components`
Expected: PASS.

- [ ] **Step 5: Rendered-parity re-verify (ratchet gate)**

```bash
node scripts/design-system/check-rendered-parity.mjs --component=SplitButton
node scripts/design-system/check-rendered-parity.mjs --component=Menu
node scripts/design-system/check-rendered-parity.mjs --component=ListItem
```

Expected: all 5/5 + 5/5.

- [ ] **Step 6: Commit**

```bash
git add packages/web-components/src/native/split-button.ts tests/web-components
git commit -m "refactor(wc): dt-split-button menu rows compose dt-list-item"
```

---

### Task 8: Full gate, sweep, roster, PR, merge

**Files:**
- Modify: `scripts/design-system/rendered-parity.roster.mjs` (via `--update-roster`)

- [ ] **Step 1: Full parity sweep with enrollment**

```bash
node scripts/design-system/check-rendered-parity.mjs --update-roster
```

Expected: 0 enforced failures; ListItem newly enrolled. Verify with:

```bash
node --input-type=module -e "import { enforced } from './scripts/design-system/rendered-parity.roster.mjs'; console.log(enforced.includes('ListItem'), enforced.length)"
```

- [ ] **Step 2: Local gate (all must exit 0)**

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run build:tokens && npm run check:contract-props && npm run check:consumers
npm run check:web-components
node scripts/design-system/check-web-component-stories.mjs
npm run validate:components
```

- [ ] **Step 3: Commit roster + open PR**

```bash
git add scripts/design-system/rendered-parity.roster.mjs
git commit -m "feat(design-system): enrol ListItem in the rendered-parity roster"
git push -u origin DT-listitem-row-primitive
gh pr create --title "feat(design-system): ListItem row primitive + dt-list-item twin; Menu/SplitButton rows compose it" --body-file <write a body summarizing spec, API, parity numbers>
```

- [ ] **Step 4: Check open PRs touching the same files, then merge**

```bash
gh pr list
gh pr merge --squash --admin
```

Expected: squash merge (this is not a view PR). Update memory (native-wc program log) with the merge SHA and any new gotchas found during the native refactors.

---

## Self-Review

- Spec coverage: anatomy/API (Task 1), states x tone incl. destructive and disabled tokens (Tasks 1, 4), AT-exposed meta (Tasks 1, 3, 4), Menu adoption with deprecated `trailing` (Task 3), MenuSubTrigger chevron (Task 3), native twin with slots+attrs (Task 4), native stories/replicas (Task 5), dt-menu + dt-split-button recomposition (Tasks 6-7), parity gates + roster enrollment + consumption-mandate export (Tasks 2, 8). No gaps found.
- Placeholders: test-case steps in Tasks 3, 6, 7 specify exact expectations against the suites' existing helpers rather than full code, because those suites' helpers own menu-opening mechanics; the assertions and inputs are fully specified.
- Type consistency: `ListItemProps` names match across Tasks 1-3; `dt-list-item` attribute names (`trailing-icon`, `tone`, `highlighted`) match across Tasks 4-7; story names match between Tasks 2 and 5.
