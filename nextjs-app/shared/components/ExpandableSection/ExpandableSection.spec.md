# ExpandableSection

## Intent
Provide a stand-alone disclosure surface for a single 'show more' affordance, without the multi-panel rhythm of `Accordion`.

## Interaction contract
- Keyboard: Tab to trigger; Enter / Space to toggle. Arrow keys are not bound (single-panel).
- Pointer: Click trigger to toggle.
- Screen readers: Trigger announces as 'button, {label}, collapsed' / 'expanded'. Panel content is announced when expanded.

## Do / don't
- Do: Use for a single detail-disclosure block (FAQ row in isolation, optional advanced settings, 'about the author' block on an article).
- Do: Default to collapsed unless the content is short and the page expects it open.
- Don't: Use a sequence of `ExpandableSection`s instead of `Accordion` — accordion owns the focus management and single-open behaviour.
- Don't: Hide critical content (errors, primary CTA) behind a disclosure.

## Design notes
- Colors: --color-text, --color-surface-elevated
- Spacing: --space-internal-8, --space-internal-12
- Figma: TODO — to be linked during the alpha → beta promotion.
- Catalog status: **alpha**, scaffolded as part of the Bucket-1
  catalog-gap migration on 2026-05-26.
