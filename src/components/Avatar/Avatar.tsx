import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./avatar.module.css";

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
  imageUrl?: string | { default: string };
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

const Avatar: React.FC<AvatarProps> = ({
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
}) => {
  const { t } = useTranslation();
  const menuEnabled = Boolean(menuItems?.length);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const menuId = React.useId();
  const [menuPlacement, setMenuPlacement] = React.useState<MenuPlacement>({
    horizontal: "right",
    vertical: "bottom",
  });

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
    const gutter = 8;

    const spaceLeft = wrapperRect.left;
    const spaceRight = viewportWidth - wrapperRect.right;
    const spaceAbove = wrapperRect.top;
    const spaceBelow = viewportHeight - wrapperRect.bottom;
    const hasLeftRoom = spaceLeft >= menuRect.width + gutter;
    const hasRightRoom = spaceRight >= menuRect.width + gutter;
    const hasTopRoom = spaceAbove >= menuRect.height + gutter;
    const hasBottomRoom = spaceBelow >= menuRect.height + gutter;

    let horizontal: MenuPlacement["horizontal"] = "right";
    let vertical: MenuPlacement["vertical"] = "bottom";

    if (!hasLeftRoom && hasRightRoom) {
      horizontal = "left";
    } else if (!hasRightRoom && hasLeftRoom) {
      horizontal = "right";
    } else if (!hasLeftRoom && !hasRightRoom) {
      horizontal = spaceLeft > spaceRight ? "right" : "left";
    }

    if (!hasBottomRoom && hasTopRoom) {
      vertical = "top";
    } else if (!hasTopRoom && hasBottomRoom) {
      vertical = "bottom";
    } else if (!hasTopRoom && !hasBottomRoom) {
      vertical = spaceAbove > spaceBelow ? "top" : "bottom";
    }

    setMenuPlacement((current) =>
      current.horizontal === horizontal && current.vertical === vertical
        ? current
        : { horizontal, vertical },
    );
  }, [menuEnabled]);

  React.useEffect(() => {
    if (!menuEnabled || !isMenuOpen) return undefined;
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
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, menuEnabled]);

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

  const resolvedImageUrl =
    typeof imageUrl === "string" ? imageUrl : imageUrl?.default;
  const resolvedSrcSet =
    srcSet ?? (resolvedImageUrl ? `${resolvedImageUrl} 1x` : undefined);
  const defaultSizes = "(max-width: 600px) 56px, 40px";
  const resolvedSizes = sizes ?? (size ? `${size}` : defaultSizes);

  const handleClick = () => {
    if (clickable && destinationUrl) {
      window.location.href = destinationUrl;
    }
  };

  const resolvedSize = size ?? "2.5rem";
  const avatarStyle = { "--avatar-size": resolvedSize } as React.CSSProperties;
  const avatarMenuLabel =
    menuLabel ??
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
          const commonProps = {
            className: styles.avatarMenuItem,
            role: "menuitem",
            onClick: () => {
              item.onSelect?.();
              setIsMenuOpen(false);
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
              <span className={styles.avatarMenuText}>{item.label}</span>
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
            <li key={key} className={styles.avatarMenuItemWrapper} role="none">
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
        <div className={styles.avatarMenuWrapper} ref={wrapperRef}>
          <button
            type="button"
            className={styles.avatarMenuTrigger}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={avatarMenuLabel}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {imageElement}
          </button>
          {isMenuOpen ? renderMenuItems() : null}
        </div>
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
      <div className={styles.avatarMenuWrapper} ref={wrapperRef}>
        <button
          type="button"
          className={styles.avatarMenuTrigger}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          aria-label={avatarMenuLabel}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {textElement}
        </button>
        {isMenuOpen ? renderMenuItems() : null}
      </div>
    );
  }

  return textElement;
};

Avatar.displayName = "Avatar";

export default Avatar;
