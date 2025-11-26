"use client";

import React, { useMemo } from "react";
import styles from "./CodeSnippet.module.css";
import Text from "@dt/Text";
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
  | "python"
  | "go"
  | "rust"
  | "json"
  | "bash"
  | "markdown";

export interface CodeSnippetProps {
  code: string;
  language?: SupportedLanguage;
  showLineNumbers?: boolean;
  "aria-label"?: string;
  allowCopy?: boolean;
}

const prismLanguageMap: Record<SupportedLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
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

const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = "typescript",
  showLineNumbers = true,
  allowCopy = true,
  "aria-label": ariaLabel,
}) => {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

  const stripComments = (value: string) =>
    value
      // line comments
      .replace(/(^|\s)\/\/.*$/gm, "")
      // block comments
      .replace(/\/\*[\s\S]*?\*\//gm, "")
      .trimEnd();

  const copyToClipboard = async (variant: "raw" | "no-comments") => {
    if (!allowCopy) return;
    try {
      const toCopy = variant === "no-comments" ? stripComments(code) : code;
      await navigator.clipboard.writeText(toCopy);
      setCopyState("copied");
      setToastMessage(
        variant === "no-comments" ? "Copied without comments" : "Copied",
      );
      setToastOpen(true);
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setToastMessage("Copy failed");
      setToastOpen(true);
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  const rendered = useMemo(
    () => renderLines(code.trimEnd(), language, showLineNumbers),
    [code, language, showLineNumbers],
  );

  return (
    <figure className={styles.wrapper}>
      <div className={styles.toolbar} aria-hidden={!allowCopy}>
        <Text as="span" size="XXS" monospace className={styles.language}>
          {language}
        </Text>
        {allowCopy && (
          <div className={styles.actions}>
            <SplitButton
              size="m"
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
          </div>
        )}
      </div>
      <pre
        className={styles.pre}
        role="region"
        aria-label={ariaLabel || `Code snippet in ${language}`}
      >
        <code
          className={`${styles.code} language-${language}`}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      </pre>
      <Toast
        message={toastMessage}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </figure>
  );
};

export default CodeSnippet;
