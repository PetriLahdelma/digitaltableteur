"use client";

import { useMemo, useState } from "react";
import { TreeView, type TreeViewNode } from "@digitaltableteur/react";
import { ResizablePanelGroup } from "@digitaltableteur/react";

export type TaxonomyEntry = {
  name: string;
  group: string;
  status: string;
  dense: string;
};

const groupLabel = (group: string) =>
  group.charAt(0).toUpperCase() + group.slice(1).replaceAll("-", " ");

/**
 * The component taxonomy as an application tree: expand a group, select a
 * component, and its dense contract line (the exact string agents retrieve)
 * renders below. Built from the generated docs registry, so the tree always
 * matches the machine-readable surface.
 */
export function ComponentTaxonomyTree({ entries }: { entries: TaxonomyEntry[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { nodes, byId } = useMemo(() => {
    const groups = new Map<string, TaxonomyEntry[]>();
    for (const entry of entries) {
      const list = groups.get(entry.group) ?? [];
      list.push(entry);
      groups.set(entry.group, list);
    }
    const byId = new Map(entries.map((entry) => [entry.name, entry]));
    const nodes: TreeViewNode[] = [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, members]) => ({
        id: `group:${group}`,
        label: groupLabel(group),
        description: `${members.length}`,
        children: members
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((entry) => ({
            id: entry.name,
            label: entry.name,
            description: entry.status,
          })),
      }));
    return { nodes, byId };
  }, [entries]);

  const selected = selectedId ? byId.get(selectedId) : undefined;

  // The workbench split both contracts document: TreeView composesWith
  // ResizablePanelGroup and vice versa. The separator is keyboard-resizable
  // (arrows, Home/End) with min sizes keeping both panes usable.
  return (
    <ResizablePanelGroup
      panels={[
        {
          id: "taxonomy",
          ariaLabel: "Component taxonomy",
          minSize: 30,
          initialSize: 55,
          content: (
            <div className="max-h-96 overflow-y-auto pr-2">
              <TreeView
                aria-label="Component taxonomy"
                nodes={nodes}
                size="sm"
                selectedId={selectedId}
                onSelectedIdChange={setSelectedId}
              />
            </div>
          ),
        },
        {
          id: "contract",
          ariaLabel: "Contract details",
          minSize: 25,
          initialSize: 45,
          content: (
            <p
              aria-live="polite"
              className="pl-4 text-sm leading-relaxed text-muted-foreground"
            >
              {selected ? (
                <>
                  <span className="font-mono text-xs">{selected.name}</span>{" "}
                  <span className="font-mono text-xs">
                    ({selected.status})
                  </span>{" "}
                  — {selected.dense}
                </>
              ) : (
                "Select a component to see the dense contract line agents retrieve."
              )}
            </p>
          ),
        },
      ]}
    />
  );
}
