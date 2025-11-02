import React from "react";
import type { IconType } from "react-icons";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

export type SemanticStatus = "success" | "info" | "warning" | "error";

const STATUS_ICON_COMPONENTS: Record<SemanticStatus, IconType> = {
  success: FaCheckCircle,
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
  error: FaTimesCircle,
};

export const getSemanticIcon = (status: SemanticStatus) => {
  const IconComponent = STATUS_ICON_COMPONENTS[status];
  return (
    <IconComponent
      aria-hidden="true"
      focusable="false"
      data-semantic-icon={status}
    />
  );
};
