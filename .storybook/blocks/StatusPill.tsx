import React from "react";
import Badge from "@dt/Badge";
import styles from "./StatusPill.module.css";

export type ComponentStatus = "alpha" | "beta" | "stable" | "deprecated";

const TONE_BY_STATUS: Record<
  ComponentStatus,
  "success" | "info" | "warning" | "error"
> = {
  stable: "success",
  beta: "info",
  alpha: "warning",
  deprecated: "error",
};

/**
 * Component lifecycle pill for the docs frame header and the landing gallery.
 * Dogfoods Badge; tone mapping mirrors the WipBadge status semantics
 * (stable = success, beta = info, alpha = warning, deprecated = error). The
 * `dot` prop renders a color-coded StatusDot in place of the semantic icon.
 */
export function StatusPill({ status }: { status: ComponentStatus }) {
  return (
    <Badge
      variant="secondary"
      tone={TONE_BY_STATUS[status]}
      size="sm"
      dot
      className={`${styles.pill} ${styles[status]}`}
    >
      {status}
    </Badge>
  );
}
