import React from "react";
import styles from "./Text.module.css";
import "../../styles/variables.css";

type TextSize = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type TextTag = "p" | "span" | "div" | "strong" | "em" | "cite" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TextProps = {
  children: React.ReactNode;
  as?: TextTag;
  terminals?: "serif" | "sans";
  size?: TextSize;
  lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLElement>;

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

const Text = ({
  children,
  as = "p",
  className = "",
  terminals = "sans",
  size = "M",
  lineHeight,
  style,
  ...rest
}: TextProps) => {
  const Tag = as;
  const terminalClass = terminals === "serif" ? styles.serif : styles.sans;
  const sizeClass = sizeClassMap[size] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  return (
    <Tag
      className={`${styles.text} ${terminalClass} ${sizeClass} ${lineHeightClass} ${className}`.trim()}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Text;
