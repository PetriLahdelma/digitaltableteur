import React from "react";

export interface FlexBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** flex-direction. @default "row" */
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  /** flex-wrap. @default "nowrap" */
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  /** Main-axis distribution. @default "flex-start" */
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  /** Cross-axis item alignment. @default "stretch" */
  align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  /** Cross-axis line distribution when wrapping. */
  alignContent?:
    | "stretch"
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around";
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
export const FlexBox: React.FC<FlexBoxProps> = ({
  direction = "row",
  wrap = "nowrap",
  justify = "flex-start",
  align = "stretch",
  alignContent,
  gap,
  rowGap,
  columnGap,
  style,
  children,
  ...rest
}) => {
  const flexStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent: justify,
    alignItems: align,
    ...(alignContent ? { alignContent } : {}),
    ...(gap !== undefined
      ? { gap: typeof gap === "number" ? `${gap}px` : gap }
      : {}),
    ...(rowGap !== undefined
      ? { rowGap: typeof rowGap === "number" ? `${rowGap}px` : rowGap }
      : {}),
    ...(columnGap !== undefined
      ? {
          columnGap:
            typeof columnGap === "number" ? `${columnGap}px` : columnGap,
        }
      : {}),
    ...style,
  };
  return (
    <div style={flexStyle} {...rest}>
      {children}
    </div>
  );
};

export default FlexBox;
