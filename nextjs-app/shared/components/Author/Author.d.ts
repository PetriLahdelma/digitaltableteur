import React from "react";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
import { type AvatarSize } from "@dt/Avatar";
export interface AuthorProps {
    /** Author name shown after the byline prefix; also names the avatar and
     * feeds its initials fallback. */
    name: string;
    /** Avatar image source: a URL, an imported asset path, or static image data.
     * When absent the avatar falls back to initials from `name`. */
    imageUrl?: string | {
        default: string;
    } | StaticImageData;
    /** Avatar size, exposed from the Avatar atom: token sizes `sm`/`md`/`lg`/`xl`
     * are canonical; any CSS length is accepted. @default "md" */
    size?: AvatarSize;
    /** Optional author profile URL; makes the byline text a link. */
    profileUrl?: string;
    /** Byline prefix before the name. Defaults to the localized "By"
     * (fi "Kirjoittanut", sv "Av"), matching the native dt-author element. */
    bylinePrefix?: string;
}
/**
 * Compact author byline for article metadata. Fully input-driven: pass any
 * name, avatar image (URL or path), and optional profile link. Use AuthorBio
 * for the expanded end-of-article biography treatment.
 */
export declare const Author: React.FC<AuthorProps>;
export default Author;
//# sourceMappingURL=Author.d.ts.map