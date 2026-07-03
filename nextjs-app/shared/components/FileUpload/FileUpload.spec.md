# FileUpload

## Intent
Wrap the native file input in a labelled, validated, AT-friendly form
control so consumers don't fight the native styling vs. accessibility
trade-off. The native input is kept hidden but functional; the visible
control is an Inputs + two Buttons that delegate to it.

## Interaction contract
- Keyboard: Tab focuses the visible Inputs field, then Browse, then
  Clear (when shown). Enter / Space on Browse or the Inputs field
  opens the picker. The hidden native input is never tab-reachable.
- Pointer: click on the Inputs field or the Browse button opens the
  picker. Click on Clear removes the selection without opening the
  picker.
- Screen readers: the Inputs label is announced; the current
  selection is read as the field value. Errors announce via the
  helper text live region linked through `aria-describedby`.

## Do / don't
- Do: pass `maxSizeInBytes`. Omitting `sizeErrorMessage` falls back to
  the localized `fileUploadSizeError` i18n key (en/fi/sv) with the
  max size interpolated; pass the prop only for custom copy.
- Do: server-side validate the type. `accept` is a UI hint, not a
  security boundary.
- Don't: render two FileUploads in the same form without unique
  labels. The labels disambiguate the AT context; identical labels
  collide.
- Don't: rely on `value` for "the file is already on the server".
  FileUpload is for *selection*, not display of an already-uploaded
  asset. Render an uploaded asset as Link + Clear control instead.
- Don't: skip the Clear button. Users who picked the wrong file have
  no recovery path without it on mobile (the platform sheet doesn't
  expose a "clear" affordance once a file is bound).

## Design notes
- Tokens: the visible Inputs uses standard `--input-height-md` and
  inherits its border / surface tokens from `Inputs`. Browse uses
  `Button variant="secondary" size="m"`; Clear uses
  `Button variant="tertiary" size="s"`. Actions are laid out
  horizontally via `--space-internal-8` gap.
- Figma: https://www.figma.com/design/digitaltableteur/file-upload —
  default / file-selected / error states.
- File summary format: `${name} (${size})` with `KB` for sub-MB and
  `MB` (to 1 decimal) above. Zero-byte files show as `(0 KB)` for
  clarity.
- Internal vs. external error state: `error` prop (external) wins
  over `internalError` (size validation). The component clears the
  internal error when a valid file is selected, but does not touch
  the external one — consumers control external errors.
