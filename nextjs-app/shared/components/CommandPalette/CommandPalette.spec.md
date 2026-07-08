# CommandPalette

## Intent
A modal, keyboard-first launcher for jumping to a command, page, or action
without reaching for the mouse. Opened by a shortcut (e.g. Cmd/Ctrl-K), it filters
a flat list of commands as you type and runs the highlighted one on Enter. Use it
for cross-surface navigation and quick actions, not as a menu bound to one control.

## Interaction contract
- Keyboard: type to filter (matches label + keywords); Arrow Down/Up move the
  active option, wrapping; Enter runs the active command and closes; Escape
  closes. Focus is trapped in the dialog and background scroll is locked while open.
- Pointer: hovering an option makes it active; clicking runs it; clicking the
  scrim closes.
- Controlled only: `open` + `onClose` own visibility; the component holds query
  and active-index state internally and resets them on open.
- Screen readers: the overlay is `role=dialog aria-modal`; the input is
  `role=combobox` with `aria-controls` + `aria-activedescendant` onto the
  `role=listbox`; each command is `role=option` with `aria-selected`.

## Do / don't
- Do: keep commands flat and label them as actions ("Go to Blog", "New post").
- Do: pass `keywords` for synonyms so fuzzy intent still matches.
- Don't: nest submenus or put long forms inside it — it is a launcher, not a
  workspace. Route or run on Enter and close.
- Don't: hardcode copy in the component — `label` / `placeholder` / `emptyText`
  are props so the host owns translation.

## Design notes
- Tokens: scrim from `--color-black`; dialog `--color-surface` + `--color-border`
  + shadow; text `--color-text` / `--color-muted`; radius/spacing from
  `--radius-*` / `--space-internal-*`. No hardcoded colors.
- Reuses `useFocusTrap` and `useScrollLock` (see Foundations/Utilities). The
  active option is a neutral tint; forced-colors maps it to a `Highlight` outline.
- Figma: TODO (parity build; no Figma node yet).

## Promotion notes
Parity build (Astryx `Command Palette`, reduced to the core launcher). Ships at
alpha with the WIP badge. Do not promote past alpha/beta without a documented
production consumer, AT snapshots, and forced-colors + light/dark verification.
