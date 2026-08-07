import React from "react";
type TitleSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TitleProps = {
    /** Heading text. */
    children: React.ReactNode;
    /** Override the rendered element (h1-h6); wins over level. */
    as?: HeadingTag;
    /** Additional CSS class names. */
    className?: string;
    /** When true, only sets the heading tag + className (no Title token typography). Use in patterns/pages that already define font/size in CSS or Tailwind. */
    unstyled?: boolean;
    /** Display size token for the heading. */
    size?: TitleSize;
    /** Semantic heading level (maps to h1-h6 when as is unset). */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Line height variant. */
    lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLHeadingElement>;
/** Page and section headings with size and line-height variants. */
declare const Title: React.ForwardRefExoticComponent<{
    /** Heading text. */
    children: React.ReactNode;
    /** Override the rendered element (h1-h6); wins over level. */
    as?: HeadingTag;
    /** Additional CSS class names. */
    className?: string;
    /** When true, only sets the heading tag + className (no Title token typography). Use in patterns/pages that already define font/size in CSS or Tailwind. */
    unstyled?: boolean;
    /** Display size token for the heading. */
    size?: TitleSize;
    /** Semantic heading level (maps to h1-h6 when as is unset). */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Line height variant. */
    lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export default Title;
//# sourceMappingURL=Title.d.ts.map