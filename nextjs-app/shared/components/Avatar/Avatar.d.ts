import React from "react";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
export interface AvatarMenuItem {
    label: string;
    icon?: React.ReactNode;
    id?: string;
    href?: string;
    onSelect?: () => void;
}
export type AvatarSize = "sm" | "md" | "lg" | "xl" | "2rem" | "2.5rem" | "3rem" | "4rem" | "5rem" | "6rem" | "7rem" | "8rem" | string;
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
    imageUrl?: string | {
        default: string;
    } | StaticImageData;
    clickable?: boolean;
    destinationUrl?: string;
    /** Avatar size: token sizes `sm`/`md`/`lg`/`xl` (2/2.5/3/4rem) are
     * canonical; any CSS length is accepted as an escape hatch. Default `md`. */
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
/**
 * Profile image, initials, link, or optional menu — production Avatar API.
 *
 * The menu is the shared `Menu` primitive (Radix dropdown-menu), so roving
 * focus, arrow keys, typeahead, Escape, focus return, and collision-aware
 * positioning come from Radix; Avatar only maps `menuItems` to menu parts.
 */
declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLButtonElement>>;
export default Avatar;
//# sourceMappingURL=Avatar.d.ts.map