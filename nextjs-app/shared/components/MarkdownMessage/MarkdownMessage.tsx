import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MarkdownMessage.module.css";
import Text from "@dt/Text";
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
/**
 * MarkdownMessage component.
 */
function MarkdownMessage({
  content,
  fallback,
  "data-role": dataRole,
  renderWithDesignSystem = false,
  designSystemTextSize = "M",
}: MarkdownMessageProps) {
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
            a: ({ href, children }) =>
              renderWithDesignSystem ? (
                <Link href={href ?? "#"}>
                  {children}
                </Link>
              ) : (
                <a href={href} rel="noopener noreferrer">
                  {children}
                </a>
              ),
            code: ({ children }) => <code>{children}</code>,
            p: ({ children }) =>
              renderWithDesignSystem ? (
                <Text terminals="sans" size={resolvedDesignSystemTextSize}>
                  {children}
                </Text>
              ) : (
                <p>{children}</p>
              ),
            h1: ({ children }) =>
              renderWithDesignSystem ? (
                <Title terminals="sans" level={1} size="L">
                  {children}
                </Title>
              ) : (
                <h1>{children}</h1>
              ),
            h2: ({ children }) =>
              renderWithDesignSystem ? (
                <Title terminals="sans" level={2} size="S">
                  {children}
                </Title>
              ) : (
                <h2>{children}</h2>
              ),
            h3: ({ children }) =>
              renderWithDesignSystem ? (
                <Title terminals="sans" level={3} size="XS">
                  {children}
                </Title>
              ) : (
                <h3>{children}</h3>
              ),
            strong: ({ children }) =>
              renderWithDesignSystem ? (
                <Text as="strong" terminals="sans" size={resolvedDesignSystemTextSize}>
                  {children}
                </Text>
              ) : (
                <strong>{children}</strong>
              ),
            em: ({ children }) =>
              renderWithDesignSystem ? (
                <Text as="em" terminals="sans" size={resolvedDesignSystemTextSize}>
                  {children}
                </Text>
              ) : (
                <em>{children}</em>
              ),
          }}
        >
          {toRender}
        </ReactMarkdown>
      ) : null}
    </div>
  );
}

export default MarkdownMessage;
