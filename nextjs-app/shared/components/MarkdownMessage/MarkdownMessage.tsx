import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MarkdownMessage.module.css";
import Text from "@dt/Text";
import Title from "@dt/Title";
import Link from "@dt/Link";
import type { TextProps } from "@dt/Text";
import Title from "@dt/Title";
import Link from "@dt/Link";

type DesignSystemTextSize = NonNullable<TextProps["size"]>;

export interface MarkdownMessageProps {
  content: string;
  fallback?: string;
  "data-role"?: string;
  /**
   * Render markdown using the design system components (Title/Text/Link).
   * Useful for long-form content pages to ensure consistent styling.
   */
  renderWithDesignSystem?: boolean;
  /**
   * When `renderWithDesignSystem` is enabled, use this as the base size for
   * paragraph and inline emphasis text (e.g. `p`, `strong`, `em`).
   */
  designSystemTextSize?: DesignSystemTextSize;
}

// Basic link transform: open in same tab for accessibility; could be target _blank with rel
const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  fallback,
  "data-role": dataRole,
  renderWithDesignSystem = false,
  designSystemTextSize = "M",
}) => {
  const safe = content?.trim();
  const toRender = safe || fallback || "";

  const resolvedDesignSystemTextSize: DesignSystemTextSize =
    designSystemTextSize || "M";

  return (
    <div
      className={styles.root}
      data-role={dataRole}
      aria-live={safe ? undefined : "polite"}
    >
      {toRender ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // Disallow raw HTML for safety; can be enabled later with rehype-sanitize
          skipHtml
          components={{
            a: ({ href, children, ...props }) =>
              renderWithDesignSystem ? (
                <Link href={href ?? "#"} {...props}>
                  {children}
                </Link>
              ) : (
                <a href={href} {...props} rel="noopener noreferrer" />
              ),
            code: ({ children, ...props }) => <code {...props}>{children}</code>,
            p: ({ node, children, ...props }) =>
              renderWithDesignSystem ? (
                <Text
                  terminals="sans"
                  size={resolvedDesignSystemTextSize}
                  {...props}
                >
                  {children}
                </Text>
              ) : (
                <p {...props}>{children}</p>
              ),
            h1: ({ node, children, ...props }) =>
              renderWithDesignSystem ? (
                <Title terminals="sans" level={1} size="L" {...props}>
                  {children}
                </Title>
              ) : (
                <h1 {...props}>{children}</h1>
              ),
            h2: ({ node, children, ...props }) =>
              renderWithDesignSystem ? (
                <Title terminals="sans" level={2} size="S" {...props}>
                  {children}
                </Title>
              ) : (
                <h2 {...props}>{children}</h2>
              ),
            h3: ({ node, children, ...props }) =>
              renderWithDesignSystem ? (
                <Title terminals="sans" level={3} size="XS" {...props}>
                  {children}
                </Title>
              ) : (
                <h3 {...props}>{children}</h3>
              ),
            strong: ({ node, children, ...props }) =>
              renderWithDesignSystem ? (
                <Text
                  as="strong"
                  terminals="sans"
                  size={resolvedDesignSystemTextSize}
                  {...props}
                >
                  {children}
                </Text>
              ) : (
                <strong {...props}>{children}</strong>
              ),
            em: ({ node, children, ...props }) =>
              renderWithDesignSystem ? (
                <Text
                  as="em"
                  terminals="sans"
                  size={resolvedDesignSystemTextSize}
                  {...props}
                >
                  {children}
                </Text>
              ) : (
                <em {...props}>{children}</em>
              ),
          }}
        >
          {toRender}
        </ReactMarkdown>
      ) : null}
    </div>
  );
};

export default MarkdownMessage;
