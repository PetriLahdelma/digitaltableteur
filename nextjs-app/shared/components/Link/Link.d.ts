import React from "react";
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Size. @default "md" */
    size?: "sm" | "md" | "lg" | "inherit";
    /**
     * Wavy underline mode. "always" shows it permanently, "hover" reveals it
     * on hover and keyboard focus (nav lists like the site footer), "none"
     * omits it entirely. @default "always"
     */
    underline?: "always" | "hover" | "none";
}
/** Accessible inline link with size tokens, a focus ring, an optional external-link icon, and always/hover/none wavy underline modes. */
declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
export default Link;
//# sourceMappingURL=Link.d.ts.map