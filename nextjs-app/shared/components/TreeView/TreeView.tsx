"use client";

import React, { useMemo, useRef, useState } from "react";
import Icon from "@dt/Icon";
import styles from "./TreeView.module.css";

export type TreeViewNode = {
  /** Stable node identifier. */
  id: string;
  /** Visible node label. */
  label: React.ReactNode;
  /** Optional supporting content rendered after the label. */
  description?: React.ReactNode;
  /** Nested child nodes. */
  children?: TreeViewNode[];
  /** Prevents selection while keeping the node discoverable. */
  disabled?: boolean;
};

export interface TreeViewProps {
  /** Hierarchical nodes. */
  nodes: TreeViewNode[];
  /** Accessible name for the tree. */
  "aria-label": string;
  /** Controlled selected node identifier. */
  selectedId?: string | null;
  /** Initial uncontrolled selected node identifier. */
  defaultSelectedId?: string | null;
  /** Receives selection changes. */
  onSelectedIdChange?: (id: string) => void;
  /** Controlled expanded node identifiers. */
  expandedIds?: string[];
  /** Initial uncontrolled expanded node identifiers. */
  defaultExpandedIds?: string[];
  /** Receives expansion changes. */
  onExpandedIdsChange?: (ids: string[]) => void;
  /** Density scale. @default "md" */
  size?: "sm" | "md" | "lg";
  className?: string;
}

type FlatNode = {
  node: TreeViewNode;
  level: number;
  parentId: string | null;
};

function flattenVisible(
  nodes: TreeViewNode[],
  expandedIds: Set<string>,
  level = 1,
  parentId: string | null = null,
): FlatNode[] {
  return nodes.flatMap((node) => {
    const current = { node, level, parentId };
    if (!node.children?.length || !expandedIds.has(node.id)) return [current];
    return [
      current,
      ...flattenVisible(node.children, expandedIds, level + 1, node.id),
    ];
  });
}

/** Application tree with roving focus, selection, and hierarchical keyboard navigation. */
export function TreeView({
  nodes,
  "aria-label": ariaLabel,
  selectedId,
  defaultSelectedId = null,
  onSelectedIdChange,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedIdsChange,
  size = "md",
  className,
}: TreeViewProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    defaultSelectedId,
  );
  const [internalExpandedIds, setInternalExpandedIds] =
    useState<string[]>(defaultExpandedIds);
  const [focusedId, setFocusedId] = useState<string | null>(
    defaultSelectedId ?? nodes[0]?.id ?? null,
  );
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const currentSelectedId =
    selectedId === undefined ? internalSelectedId : selectedId;
  const currentExpandedIds =
    expandedIds === undefined ? internalExpandedIds : expandedIds;
  const expandedSet = useMemo(
    () => new Set(currentExpandedIds),
    [currentExpandedIds],
  );
  const visible = useMemo(
    () => flattenVisible(nodes, expandedSet),
    [expandedSet, nodes],
  );

  const updateExpanded = (next: string[]) => {
    if (expandedIds === undefined) setInternalExpandedIds(next);
    onExpandedIdsChange?.(next);
  };

  const toggle = (id: string, force?: boolean) => {
    const expanded = expandedSet.has(id);
    const nextExpanded = force ?? !expanded;
    updateExpanded(
      nextExpanded
        ? [...currentExpandedIds, id]
        : currentExpandedIds.filter((candidate) => candidate !== id),
    );
  };

  const select = (node: TreeViewNode) => {
    if (node.disabled) return;
    if (selectedId === undefined) setInternalSelectedId(node.id);
    onSelectedIdChange?.(node.id);
    if (node.children?.length) toggle(node.id);
  };

  const focusNode = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    itemRefs.current.get(id)?.focus();
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    entry: FlatNode,
  ) => {
    const index = visible.findIndex(({ node }) => node.id === entry.node.id);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusNode(visible[index + 1]?.node.id);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusNode(visible[index - 1]?.node.id);
        break;
      case "Home":
        event.preventDefault();
        focusNode(visible[0]?.node.id);
        break;
      case "End":
        event.preventDefault();
        focusNode(visible.at(-1)?.node.id);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (entry.node.children?.length && !expandedSet.has(entry.node.id)) {
          toggle(entry.node.id, true);
        } else {
          focusNode(visible[index + 1]?.node.id);
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (expandedSet.has(entry.node.id)) {
          toggle(entry.node.id, false);
        } else {
          focusNode(entry.parentId ?? undefined);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(entry.node);
        break;
      default:
        break;
    }
  };

  const rootClassName = [styles.tree, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} role="tree" aria-label={ariaLabel}>
      {visible.map((entry) => {
        const hasChildren = Boolean(entry.node.children?.length);
        const expanded = expandedSet.has(entry.node.id);
        return (
          <button
            key={entry.node.id}
            ref={(element) => {
              if (element) itemRefs.current.set(entry.node.id, element);
              else itemRefs.current.delete(entry.node.id);
            }}
            className={styles.item}
            type="button"
            role="treeitem"
            tabIndex={focusedId === entry.node.id ? 0 : -1}
            aria-level={entry.level}
            aria-expanded={hasChildren ? expanded : undefined}
            aria-selected={currentSelectedId === entry.node.id}
            aria-disabled={entry.node.disabled || undefined}
            data-level={entry.level}
            data-selected={
              currentSelectedId === entry.node.id ? "true" : undefined
            }
            onFocus={() => setFocusedId(entry.node.id)}
            onClick={() => select(entry.node)}
            onKeyDown={(event) => onKeyDown(event, entry)}
          >
            <span className={styles.indent} aria-hidden="true">
              {Array.from({ length: entry.level - 1 }, (_, index) => (
                <span key={index} className={styles.guide} />
              ))}
            </span>
            <Icon
              name={
                hasChildren ? (expanded ? "caret-down" : "caret-right") : "file"
              }
              size="sm"
              decorative
            />
            <span className={styles.content}>
              <span className={styles.label}>{entry.node.label}</span>
              {entry.node.description ? (
                <span className={styles.description}>
                  {entry.node.description}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

TreeView.displayName = "TreeView";

export default TreeView;
