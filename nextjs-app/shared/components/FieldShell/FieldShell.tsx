"use client";

import React from "react";
import { cn } from "../../lib/cn";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import Icon from "@dt/Icon";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@dt/Menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@dt/Tooltip";
import fieldStyles from "../../styles/field.module.css";
import styles from "./FieldShell.module.css";

/** Semantic state of a field: colours the control border and the message under it. */
export type FieldStatus = "error" | "warning" | "success";

/** One entry in a field action's menu. */
export interface FieldActionItem {
  /** Visible item text. */
  label: string;
  /** Runs when the item is chosen; the menu closes after. */
  onSelect: () => void;
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Disables the item. */
  disabled?: boolean;
  /** "destructive" gives the item the error treatment. @default "neutral" */
  tone?: "neutral" | "destructive";
}

/**
 * An icon button in the label row. With `onClick` it runs an operation
 * directly; with `items` it opens a menu of operations instead.
 */
export interface FieldAction {
  /** Accessible name and tooltip, e.g. "Generate password". */
  label: string;
  /**
   * Phosphor icon name (e.g. "copy") or a rendered icon element. A menu
   * action defaults to the vertical three-dot overflow icon.
   */
  icon?: React.ReactNode | string;
  /** Runs the operation directly. Ignored when `items` is set. */
  onClick?: () => void;
  /** Opens a menu of these operations instead of running one. */
  items?: FieldActionItem[];
  /** Disables this action; every action is disabled with the field. */
  disabled?: boolean;
}

export interface FieldShellProps {
  /** id of the control inside; the label, status and helper ids derive from it. */
  controlId: string;
  /** Visible field label. */
  label: string;
  /** The control: an input, textarea, select or composite control. */
  children: React.ReactNode;
  /** Semantic state; pairs with `statusMessage`. */
  status?: FieldStatus;
  /** Message under the control, styled and announced for `status`. */
  statusMessage?: string;
  /** Supporting copy under the control, after the status message. */
  helperText?: string;
  /** Icon buttons at the end of the label row, level with the label. */
  actions?: FieldAction[];
  /** Shows the required marker on the label. @default false */
  required?: boolean;
  /** Dims the label and disables every action. @default false */
  disabled?: boolean;
  /** Visually hides the label; it stays the control's accessible name. @default false */
  hideLabel?: boolean;
  /** Merged onto the field wrapper. */
  className?: string;
}

/** Ids the shell renders, derived from the control id. */
export function fieldIds(controlId: string) {
  return {
    label: `${controlId}-label`,
    status: `${controlId}-status`,
    helper: `${controlId}-helper`,
  };
}

/**
 * The aria-describedby value for a control inside a FieldShell: the status
 * message first, then the helper line, then any ids the consumer passed.
 */
export function fieldDescribedBy(
  controlId: string,
  parts: { statusMessage?: string; helperText?: string },
  extra?: string,
): string | undefined {
  const ids = fieldIds(controlId);
  return (
    [
      parts.statusMessage ? ids.status : null,
      parts.helperText ? ids.helper : null,
      extra,
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

/**
 * Folds the `error` shorthand every field accepts into `status` and
 * `statusMessage`. An error always wins over another status.
 */
export function resolveFieldStatus({
  status,
  statusMessage,
  error,
}: {
  status?: FieldStatus;
  statusMessage?: string;
  error?: string;
}): { status?: FieldStatus; statusMessage?: string } {
  if (error) return { status: "error", statusMessage: error };
  return { status, statusMessage };
}

const statusClass: Record<FieldStatus, string> = {
  error: fieldStyles.statusError,
  warning: fieldStyles.statusWarning,
  success: fieldStyles.statusSuccess,
};

/** Field sizes shared by every DS field: 40, 48 or 56px tall. */
export type FieldSize = "sm" | "md" | "lg";

/** Class that sets a control's height, text size and inset; md needs none. */
export function fieldSizeClass(size?: FieldSize): string | undefined {
  if (size === "sm") return fieldStyles.sizeSm;
  if (size === "lg") return fieldStyles.sizeLg;
  return undefined;
}

/** Class that colours a control's border for `status`; put it on the element that composes the field chrome. */
export function fieldStatusClass(status?: FieldStatus): string | undefined {
  return status ? statusClass[status] : undefined;
}

/**
 * An action in the label row: the icon-button glyph (24px) on a 32px box
 * with square corners like the field, centred on the label line without
 * changing its height. Coarse pointers get a 44px hit area that changes no
 * layout.
 * The name shows in a DS Tooltip, which opens on keyboard focus as well as
 * hover (a native title is pointer-only).
 */
const FieldActionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    icon: React.ReactNode | string;
  }
>(function FieldActionTrigger({ label, icon, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(styles.action, className)}
      {...rest}
    >
      {typeof icon === "string" ? (
        <Icon name={icon} size={24} decorative />
      ) : (
        icon
      )}
    </button>
  );
});

function FieldActionButton({
  action,
  disabled,
}: {
  action: FieldAction;
  disabled: boolean;
}) {
  const isDisabled = disabled || !!action.disabled;
  const tip = <TooltipContent side="top">{action.label}</TooltipContent>;
  if (action.items && action.items.length > 0) {
    return (
      <Menu>
        <Tooltip>
          <TooltipTrigger asChild>
            <MenuTrigger asChild>
              <FieldActionTrigger
                label={action.label}
                icon={action.icon ?? "dots-three-vertical"}
                disabled={isDisabled}
              />
            </MenuTrigger>
          </TooltipTrigger>
          {tip}
        </Tooltip>
        <MenuContent align="end">
          {action.items.map((item) => (
            <MenuItem
              key={item.label}
              icon={item.icon}
              tone={item.tone}
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <FieldActionTrigger
          label={action.label}
          icon={action.icon ?? "dots-three-vertical"}
          disabled={isDisabled}
          onClick={action.onClick}
        />
      </TooltipTrigger>
      {tip}
    </Tooltip>
  );
}

/**
 * The frame every DS text and choice field is built on: a label row with
 * optional icon actions at its end, the control, then a status message and a
 * helper line. Owns no value or focus; the control inside does.
 */
export const FieldShell = React.forwardRef<HTMLDivElement, FieldShellProps>(
  function FieldShell(
    {
      controlId,
      label,
      children,
      status,
      statusMessage,
      helperText,
      actions,
      required = false,
      disabled = false,
      hideLabel = false,
      className,
    },
    ref,
  ) {
    const ids = fieldIds(controlId);
    const hasActions = !!actions && actions.length > 0;

    return (
      <div ref={ref} className={cn(styles.field, className)}>
        <div
          className={cn(
            styles.header,
            hideLabel && !hasActions && styles.headerHidden,
          )}
        >
          <Label
            id={ids.label}
            htmlFor={controlId}
            required={required}
            disabled={disabled}
            className={hideLabel ? styles.srOnly : undefined}
          >
            {label}
          </Label>
          {hasActions ? (
            <TooltipProvider>
              <div className={styles.actions}>
                {actions.map((action) => (
                  <FieldActionButton
                    key={action.label}
                    action={action}
                    disabled={disabled}
                  />
                ))}
              </div>
            </TooltipProvider>
          ) : null}
        </div>
        {children}
        {statusMessage || helperText ? (
          <div className={styles.messages}>
            {statusMessage ? (
              <HelperText id={ids.status} state={status}>
                {statusMessage}
              </HelperText>
            ) : null}
            {helperText ? (
              <HelperText id={ids.helper}>{helperText}</HelperText>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

FieldShell.displayName = "FieldShell";

export default FieldShell;
