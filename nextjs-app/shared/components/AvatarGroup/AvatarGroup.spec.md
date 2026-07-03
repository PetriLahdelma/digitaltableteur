# AvatarGroup

## Intent
Compact "who is involved" cluster: overlapping Avatars with a `+N`
overflow bubble. The Astryx-parity companion to Avatar noted as backlog
in the roadmap (5.2).

## Interaction contract
- Static by default; individual Avatars keep their own behavior
  (clickable, menu) if configured.
- Screen readers: `role="group"` + `ariaLabel` names the cluster; each
  Avatar announces its own name; the bubble announces "N more".

## Do / don't
- Do: pass Avatars of one size and match the group `size` (sm=2rem,
  md=2.5rem, lg=3rem) so the bubble aligns.
- Do: keep `max` low (3-5); the stack is a summary, not a roster.
- Don't: mix clickable and static Avatars in one stack.
- Don't: use it as navigation to profiles when the count matters more
  than the identities — use a list instead.

## Design notes
- Overlap is a fixed token step (`--space-internal-8`) which reads right
  for the three supported sizes.
- Each item carries a 2px `--color-surface` ring (Canvas in forced
  colors) so overlapping edges stay legible on any background.
- Overflow bubble uses the neutral Badge palette tokens.
