import React from "react";
import styles from "./Link.module.css";
import "../../styles/variables.css";
import { FaExternalLinkAlt } from "react-icons/fa";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: "S" | "M" | "L";
}

const Link: React.FC<LinkProps> = ({
  href = "#",
  size = "M",
  children,
  ...rest
}) => {
  const isExternal =
    !href.startsWith("/") && !href.includes("digitaltableteur.com");

  return (
    <a
      href={href}
      className={`${styles.link} ${styles[`link${size}`]}`}
      {...rest}
    >
      {children}
      {isExternal && (
        <span className={styles.externalIcon}>
          {FaExternalLinkAlt({ "aria-label": "External link" })}
        </span>
      )}
    </a>
  );
};

export default Link;
