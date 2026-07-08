import React from "react";
import { useTranslation } from "react-i18next";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
import styles from "./avatar.module.css";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@dt/Menu";

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
}

const resolveImageUrl = (
  imageUrl: AvatarProps["imageUrl"],
): string | undefined => {
  if (!imageUrl) return undefined;
  if (typeof imageUrl === "string") return imageUrl;
  if ("src" in imageUrl) return imageUrl.src;
  if ("default" in imageUrl) return imageUrl.default;
  return undefined;
};

/**
 * Profile image, initials, link, or optional menu — production Avatar API.
 *
 * The menu is the shared `Menu` primitive (Radix dropdown-menu), so roving
 * focus, arrow keys, typeahead, Escape, focus return, and collision-aware
 * positioning come from Radix; Avatar only maps `menuItems` to menu parts.
 */
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
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const menuEnabled = Boolean(menuItems?.length);

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

    const shouldRenderImage = variant === "image" && resolvedImageUrl;

    const visual = shouldRenderImage ? (
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
    ) : (
      (() => {
        const initials = name
          ? name
              .split(" ")
              .map((part) => part[0]?.toUpperCase())
              .join("")
          : "";
        return (
          <div
            className={styles.avatarText}
            onClick={clickable && !menuEnabled ? handleClick : undefined}
            style={avatarStyle}
          >
            {initials}
          </div>
        );
      })()
    );

    if (menuEnabled) {
      return (
        <Menu>
          <MenuTrigger asChild>
            <button
              type="button"
              className={styles.avatarMenuTrigger}
              aria-label={avatarMenuLabel}
              ref={ref}
            >
              {visual}
            </button>
          </MenuTrigger>
          <MenuContent align="end">
            {menuItems!.map((item, index) => (
              <MenuItem
                key={item.id ?? `${item.label}-${index}`}
                icon={item.icon}
                href={item.href}
                onSelect={item.onSelect}
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      );
    }

    return visual;
  },
);

Avatar.displayName = "Avatar";

export default Avatar;
