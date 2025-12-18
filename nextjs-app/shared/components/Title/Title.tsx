import React from "react";
import styles from "./Title.module.css";
import "../../styles/variables.css";

type TitleSize = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL";
type TitleTerminals = "sans" | "serif";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type TitleProps = {
  children: React.ReactNode;
  as?: HeadingTag;
  className?: string;
  size?: TitleSize;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  terminals?: TitleTerminals;
  lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLHeadingElement>;

const sizeClassMap: Record<TitleSize, string> = {
  XXS: styles["titleXXS"] || "",
  XS: styles["titleXS"] || "",
  S: styles["titleS"] || "",
  M: styles["titleM"] || "",
  L: styles["titleL"] || "",
  XL: styles["titleXL"] || "",
  XXL: styles["titleXXL"] || "",
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
  ...rest
}) => {
  const Tag =
    as || (level ? (`h${level}` as HeadingTag) : "h1");
  const sizeClass = sizeClassMap[size] || "";
  const terminalsClass = terminalsClassMap[terminals] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  return (
    <Tag
      className={`${styles.title} ${sizeClass} ${terminalsClass} ${lineHeightClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Title;
