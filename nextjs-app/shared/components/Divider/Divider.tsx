import React from "react";
import styles from "./Divider.module.css";

export interface DividerProps {
  /** Horizontal rule or vertical separator */
  orientation?: "horizontal" | "vertical";
  /** When true, removed from accessibility tree (purely visual) */
  decorative?: boolean;
  /** Optional spacing token class — use margin utilities on className */
  className?: string;
}

/** Semantic separator using production border tokens. */
export function Divider({
  orientation = "horizontal",
  decorative = true,
  className,
}: DividerProps) {
  const classNames = [
    orientation === "horizontal" ? styles.horizontal : styles.vertical,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <hr
      className={classNames}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
    />
  );
}

Divider.displayName = "Divider";
export default Divider;
