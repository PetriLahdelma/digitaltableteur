import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

import styles from "./DashLeadList.module.css";

export interface DashLeadListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Pseudo-list: one em-dash line per block, not a <ul>/<li>.
 * In MDX, put a blank line between each —Line so each becomes its own paragraph.
 */
export function DashLeadList({ children, className }: DashLeadListProps) {
  return (
    <div className={cn(styles.list, "not-prose", className)}>{children}</div>
  );
}

DashLeadList.displayName = "DashLeadList";
