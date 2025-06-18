import React from "react";
import styles from "./Text.module.css";
import "../../styles/variables.css";

type TextProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

const Text: React.FC<TextProps> = ({ children, as = "p", className = "" }) => {
  const Tag = as;
  return <Tag className={`${styles.text} ${className}`.trim()}>{children}</Tag>;
};

export default Text;
