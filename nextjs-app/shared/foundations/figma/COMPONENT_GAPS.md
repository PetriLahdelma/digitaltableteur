# Figma library — component rebuild Gaps report

Running log of fidelity gaps between code (source of truth) and the Figma library
(`PC2UPdYwm8qGt6ZTg0AakF`). Rule: build 100% from the design system, flag gaps, never invent.

## Button (406:1569) — icon wiring complete

Matrix: `Variant(9) × Size(3) × State(3) × Inverse(2)` = 108. Verified, 0 anomalies.

Icon model:
- Status variants (Error/Warning/Success/Info/SecondaryError/TertiaryError, 54): semantic
  glyph stays **baked per-variant** and visible (XCircle / Warning / CheckCircle / Info).
- Visual variants (Primary/Secondary/Tertiary incl. inverse, 54): shared optional leading
  `Icon` (INSTANCE_SWAP) + `Has Icon` (BOOL), default off.
- All 108: shared optional trailing `End Icon` + `Has End Icon`, default off.
- Default swap placeholder = ArrowRight, recolored per-child to the label color variable.

Gaps (flagged, not invented):
1. **Status leading icon is not swappable or hideable.** Figma's non-variant component
   properties carry a single global default with no per-variant default; linking the baked
   glyph to a shared INSTANCE_SWAP destroys the per-variant glyph (verified). So the
   code behavior `lookupIcon(icon) ?? getSemanticIcon(...)` is honored only for the
   default branch (semantic glyph shown); the override branch is not expressible on status
   variants without either a variant-axis explosion or per-family swap properties.
2. **`isRounded` not modeled.** `componentPropertyReferences` accepts only
   `visible | characters | mainComponent`; a BOOLEAN cannot drive `cornerRadius`. Faithful
   options: a Rounded variant axis (108→216) or a separate pill component. Deferred.
3. **Icon Only** deferred (user decision); code supports it via `!children && icon` → square.
4. **Error background `#b91c1c` untokenized** (pre-existing; recolor when a token exists).

## Avatar (369:8) — variant axis added

Added `Variant=Initials|Image` (was Size-only). Image variant = tokenized circle with a
centered Phosphor **User** placeholder glyph (swap for a real image fill in use).

Gaps:
1. **Image variant is a User-glyph placeholder**, not a real photo fill (Figma image fills
   need an uploaded hash). Designers replace with a photo. Faithful to the "image slot".
2. **Dropdown menu not modeled as a Figma sub-component.** Code's `menuItems` render a
   floating menu with per-item icons (`.avatarMenuIcon`). No caret on the trigger in code,
   so none added (would be invented). The menu molecule (with real Phosphor item icons) is
   a separate build, not done here.

## Form atoms — Checkbox / Radio / Switch

Icons here were already real (Checkbox Check glyph, Radio dot, Switch thumb). Work + gaps:

- **Checkbox (372:14)**: added **Indeterminate** state (Minus glyph `390:28558`) across SM/MD/LG;
  now Unchecked/Checked/Indeterminate/Disabled × 3 = 12. Matches code's `isIndeterminate`.
- **Radio (372:27)**: real Ellipse dot, no glyph needed. GAP: State is a single axis
  (Unchecked/Checked/Disabled) so disabled-checked can't be expressed; flagged, low priority.
- **Switch (373:14)**: real Ellipse thumb. GAPS: no **Disabled** and no **Loading** states
  (code has `isLoading` spinner + disabled). Loading needs a spinner glyph in the thumb;
  state expansion deferred/flagged.

## Inputs / TextArea / Select

- **Select (383:23)**: added baked **CaretDown** chevron to all 4 states, recolored per state.
  GAP: only a State axis; code has `size` (sm/md/lg) — Size axis missing.
- **Inputs (374:10)**: no icon props in code (type/size/error only), so no icons added.
  GAP: only State axis; code `size` (sm/md/lg) missing. password/search show no glyph in code.
- **TextArea (374:17)**: no inherent icons. Disabled state RESOLVED (cloned Default, bound
  bg `322:832` + text `322:844`, real disabled tokens) → 4 states. Resize affordance not modeled.

