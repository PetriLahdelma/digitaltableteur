import React from "react";
import Icon from "@dt/Icon";

export type SemanticStatus = "success" | "info" | "warning" | "error";

const STATUS_ICON_NAMES: Record<SemanticStatus, string> = {
  success: "check-circle",
  info: "info",
  warning: "triangle-exclamation",
  error: "x-circle",
};

export const getSemanticIcon = (status: SemanticStatus) => {
  const iconName = STATUS_ICON_NAMES[status];
  return (
    <Icon
      name={iconName}
      aria-hidden="true"
      decorative
      data-semantic-icon={status}
    />
  );
};
