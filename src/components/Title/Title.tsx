import React from "react";
import styles from "./Title.module.css";
import "../../styles/variables.css";

type TitleSize = "S" | "M" | "L" | "XL";
type TitleTerminals = "sans" | "serif";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";

type TitleProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  size?: TitleSize;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  terminals?: TitleTerminals;
  lineHeight?: LineHeight;
};

const sizeClassMap: Record<TitleSize, string> = {
  S: styles["titleS"] || "",
  M: styles["titleM"] || "",
  L: styles["titleL"] || "",
  XL: styles["titleXL"] || "",
};

const terminalsClassMap: Record<TitleTerminals, string> = {
  sans: styles["fontSans"] || "",
  serif: styles["fontSerif"] || "",
};

const lineHeightClassMap: Record<LineHeight, string> = {
  tight: styles["lineHeightTight"] || "",
  snug: styles["lineHeightSnug"] || "",
  normal: styles["lineHeightNormal"] || "",
  relaxed: styles["lineHeightRelaxed"] || "",
  loose: styles["lineHeightLoose"] || "",
};

const Title: React.FC<TitleProps> = ({
  children,
  as,
  className = "",
  size = "L",
  level,
  terminals = "serif",
  lineHeight,
}) => {
  const Tag =
    as || (level ? (`h${level}` as keyof React.JSX.IntrinsicElements) : "h1");
  const sizeClass = sizeClassMap[size] || "";
  const terminalsClass = terminalsClassMap[terminals] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  return (
    <Tag
      className={`${styles.title} ${sizeClass} ${terminalsClass} ${lineHeightClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
};

export default Title;
