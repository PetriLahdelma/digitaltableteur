import React from "react";
import Icon, { type IconProps } from "@dt/Icon";

export type SemanticStatus = "success" | "info" | "warning" | "error";

export const STATUS_ICON_NAMES: Record<SemanticStatus, string> = {
  success: "check-circle",
  info: "info",
  warning: "warning",
  error: "x-circle",
};

const STATUS_COLORS: Record<SemanticStatus, string> = {
  success: "var(--color-success)",
  error: "var(--color-error)",
  warning: "var(--color-warning-contrast)",
  info: "var(--color-info)",
};

export type SemanticIconOptions = {
  size?: IconProps["size"];
};

export const getSemanticIcon = (
  status: SemanticStatus,
  options?: SemanticIconOptions,
) => {
  return (
    <Icon
      name={STATUS_ICON_NAMES[status]}
      size={options?.size}
      color={STATUS_COLORS[status]}
      ariaLabel={status}
      aria-hidden="true"
      data-semantic-icon={status}
    />
  );
};
