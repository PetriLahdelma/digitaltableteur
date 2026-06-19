import React from "react";
import styles from "./Title.module.css";
import "../../styles/variables.css";

type TitleSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
type TitleTerminals = "sans" | "serif";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TitleProps = {
  children: React.ReactNode;
  as?: HeadingTag;
  className?: string;
  /** When true, only sets the heading tag + className (no Title token typography). Use in patterns/pages that already define font/size in CSS or Tailwind. */
  unstyled?: boolean;
  size?: TitleSize;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  terminals?: TitleTerminals;
  lineHeight?: LineHeight;
} & React.HTMLAttributes<HTMLHeadingElement>;

const sizeClassMap: Record<TitleSize, string> = {
  xxs: styles["titleXXS"] || "",
  xs: styles["titleXS"] || "",
  s: styles["titleS"] || "",
  m: styles["titleM"] || "",
  l: styles["titleL"] || "",
  xl: styles["titleXL"] || "",
  xxl: styles["titleXXL"] || "",
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

/** Page and section headings with size and terminal (serif/sans) variants. */
const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  {
    children,
    as,
    className = "",
    unstyled = false,
    size = "l",
    level,
    terminals = "serif",
    lineHeight,
    ...rest
  },
  ref,
) {
  const Tag = as || (level ? (`h${level}` as HeadingTag) : "h1");
  if (unstyled) {
    return (
      <Tag ref={ref} className={className.trim() || undefined} {...rest}>
        {children}
      </Tag>
    );
  }
  const sizeClass = sizeClassMap[size] || "";
  const terminalsClass = terminalsClassMap[terminals] || "";
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  return (
    <Tag
      ref={ref}
      className={`${styles.title} ${sizeClass} ${terminalsClass} ${lineHeightClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Title.displayName = "Title";

export default Title;
