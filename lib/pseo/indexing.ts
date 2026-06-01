import { getPseoCatalog } from "./catalog";

/** Leaf slugs approved for search indexing (pilot / batch rollout). */
export function getIndexedPseoLeafSlugs(): Set<string> {
  const slugs = getPseoCatalog().generation?.indexedLeafSlugs ?? [];
  return new Set(slugs);
}

export function isPseoLeafIndexable(slug: string): boolean {
  return getIndexedPseoLeafSlugs().has(slug);
}
