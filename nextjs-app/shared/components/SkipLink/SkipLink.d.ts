export interface SkipLinkProps {
    /** Target fragment for the main content region. @default "#main-content" */
    href?: string;
    /** Visible link text on focus. @default "Skip to main content" */
    children?: React.ReactNode;
    /** Optional utility classes on the link. */
    className?: string;
}
/**
 * SkipLink component.
 *
 * Visually hidden until focused, then surfaces as a high-contrast pill so
 * keyboard users can jump straight to the main content.
 */
export declare function SkipLink({ href, children, className, }: SkipLinkProps): import("react").JSX.Element;
//# sourceMappingURL=SkipLink.d.ts.map