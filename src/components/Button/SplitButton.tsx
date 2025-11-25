import React from "react";
import Button, { type ButtonProps } from "./Button";
import buttonStyles from "./Button.module.css";
import Icon from "@dt/Icon";
import styles from "./SplitButton.module.css";

export type SplitButtonOption = {
  id?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode | string;
  trailingIcon?: React.ReactNode | string;
  disabled?: boolean;
  onSelect?: () => void;
  /** Optional tooltip shown on hover */
  title?: string;
  /** Nested options for a second-level menu */
  children?: SplitButtonOption[];
};

export interface SplitButtonProps
  extends Pick<
      ButtonProps,
      "variant" | "size" | "inverse" | "rounded" | "tooltip" | "accessibleName"
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
}

const isStringIcon = (icon: React.ReactNode | string): icon is string =>
  typeof icon === "string";

/**
 * SplitButton renders a primary action with a trailing caret that opens a menu of related actions.
 * The main button and the toggle share the same visual variant for cohesion.
 */
const SplitButton: React.FC<SplitButtonProps> = ({
  label,
  onPrimaryClick,
  options,
  variant = "primary",
  size = "m",
  inverse = false,
  rounded = false,
  tooltip,
  accessibleName,
  menuAlign = "start",
  disabled = false,
  toggleLabel = "More options",
  className,
}) => {
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

  const closeMenu = React.useCallback(() => setOpen(false), []);

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
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [closeMenu, open]);

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

  const renderIcon = (icon: React.ReactNode | string | undefined) => {
    if (!icon) return null;
    if (isStringIcon(icon)) {
      return (
        <Icon
          name={icon}
          ariaLabel={icon}
          className={styles.menuIcon}
          weight="regular"
        />
      );
    }
    if (React.isValidElement(icon)) {
      return <span className={styles.menuIcon}>{icon}</span>;
    }
    return <span className={styles.menuIcon}>{icon}</span>;
  };

  const handleSelect = (option: SplitButtonOption) => {
    if (option.disabled) return;
    option.onSelect?.();
    closeMenu();
    toggleRef.current?.focus();
  };

  const focusItem = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(options.length - 1, nextIndex));
    setFocusedIndex(clamped);
    itemRefs.current[clamped]?.focus();
  };

  const findNextEnabled = (start: number, direction: 1 | -1) => {
    const len = options.length;
    for (let i = 0; i < len; i += 1) {
      const idx = (start + direction * i + len) % len;
      if (!options[idx]?.disabled) {
        return idx;
      }
    }
    return start;
  };

  return (
    <div
      className={[styles.splitWrapper, className].filter(Boolean).join(" ")}
      data-variant={variant}
      ref={wrapperRef}
    >
      <Button
        variant={variant}
        size={size}
        inverse={inverse}
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
        inverse={inverse}
        rounded={rounded}
        aria-label={toggleLabel}
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
          <Icon name="caret-down" ariaLabel={toggleLabel} />
        </span>
      </Button>
      {open && hasOptions ? (
        <ul
          id={menuId}
          className={styles.menu}
          role="menu"
          data-align={menuAlign}
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
                  <span className={styles.trailing}>
                    <Icon name="caret-right" ariaLabel="Open submenu" />
                  </span>
                ) : (
                  renderIcon(option.trailingIcon)
                )}
              </button>
              {option.children && option.children.length > 0 && openSubIndex === index ? (
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
      ) : null}
    </div>
  );
};

export default SplitButton;
