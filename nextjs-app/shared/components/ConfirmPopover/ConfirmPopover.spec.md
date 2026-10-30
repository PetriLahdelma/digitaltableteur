# ConfirmPopover

## Intent
Asks for confirmation right where the person acted, for one costly action ("Clear the answers in this section?"). After Ant Design's Popconfirm: smaller and closer than a modal, so the person keeps their place.

## Interaction contract
- Keyboard: the trigger opens it; focus starts on Cancel; Tab moves to the confirm button; Escape cancels and returns focus to the trigger.
- Pointer: a click outside cancels; the confirm button runs `onConfirm` and closes.
- Screen readers: `role="alertdialog"`, named by `title`, described by `description`.
- With `choices`: the first step asks which action (`title`) and lists one button per choice; focus starts on the first choice (a confirmation always follows). Picking one mounts a new alertdialog with that choice's question, description and confirm label, so screen readers announce it, and focus starts on Cancel. `onConfirm` receives the choice's `id`.

## Do / don't
- Do: repeat the action in `confirmLabel` ("Clear answers", not "Yes"); say what happens in `description`.
- Do: use `tone="error"` for actions that remove something.
- Don't: use it when the action can be undone; offer Undo instead.
- Do: keep `choices` to two or three related actions, for example "Clear this section" and "Clear all".
- Don't: put forms or long explanations inside; use Modal.

## Design notes
- Tokens: `--color-white` surface, `--color-border` edge, `--shadow-lg`; 24px padding, 32px between the text and the buttons.
- Buttons are default size (md), Cancel secondary, confirm primary in the chosen tone.
- `arrow` (off by default) draws a 16x8 pointer from the middle of the edge `side` names (top, right, bottom or left) and centres the popover on the trigger; `align` does not apply (dev warning, `forbiddenCombos`): the fill
  covers the surface border where they join and the stroke carries the border
  round the point, so it reads as one speech bubble. Forced colours use
  Canvas and CanvasText.
- `shortcut` shows the keys that run the action without asking, under the
  description, through the shared keycap row (`Kbd/KbdShortcut`, also used by
  Tooltip): modifier symbols as icons with translated names, joined by plus
  signs, tinted with the muted ink.
- Production use with both: the chat's New chat button (`side="left"`).
- Figma: not yet drawn.
