import React from "react";
import styles from "./Title.module.css";
import "../../styles/variables.css";

type TitleSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
type LineHeight = "tight" | "snug" | "normal" | "relaxed" | "loose";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TitleProps = {
  /** Heading text. */
  children: React.ReactNode;
  /** Override the rendered element (h1-h6); wins over level. */
  as?: HeadingTag;
  /** Additional CSS class names. */
  className?: string;
  /** When true, only sets the heading tag + className (no Title token typography). Use in patterns/pages that already define font/size in CSS or Tailwind. */
  unstyled?: boolean;
  /** Display size token for the heading. */
  size?: TitleSize;
  /** Semantic heading level (maps to h1-h6 when as is unset). */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Line height variant. */
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

const lineHeightClassMap: Record<LineHeight, string> = {
  tight: styles["lineHeightTight"] || "",
  snug: styles["lineHeightSnug"] || "",
  normal: styles["lineHeightNormal"] || "",
  relaxed: styles["lineHeightRelaxed"] || "",
  loose: styles["lineHeightLoose"] || "",
};

/** Page and section headings with size and line-height variants. */
const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  {
    children,
    as,
    className = "",
    unstyled = false,
    size = "l",
    level,
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
  const lineHeightClass = lineHeight
    ? lineHeightClassMap[lineHeight] || ""
    : "";
  return (
    <Tag
      ref={ref}
      className={`${styles.title} ${sizeClass} ${lineHeightClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Title.displayName = "Title";

export default Title;
