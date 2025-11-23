import React from "react";
import styles from "./Text.module.css";
import "../../styles/variables.css";

type TextSize = "S" | "M" | "L";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";

type TextProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  terminals?: "serif" | "sans";
  size?: TextSize;
  lineHeight?: LineHeight;
};

const sizeClassMap: Record<TextSize, string> = {
  S: styles["textS"] || "",
  M: styles["textM"] || "",
  L: styles["textL"] || "",
};

const lineHeightClassMap: Record<LineHeight, string> = {
  tight: styles["lineHeightTight"] || "",
  snug: styles["lineHeightSnug"] || "",
  normal: styles["lineHeightNormal"] || "",
  relaxed: styles["lineHeightRelaxed"] || "",
  loose: styles["lineHeightLoose"] || "",
};

const Text: React.FC<TextProps> = ({
  children,
  as = "p",
  className = "",
  terminals = "sans",
  size = "M",
  lineHeight,
}) => {
  const Tag = as;
  const terminalClass = terminals === "serif" ? styles.serif : styles.sans;
  const sizeClass = sizeClassMap[size] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  return (
    <Tag
      className={`${styles.text} ${terminalClass} ${sizeClass} ${lineHeightClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
};

export default Text;
