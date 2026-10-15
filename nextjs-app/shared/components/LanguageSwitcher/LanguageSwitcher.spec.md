# LanguageSwitcher — spec

Compact locale selector. Molecule, navigation group.

## Intent

Let a visitor switch UI language from a small, header-friendly control that
shows the current language and reveals the alternatives on demand, without a
full dropdown's weight. Used in the site header.

## Purpose

Single, accessible language control shared across layouts. The parent owns the
language list and the change handler (i18n lives outside the component); this
renders the trigger + fanned options and the open/close behavior.

## API

| Prop               | Type                       | Notes                                   |
| ------------------ | -------------------------- | --------------------------------------- |
| `languages`        | `LanguageSwitcherOption[]` | `{ code, label, ariaLabel }` per locale |
| `currentLang`      | `string`                   | Selected language code                  |
| `onLanguageChange` | `(code: string) => void`   | Called when an option is chosen         |
| `className`        | `string`                   | Classes on the `role=group` wrapper     |
| `*ClassName`       | `string`                   | Style overrides for trigger/options     |

## Behavior

- Collapsed: shows only the current language as the trigger.
- Expanded: fans out the other locales as buttons; selecting one calls
  `onLanguageChange` and collapses.
- Closes on Escape and on outside click.
- Animations use a spring fan, swapped for a plain fade under reduced motion.

## Interaction contract

- **Trigger** is a `button` with `aria-expanded`, `aria-controls`, and
  `aria-current`; Enter/Space toggle it (native button).
- **Options** are native `button`s named "<label>, <ariaLabel>" (e.g. "FI, Suomi") with `lang` set to the option's code; Enter/Space activate.
- **Escape** closes the fan and returns control to the trigger.
- Verified by the `KeyboardToggle` story play function (open via trigger, close
  via Escape).

## Do / don't

- Do: pass the language's name as `ariaLabel` (e.g. "Suomi"), not just the code.
- Don't: pass an action or the code in `ariaLabel` ("FI, Switch to Suomi"). The component already adds the visible label and the show/hide action, so the trigger would announce the code twice and tell users to switch to the language already in use.
- Do: keep language state in the parent and feed `currentLang` back.
- Don't: translate inside the component; labels and accessible names come from the caller.
- Don't: render it as the only navigation; it complements rather than replaces site navigation.

## Accessibility

- `role="group"` with an `aria-label` ("Language").
- Trigger announces "<label>, <name>. Show language options" (or "Hide" when open)
  plus its expanded state; options announce "<label>, <name>". Both names start
  with the visible label (WCAG 2.5.3 Label in Name), and option buttons carry
  `lang` so screen readers pronounce each language's own name correctly.
- Reduced motion respected; colors inherit theme tokens (light/dark + forced
  colors safe).

## Design notes

- The "fan" is intentional brand motion; it degrades to a fade, never blocking
  use. Styling is utility-class driven with overridable `*ClassName` props for
  header vs. floated placements.
