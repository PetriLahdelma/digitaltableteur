import React, {
  Children,
  isValidElement,
  cloneElement,
  ReactNode,
  CSSProperties,
} from "react";
import styles from "./Grid.module.css";

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
  [key: string]: any; // Allow passing any grid CSS prop
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
function Grid({
  children,
  columns = 1,
  tabletColumns,
  desktopColumns,
  wideColumns,
  ultraColumns,
  rows,
  gap = "1rem",
  tabletGap,
  desktopGap,
  wideGap,
  ultraGap,
  rowGap,
  colGap,
  align,
  justify,
  style = {},
  className = "",
  ...rest
}: GridProps) {
  // Enhance children with gridColumn/gridRow if span/rowSpan prop is present
  const enhancedChildren = Children.map(children, (child) => {
    if (
      isValidElement(child) &&
      typeof child.props === "object" &&
      child.props !== null
    ) {
      const {
        span,
        rowSpan,
        style: childStyle,
        ...childRest
      } = child.props as GridItemProps;
      const gridStyles: CSSProperties = { ...childStyle };
      if (span) gridStyles.gridColumn = `span ${span}`;
      if (rowSpan) gridStyles.gridRow = `span ${rowSpan}`;
      return cloneElement(child as React.ReactElement<any>, {
        ...childRest,
        style: gridStyles,
      });
    }
    return child;
  });

  // Per-breakpoint props switch the column/gap resolution from inline styles
  // to CSS custom properties read by the .responsive media queries in
  // Grid.module.css (inline styles cannot express media queries). Without
  // them the legacy inline path below renders byte-identical to before.
  const isResponsive =
    tabletColumns != null ||
    desktopColumns != null ||
    wideColumns != null ||
    ultraColumns != null ||
    tabletGap != null ||
    desktopGap != null ||
    wideGap != null ||
    ultraGap != null;

  // Responsive tracks use minmax(0, 1fr) so cells can shrink below their
  // content's intrinsic width (matches utility-grid column behavior).
  const toTemplate = (value: number | string) =>
    typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;

  const gridStyles: CSSProperties = {
    display: "grid",
    ...(isResponsive
      ? ({
          "--dt-grid-columns": toTemplate(columns),
          ...(tabletColumns != null && {
            "--dt-grid-columns-tablet": toTemplate(tabletColumns),
          }),
          ...(desktopColumns != null && {
            "--dt-grid-columns-desktop": toTemplate(desktopColumns),
          }),
          ...(wideColumns != null && {
            "--dt-grid-columns-wide": toTemplate(wideColumns),
          }),
          ...(ultraColumns != null && {
            "--dt-grid-columns-ultra": toTemplate(ultraColumns),
          }),
          "--dt-grid-gap": gap,
          ...(tabletGap != null && { "--dt-grid-gap-tablet": tabletGap }),
          ...(desktopGap != null && { "--dt-grid-gap-desktop": desktopGap }),
          ...(wideGap != null && { "--dt-grid-gap-wide": wideGap }),
          ...(ultraGap != null && { "--dt-grid-gap-ultra": ultraGap }),
        } as CSSProperties)
      : {
          gridTemplateColumns:
            typeof columns === "number" ? `repeat(${columns}, 1fr)` : columns,
          gap,
        }),
    ...(rows && {
      gridTemplateRows:
        typeof rows === "number" ? `repeat(${rows}, 1fr)` : rows,
    }),
    ...(rowGap && { rowGap }),
    ...(colGap && { columnGap: colGap }),
    ...(align && { alignItems: align }),
    ...(justify && { justifyItems: justify }),
    ...style,
  };

  const gridClassName = [
    styles.grid,
    isResponsive ? styles.responsive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={gridClassName} style={gridStyles} {...rest}>
      {enhancedChildren}
    </div>
  );
}

/**
 * Grid.Item: Use for grid children that need span/rowSpan. Example:
 * <Grid.Item span={2}>Spans 2 columns</Grid.Item>
 */
function GridItem({
  children,
  span,
  rowSpan,
  style = {},
  className = "",
  ...rest
}: GridItemProps) {
  const gridStyles: CSSProperties = { ...style };
  if (span) gridStyles.gridColumn = `span ${span}`;
  if (rowSpan) gridStyles.gridRow = `span ${rowSpan}`;
  return (
    <div className={className} style={gridStyles} {...rest}>
      {children}
    </div>
  );
}

Grid.Item = GridItem;

export { GridItem };
export default Grid;
