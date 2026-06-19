"use client";

import React from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import Button, { type ButtonProps } from "./Button";
import buttonStyles from "./Button.module.css";
import Icon from "@dt/Icon";
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
  /** Alignment of the dropdown menu */
  menuAlign?: "start" | "end";
  /** Disable both segments */
  disabled?: boolean;
  /** Accessible label for the dropdown trigger */
  toggleLabel?: string;
  /** Optional className forwarded to the outer wrapper */
  className?: string;
  /** Render menu in a portal (prevents clipping by overflow:hidden containers) */
  usePortal?: boolean;
}

const isStringIcon = (icon: React.ReactNode | string): icon is string =>
  typeof icon === "string";

/**
 * SplitButton renders a primary action with a trailing caret that opens a menu of related actions.
 * The main button and the toggle share the same visual variant for cohesion.
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
      menuAlign = "end",
      disabled = false,
      toggleLabel,
      className,
      usePortal = false,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const defaultToggleLabel = toggleLabel ?? t("splitButton.moreOptions");
    const isSecondary = variant === "secondary";
    const isTertiary = variant === "tertiary";
    const hasOptions = Array.isArray(options) && options.length > 0;
    const [open, setOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const menuRef = React.useRef<HTMLUListElement | null>(null);
    const toggleRef = React.useRef<HTMLButtonElement | null>(null);
    const menuId = React.useId();
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const [openSubIndex, setOpenSubIndex] = React.useState<number | null>(null);
    const [focusOnOpen, setFocusOnOpen] = React.useState(false);
    const [resolvedAlign, setResolvedAlign] = React.useState(menuAlign);
    const [menuPlacement, setMenuPlacement] = React.useState<"top" | "bottom">(
      "bottom",
    );

    const closeMenu = React.useCallback(() => setOpen(false), []);

    // Helper functions for navigation
    const focusItem = React.useCallback(
      (nextIndex: number) => {
        const clamped = Math.max(0, Math.min(options.length - 1, nextIndex));
        setFocusedIndex(clamped);
        itemRefs.current[clamped]?.focus();
      },
      [options.length],
    );

    const findNextEnabled = React.useCallback(
      (start: number, direction: 1 | -1) => {
        const len = options.length;
        for (let i = 0; i < len; i += 1) {
          const idx = (start + direction * i + len) % len;
          if (!options[idx]?.disabled) {
            return idx;
          }
        }
        return start;
      },
      [options],
    );

    React.useEffect(() => {
      if (!open) return undefined;
      const handleClick = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          closeMenu();
        }
      };
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          closeMenu();
          toggleRef.current?.focus();
        }

        // Focus trap: prevent Tab from escaping the menu
        if (event.key === "Tab" && menuRef.current) {
          event.preventDefault();
          const focusableItems = itemRefs.current.filter(Boolean);
          if (focusableItems.length === 0) return;

          const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;

          if (event.shiftKey) {
            // Shift+Tab: move backward
            const prevIndex = findNextEnabled(currentIndex - 1, -1);
            focusItem(prevIndex);
          } else {
            // Tab: move forward
            const nextIndex = findNextEnabled(currentIndex + 1, 1);
            focusItem(nextIndex);
          }
        }
      };
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKey);
      };
    }, [closeMenu, open, focusedIndex, findNextEnabled, focusItem]);

    React.useLayoutEffect(() => {
      if (!open) {
        setResolvedAlign(menuAlign);
        setMenuPlacement("bottom");
        return;
      }

      const computePlacement = () => {
        if (!wrapperRef.current || !menuRef.current) return;

        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();

        const viewportWidth =
          window.innerWidth ||
          document.documentElement?.clientWidth ||
          menuRect.width;
        const viewportHeight =
          window.innerHeight ||
          document.documentElement?.clientHeight ||
          menuRect.height;

        // Enhanced collision detection with viewport margins (industry standard)
        const viewportMargin = 12; // Buffer from screen edges (MUI uses 16px, we use 12px)
        const gutter = 8; // Space between trigger and menu

        // Calculate available space with viewport margins for better UX
        const spaceLeft = wrapperRect.left - viewportMargin;
        const spaceRight = viewportWidth - wrapperRect.right - viewportMargin;
        const spaceAbove = wrapperRect.top - viewportMargin;
        const spaceBelow = viewportHeight - wrapperRect.bottom - viewportMargin;

        // Check if menu fits with preferred positioning
        const hasLeftRoom = spaceLeft >= menuRect.width + gutter;
        const hasRightRoom = spaceRight >= menuRect.width + gutter;
        const hasTopRoom = spaceAbove >= menuRect.height + gutter;
        const hasBottomRoom = spaceBelow >= menuRect.height + gutter;

        // Horizontal alignment with smart fallback (implements "nudging")
        let nextAlign: SplitButtonProps["menuAlign"] = menuAlign;
        if (hasRightRoom) {
          nextAlign = "start"; // Opens to the right
        } else if (hasLeftRoom) {
          nextAlign = "end"; // Opens to the left
        } else {
          // Neither side has full room - choose side with more space
          // This allows menu to "nudge" into partial visibility
          nextAlign = spaceRight > spaceLeft ? "start" : "end";
        }

        // Vertical placement with smart fallback
        let nextPlacement: "top" | "bottom" = "bottom";
        if (hasBottomRoom) {
          nextPlacement = "bottom"; // Opens downward (preferred)
        } else if (hasTopRoom) {
          nextPlacement = "top"; // Opens upward
        } else {
          // Neither direction has full room - choose direction with more space
          // Menu will be partially visible on the side with more space
          nextPlacement = spaceBelow > spaceAbove ? "bottom" : "top";
        }

        setResolvedAlign(nextAlign);
        setMenuPlacement(nextPlacement);
      };

      // measure after menu has rendered
      const rafId = requestAnimationFrame(computePlacement);
      window.addEventListener("resize", computePlacement);
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", computePlacement);
      };
    }, [menuAlign, open]);

    React.useEffect(() => {
      if (!open) return;
      if (!focusOnOpen) {
        setFocusedIndex(-1);
        return;
      }
      const firstEnabled = options.findIndex((opt) => !opt.disabled);
      const targetIndex = firstEnabled >= 0 ? firstEnabled : 0;
      setFocusedIndex(targetIndex);
      itemRefs.current[targetIndex]?.focus();
    }, [focusOnOpen, open, options]);

    const renderIcon = (
      icon: React.ReactNode | string | undefined,
      isDecorative = true,
    ) => {
      if (!icon) return null;
      if (isStringIcon(icon)) {
        return (
          <Icon
            name={icon}
            ariaLabel={isDecorative ? "" : icon}
            className={styles.menuIcon}
            weight="regular"
          />
        );
      }
      if (React.isValidElement(icon)) {
        return (
          <span className={styles.menuIcon} aria-hidden={isDecorative}>
            {icon}
          </span>
        );
      }
      return (
        <span className={styles.menuIcon} aria-hidden={isDecorative}>
          {icon}
        </span>
      );
    };

    const handleSelect = async (option: SplitButtonOption) => {
      if (option.disabled) return;

      try {
        // Support both sync and async onSelect handlers
        await option.onSelect?.();
      } catch (error) {
        console.error("SplitButton option onSelect error:", error);
      } finally {
        closeMenu();
        toggleRef.current?.focus();
      }
    };

    // Render menu content
    const renderMenu = () => {
      if (!open || !hasOptions) return null;

      return (
        <ul
          id={menuId}
          className={styles.menu}
          role="menu"
          data-align={resolvedAlign}
          data-placement={menuPlacement}
          ref={menuRef}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              const next = findNextEnabled(focusedIndex + 1, 1);
              focusItem(next);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              const prev = findNextEnabled(focusedIndex - 1, -1);
              focusItem(prev);
            } else if (event.key === "Home") {
              event.preventDefault();
              focusItem(findNextEnabled(0, 1));
            } else if (event.key === "End") {
              event.preventDefault();
              focusItem(findNextEnabled(options.length - 1, -1));
            } else if (event.key === "Escape") {
              event.preventDefault();
              closeMenu();
              toggleRef.current?.focus();
              setOpenSubIndex(null);
              setFocusOnOpen(false);
            }
          }}
        >
          {options.map((option, index) => (
            <li
              role="none"
              key={option.id ?? option.label ?? index}
              className={styles.menuItemWrapper}
            >
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => handleSelect(option)}
                disabled={option.disabled}
                tabIndex={focusedIndex === index ? 0 : -1}
                aria-haspopup={option.children?.length ? "menu" : undefined}
                aria-expanded={
                  option.children?.length ? openSubIndex === index : undefined
                }
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (option.children?.length) {
                      setOpenSubIndex(index);
                    } else {
                      handleSelect(option);
                    }
                  }
                  if (event.key === "ArrowRight" && option.children?.length) {
                    event.preventDefault();
                    setOpenSubIndex(index);
                  }
                  if (event.key === "ArrowLeft" && openSubIndex !== null) {
                    event.preventDefault();
                    setOpenSubIndex(null);
                  }
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    // Let parent handler manage navigation to avoid double handling
                    event.preventDefault();
                  }
                }}
                title={option.title ?? option.description}
                onMouseEnter={() =>
                  setOpenSubIndex(option.children?.length ? index : null)
                }
              >
                {renderIcon(option.icon)}
                <span className={styles.menuText}>
                  <span>{option.label}</span>
                </span>
                {option.children?.length ? (
                  <span className={styles.trailing} aria-hidden="true">
                    <Icon name="caret-right" ariaLabel="" />
                  </span>
                ) : (
                  renderIcon(option.trailingIcon, true)
                )}
              </button>
              {option.children &&
              option.children.length > 0 &&
              openSubIndex === index ? (
                <ul className={styles.subMenu} role="menu">
                  {option.children.map((child, childIndex) => (
                    <li role="none" key={child.id ?? child.label ?? childIndex}>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.menuItem}
                        onClick={() => handleSelect(child)}
                        disabled={child.disabled}
                        title={child.title ?? child.description}
                      >
                        {renderIcon(child.icon)}
                        <span className={styles.menuText}>
                          <span>{child.label}</span>
                        </span>
                        {renderIcon(child.trailingIcon)}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      );
    };

    return (
      <div
        className={[styles.splitWrapper, className].filter(Boolean).join(" ")}
        data-variant={variant}
        ref={(node) => {
          wrapperRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
      >
        <Button
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
            isTertiary ? buttonStyles.splitTertiaryMain : "",
            isSecondary ? buttonStyles.splitSecondaryMain : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </Button>
        <Button
          variant={variant}
          size={size}
          surface={surface}
          rounded={rounded}
          aria-label={defaultToggleLabel}
          aria-haspopup="menu"
          aria-expanded={open && hasOptions}
          aria-controls={menuId}
          onClick={() => {
            if (!hasOptions) return;
            if (open) {
              setOpen(false);
              setFocusOnOpen(false);
            } else {
              setFocusOnOpen(true);
              setOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (!hasOptions) return;
            if (
              event.key === "ArrowDown" ||
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setFocusOnOpen(true);
              setOpen(true);
              requestAnimationFrame(() => {
                const firstEnabled = findNextEnabled(0, 1);
                focusItem(firstEnabled);
              });
            }
          }}
          disabled={disabled || !hasOptions}
          className={[
            buttonStyles.splitToggle,
            isTertiary ? buttonStyles.splitTertiaryToggle : "",
            isSecondary ? buttonStyles.splitSecondaryToggle : "",
          ]
            .filter(Boolean)
            .join(" ")}
          tooltip={toggleLabel}
          ref={toggleRef}
        >
          <span className={styles.caret}>
            <Icon name="caret-down" ariaLabel="" />
          </span>
        </Button>
        {usePortal && typeof document !== "undefined"
          ? ReactDOM.createPortal(renderMenu(), document.body)
          : renderMenu()}
      </div>
    );
  },
);

SplitButton.displayName = "SplitButton";

export default SplitButton;
