import React from "react";
import styles from "./Link.module.css";

interface LinkProps {
  href: string;
  size?: "S" | "M" | "L";
  children: React.ReactNode;
  className?: string;
}

const Link: React.FC<LinkProps> = ({ href, size = "M", children }) => {
  const isExternal =
    !href.startsWith("/") && !href.includes("digitaltableteur.com");

  return (
    <a href={href} className={`${styles.link} ${styles[size]}`}>
      {children}
      {isExternal && <span className={styles.externalIcon}>🔗</span>}{" "}
    </a>
  );
};

export default Link;
