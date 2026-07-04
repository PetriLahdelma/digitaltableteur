# Menu

## Intent
The shared dropdown-menu primitive: a focusable trigger opens a portaled
list of actions. Built on `@radix-ui/react-dropdown-menu`, so Radix owns
the a11y model and this layer contributes only the visual treatment.
Composed from parts: `Menu` (root, open state) > `MenuTrigger asChild`
around the real control > `MenuContent` holding `MenuItem`,
`MenuSeparator`, and nested `MenuSub` > `MenuSubTrigger` +
`MenuSubContent`. It is the dogfooded engine behind Avatar's account menu
and SplitButton's options.

## Interaction contract
- Keyboard: the trigger opens on `Enter`/`Space`/`ArrowDown` with
  `aria-haspopup=menu` and `aria-expanded`. Inside, `ArrowUp`/`ArrowDown`
  move the roving focus, `Home`/`End` jump to ends, typeahead focuses by
  label, `Enter` selects. `Escape` closes and returns focus to the
  trigger; `Tab` closes and moves on (non-modal menu-button pattern).
- Submenus: `MenuSubTrigger` opens on `ArrowRight`/hover and closes on
  `ArrowLeft`/`Escape`.
- Pointer: click the trigger to toggle; click outside to dismiss.
- Screen readers: content is `role=menu`, items `role=menuitem`;
  disabled items are announced disabled and skipped by navigation.

## Do / don't
- Do: wrap the real Button/Avatar with `asChild` so it receives the
  trigger wiring directly.
- Do: put the item glyph in the `icon` slot so labels align in a column;
  use `href` for navigation items and `onSelect` for actions.
- Don't: use Menu for primary site navigation — a list of page links is
  `NavMenuList` with `aria-current`, not a `role=menu`.
- Don't: hand-roll positioning or keyboard handling around Menu; Radix
  provides collision, roving focus, typeahead, and Escape.
- Don't: promote past alpha without real consumers (Avatar + SplitButton)
  and the full beta gate.

## Design notes
- Tokens: surface/border/radius/shadow and the `--color-neutral-bg`
  highlight come from `variables.css` via Menu.module.css; item rows are
  ~40px with a fixed 1.25rem leading-icon gutter (16px glyph); the
  open/close scale-fade animation drops under `prefers-reduced-motion`.
- `side`/`align`/`sideOffset` set placement; Radix flips on collision
  (12px collision padding). Highlight is Radix `[data-highlighted]`, not
  `:hover`/`:focus`, so pointer and keyboard share one visual state.
- Figma: not yet designed (alpha; primitive extracted from the existing
  Avatar and SplitButton menus).
