import React from "react";
import { useTranslation } from "react-i18next";
import type { StaticImageData } from "next/image";
import styles from "./avatar.module.css";
import Text from "@dt/Text/Text";

export interface AvatarMenuItem {
  label: string;
  icon?: React.ReactNode;
  id?: string;
  href?: string;
  onSelect?: () => void;
}

export type AvatarSize =
  | "2rem"
  | "2.5rem"
  | "3rem"
  | "4rem"
  | "5rem"
  | "6rem"
  | "7rem"
  | "8rem"
  | string;

/**
 * Avatar component displays user profile images or initials with optional dropdown menu.
 *
 * @example
 * ```tsx
 * <Avatar name="John Doe" imageUrl="/avatar.jpg" />
 * <Avatar name="Jane Smith" variant="initials" />
 * <Avatar name="Admin" menuItems={[{ label: "Profile" }, { label: "Sign out" }]} />
 * ```
 */
export interface AvatarProps {
  name?: string;
  imageUrl?: string | { default: string } | StaticImageData;
  clickable?: boolean;
  destinationUrl?: string;
  size?: AvatarSize;
  srcSet?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  decoding?: "auto" | "sync" | "async";
  /** When provided, renders an in-place dropdown menu triggered by the avatar */
  menuItems?: AvatarMenuItem[];
  /** Accessible label announced for the avatar menu trigger */
  menuLabel?: string;
  /** Controls whether the avatar prefers an image or initials */
  variant?: "image" | "initials";
  /** Optional token that forces menu placement recalculation when changed */
  placementRefreshKey?: number;
}

type MenuPlacement = {
  horizontal: "left" | "right";
  vertical: "top" | "bottom";
};

const resolveImageUrl = (
  imageUrl: AvatarProps["imageUrl"],
): string | undefined => {
  if (!imageUrl) return undefined;
  if (typeof imageUrl === "string") return imageUrl;
  if ("src" in imageUrl) return imageUrl.src;
  if ("default" in imageUrl) return imageUrl.default;
  return undefined;
};

