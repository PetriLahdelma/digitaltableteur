# TreeView

## Intent

Present hierarchical data when users need to inspect branches, expand and
collapse groups, and select one node while preserving their place in the
structure.

## Interaction contract

- Uses ARIA tree and treeitem semantics with level, expanded, and selected
  state.
- Up and Down move through visible nodes using roving focus.
- Right expands a branch or moves to its first child; Left collapses a branch
  or moves to its parent.
- Home, End, Enter, and Space follow the conventional tree keyboard model.
- Expansion and selection can each be controlled or uncontrolled.

## Do / don't

- Do use stable node identifiers and concise labels.
- Do preserve expansion state when the surrounding view updates.
- Don't use TreeView for a flat list of navigation links.
- Don't place unrelated buttons or menus inside a tree item.

## Design notes

- Indentation is derived from the ARIA level and a single spacing step.
- Disclosure icons rotate without changing the item's hit area.
- Focus, hover, and selected states use semantic interaction tokens.
