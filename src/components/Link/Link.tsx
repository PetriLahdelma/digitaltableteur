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
  className = "",
  ...rest
}) => {
  const isExternal =
    !href.startsWith("/") && !href.includes("digitaltableteur.com");

  // Check if children contains actual text content
  const hasTextContent: boolean = React.useMemo((): boolean => {
    if (typeof children === "string") {
      return children.trim().length > 0;
    }
    if (React.isValidElement(children)) {
      // If it's a React element (like an icon), check if it has text content
      const getTextContent = (element: React.ReactElement): string => {
        const props = element.props as any;
        if (typeof props.children === "string") {
          return props.children;
        }
        if (Array.isArray(props.children)) {
          return props.children
            .map((child: any) =>
              typeof child === "string"
                ? child
                : React.isValidElement(child)
                  ? getTextContent(child)
                  : "",
            )
            .join("");
        }
        return "";
      };
      return getTextContent(children).trim().length > 0;
    }
    if (Array.isArray(children)) {
      return children.some((child) =>
        typeof child === "string"
          ? child.trim().length > 0
          : React.isValidElement(child)
            ? hasTextContent
            : false,
      );
    }
    return false;
  }, [children]);

  return (
    <a
      href={href}
      className={`${styles.link} ${styles[`link${size}`]} wavyUnderline ${className}`.trim()}
      {...rest}
    >
      {children}
      {isExternal && hasTextContent && (
        <span className={styles.externalIcon}>
          {FaExternalLinkAlt({ "aria-label": "External link" })}
        </span>
      )}
    </a>
  );
};

export default Link;
