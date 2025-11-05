import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MarkdownMessage.module.css";
import { useTranslation } from "react-i18next";

export interface MarkdownMessageProps {
  content: string;
  fallback?: string;
  [dataAttr: string]: unknown; // allow data-role etc. (data-role etc.)
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  fallback,
  ...rest
}) => {
  const { t } = useTranslation();
  const trimmed = content?.trim();
  const toRender =
    trimmed && trimmed.length > 0
      ? trimmed
      : fallback || t("chatThinking", "Thinking…");

  return (
    <div
      className={styles.root}
      {...rest}
      aria-live={!trimmed ? "polite" : undefined}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ node, ...props }) => <a {...props} rel="noopener noreferrer" />,
          code: ({ className, children, ...props }) => (
            <code className={className} {...props}>
              {children}
            </code>
          ),
        }}
      >
        {toRender}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
