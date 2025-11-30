import React from "react";
import styles from "./Link.module.css";
import "../../styles/variables.css";
import Icon from "@dt/Icon";

const useNextLink = () => {
  const [NextLink, setNextLink] = React.useState<any>(null);
  React.useEffect(() => {
    let cancelled = false;
    import("next/link")
      .then((mod) => {
        if (!cancelled) {
          setNextLink(() => mod.default || mod);
        }
      })
      .catch(() => {
        /* fall back to <a> */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return NextLink;
};

interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  size?: "S" | "M" | "L";
  terminals?: "sans" | "serif";
}

const Link: React.FC<LinkProps> = ({
  href,
  size = "M",
  terminals = "sans",
  children,
  className = "",
  ...rest
}) => {
  const isExternal =
    !href.startsWith("/") && !href.includes("digitaltableteur.com");
  const NextLink = useNextLink();

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

  // Map link size to icon size
  const iconSize = size === "S" ? 20 : size === "L" ? 32 : 24;
  const combinedClassName = [
    styles.link,
    styles[`link${size}`],
    terminals === "serif" ? styles.fontSerif : styles.fontSans,
    "wavyUnderline",
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const content = (
    <>
      {children}
      {isExternal && hasTextContent && (
        <span className={styles.externalIcon}>
          <Icon
            name="arrow-square-out"
            size={iconSize}
            ariaLabel="External link"
          />
        </span>
      )}
    </>
  );

  if (isExternal || !NextLink) {
    return (
      <a href={href} className={combinedClassName} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <NextLink href={href} className={combinedClassName} {...rest}>
      {content}
    </NextLink>
  );
};

export default Link;
