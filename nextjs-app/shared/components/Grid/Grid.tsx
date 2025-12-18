import React, {
  Children,
  isValidElement,
  cloneElement,
  ReactNode,
  CSSProperties,
} from "react";
import styles from "./Grid.module.css";

interface GridProps {
  children: ReactNode;
  columns?: number | string;
  rows?: number | string;
  gap?: string;
  rowGap?: string;
  colGap?: string;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyItems"];
  style?: CSSProperties;
  className?: string;
  [key: string]: any; // Allow passing any grid CSS prop
}

/**
 * GridItemProps: span for columns, rowSpan for rows, and style/className
 */
interface GridItemProps {
  children?: ReactNode;
  span?: number;
  rowSpan?: number;
  style?: CSSProperties;
  className?: string;
  [key: string]: any;
}

function Grid({
  children,
  columns = 1,
  rows,
  gap = "1rem",
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

  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateColumns:
      typeof columns === "number" ? `repeat(${columns}, 1fr)` : columns,
    ...(rows && {
      gridTemplateRows:
        typeof rows === "number" ? `repeat(${rows}, 1fr)` : rows,
    }),
    gap,
    ...(rowGap && { rowGap }),
    ...(colGap && { columnGap: colGap }),
    ...(align && { alignItems: align }),
    ...(justify && { justifyItems: justify }),
    ...style,
  };

  return (
    <div className={`${styles.grid} ${className}`} style={gridStyles} {...rest}>
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
