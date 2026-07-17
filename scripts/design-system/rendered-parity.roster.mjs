/**
 * Rendered-parity enforcement roster.
 *
 * `enforced` lists components whose React↔native story pairs have been
 * audited and match across the comparison matrix; the gate fails on any
 * regression for them (ratchet — enforcement is never removed, only added).
 * Components not yet enrolled are measured and reported but do not fail the
 * gate; enrol them by fixing their pairs and running
 * `check-rendered-parity.mjs --update-roster`.
 *
 * `exceptions` are narrow, reviewed waivers for INTENTIONAL native
 * divergence, keyed per component/story/mode with a concrete reason.
 * No blanket thresholds, no automatic baseline acceptance: the gate fails
 * on stale exceptions (pair now matches) and on drift past the recorded
 * ratio.
 */
export const enforced = [
  "Avatar",
  "Badge",
  "BlogMediaImage",
  "Container",
  "CookieConsent",
  "GroupLabel",
  "IconButton",
  "List",
  "Menu",
  "NavMenuList",
  "SelectOption",
  "SkipLink",
  "SplitButton",
  "Testimonial"
];

export const exceptions = [];
