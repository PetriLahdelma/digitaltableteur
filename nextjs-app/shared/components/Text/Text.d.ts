import React from "react";
type TextSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type TextTag = "p" | "span" | "div" | "strong" | "em" | "cite" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TextProps = {
    children: React.ReactNode;
    as?: TextTag;
    size?: TextSize;
    lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLElement>;
/** Body and inline typography with size and line-height tokens. */
declare const Text: React.ForwardRefExoticComponent<{
    children: React.ReactNode;
    as?: TextTag;
    size?: TextSize;
    lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>;
export default Text;
//# sourceMappingURL=Text.d.ts.map