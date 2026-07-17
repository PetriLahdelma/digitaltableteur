/**
 * Single source of truth for "this contract prop deliberately has no
 * Controls-panel row". Consumed by BOTH sides of the controls system:
 *
 *   - .storybook/lib/controls-autogen.ts derives argTypes from contracts and
 *     hides these props (table.disable) instead of rendering dead widgets.
 *   - scripts/design-system/audit-controls.mjs excludes them from the
 *     operability denominator (a deliberately hidden row is not "missing").
 *
 * Categories:
 *   plumbing         — DOM/React wiring a human never sets from a panel.
 *   ref              — Ref-typed props, same class as `ref` itself.
 *   handler          — event callbacks; the actions pane covers them.
 *   react-node       — ReactNode/Element slots: a "Set object" button helps
 *                      nobody. (`children` is exempt — the enhancer gives it
 *                      a text control or stories map presets onto it.)
 *   composite        — arrays / Record types: same "Set object" problem, and
 *                      a seeded "" scalar actively breaks components
 *                      (Accordion openIds: "" = controlled-empty, #1238).
 *   controlled-pair  — the controlled half of a value/defaultValue-style
 *                      pair. "" is a LEGITIMATE controlled value, so it can
 *                      never be seeded as a no-op; a seeded "" locks the
 *                      canvas into controlled-empty (dead typing,
 *                      TransformingActionInput #1242). Drive the playground
 *                      via the default* sibling instead.
 */

export const PLUMBING = new Set([
  "ref",
  "style",
  "key",
  "asChild",
  "as",
  "data-role",
  "aria-label",
  "id",
]);

/** The `defaultX` sibling name for a controlled prop `x`, if the contract has one. */
export function controlledPairPartner(prop, allPropNames) {
  const partner = `default${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
  return allPropNames.includes(partner) ? partner : null;
}

/**
 * @param {string} prop      contract prop name
 * @param {string} type      contract prop type string
 * @param {string[]} allPropNames all prop names on the same contract
 * @returns {string|null} the hidden-by-design category, or null (needs a row)
 */
export function hiddenByDesign(prop, type, allPropNames) {
  if (PLUMBING.has(prop)) return "plumbing";
  if (/^(React\.)?(Ref|RefObject|MutableRefObject)\b/.test(type)) return "ref";
  if (/^on[A-Z]/.test(prop) || type.includes("=>") || /^\(/.test(type)) {
    return "handler";
  }
  if (prop !== "children" && /ReactNode|Element|Children/i.test(type)) {
    return "react-node";
  }
  if (type.includes("[]") || /\bArray</.test(type) || /\bRecord</.test(type)) {
    return "composite";
  }
  if (controlledPairPartner(prop, allPropNames)) return "controlled-pair";
  return null;
}
