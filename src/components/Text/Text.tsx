import React from "react";
import styles from "./Text.module.css";

type TextSize = "S" | "M" | "L";

type TextProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  terminals?: "serif" | "sans";
  size?: TextSize;
};

const sizeClassMap: Record<TextSize, string> = {
  S: styles["textS"] || "",
  M: styles["textM"] || "",
  L: styles["textL"] || "",
};

const Text: React.FC<TextProps> = ({
  children,
  as = "p",
  className = "",
  terminals = "sans",
  size = "M",
}) => {
  const Tag = as;
  const terminalClass = terminals === "serif" ? styles.serif : styles.sans;
  const sizeClass = sizeClassMap[size] || "";
  return (
    <Tag
      className={`${styles.text} ${terminalClass} ${sizeClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
};

export default Text;
