# Lightbox

## Intent

A modal image viewer for a set of images. It portals a dialog above the page, traps focus
inside it, moves between images with the arrow keys, and restores focus to the trigger on
close. Consumed by `ProjectGallery` and case-study pages so each gallery does not
reimplement focus handling and keyboard navigation.

## Interaction contract

| Input | Result |
|-------|--------|
| `open` becomes true | Panel portals in, page content gets `inert`, focus moves to the first control |
| Escape | Calls `onOpenChange(false)`; the parent owns the state change |
| ArrowRight | Advances one image, wrapping from the last back to the first |
| ArrowLeft | Steps back one image, wrapping from the first to the last |
| Backdrop click | Calls `onOpenChange(false)` |
| `open` becomes false | Panel unmounts, `inert` is removed, focus returns to the previously focused element |
| `initialIndex` changes while open | Resets to that index |

Key handling is bound at the `window` level while open, so the shortcuts work regardless
of which control inside the panel currently holds focus.

## Do / don't

- Do (must): give every image a real `alt` -- a caption is visible to everyone and is not
  a substitute, so without alt an AT user gets an unlabelled graphic.
- Do (must): keep the component mounted and drive it with `open` -- unmounting on close
  destroys the panel before focus can return, stranding the user at the top of the page.
- Do: pass `onOpenChange` and treat it as the single source of truth for open state, so
  Escape and backdrop clicks stay in sync with the parent.
- Do: pass `initialIndex` when opening from a specific thumbnail, so the viewer opens on
  the image the user clicked rather than the first.
- Don't (must): nest a Lightbox inside a Modal -- both trap focus and apply `inert`, and
  the inner trap wins, leaving the outer dialog unreachable but still visible.
- Don't: use it for non-image content. It is sized and captioned for images; use `Modal`
  for arbitrary content.
- Don't: put interactive controls in a caption. The caption is announced as part of the
  image's description, and controls inside it are unreachable in that reading order.
- Don't: rely on the counter as the only position cue. It is visual; the accessible name
  carries position for AT.

## Design notes

The panel renders through `createPortal` so it escapes any ancestor `overflow: hidden` or
transform, which is what breaks naive gallery overlays inside cards.

Focus is captured on open into the panel and restored to `previousActiveElement` on close.
That restore is why the component must not be conditionally mounted: React unmounts before
the effect can run.

## Status

Alpha. Beta needs `forcedColorsVerified` and `lightDarkVerified`; a backdrop-heavy overlay
is exactly the shape that fails forced-colors, so this should be verified before promotion
rather than assumed.
