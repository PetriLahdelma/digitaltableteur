import React from "react";
import Icon from "@dt/Icon";

export type SemanticStatus = "success" | "info" | "warning" | "error";

const STATUS_ICON_NAMES: Record<SemanticStatus, string> = {
  success: "check-circle",
  info: "info",
  warning: "warning",
  error: "x-circle",
};

export const getSemanticIcon = (status: SemanticStatus) => {
  return (
    <Icon
      name={STATUS_ICON_NAMES[status]}
      ariaLabel={status}
      aria-hidden="true"
      data-semantic-icon={status}
    />
  );
};
