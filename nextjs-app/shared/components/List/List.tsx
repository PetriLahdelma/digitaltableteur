import React from "react";
import styles from "./List.module.css";
import "../../styles/variables.css";

type TextSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type ListType = "ul" | "ol";
type ListStyleType =
  | "disc"
  | "circle"
  | "square"
  | "decimal"
  | "decimal-leading-zero"
  | "lower-alpha"
  | "upper-alpha"
  | "lower-roman"
  | "upper-roman"
  | "none";

export interface ListProps {
  items: React.ReactNode[];
  as?: ListType;
  className?: string;
  terminals?: "serif" | "sans";
  size?: TextSize;
  lineHeight?: LineHeight;
  style?: React.CSSProperties;
  listStyleType?: ListStyleType;
  spacing?: "compact" | "normal" | "relaxed";
  role?: string;
}

const sizeClassMap: Record<TextSize, string> = {
  xxs: styles["textXXS"] || "",
  xs: styles["textXS"] || "",
  s: styles["textS"] || "",
  m: styles["textM"] || "",
  l: styles["textL"] || "",
  xl: styles["textXL"] || "",
  xxl: styles["textXXL"] || "",
};

const lineHeightClassMap: Record<LineHeight, string> = {
  tight: styles["lineHeightTight"] || "",
  snug: styles["lineHeightSnug"] || "",
  normal: styles["lineHeightNormal"] || "",
  relaxed: styles["lineHeightRelaxed"] || "",
  loose: styles["lineHeightLoose"] || "",
};

const spacingClassMap: Record<string, string> = {
  compact: styles["spacingCompact"] || "",
  normal: styles["spacingNormal"] || "",
  relaxed: styles["spacingRelaxed"] || "",
};

/**
 * List component.
 */
export const List = React.forwardRef<
  HTMLUListElement | HTMLOListElement,
  ListProps
>(function List(
  {
    items,
    as = "ul",
    className = "",
    terminals = "sans",
    size = "m",
    lineHeight,
    style,
    listStyleType,
    spacing = "normal",
    role,
  },
  ref,
) {
  // Polymorphic tag (ul/ol): widen to ElementType so the forwarded ref types
  // cleanly against both list elements.
  const Tag = as as React.ElementType;
  const terminalClass = terminals === "serif" ? styles.serif : styles.sans;
  const sizeClass = sizeClassMap[size] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  const spacingClass = spacingClassMap[spacing] || "";

  const resolvedListStyleType =
    listStyleType === "none" ? ('" "' as ListStyleType) : listStyleType;

  const combinedStyle = {
    ...style,
    ...(resolvedListStyleType && { listStyleType: resolvedListStyleType }),
  };

  return (
    <Tag
      ref={ref}
      className={`${styles.list} ${terminalClass} ${sizeClass} ${lineHeightClass} ${spacingClass} ${className}`.trim()}
      style={combinedStyle}
      role={role}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
});

List.displayName = "List";

export default List;
