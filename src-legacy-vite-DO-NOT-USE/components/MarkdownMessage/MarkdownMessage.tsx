import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MarkdownMessage.module.css";

export interface MarkdownMessageProps {
  content: string;
  fallback?: string;
  "data-role"?: string;
}

// Basic link transform: open in same tab for accessibility; could be target _blank with rel
const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  fallback,
  "data-role": dataRole,
}) => {
  const safe = content?.trim();
  const toRender = safe || fallback || "";

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
            a: ({ node, ...props }) => (
              <a {...props} rel="noopener noreferrer" />
            ),
            code: ({ className, children, ...props }) => (
              <code className={className} {...props}>
                {children}
              </code>
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