/** Profile image, initials, link, or optional menu — production Avatar API. */
const Avatar = React.forwardRef<HTMLButtonElement, AvatarProps>(
  (
    {
      name,
      imageUrl,
      clickable,
      destinationUrl,
      size,
      srcSet,
      sizes,
      loading = "lazy",
      decoding = "async",
      menuItems,
      menuLabel,
      variant = "image",
      placementRefreshKey = 0,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const menuEnabled = Boolean(menuItems?.length);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const menuRef = React.useRef<HTMLUListElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const previousFocusRef = React.useRef<HTMLElement | null>(null);
    const menuId = React.useId();
    const [menuPlacement, setMenuPlacement] = React.useState<MenuPlacement>({
      horizontal: "right",
      vertical: "bottom",
    });
    const [menuStateAnnouncement, setMenuStateAnnouncement] =
      React.useState<string>("");

    const updateMenuPlacement = React.useCallback(() => {
      if (
        !menuEnabled ||
        !menuRef.current ||
        !wrapperRef.current ||
        typeof window === "undefined"
      ) {
        return;
      }

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

      // Calculate available space with viewport margins
      const spaceLeft = wrapperRect.left - viewportMargin;
      const spaceRight = viewportWidth - wrapperRect.right - viewportMargin;
      const spaceAbove = wrapperRect.top - viewportMargin;
      const spaceBelow = viewportHeight - wrapperRect.bottom - viewportMargin;

      // Check if menu fits with preferred positioning
      const hasLeftRoom = spaceLeft >= menuRect.width + gutter;
      const hasRightRoom = spaceRight >= menuRect.width + gutter;
      const hasTopRoom = spaceAbove >= menuRect.height + gutter;
      const hasBottomRoom = spaceBelow >= menuRect.height + gutter;

      let horizontal: MenuPlacement["horizontal"] = "right";
      let vertical: MenuPlacement["vertical"] = "bottom";

      // Horizontal placement with smart fallback
      if (hasRightRoom) {
        horizontal = "left"; // Opens to the right
      } else if (hasLeftRoom) {
        horizontal = "right"; // Opens to the left
      } else {
        // Neither side has full room - choose side with more space
        // This implements "nudging" - menu will be partially visible on larger side
        horizontal = spaceRight > spaceLeft ? "left" : "right";
      }

      // Vertical placement with smart fallback
      if (hasBottomRoom) {
        vertical = "bottom"; // Opens downward (preferred)
      } else if (hasTopRoom) {
        vertical = "top"; // Opens upward
      } else {
        // Neither direction has full room - choose direction with more space
        // Menu will be scrollable or partially visible
        vertical = spaceBelow > spaceAbove ? "bottom" : "top";
      }

      setMenuPlacement((current) =>
        current.horizontal === horizontal && current.vertical === vertical
          ? current
          : { horizontal, vertical },
      );
    }, [menuEnabled]);

    React.useEffect(() => {
      if (!menuEnabled || !isMenuOpen) return undefined;

      // Announce menu state for screen readers
      setMenuStateAnnouncement(t("avatar.menuOpened"));
      // Store previous focus for return on close
      previousFocusRef.current = document.activeElement as HTMLElement;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setIsMenuOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsMenuOpen(false);
        }
      };

      // Focus trap: prevent Tab from leaving menu + Arrow key navigation
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!menuRef.current) return;

        const focusableElements = menuRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;
        const currentElement = document.activeElement as HTMLElement;
        const currentIndex =
          Array.from(focusableElements).indexOf(currentElement);

        // Arrow key navigation (WAI-ARIA menu pattern)
        if (event.key === "ArrowDown") {
          event.preventDefault();
          const nextIndex = currentIndex + 1;
          if (nextIndex < focusableElements.length) {
            (focusableElements[nextIndex] as HTMLElement).focus();
          } else {
            firstElement?.focus();
          }
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            (focusableElements[prevIndex] as HTMLElement).focus();
          } else {
            lastElement?.focus();
          }
          return;
        }

        // Home key: jump to first item
        if (event.key === "Home") {
          event.preventDefault();
          firstElement?.focus();
          return;
        }

        // End key: jump to last item
        if (event.key === "End") {
          event.preventDefault();
          lastElement?.focus();
          return;
        }

        // Type-ahead: focus item starting with typed character
        if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
          const char = event.key.toLowerCase();
          const elements = Array.from(focusableElements) as HTMLElement[];
          const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

          // Search from current position to end, then wrap to beginning
          const searchOrder = [
            ...elements.slice(startIndex),
            ...elements.slice(0, startIndex),
          ];

          for (const el of searchOrder) {
            const text = el.textContent?.trim().toLowerCase();
            if (text && text.startsWith(char)) {
              el.focus();
              return;
            }
          }
        }

        // Tab/Shift+Tab focus trap
        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Shift+Tab: cycle backwards
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            // Tab: cycle forwards
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleKeyDown);

      // Focus first menu item on open
      const firstMenuItem = menuRef.current?.querySelector(
        '[role="menuitem"]',
      ) as HTMLElement;
      firstMenuItem?.focus();

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleKeyDown);

        // Return focus to trigger on close
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }, [isMenuOpen, menuEnabled]);

    // Separate effect for closed announcement
    React.useEffect(() => {
      if (!menuEnabled || isMenuOpen) return;
      setMenuStateAnnouncement(t("avatar.menuClosed"));
    }, [isMenuOpen, menuEnabled, t]);

    React.useLayoutEffect(() => {
      if (!menuEnabled || !isMenuOpen || typeof window === "undefined") {
        return undefined;
      }

      updateMenuPlacement();

      const handleResize = () => {
        updateMenuPlacement();
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [isMenuOpen, menuEnabled, updateMenuPlacement]);

    React.useLayoutEffect(() => {
      if (!menuEnabled || !isMenuOpen) {
        return;
      }
      updateMenuPlacement();
    }, [menuEnabled, isMenuOpen, updateMenuPlacement, placementRefreshKey]);

    const resolvedImageUrl = resolveImageUrl(imageUrl);
    const resolvedSrcSet =
      srcSet || (resolvedImageUrl ? `${resolvedImageUrl} 1x` : undefined);
    const defaultSizes = "(max-width: 600px) 56px, 40px";
    const resolvedSizes = sizes || (size ? `${size}` : defaultSizes);

    const handleClick = () => {
      if (clickable && destinationUrl) {
        window.location.href = destinationUrl;
      }
    };

    const resolvedSize = size ?? "2.5rem";
    const avatarStyle = {
      "--avatar-size": resolvedSize,
    } as React.CSSProperties;
    const avatarMenuLabel =
      menuLabel ||
      (name ? t("avatar.menuLabel", { name }) : t("avatar.menuLabelGeneric"));

    const renderMenuItems = () => {
      if (!menuItems) return null;
      return (
        <ul
          className={styles.avatarMenu}
          role="menu"
          id={menuId}
          aria-label={avatarMenuLabel}
          data-horizontal={menuPlacement.horizontal}
          data-vertical={menuPlacement.vertical}
          ref={menuRef}
        >
          {menuItems.map((item, index) => {
            const key = item.id ?? `${item.label}-${index}`;
            const handleItemSelect = () => {
              try {
                item.onSelect?.();
              } catch (error) {
                console.error("Avatar menu item onSelect error:", error);
              } finally {
                setIsMenuOpen(false);
              }
            };

            const commonProps = {
              className: styles.avatarMenuItem,
              role: "menuitem",
              tabIndex: 0,
              onClick: handleItemSelect,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemSelect();
                }
              },
            };
            const content = (
              <>
                {item.icon && (
                  <span
                    className={styles.avatarMenuIcon}
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    {item.icon}
                  </span>
                )}
                <Text
                  as="span"
                  size="s"
                  terminals="sans"
                  className={styles.avatarMenuText}
                >
                  {item.label}
                </Text>
              </>
            );
            if (item.href) {
              return (
                <li
                  key={key}
                  className={styles.avatarMenuItemWrapper}
                  role="none"
                >
                  <a {...commonProps} href={item.href} tabIndex={0}>
                    {content}
                  </a>
                </li>
              );
            }
            return (
              <li
                key={key}
                className={styles.avatarMenuItemWrapper}
                role="none"
              >
                <button type="button" {...commonProps}>
                  {content}
                </button>
              </li>
            );
          })}
        </ul>
      );
    };

    const shouldRenderImage = variant === "image" && resolvedImageUrl;

    if (shouldRenderImage) {
      const imageElement = (
        <img
          src={resolvedImageUrl}
          srcSet={resolvedSrcSet}
          sizes={resolvedSizes}
          alt={name || t("avatar.altTextGeneric")}
          className={styles.avatarImage}
          onClick={clickable && !menuEnabled ? handleClick : undefined}
          style={avatarStyle}
          loading={loading}
          decoding={decoding}
        />
      );
      if (menuEnabled) {
        return (
          <>
            <div className={styles.avatarMenuWrapper} ref={wrapperRef}>
              <button
                type="button"
                className={styles.avatarMenuTrigger}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-controls={menuId}
                aria-label={avatarMenuLabel}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                ref={(node: HTMLButtonElement | null) => {
                  triggerRef.current = node;
                  if (typeof ref === "function") {
                    ref(node);
                  } else if (ref) {
                    ref.current = node;
                  }
                }}
              >
                {imageElement}
              </button>
              {isMenuOpen ? renderMenuItems() : null}
            </div>
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: "0",
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: "0",
              }}
            >
              {menuStateAnnouncement}
            </div>
          </>
        );
      }
      return (
        <img
          src={resolvedImageUrl}
          srcSet={resolvedSrcSet}
          sizes={resolvedSizes}
          alt={name || t("avatar.altTextGeneric")}
          className={styles.avatarImage}
          onClick={clickable ? handleClick : undefined}
          style={avatarStyle}
          loading={loading}
          decoding={decoding}
        />
      );
    }

    const initials = name
      ? name
          .split(" ")
          .map((part) => part[0]?.toUpperCase())
          .join("")
      : "";

    const textElement = (
      <div
        className={styles.avatarText}
        onClick={clickable && !menuEnabled ? handleClick : undefined}
        style={avatarStyle}
      >
        {initials}
      </div>
    );

    if (menuEnabled) {
      return (
        <>
          <div className={styles.avatarMenuWrapper} ref={wrapperRef}>
            <button
              type="button"
              className={styles.avatarMenuTrigger}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={avatarMenuLabel}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              ref={(node: HTMLButtonElement | null) => {
                triggerRef.current = node;
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
            >
              {textElement}
            </button>
            {isMenuOpen ? renderMenuItems() : null}
          </div>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: "0",
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: "0",
            }}
          >
            {menuStateAnnouncement}
          </div>
        </>
      );
    }

    return textElement;
  },
);

Avatar.displayName = "Avatar";

export default Avatar;
