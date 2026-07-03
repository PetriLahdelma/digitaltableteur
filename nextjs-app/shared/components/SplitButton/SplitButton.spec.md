# SplitButton

## Intent
Primary action button paired with a dropdown toggle for related secondary actions, with collision-aware menu placement and optional nested submenus.

## Interaction contract
- Keyboard: ArrowDown/Enter/Space on the toggle opens the menu; ArrowUp/ArrowDown navigate items; Home/End jump to first/last enabled item; ArrowRight/ArrowLeft open/close a nested submenu; Tab is trapped inside the open menu; Escape closes the menu and returns focus to the toggle.
- Pointer: click the primary segment to fire `onPrimaryClick`; click the toggle segment to open/close the menu; click a menu item to fire its `onSelect`; click outside closes the menu.
- Screen readers: toggle exposes `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`; menu items use `role="menuitem"`; disabled items are excluded from roving-tabindex navigation.

## Do / don't
- Do: use for a primary action that has closely related alternate actions (Save / Save as, Export PDF / Export CSV).
- Do: pass `usePortal` when the trigger sits inside an `overflow: hidden` container.
- Don't: use for unrelated actions; prefer separate Buttons.
- Don't: promote past alpha without a11y review, forced-colors verification, and light/dark verification (see roadmap below).

## Design notes
- Tokens: inherits from the composed Button and Icon components; own menu chrome tokens are listed in the contract (colors --color-dark/muted/neutral-bg/primary/white, spacing --space-internal-4/6/8, radii --radius-sm/md).
- i18n: the toggle's default accessible name is `t("splitButton.moreOptions")`; keys exist in en/fi/sv (added 2026-07-03 — they were missing, so the toggle used to announce the literal key).
- Status: alpha. Doc data (usage, best practices, anatomy, playground) authored in the Astryx Phase 3 batch 1 sweep on 2026-07-03; forced-colors and light/dark verification still pending before beta.
