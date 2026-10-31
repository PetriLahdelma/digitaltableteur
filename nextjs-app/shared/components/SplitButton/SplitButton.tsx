"use client";

import React from "react";
import { useTranslate } from "../../lib/translation";
import Button, { type ButtonProps } from "../Button";
import buttonStyles from "../Button/Button.module.css";
import Icon from "@dt/Icon";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@dt/Menu";
import styles from "./SplitButton.module.css";

// Base option properties shared by all option types
type BaseSplitButtonOption = {
  id?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode | string;
  trailingIcon?: React.ReactNode | string;
  disabled?: boolean;
  /** Optional tooltip shown on hover */
  title?: string;
};

// Discriminated union: options with children cannot have onSelect
export type SplitButtonOption =
  | (BaseSplitButtonOption & {
      /** Action invoked when selecting this option */
      onSelect?: () => void | Promise<void>;
      children?: never;
    })
  | (BaseSplitButtonOption & {
      /** Nested options for a second-level menu */
      children: SplitButtonOption[];
      onSelect?: never;
    });

export interface SplitButtonProps
  extends Pick<
    ButtonProps,
    "variant" | "size" | "surface" | "rounded" | "tooltip" | "accessibleName"
  > {
  /** Main label rendered on the primary segment */
  label: React.ReactNode;
  /** Primary action invoked when clicking the main segment */
  onPrimaryClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** List of alternative actions shown in the dropdown */
  options: SplitButtonOption[];
  /**
   * Which edge of the split button the menu lines up with: "start" puts the
   * menu under the whole control from its leading edge, "end" lines its end
   * up with the toggle. @default "start"
   */
  menuAlign?: "start" | "end";
  /** Disable both segments */
  disabled?: boolean;
  /** Accessible label for the dropdown trigger */
  toggleLabel?: string;
  /** Optional className forwarded to the outer wrapper */
  className?: string;
}

const isStringIcon = (icon: React.ReactNode | string): icon is string =>
  typeof icon === "string";

const resolveIcon = (
  icon: React.ReactNode | string | undefined,
): React.ReactNode | undefined => {
  if (icon == null) return undefined;
  if (isStringIcon(icon)) return <Icon name={icon} ariaLabel="" />;
  return icon;
};

/**
 * SplitButton renders a primary action with a trailing caret that opens a menu
 * of related actions. The dropdown is the shared Menu primitive (Radix
 * dropdown-menu): roving focus, arrow keys, typeahead, Escape, focus return,
 * submenus, and collision-aware placement come from Radix. The main button and
 * the toggle share the same visual variant for cohesion.
 */
const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  (
    {
      label,
      onPrimaryClick,
      options,
      variant = "primary",
      size = "md",
      surface = "default",
      rounded = false,
      tooltip,
      accessibleName,
      menuAlign = "start",
      disabled = false,
      toggleLabel,
      className,
    },
    ref,
  ) => {
    const t = useTranslate();
    const defaultToggleLabel = toggleLabel || t("splitButton.moreOptions");
    const isSecondary = variant === "secondary";
    const hasOptions = Array.isArray(options) && options.length > 0;
    // Only wire the Radix Menu when the toggle can actually open: a disabled
    // trigger still opens under Radix asChild, so gate the whole Menu instead.
    const menuActive = hasOptions && !disabled;

    // The menu is anchored to the toggle; to start it at the split button's
    // leading edge, shift it back by the distance from the main segment's
    // start to the toggle's start (the segments overlap by a border).
    const mainRef = React.useRef<HTMLButtonElement>(null);
    const [mainWidth, setMainWidth] = React.useState(0);
    React.useLayoutEffect(() => {
      const main = mainRef.current;
      if (!main) return;
      const measure = () => {
        const toggleEl = main.nextElementSibling;
        const start = main.getBoundingClientRect().left;
        setMainWidth(
          toggleEl ? toggleEl.getBoundingClientRect().left - start : main.getBoundingClientRect().width,
        );
      };
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(main);
      return () => observer.disconnect();
    }, []);

    const toggle = (
      <Button
        variant={variant}
        size={size}
        surface={surface}
        rounded={rounded}
        aria-label={defaultToggleLabel}
        disabled={disabled || !hasOptions}
        className={buttonStyles.splitToggle}
        tooltip={toggleLabel}
      >
        <span className={styles.caret}>
          <Icon name="caret-down" ariaLabel="" />
        </span>
      </Button>
    );

    const handleSelect = async (option: SplitButtonOption) => {
      if (option.disabled) return;
      try {
        await option.onSelect?.();
      } catch (error) {
        console.error("SplitButton option onSelect error:", error);
      }
    };

    const renderOption = (
      option: SplitButtonOption,
      index: number,
    ): React.ReactNode => {
      const key = option.id ?? option.label ?? index;
      if (option.children && option.children.length > 0) {
        return (
          <MenuSub key={key}>
            <MenuSubTrigger
              icon={resolveIcon(option.icon)}
              disabled={option.disabled}
            >
              {option.label}
            </MenuSubTrigger>
            <MenuSubContent>
              {option.children.map((child, childIndex) =>
                renderOption(child, childIndex),
              )}
            </MenuSubContent>
          </MenuSub>
        );
      }
      return (
        <MenuItem
          key={key}
          icon={resolveIcon(option.icon)}
          trailing={resolveIcon(option.trailingIcon)}
          disabled={option.disabled}
          onSelect={() => handleSelect(option)}
        >
          {option.label}
        </MenuItem>
      );
    };

    return (
      <div
        className={[styles.splitWrapper, className].filter(Boolean).join(" ")}
        data-variant={variant}
        ref={ref}
      >
        <Button
          ref={mainRef}
          variant={variant}
          size={size}
          surface={surface}
          rounded={rounded}
          tooltip={tooltip}
          accessibleName={accessibleName}
          onClick={onPrimaryClick}
          disabled={disabled}
          className={[
            buttonStyles.splitMain,
            isSecondary ? buttonStyles.splitSecondaryMain : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </Button>
        {menuActive ? (
          <Menu>
            <MenuTrigger asChild>{toggle}</MenuTrigger>
            <MenuContent
              align={menuAlign}
              alignOffset={menuAlign === "start" ? -mainWidth : 0}
            >
              {options.map((option, index) => renderOption(option, index))}
            </MenuContent>
          </Menu>
        ) : (
          toggle
        )}
      </div>
    );
  },
);

SplitButton.displayName = "SplitButton";

export default SplitButton;