## Tabs / Accordion / FileUpload

- **Accordion (381:17)**: added expand/collapse carets — CaretDown (expanded) + CaretRight
  (collapsed) in the section headers, matching code's `<span className={styles.icon}>`.
- **Tabs (381:5)**: text tabs with underline indicator; code has no per-tab icons, none added.
  GAP: single static component — variants `default|pills|underline`, `size`, and disabled
  tab state not modeled as a component set.
- **FileUpload (384:26)**: REBUILT dropzone → **field + button** to match code: label +
  display field ('No file selected', real field tokens) + a composed **Button** instance
  (Secondary/MD) carrying the **UploadSimple** glyph + 'Browse'. Hidden-input/clear are behavioral.

## Toast / AlertBanner — semantic icons

- **Toast (393:35)**: fixed Success glyph plain `Check` → **CheckCircle**. All 5 intents now
  correct (Default none, Success CheckCircle, Warning, Error XCircle, Info), white on fill.
- **AlertBanner (394:41)**: added the 3 missing semantic icons — Success (CheckCircle),
  Warning, Error (XCircle); Info already present. Removed 3 orphan stray `Vector` nodes left
  in the icon frames from an earlier build. Bound each icon to its semantic color variable
  (color/info, color/success, color/warning, color/error).
  RESOLVED: added `Dismissible` BOOLEAN (default off) + a muted Phosphor **X** close glyph
  (top-right, `color/muted`) linked across all 4 variants. Verified on the Error variant.

> Note: live node ids for Toast/AlertBanner differed from the stale ledger ids
> (Toast 393:35 not 378:38; AlertBanner 394:41 not 378:25). Ledger ids refreshed.


## Discretionary follow-up pass (states + FileUpload)

- TextArea **Disabled** added (real disabled tokens). FileUpload **rebuilt** to field+button.
- Switch **Disabled** added per size (opacity-dimmed — no track-disabled token exists in the
  system; flagged as opacity-based rather than tokenized).

Still open (genuinely token/spec-blocked, not invented):
- **Switch Loading** (spinner-in-thumb) — niche; deferred.
- **Tabs** `default|pills|underline` + size + disabled — needs design direction on pill/default
  styling (current component is the underline treatment only).
- **Size axes** (Inputs/Select/TextArea) — BLOCKED: no control-height-per-size tokens exist
  (only `size/width/*`, `radius/*`, `space/*`); would require inventing heights.
- **Button** `isRounded` (variant-axis only) + Icon Only (user-deferred).
- **Avatar** dropdown menu molecule unbuilt.

## Organisms (page 331:825) — built (were empty)

All composed from real component instances + Phosphor glyphs + tokens.

- **ContactForm (470:2)**: heading + labeled Inputs (Full name, Email) + Message TextArea +
  FileUpload instance + full-width Submit Button. GAP: honeypot + per-field validation/error
  states are behavioral, not modeled; copy is illustrative (real copy is i18n).
- **NewsletterWaitlist (471:21)**: expanded state — title + subtitle + email Input + Notify
  Button. GAP: collapsed trigger/expand animation is behavioral, not modeled.
- **ChatWidget (473:25)**: panel with shadow, dark header (ChatCircleDots + title + close X),
  bot/user message bubbles, input row + PaperPlaneTilt send button. GAPs: message bubbles are
  bespoke (no Bubble component); launcher FAB, streaming/typing/error states not modeled.

## Patterns (page 331:826) — built (were empty)

- **SiteHeader (476:2)**: logo + brand + nav (Home/Work/About/Pricing/Blog/Contact) +
  Get-in-touch Button + List hamburger, bottom border. GAPs: theme/language controls
  (behavioral) not modeled; mobile drawer is just the hamburger affordance; logo is a DT
  placeholder mark, not the animated logo-bar.
- **SiteFooter (477:6)**: brand/tagline/address column + Company/Resources nav columns +
  divider + copyright + social glyphs (Instagram/LinkedIn/X/GitHub). GAPs: social set is a
  subset (Facebook/Medium/Substack/Dribbble omitted); neutral-light footer treatment chosen;
  nav columns illustrative.
