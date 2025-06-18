import React from "react";
import styles from "./Title.module.css";
import "../../styles/variables.css";

type TitleSize = "S" | "M" | "L" | "XL";

type TitleProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  size?: TitleSize;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

const sizeClassMap: Record<TitleSize, string> = {
  S: styles["title-s"] || "",
  M: styles["title-m"] || "",
  L: styles["title-l"] || "",
  XL: styles["title-xl"] || "",
};

const Title: React.FC<TitleProps> = ({
  children,
  as,
  className = "",
  size = "L",
  level,
}) => {
  const Tag =
    as || (level ? (`h${level}` as keyof React.JSX.IntrinsicElements) : "h1");
  const sizeClass = sizeClassMap[size] || "";
  return (
    <Tag className={`${styles.title} ${sizeClass} ${className}`.trim()}>
      {children}
    </Tag>
  );
};

export default Title;
