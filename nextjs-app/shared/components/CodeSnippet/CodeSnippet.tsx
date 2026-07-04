"use client";

import React, { useMemo, useState, useRef } from "react";
import styles from "./CodeSnippet.module.css";
import Text from "@dt/Text";
import Button from "@dt/Button";
import SplitButton from "@dt/SplitButton";
import Toast from "@dt/Toast";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markup";

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "html"
  | "xml"
  | "python"
  | "go"
  | "rust"
  | "json"
  | "bash"
  | "markdown";

export type CodeSnippetVariant = "inline" | "single" | "multi";

export interface CodeSnippetProps {
  /** The code string to highlight. */
  code: string;
  /** Highlighting grammar. */
  language?: SupportedLanguage;
  /** Render a line-number gutter. */
  showLineNumbers?: boolean;
  /** Accessible name for the snippet region. */
  "aria-label"?: string;
  /** Show the copy button; keep on for reusable code. */
  allowCopy?: boolean;
  /** Layout variant: inline token, single line, or multi-line window. */
  variant?: CodeSnippetVariant;
  /** Clamp height to this many lines; longer code scrolls. 0 disables the clamp. */
  maxLines?: number;
  /** Fires after the code is copied to the clipboard. */
  onCopy?: () => void;
}

const prismLanguageMap: Record<SupportedLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
  html: "markup",
  xml: "markup",
  python: "python",
  go: "go",
  rust: "rust",
  json: "json",
  bash: "bash",
  markdown: "markup",
};

const renderLines = (
  code: string,
  language: SupportedLanguage,
  showLineNumbers: boolean,
) => {
  const prismLang = prismLanguageMap[language] || "markup";
  const grammar = Prism.languages[prismLang] || Prism.languages.markup;
  const highlighted = Prism.highlight(code, grammar, prismLang);
  const lines = highlighted.split("\n");
  return lines
    .map((line, index) => {
      const lineNumber = showLineNumbers
        ? `<span class="${styles.lineNumber}" aria-hidden="true">${index + 1}</span>`
        : "";
      const content = line.length ? line : "&nbsp;";
      return `<div class="${styles.line}">${lineNumber}<span class="${styles.codeText}">${content}</span></div>`;
    })
    .join("");
};

/**
 * CodeSnippet component.
 */
export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = "typescript",
  showLineNumbers = true,
  allowCopy = true,
  variant = "multi",
  maxLines,
  onCopy,
  "aria-label": ariaLabel,
}) => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const lines = code.trimEnd().split("\n");
  const hasOverflow =
    maxLines && lines.length > maxLines && variant === "multi";
  const displayedCode =
    hasOverflow && !isExpanded ? lines.slice(0, maxLines).join("\n") : code;

  const stripComments = (value: string) =>
    value
      // line comments
      .replace(/(^|\s)\/\/.*$/gm, "")
      // block comments
      .replace(/\/\*[\s\S]*?\*\//gm, "")
      .trimEnd();

  const copyToClipboard = async (copyVariant: "raw" | "no-comments") => {
    if (!allowCopy) return;
    try {
      const toCopy = copyVariant === "no-comments" ? stripComments(code) : code;
      await navigator.clipboard.writeText(toCopy);
      setCopyState("copied");
      setToastMessage(
        copyVariant === "no-comments"
          ? "Copied without comments"
          : "Copied to clipboard",
      );
      setToastOpen(true);
      onCopy?.();
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setToastMessage("Failed to copy");
      setToastOpen(true);
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  const handleInlineClick = () => {
    if (variant === "inline" && allowCopy) {
      void copyToClipboard("raw");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      variant === "inline" &&
      allowCopy &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      void copyToClipboard("raw");
    }
  };

  const rendered = useMemo(
    () =>
      renderLines(
        displayedCode.trimEnd(),
        language,
        showLineNumbers && variant !== "inline",
      ),
    [displayedCode, language, showLineNumbers, variant],
  );

  // Inline variant - simple inline code
  if (variant === "inline") {
    return (
      <>
        <code
          ref={codeRef as React.RefObject<HTMLElement>}
          className={`${styles.inline} language-${language}`}
          onClick={handleInlineClick}
          onKeyDown={handleKeyDown}
          role={allowCopy ? "button" : undefined}
          tabIndex={allowCopy ? 0 : undefined}
          aria-label={
            ariaLabel || (allowCopy ? `Copy code: ${code}` : undefined)
          }
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(
              code,
              Prism.languages[prismLanguageMap[language]] ||
                Prism.languages.markup,
              prismLanguageMap[language],
            ),
          }}
        />
        <Toast
          message={toastMessage}
          open={toastOpen}
          onClose={() => setToastOpen(false)}
        />
      </>
    );
  }

  // Single and Multi variants
  return (
    <figure
      className={`${styles.wrapper} ${styles[variant]}`}
      data-variant={variant}
    >
      <div className={styles.toolbar} aria-hidden={!allowCopy}>
        <Text as="span" size="xxs" className={styles.language}>
          {language}
        </Text>
        {allowCopy && (
          <div className={styles.actions}>
            {variant === "single" ? (
              <Button
                size="md"
                variant="secondary"
                onClick={() => void copyToClipboard("raw")}
                aria-label="Copy code to clipboard"
              >
                Copy
              </Button>
            ) : (
              <SplitButton
                size="md"
                variant="secondary"
                label="Copy"
                onPrimaryClick={() => void copyToClipboard("raw")}
                options={[
                  {
                    label: "Copy w/o comments",
                    onSelect: () => void copyToClipboard("no-comments"),
                  },
                ]}
              />
            )}
          </div>
        )}
      </div>
      <pre
        className={`${styles.pre} ${hasOverflow ? styles.preWithExpand : ""}`}
        role="region"
        aria-label={ariaLabel || `Code snippet in ${language}`}
      >
        <code
          ref={codeRef as React.RefObject<HTMLElement>}
          className={`${styles.code} language-${language}`}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      </pre>
      {hasOverflow && (
        <div className={styles.expandControl}>
          <Button
            size="md"
            variant="tertiary"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={codeRef.current?.id}
          >
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        </div>
      )}
      <Toast
        message={toastMessage}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </figure>
  );
};

export default CodeSnippet;
