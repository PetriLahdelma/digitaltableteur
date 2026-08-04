"use client";

import { TreeView, type TreeViewNode } from "@dt/TreeView";
import { taxonomy, type TaxonomyNode } from "./taxonomy";

function toNodes(entries: TaxonomyNode[]): TreeViewNode[] {
  return entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    ...(entry.children ? { children: toNodes(entry.children) } : {}),
  }));
}

const nodes = toNodes(taxonomy);

export default function TaxonomyTree() {
  return <TreeView aria-label="Bird taxonomy" nodes={nodes} />;
}
