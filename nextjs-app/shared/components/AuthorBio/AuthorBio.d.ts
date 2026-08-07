import React from "react";
import type { ImageSource as StaticImageData } from "../../lib/imageComponent";
/**
 * AuthorBio displays author information with avatar, name, role, and biography.
 * Fully input-driven: pass the details directly, or pass `slug` to pull them
 * from the site's author registry. Direct props override slug-derived fields.
 *
 * @example
 * ```tsx
 * <AuthorBio slug="petri-lahdelma" />
 * <AuthorBio name="Jane Doe" imageUrl="/people/jane.jpg" bio="Writes about design." />
 * ```
 */
export interface AuthorBioProps {
    /** Optional author slug resolved from the site's authors registry; direct
     * props below override the registry fields. */
    slug?: string;
    /** Author name. Required unless `slug` resolves it. */
    name?: string;
    /** Avatar image source: a URL, an imported asset path, or static image data. */
    imageUrl?: string | {
        default: string;
    } | StaticImageData;
    /** Role/title shown under the name (e.g. "Founder, CEO"). */
    role?: string;
    /** Biography text; markdown after the first paragraph. The first paragraph
     * renders as the lead/tagline. */
    bio?: string;
    /** Contact email rendered as a mailto link when `showContact` is set. */
    email?: string;
    /** Optional CSS class for styling extension */
    className?: string;
    /** Optional custom heading text (defaults to the author name) */
    heading?: string;
    /** Render the author's contact email (mailto) after the bio, if the author has one. */
    showContact?: boolean;
}
/**
 * AuthorBio component.
 */
export declare const AuthorBio: React.FC<AuthorBioProps>;
export default AuthorBio;
//# sourceMappingURL=AuthorBio.d.ts.map