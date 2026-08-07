import React from "react";
export interface FlexBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    /** flex-direction. @default "row" */
    direction?: "row" | "row-reverse" | "column" | "column-reverse";
    /** flex-wrap. @default "nowrap" */
    wrap?: "nowrap" | "wrap" | "wrap-reverse";
    /** Main-axis distribution. @default "flex-start" */
    justify?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    /** Cross-axis item alignment. @default "stretch" */
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    /** Cross-axis line distribution when wrapping. */
    alignContent?: "stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
    /** Shorthand gap (CSS length or number of px). */
    gap?: string | number;
    /** Row gap override. */
    rowGap?: string | number;
    /** Column gap override. */
    columnGap?: string | number;
    /** Inline style overrides applied after generated flex declarations. */
    style?: React.CSSProperties;
    /** Flex items rendered inside the container. */
    children: React.ReactNode;
}
/**
 * FlexBox component.
 */
export declare const FlexBox: React.FC<FlexBoxProps>;
export default FlexBox;
//# sourceMappingURL=FlexBox.d.ts.map