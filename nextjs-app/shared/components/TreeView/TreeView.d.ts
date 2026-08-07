import React from "react";
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
/** Application tree with roving focus, selection, and hierarchical keyboard navigation. */
export declare function TreeView({ nodes, "aria-label": ariaLabel, selectedId, defaultSelectedId, onSelectedIdChange, expandedIds, defaultExpandedIds, onExpandedIdsChange, size, className, }: TreeViewProps): React.JSX.Element;
export declare namespace TreeView {
    var displayName: string;
}
export default TreeView;
//# sourceMappingURL=TreeView.d.ts.map