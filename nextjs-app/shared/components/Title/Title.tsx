import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const titleVariants = cva("", {
  variants: {
    size: { XXS: "", XS: "", S: "", M: "", L: "", XL: "", XXL: "" },
    terminals: { sans: "", serif: "" },
  },
  defaultVariants: { size: "L", terminals: "serif" },
});
import styles from "./Title.module.css";
import "../../styles/variables.css";

type TitleSize = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL";
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

/** Page and section headings with size and terminal (serif/sans) variants. */
const Title: React.FC<TitleProps> = ({
  children,
  as,
  className = "",
  unstyled = false,
  size = "L",
  level,
  terminals = "serif",
  lineHeight,
  ...rest
}) => {
  const Tag =
    as || (level ? (`h${level}` as HeadingTag) : "h1");
  if (unstyled) {
    return (
      <Tag className={className.trim() || undefined} {...rest}>
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
      className={`${styles.title} ${sizeClass} ${terminalsClass} ${lineHeightClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Title;
