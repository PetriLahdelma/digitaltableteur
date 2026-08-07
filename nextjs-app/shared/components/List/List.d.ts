import React from "react";
type TextSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type ListType = "ul" | "ol";
type ListStyleType = "disc" | "circle" | "square" | "decimal" | "decimal-leading-zero" | "lower-alpha" | "upper-alpha" | "lower-roman" | "upper-roman" | "none" | "dash";
export interface ListProps {
    /** Ordered content rendered as one list item per entry. */
    items: React.ReactNode[];
    /** Semantic list element. @default "ul" */
    as?: ListType;
    /** Additional class name applied to the list element. */
    className?: string;
    /** Tokenized text size. @default "m" */
    size?: TextSize;
    /** Optional tokenized line height. */
    lineHeight?: LineHeight;
    /** Inline style overrides applied after component defaults. */
    style?: React.CSSProperties;
    /** Native marker style or the custom dash treatment. */
    listStyleType?: ListStyleType;
    /** Vertical spacing between items. @default "normal" */
    spacing?: "compact" | "normal" | "relaxed";
    /** Optional ARIA role override for specialized list semantics. */
    role?: string;
}
/**
 * List component.
 */
export declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLOListElement | HTMLUListElement>>;
export default List;
//# sourceMappingURL=List.d.ts.map