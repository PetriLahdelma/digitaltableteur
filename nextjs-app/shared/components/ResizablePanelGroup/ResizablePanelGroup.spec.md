# ResizablePanelGroup

## Intent

Let users allocate space between two or more adjacent work areas without
losing keyboard access or exceeding each panel's usable size.

## Interaction contract

- Separators support pointer dragging and arrow-key resizing.
- Home and End move a separator to the minimum and maximum permitted split.
- `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` describe the current
  separator position.
- Horizontal and vertical orientations share the same sizing model.

## Do / don't

- Do set realistic minimum sizes for every panel.
- Do label panels so their purpose remains clear to assistive technology.
- Don't allow essential controls to collapse below their usable size.
- Don't use resizable panels for a decorative split that does not need user
  control.

## Design notes

- Runtime flex-basis values are intentionally inline because they are
  interaction state, not static styling.
- The visible separator and focus treatment use semantic border and focus
  tokens.
- Panel content owns its own overflow behavior.
