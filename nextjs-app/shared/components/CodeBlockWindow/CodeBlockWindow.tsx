"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import Text from "@dt/Text";
import styles from "./CodeBlockWindow.module.css";

export interface CodeBlockWindowProps {
  /** Optional title or filename shown in the header */
  title?: string;
  /** Optional caption rendered below the code */
  caption?: string;
  /** Language label shown in the header */
  language?: string;
  /** Force line numbers on/off (defaults to presence in Shiki output) */
  showLineNumbers?: boolean;
  /** Optional className passthrough */
  className?: string;
  /** Code block content (expected Shiki <pre><code>) */
  children: React.ReactNode;
}

type WithChildren = { children?: React.ReactNode };

type DataProps = {
  [key: string]: unknown;
  children?: React.ReactNode;
};

const hasDataAttribute = (props: DataProps, attr: string) =>
  Object.prototype.hasOwnProperty.call(props, attr);

const extractCodeText = (value: React.ReactNode): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(extractCodeText).join("");
  }
  if (React.isValidElement<WithChildren>(value)) {
    const props = value.props as DataProps;
    const content = extractCodeText(props.children);
    if (hasDataAttribute(props, "data-line")) {
      const normalized = content === " " ? "" : content;
      return `${normalized}\n`;
    }
    return content;
  }
  return "";
};

const hasLineNumbers = (value: React.ReactNode): boolean => {
  if (Array.isArray(value)) {
    return value.some(hasLineNumbers);
  }
  if (!React.isValidElement<WithChildren>(value)) {
    return false;
  }
  const props = value.props as DataProps;
  if (value.type === "code" && hasDataAttribute(props, "data-line-numbers")) {
    return true;
  }
  return hasLineNumbers(props.children);
};

const isPreElement = (
  node: React.ReactNode,
): node is React.ReactElement<React.ComponentPropsWithoutRef<"pre">> =>
  React.isValidElement(node) && node.type === "pre";

const isCodeElement = (
  node: React.ReactNode,
): node is React.ReactElement<React.ComponentPropsWithoutRef<"code">> =>
  React.isValidElement(node) && node.type === "code";

const enhancePreElement = (preNode: React.ReactNode) => {
  if (!isPreElement(preNode)) {
    return preNode;
  }

  const preProps = preNode.props;
  const preClassName = [styles.pre, preProps.className]
    .filter(Boolean)
    .join(" ");

  const enhancedChildren = React.Children.map(preProps.children, (child) => {
    if (!isCodeElement(child)) {
      return child;
    }

    const codeProps = child.props;
    const codeClassName = [styles.code, codeProps.className]
      .filter(Boolean)
      .join(" ");

    return React.cloneElement(child, { className: codeClassName });
  });

  return React.cloneElement(preNode, { className: preClassName }, enhancedChildren);
};

const copyTextToClipboard = async (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard not available");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!success) {
    throw new Error("Copy failed");
  }
};

const CodeBlockWindow: React.FC<CodeBlockWindowProps> = ({
  title,
  caption,
  language,
  showLineNumbers,
  className = "",
  children,
}) => {
  const { t } = useTranslation();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimer = useRef<number | null>(null);

  const codeText = useMemo(() => {
    const text = extractCodeText(children).trimEnd();
    return text;
  }, [children]);

  const lineNumbersEnabled =
    showLineNumbers !== undefined ? showLineNumbers : hasLineNumbers(children);

  const copyLabel = t("codeBlockWindow.copy");

  const statusMessage =
    copyState === "copied"
      ? t("codeBlockWindow.copied")
      : copyState === "error"
        ? t("codeBlockWindow.copyFailed")
        : "";

  const languageLabel = language
    ? language.toUpperCase()
    : t("codeBlockWindow.languageFallback");

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!codeText) return;
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }
    try {
      await copyTextToClipboard(codeText);
      setCopyState("copied");
      resetTimer.current = window.setTimeout(() => {
        setCopyState("idle");
      }, 1600);
    } catch {
      setCopyState("error");
      resetTimer.current = window.setTimeout(() => {
        setCopyState("idle");
      }, 2200);
    }
  };

  return (
    <figure
      className={`${styles.container} not-prose ${className}`.trim()}
      data-line-numbers={lineNumbersEnabled ? "true" : "false"}
    >
      <div className={styles.header}>
        <div className={styles.controls} aria-hidden="true">
          <span className={`${styles.dot} ${styles.close}`} />
          <span className={`${styles.dot} ${styles.minimize}`} />
          <span className={`${styles.dot} ${styles.maximize}`} />
          <Text as="span" size="XXS" className={styles.language}>
            {languageLabel}
          </Text>
        </div>
        <div className={styles.headerInfo}>
          {title ? (
            <Text as="span" size="XS" className={styles.title}>
              {title}
            </Text>
          ) : null}
        </div>
        <div className={styles.actions}>
          <Button
            variant="tertiary"
            size="s"
            className={styles.copyButton}
            onClick={handleCopy}
            isDisabled={!codeText}
            accessibleName={t("codeBlockWindow.copyAriaLabel")}
          >
            {copyLabel}
          </Button>
          {statusMessage ? (
            <Text
              as="span"
              size="XS"
              className={styles.status}
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </Text>
          ) : null}
        </div>
      </div>
      <div
        className={styles.body}
        role="group"
        aria-label={t("codeBlockWindow.regionLabel", { language: languageLabel })}
      >
        {enhancePreElement(children)}
      </div>
      {caption ? (
        <figcaption className={styles.caption}>
          <Text as="span" size="XS">
            {caption}
          </Text>
        </figcaption>
      ) : null}
    </figure>
  );
};

CodeBlockWindow.displayName = "CodeBlockWindow";

export default CodeBlockWindow;
