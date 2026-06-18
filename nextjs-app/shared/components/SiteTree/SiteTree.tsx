import React from "react";

import Icon from "@dt/Icon";
import Link from "@dt/Link";

import styles from "./SiteTree.module.css";

export type SiteTreeNode = {
  /** Stable key for React lists */
  id: string;
  /** Visible label (already translated by the caller) */
  label: string;
  /** Page URL for leaf nodes, or optional index link on branches */
  href?: string;
  /**
   * Label (already translated) for a branch's own index link, surfaced as the
   * branch's first leaf. Defaults to `label`; set it to disambiguate from the
   * folder name, e.g. "Work overview" under the "Work" branch.
   */
  indexLabel?: string;
  /** Opens in a new tab with external affordance */
  external?: boolean;
  /** Nested pages or sections */
  children?: SiteTreeNode[];
  /** Initial expanded state for branch nodes */
  defaultExpanded?: boolean;
};

export type SiteTreeProps = {
  nodes: SiteTreeNode[];
  /** Accessible name for the navigation landmark */
  "aria-label"?: string;
  /** Expand all branch nodes by default */
  defaultExpandAll?: boolean;
  className?: string;
};

type SiteTreeBranchProps = {
  node: SiteTreeNode;
  depth: number;
  defaultExpandAll: boolean;
};

type SiteTreeLeafProps = {
  node: SiteTreeNode;
  depth: number;
};

const isBranch = (node: SiteTreeNode) => Boolean(node.children?.length);

function SiteTreeLeaf({ node, depth }: SiteTreeLeafProps) {
  const { label, href, external } = node;

  return (
    <li
      className={styles.leaf}
      style={{ "--site-tree-depth": depth } as React.CSSProperties}
    >
      <div className={styles.row}>
        <Icon name="file-text" size="sm" decorative />
        {href ? (
          <Link
            href={href}
            size="sm"
            className={styles.link}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {label}
          </Link>
        ) : (
          <span className={styles.label}>{label}</span>
        )}
      </div>
    </li>
  );
}

function SiteTreeBranch({
  node,
  depth,
  defaultExpandAll,
}: SiteTreeBranchProps) {
  const {
    id,
    label,
    href,
    indexLabel,
    external,
    children = [],
    defaultExpanded,
  } = node;
  const open = defaultExpandAll || defaultExpanded;

  // A branch toggle (<summary>) must not contain an interactive element: a link
  // nested inside <summary> is the axe `nested-interactive` violation and
  // leaves keyboard/screen-reader users unsure whether activating toggles or
  // navigates. When the branch has its own page, surface that as the first leaf
  // so the toggle and the link stay separate and both remain accessible. The
  // synthetic id is namespaced so it can't collide with a sibling node id, and
  // `indexLabel` lets callers disambiguate it from the folder name.
  const branchChildren: SiteTreeNode[] = href
    ? [
        {
          id: `site-tree-index:${id}`,
          label: indexLabel ?? label,
          href,
          external,
        },
        ...children,
      ]
    : children;

  return (
    <li
      className={styles.branchItem}
      style={{ "--site-tree-depth": depth } as React.CSSProperties}
    >
      <details className={styles.branch} open={open}>
        <summary className={styles.summary}>
          <Icon
            name="caret-right"
            size="xs"
            className={styles.caret}
            decorative
          />
          <Icon name="folder" size="sm" decorative />
          <span className={styles.summaryLabel}>
            <span className={styles.label}>{label}</span>
          </span>
        </summary>
        <SiteTreeList
          nodes={branchChildren}
          depth={depth + 1}
          defaultExpandAll={defaultExpandAll}
        />
      </details>
    </li>
  );
}

type SiteTreeListProps = {
  nodes: SiteTreeNode[];
  depth: number;
  defaultExpandAll: boolean;
};

function SiteTreeList({ nodes, depth, defaultExpandAll }: SiteTreeListProps) {
  if (!nodes.length) return null;

  return (
    <ul className={styles.list}>
      {nodes.map((node) =>
        isBranch(node) ? (
          <SiteTreeBranch
            key={node.id}
            node={node}
            depth={depth}
            defaultExpandAll={defaultExpandAll}
          />
        ) : (
          <SiteTreeLeaf key={node.id} node={node} depth={depth} />
        ),
      )}
    </ul>
  );
}

/** Hierarchical sitemap with folder branches and page leaves. */
const SiteTree: React.FC<SiteTreeProps> = ({
  nodes,
  "aria-label": ariaLabel = "Sitemap",
  defaultExpandAll = false,
  className,
}) => {
  if (!nodes?.length) return null;

  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <nav className={rootClassName} aria-label={ariaLabel}>
      <SiteTreeList
        nodes={nodes}
        depth={0}
        defaultExpandAll={defaultExpandAll}
      />
    </nav>
  );
};

export default SiteTree;
