import React from "react";
import styles from "./List.module.css";
import "../../styles/variables.css";

type TextSize = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL";
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

type ListProps = {
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
};

const sizeClassMap: Record<TextSize, string> = {
  XXS: styles["textXXS"] || "",
  XS: styles["textXS"] || "",
  S: styles["textS"] || "",
  M: styles["textM"] || "",
  L: styles["textL"] || "",
  XL: styles["textXL"] || "",
  XXL: styles["textXXL"] || "",
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
export const List: React.FC<ListProps> = ({
  items,
  as = "ul",
  className = "",
  terminals = "sans",
  size = "M",
  lineHeight,
  style,
  listStyleType,
  spacing = "normal",
  role,
}) => {
  const Tag = as;
  const terminalClass = terminals === "serif" ? styles.serif : styles.sans;
  const sizeClass = sizeClassMap[size] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  const spacingClass = spacingClassMap[spacing] || "";

  const combinedStyle = {
    ...style,
    ...(listStyleType && { listStyleType }),
  };

  return (
    <Tag
      className={`${styles.list} ${terminalClass} ${sizeClass} ${lineHeightClass} ${spacingClass} ${className}`.trim()}
      style={combinedStyle}
      role={role}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
};

export default List;
