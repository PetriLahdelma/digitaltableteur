import React from "react";
import styles from "./Text.module.css";
import "../../styles/variables.css";

type TextSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
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

/** Body and inline typography with size, terminal, and line-height tokens. */
const Text = ({
  children,
  as = "p",
  className = "",
  terminals = "sans",
  size = "m",
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
