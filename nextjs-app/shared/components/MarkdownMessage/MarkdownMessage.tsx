import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MarkdownMessage.module.css";
import Text from "@dt/Text";
import type { TextProps } from "@dt/Text";
import Title from "@dt/Title";
import Link from "@dt/Link";

type DesignSystemTextSize = NonNullable<TextProps["size"]>;

export interface MarkdownMessageProps {
  /** Markdown source rendered through DS typography. */
  content: string;
  /** Plain text shown when content is empty or fails to parse. */
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
  /** Compact typography for in-chat assistant replies. */
  density?: "default" | "chat";
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
  designSystemTextSize = "m",
  density = "default",
}: MarkdownMessageProps) {
  const safe = content?.trim();
  const toRender = safe || fallback || "";
  const isChatDensity = density === "chat";

  const resolvedDesignSystemTextSize: DesignSystemTextSize =
    designSystemTextSize || "M";

  return (
    <div
      className={`${styles.root}${isChatDensity ? ` ${styles.chat}` : ""}`}
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
            // Block code (<pre>) is horizontally scrollable, so it must be
            // keyboard-focusable to satisfy WCAG 2.1.1 (axe rule
            // `scrollable-region-focusable`).
            pre: ({ children }) => <pre tabIndex={0}>{children}</pre>,
            p: ({ children }) =>
              renderWithDesignSystem ? (
                <Text size={resolvedDesignSystemTextSize}>
                  {children}
                </Text>
              ) : (
                <p>{children}</p>
              ),
            h1: ({ children }) =>
              renderWithDesignSystem ? (
                <Title level={1} size="l">
                  {children}
                </Title>
              ) : (
                <h1>{children}</h1>
              ),
            h2: ({ children }) =>
              renderWithDesignSystem ? (
                <Title level={2} size="s">
                  {children}
                </Title>
              ) : (
                <h2>{children}</h2>
              ),
            h3: ({ children }) =>
              renderWithDesignSystem ? (
                <Title level={3} size="xs">
                  {children}
                </Title>
              ) : (
                <h3>{children}</h3>
              ),
            img: isChatDensity
              ? () => null
              : ({ src, alt }) => {
                  const imageSrc = typeof src === "string" ? src : undefined;
                  if (!imageSrc) return null;
                  return (
                    <img src={imageSrc} alt={alt ?? ""} loading="lazy" />
                  );
                },
            strong: ({ children }) =>
              renderWithDesignSystem ? (
                <Text as="strong" size={resolvedDesignSystemTextSize}>
                  {children}
                </Text>
              ) : (
                <strong>{children}</strong>
              ),
            em: ({ children }) =>
              renderWithDesignSystem ? (
                <Text as="em" size={resolvedDesignSystemTextSize}>
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
