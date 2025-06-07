import React from "react";
import styles from "./Link.module.css";
import { FaExternalLinkAlt } from "react-icons/fa";

interface LinkProps {
  href: string;
  size?: "S" | "M" | "L";
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, size = "M", children }) => {
  const isExternal =
    typeof href === "string" && !href.includes("digitaltableteur.com");

  return (
    <a
      href={href}
      className={`${styles.link} ${styles[size]}`}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {isExternal && FaExternalLinkAlt({ className: styles.icon })}
    </a>
  );
};

export default Link;
