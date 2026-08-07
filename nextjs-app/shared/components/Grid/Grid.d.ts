import React, { ReactNode, CSSProperties } from "react";
export interface GridProps {
    /** Grid cells (supports span on child props). */
    children: ReactNode;
    /** Column count or grid-template-columns string. */
    columns?: number | string;
    /** Columns from the tablet breakpoint (768px) up. Numeric counts render as
     * `repeat(n, minmax(0, 1fr))` so cells can shrink below content width. */
    tabletColumns?: number | string;
    /** Columns from the desktop breakpoint (1024px) up. Falls back to
     * tabletColumns, then columns. */
    desktopColumns?: number | string;
    /** Columns from the wide breakpoint (1440px) up. Falls back through
     * desktopColumns, tabletColumns, columns. */
    wideColumns?: number | string;
    /** Columns from the ultra breakpoint (1920px) up. Falls back through
     * wideColumns, desktopColumns, tabletColumns, columns. */
    ultraColumns?: number | string;
    /** Row count or grid-template-rows string. */
    rows?: number | string;
    /** Grid gap. @default "1rem" */
    gap?: string;
    /** Gap from the tablet breakpoint (768px) up. */
    tabletGap?: string;
    /** Gap from the desktop breakpoint (1024px) up. Falls back to tabletGap,
     * then gap. */
    desktopGap?: string;
    /** Gap from the wide breakpoint (1440px) up. Falls back through desktopGap,
     * tabletGap, gap. */
    wideGap?: string;
    /** Gap from the ultra breakpoint (1920px) up. Falls back through wideGap,
     * desktopGap, tabletGap, gap. */
    ultraGap?: string;
    /** Row gap override. */
    rowGap?: string;
    /** Column gap override. */
    colGap?: string;
    /** align-items. */
    align?: CSSProperties["alignItems"];
    /** justify-items. */
    justify?: CSSProperties["justifyItems"];
    style?: CSSProperties;
    /** Grid class names. */
    className?: string;
    [key: string]: any;
}
/**
 * GridItemProps: span for columns, rowSpan for rows, and style/className
 */
export interface GridItemProps {
    children?: ReactNode;
    span?: number;
    rowSpan?: number;
    style?: CSSProperties;
    className?: string;
    [key: string]: any;
}
/**
 * Grid component.
 */
declare function Grid({ children, columns, tabletColumns, desktopColumns, wideColumns, ultraColumns, rows, gap, tabletGap, desktopGap, wideGap, ultraGap, rowGap, colGap, align, justify, style, className, ...rest }: GridProps): React.JSX.Element;
declare namespace Grid {
    var Item: typeof GridItem;
}
/**
 * Grid.Item: Use for grid children that need span/rowSpan. Example:
 * <Grid.Item span={2}>Spans 2 columns</Grid.Item>
 */
declare function GridItem({ children, span, rowSpan, style, className, ...rest }: GridItemProps): React.JSX.Element;
export { GridItem };
export default Grid;
//# sourceMappingURL=Grid.d.ts.map