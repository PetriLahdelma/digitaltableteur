/**
 * Classify a `replacementFor` / `prefersOver` entry.
 *
 * These fields deliberately hold two different kinds of thing, and until now nothing
 * could tell them apart:
 *
 *   Button.replacementFor  = ["raw <button>", "shadcn Button", "@/components/ui/button"]
 *   Toast.replacementFor   = ["AlertBanner for transient feedback", "window.alert"]
 *
 * "AlertBanner for transient feedback" points at a documented component and belongs in
 * the relationship graph. "raw <button>" points at an anti-pattern that will never be a
 * documented entity, and belongs in guidance. Both are correct data. Treating them as
 * one type is what made the graph look broken.
 *
 * Classification rule: an entry references a component when its FIRST word is a known
 * component name. Everything after that word is context.
 *
 *   "AlertBanner for transient feedback" -> entity AlertBanner, context "for transient feedback"
 *   "inline SVG without Icon wrapper"    -> anti-pattern (mentions Icon, does not start with it)
 *   "shadcn Button"                      -> anti-pattern (starts with "shadcn")
 *
 * The first-word rule is deliberate rather than a substring search: "inline SVG without
 * Icon wrapper" mentions Icon but is not a reference to it.
 */

/**
 * @param {string} entry
 * @param {Set<string>} knownComponents
 * @returns {{kind: "entity", target: string, context: string|null, raw: string}
 *          | {kind: "anti-pattern", description: string, raw: string}}
 */
export function classifyRelationEntry(entry, knownComponents) {
  const raw = String(entry).trim();
  const first = raw.split(/\s+/)[0];
  if (first && knownComponents.has(first)) {
    const context = raw.slice(first.length).trim();
    return { kind: "entity", target: first, context: context || null, raw };
  }
  return { kind: "anti-pattern", description: raw, raw };
}

/**
 * @param {string[]} entries
 * @param {Set<string>} knownComponents
 */
export function partitionRelationEntries(entries, knownComponents) {
  const entities = [];
  const antiPatterns = [];
  for (const e of entries ?? []) {
    const c = classifyRelationEntry(e, knownComponents);
    if (c.kind === "entity") entities.push(c);
    else antiPatterns.push(c);
  }
  return { entities, antiPatterns };
}
