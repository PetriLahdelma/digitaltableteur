# Plausible accessibility: visual brief

Follows the house [illustration standard](../../../docs/WRITING_STYLE.md#illustration-standard) and the palette and style rules in [`agentic-design-systems/VISUAL_BRIEF.md`](../agentic-design-systems/VISUAL_BRIEF.md). Status: illustrations produced and placed (2026-10-15); the two explanatory artifacts (A, B) are still to capture.

## The family

**Recurring motif: the stencil.** A person-shaped paper stencil: crisp outline, the inside cut away so the background shows through. It reads as a person at a glance and holds nobody. It is the article's spine made visible: output with the right shape and no one inside. It also echoes the "Aren't design systems just stencils?" talk, so the motif can recur across future Digitaltableteur pieces.

**Counter-motif: hands.** Wherever a real person matters (testing, judgment, lived experience), show hands doing something specific: on a keyboard, on a braille display, signing, holding a pen over a printout. Hands, never faces, so no illustration claims to depict "what a disabled person looks like".

**Style.** Print and editorial illustration in flat colour with subtle paper grain, cut-paper edges on the stencil. Ink `#041b23` lines, Paper `#f4f1ea` grounds, Teal `#85b5bd` secondary shapes, Violet `#812eff` as the single accent: violet always marks the human element, never the machine. No glow, no gradients, no robots, no glass, no readable text inside the artwork.

**Formats.** Hero 1536×1024. Section illustrations 1600×900, more margin, a single focal object.

## Placements

| # | Placement | Subject and metaphor | Alt treatment |
|---|-----------|----------------------|---------------|
| 0 | Hero | A stencil figure sits at a desk in front of a laptop, a neat column of checkmarks stamped down a sheet of paper beside it. The chair, desk, and laptop are solid; the figure is a hole. One violet hand reaches into frame from the right, resting on the keyboard. | Decorative: `alt=""` (the title carries the meaning) |
| 1 | After the opening ("Looks good to me") | A magnifying glass over a printed page of checkmarks. Through the lens, one checkmark turns out to be a stencil cut-out with nothing printed behind it. | Decorative: `alt=""` |
| 2 | "The median of an inaccessible web" | Dozens of translucent sheets (web page wireframes) stacked and slightly offset; where they overlap, the result is one blurred, average page. A stencil figure stands in front of the blur. | Decorative: `alt=""` |
| 3 | "Purpose, not pixels" (alt text) | A framed picture with a luggage tag tied to it. The tag hangs the wrong way round, facing the wall, so only its blank back is visible. | Decorative: `alt=""` |
| 4 | "Order, focus, and the keyboard" | A paper maze seen from above; a violet thread enters, loops around a closed box in the centre, and cannot find the way out. | Decorative: `alt=""` |
| 5 | "Who to call, and when" | A table with two chairs. The stencil figure stands up from one chair and steps aside; violet hands rest on the table in front of the other chair, next to a printed checklist with handwritten marks. | Decorative: `alt=""` |

## Explanatory figures (real artifacts, not illustrations)

| # | Placement | Artifact | Alt and caption |
|---|-----------|----------|-----------------|
| A | Opening, after the 949 records | Side-by-side excerpt of one committed evidence record before and after the silent strip: same story, same pass, `axe-no-violations` present on the left, missing on the right, exit code 0 under both. Real JSON from the repo history, cropped. | Alt describes the two records and the one missing field. Caption: "The same Storybook story's evidence record, captured with and without `CI=1`. Both runs exited 0." |
| B | "Names that sound right" | The real accessibility-tree snapshot diff from commit b73740e0f: the header button's old name (code twice, separator, "Switch to English") struck through above the new "EN, English. Show language options". A real artifact from the repo history; no mock needed. | Alt quotes both names and says English was active. Caption: "The same button before and after. Every automated check passed both." |
| C | "Who to call, and when" | The routing table from the article, set as a designed table (case, why automation misses it, who to bring in, what to give them). | Alt: summary of the table; the full table is also in the text, so the figure is a visual duplicate and could be `alt=""` if the HTML table is published instead. Prefer the HTML table. |

Capture A and B from the real systems before publishing; do not mock them.

## Produced and placed

All in `public/blog/plausible-accessibility/`, decorative, rendered with `alt=""`. The produced set follows the motif and palette; two placements changed from the brief where the delivered image fit a different section better.

| File | Placement | Notes |
|------|-----------|-------|
| `hero-stencil-at-desk.webp` (1536×1024) | Hero (`mainImageUrl`) | As briefed: stencil at the desk, checklist, violet hand on the keyboard |
| `fig-hollow-checkmark.webp` | After the opening, where the concept lands | As briefed: magnifier finds a dashed, hollow checkmark |
| `fig-median-web.webp` | "The median of an inaccessible web" | As briefed: stacked translucent pages and a stencil figure |
| `fig-outline-pulled-loose.webp` | "Purpose, not pixels" | Replaces the luggage-tag brief: a violet hand lifts an outline that no longer matches its shape, a description traced around the object rather than its purpose |
| `fig-focus-maze.webp` | "Order, focus, and the keyboard" | As briefed: violet thread loops around the centre and never gets out |
| `fig-who-to-call.webp` | "Who to call, and when", after the table | As briefed: the stencil leaves the chair; violet hands at the table with the checklist |
| `fig-placing-a-person.webp` (1536×1024) | "Works for whom", the close | Added: a violet hand places a real person into the empty frame beside the interface |
