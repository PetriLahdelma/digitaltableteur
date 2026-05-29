# Tabs

## Intent
Provide the canonical sibling-content switcher with full APG keyboard
semantics. Tabs intentionally renders only the tablist — the parent owns
the panels — because controlling when content mounts is the consumer's
decision, not the design system's.

## Interaction contract
- Keyboard:
  - ArrowLeft / ArrowUp: previous tab (wraps).
  - ArrowRight / ArrowDown: next tab (wraps).
  - Home: first tab. End: last tab.
  - Enter / Space: activate the focused tab.
  - Disabled tabs are skipped by arrows and reject Enter / Space.
- Pointer: clicking a tab activates it. Clicking a disabled tab is a
  no-op.
- Screen readers: the wrapper is announced as "tab list" with an
  accessible name from `t('tabs.navigation')`. Each tab announces its
  label plus "selected" / "not selected", and disabled tabs announce
  "dimmed".

## Do / don't
- Do: render tabpanels with `getTabPanelProps(key, isActive)` so the
  four required attributes (`id`, `role`, `aria-labelledby`, `hidden`,
  `tabIndex`) stay in sync with the tablist.
- Do: keep `tabs[].key` stable across renders. Switching keys mid-flight
  breaks the controlled / uncontrolled selection bookkeeping.
- Don't: nest tablists inside another tablist. APG explicitly disallows
  it — keyboard navigation becomes ambiguous.
- Don't: use Tabs for non-mutually-exclusive content. Two panels open
  at once is a job for **Accordion** (in a future `mode="multi"`) or
  side-by-side layout.
- Don't: hand-author `id="tab-<key>"` / `id="tabpanel-<key>"` on the
  panel side. Use `getTabPanelProps`; the id convention is internal.

## Design notes
- Tokens: tab strip uses `--space-internal-8` block padding and
  `--space-internal-12` inline padding for `md`. The active-state
  underline (`variant="underline"`) is 2px and uses `--color-primary`.
  Disabled tabs use `--color-text-disabled` and `cursor: not-allowed`.
- Figma: https://www.figma.com/design/digitaltableteur/tabs — three
  variants (`default`, `pills`, `underline`) map 1:1 to the prop.
- The `getTabPanelProps` helper exports the only invariant the consumer
  must hold: panel `id` and tab `aria-controls` point at each other.
- Selection storage is intentionally split into "controlled vs internal"
  to avoid mid-mount drift. If `activeTab` is `undefined`, the component
  uses its internal state; once `activeTab` becomes defined, the parent
  owns it.
