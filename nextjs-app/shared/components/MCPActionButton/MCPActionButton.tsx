import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button, { type ButtonAsButton, type ButtonAsLink } from "@dt/Button";
import Text from "@dt/Text";
import styles from "./MCPActionButton.module.css";

type MCPActionButtonExtras = {
  /** Identifier for the MCP tool to invoke */
  toolId: string;
  /** Optional payload for the MCP call */
  payload?: Record<string, unknown>;
  /** Async executor for the MCP action */
  onExecute?: (input: {
    toolId: string;
    payload?: Record<string, unknown>;
  }) => Promise<unknown>;
  /** Callback for successful results */
  onResult?: (result: unknown) => void;
  /** Callback for errors */
  onError?: (error: unknown) => void;
  /** Button label override */
  children?: React.ReactNode;
};

export type MCPActionButtonProps =
  | (Omit<ButtonAsButton, "children" | "onClick"> & MCPActionButtonExtras)
  | (Omit<ButtonAsLink, "children" | "onClick"> & MCPActionButtonExtras);

type Status = "idle" | "loading" | "success" | "error";

const governanceBlueprint = {
  component_id: "mcp_action_button",
  semantic_role: "intent-router",
  primary_function:
    "Trigger MCP tools with observable feedback and context capture",
  adaptive_level: "self-governed",
  context_sensitivity: {
    user_role: true,
    device: true,
    intent: true,
  },
  mutation_rules: [
    "Lock interaction while MCP call is executing",
    "Expose live status text for screen readers",
    "Elevate warning styling when error rate increases",
  ],
  transformation_rules: [
    "Action → Inline status chip after execution",
    "Action → Secondary control when embedded inside dense lists",
  ],
  governance_checks: [
    "Ensure aria-live is present for status",
    "Tokenize padding, radius, and border",
    "Respect prefers-reduced-motion for status transitions",
  ],
  performance_metrics: [
    "interaction_success_rate",
    "latency_perceived",
    "friction_score",
  ],
  evolution_log: [],
} as const;

const STATUS_TO_KEY: Record<Status, string> = {
  idle: "mcpActionButton.status.idle",
  loading: "mcpActionButton.status.loading",
  success: "mcpActionButton.status.success",
  error: "mcpActionButton.status.error",
};

/**
 * MCPActionButton component.
 */
export const MCPActionButton: React.FC<MCPActionButtonProps> = (props) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("idle");
  const {
    toolId,
    payload,
    onExecute,
    onResult,
    onError,
    children,
    disabled,
    isDisabled,
    className = "",
  } = props;
  const effectiveDisabled = isDisabled ?? disabled;

  const statusKey = effectiveDisabled
    ? "mcpActionButton.status.notReady"
    : STATUS_TO_KEY[status];
  const mergedClassName = useMemo(
    () => `${styles.button} ${className}`.trim(),
    [className],
  );

  const handleClick = async () => {
    if (!onExecute || effectiveDisabled) return;
    setStatus("loading");
    try {
      const result = await onExecute({ toolId, payload });
      onResult?.(result);
      setStatus("success");
    } catch (error) {
      onError?.(error);
      setStatus("error");
    }
  };

  const commonProps = {
    className: mergedClassName,
    isDisabled: effectiveDisabled || status === "loading",
    onClick: handleClick,
    accessibleDescription: t("mcpActionButton.actionDescription"),
  };

  const renderButton = () => {
    if (typeof props.href === "string") {
      const {
        href,
        submits: _submits,
        toolId: _toolId,
        payload: _payload,
        onExecute: _onExecute,
        onResult: _onResult,
        onError: _onError,
        children: _children,
        disabled: _disabled,
        isDisabled: _isDisabled,
        className: _className,
        ...rest
      } = props;

      return (
        <Button href={href} {...rest} {...commonProps}>
          {children ?? t("mcpActionButton.label")}
        </Button>
      );
    }

    const {
      href: _href,
      toolId: _toolId,
      payload: _payload,
      onExecute: _onExecute,
      onResult: _onResult,
      onError: _onError,
      children: _children,
      disabled: _disabled,
      isDisabled: _isDisabled,
      className: _className,
      ...rest
    } = props;

    return (
      <Button {...rest} {...commonProps}>
        {children ?? t("mcpActionButton.label")}
      </Button>
    );
  };

  return (
    <div
      className={styles.container}
      data-component-id={governanceBlueprint.component_id}
      data-status={status}
    >
      {renderButton()}
      <Text
        as="div"
        size="S"
        role="status"
        aria-live="polite"
        className={`${styles.status} ${effectiveDisabled ? styles.disabled : ""}`}
      >
        {t(statusKey)}
      </Text>
    </div>
  );
};

MCPActionButton.displayName = "MCPActionButton";
// @ts-expect-error - governance is added for documentation/analysis purposes
MCPActionButton.governance = governanceBlueprint;

export default MCPActionButton;
