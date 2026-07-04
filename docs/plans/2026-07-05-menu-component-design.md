# Design: shared `Menu` primitive (dogfooded by Avatar + SplitButton)

**Date:** 2026-07-05
**Status:** validated design, ready for implementation
**Trigger:** Avatar's account-menu was low quality (62px rows, 24px icons, 18px label — too sparse; clipped in docs) and hand-rolled. Investigation found **three** components hand-rolling menu markup with no shared primitive.

## Findings

| Component | Pattern | State |
|---|---|---|
| **SplitButton** menu | ARIA menu-button dropdown: `role=menu`, roving tabindex, Arrow/Home/End/Escape, submenus, disabled, leading+trailing icons, portal + collision | Most complete; reference keyboard model |
| **Avatar** menu | Same ARIA dropdown, built weaker: `tabIndex=0` on every item (should be roving), Enter/Space only, no arrow keys; oversized styling | Needs replacing |
| **NavMenuList** | `<ul>` of Next `<Link>`s + `aria-current="page"` | **Navigation, NOT a menu.** Excluded — forcing `role=menu` would be an a11y regression |

## Decisions (validated with owner 2026-07-05)

1. **Scope:** consolidate **Avatar + SplitButton** onto a shared `Menu`. Leave **NavMenuList** as navigation (unchanged).
2. **Build on `@radix-ui/react-dropdown-menu`** (already a dep; matches the Tooltip Radix precedent). Radix provides roving focus, arrow keys, typeahead, Escape, focus return, and collision positioning — so we own only the visual layer, not the a11y edge cases.
3. **Compositional API** (Radix-style parts). Avatar and SplitButton keep their existing **data props** (`menuItems`, `options`) and map them to Menu parts internally, so **no consumer-facing API changes** and Avatar's stable contract is preserved.

## API

```tsx
<Menu open? defaultOpen? onOpenChange?>
  <MenuTrigger asChild>{trigger}</MenuTrigger>
  <MenuContent side? align? sideOffset?>
    <MenuItem
      icon?               // leading Icon (16px in-menu size)
      trailing?           // trailing icon / shortcut hint
      disabled?
      onSelect?           // sync | async
      href?               // renders an <a> via asChild (Avatar link items)
    >Label</MenuItem>
    <MenuSeparator />
    <MenuSub>
      <MenuSubTrigger icon?>Label</MenuSubTrigger>
      <MenuSubContent> …items… </MenuSubContent>
    </MenuSub>
  </MenuContent>
</Menu>
```

Sub-parts (contract `subParts`): Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuSub, MenuSubTrigger, MenuSubContent.

## Visual spec (fixes the 0/10 menu)

- **Item row:** ~40px min-height (was 62px). Padding `var(--space-internal-8) var(--space-internal-12)`, `gap: var(--space-internal-8)`, `align-items: center`.
- **Label:** menu text size (~0.875rem / `--font-size-text-s` verified against tokens, NOT the 18px `Text size="s"` currently rendered). Left-aligned, `flex: 1`.
- **Leading icon:** fixed **1.25rem (20px) gutter box**, glyph 16px, so labels align in a column regardless of glyph width.
- **Trailing:** submenu caret / shortcut, muted, right-aligned.
- **Content:** token radius/border/shadow, `min-inline-size: 11rem`, `padding-block: var(--space-internal-4)`, portal + Radix collision (no manual data-horizontal/vertical math).
- **States:** hover/highlighted via Radix `[data-highlighted]` → `--color-neutral-bg`; disabled dimmed + not selectable; forced-colors border + CanvasText; reduced-motion drops the open animation.

## Migration

- **Avatar:** replace the `<ul role=menu>` block + custom positioning/keyboard with `Menu` parts rendered from `menuItems`. Keep `menuItems`/`menuLabel` props and behavior (href items, async onSelect, close-on-select). Delete the bespoke menu CSS + placement effect. Re-verify to the stable bar (axe, controls, AT snapshots ×4 modes, light/dark/forced-colors, **open the menu and eyeball it**). Fix the docs canvas clipping (story min-height / decorator).
- **SplitButton:** replace its hand-rolled menu (incl. submenus) with `Menu` + `MenuSub`. Keep the `options` API. Re-verify.

## Phased PRs (coordinated)

1. **PR A — build `Menu`:** component + `.module.css` + contract + stories (Default/Playground/Example/ForcedColors + WithIcons/WithSubmenu/Disabled/AsLinks) + tests (a11y: keyboard open/arrow/escape/typeahead, item select, disabled) + i18n if any. Ships **alpha** (new primitive). Verify: validate:components, axe, controls 100%/0-inert, light/dark/forced-colors eyeballed.
2. **PR B — Avatar consumes Menu:** refactor + visual fix + docs-canvas fix + full stable re-verification (Avatar is stable — API unchanged, internals swapped). Update reviewedNote.
3. **PR C — SplitButton consumes Menu:** refactor incl. submenus + re-verify.
4. **Follow-up (optional):** promote `Menu` alpha→beta once it has real consumers (Avatar + SplitButton) and passes the full beta gate.

## Risks

- Avatar is **stable** — internals change but public API must not. Guard: keep `menuItems`/`menuLabel`; run the full stable gate + AT-snapshot compare (refresh only if the accessible tree legitimately improves).
- Radix DropdownMenu portals to `document.body` — story `render` must handle `viewMode === "docs"` (don't auto-open over the docs page) and AT capture must include portal content (the test-runner already diffs portal siblings since batch 3).
- SplitButton submenus: Radix `Sub` replaces the manual `openSubIndex` state — verify hover + keyboard (ArrowRight/Left) parity.
