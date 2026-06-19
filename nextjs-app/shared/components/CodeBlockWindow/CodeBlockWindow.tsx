"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import Text from "@dt/Text";
import { cn } from "@/lib/utils";
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
  /** Article prose layout — 80% width, 35vh max height, wrap + vertical scroll */
  context?: "default" | "article";
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

/**
 * Lenis smooth-scroll ignores wheel events inside this subtree; header/caption
 * wheel is forwarded to the scrollable body manually.
 */
const bindArticleCodeBlockWheelScroll = (
  container: HTMLElement,
  body: HTMLElement,
) => {
  const onWheel = (event: WheelEvent) => {
    if (body.scrollHeight <= body.clientHeight + 1) {
      return;
    }

    // Body uses native overflow scroll once Lenis is excluded via data-lenis-prevent-wheel.
    if (body.contains(event.target as Node)) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = body;
    const maxScrollTop = scrollHeight - clientHeight;
    const deltaY = event.deltaY;
    const canScrollUp = scrollTop > 0;
    const canScrollDown = scrollTop < maxScrollTop - 1;

    if ((deltaY < 0 && canScrollUp) || (deltaY > 0 && canScrollDown)) {
      event.preventDefault();
      body.scrollTop = Math.min(
        maxScrollTop,
        Math.max(0, scrollTop + deltaY),
      );
    }
  };

  container.addEventListener("wheel", onWheel, { passive: false });
  return () => container.removeEventListener("wheel", onWheel);
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

/**
 * CodeBlockWindow component.
 */
export const CodeBlockWindow: React.FC<CodeBlockWindowProps> = ({
  title,
  caption,
  language,
  showLineNumbers,
  context = "default",
  className = "",
  children,
}) => {
  const isArticleContext = context === "article";
  const { t } = useTranslation();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isArticleContext) {
      return;
    }

    const containerElement = containerRef.current;
    const bodyElement = bodyRef.current;
    if (!containerElement || !bodyElement) {
      return;
    }

    return bindArticleCodeBlockWheelScroll(containerElement, bodyElement);
  }, [isArticleContext, children]);

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
      ref={containerRef}
      className={cn(
        styles.container,
        isArticleContext && styles.containerArticle,
        "not-prose",
        className,
      )}
      data-line-numbers={lineNumbersEnabled ? "true" : "false"}
      {...(isArticleContext ? { "data-lenis-prevent-wheel": "" } : {})}
    >
      <div className={styles.header}>
        <div className={styles.controls} aria-hidden="true">
          <span className={`${styles.dot} ${styles.close}`} />
          <span className={`${styles.dot} ${styles.minimize}`} />
          <span className={`${styles.dot} ${styles.maximize}`} />
          <Text as="span" size="xxs" className={styles.language}>
            {languageLabel}
          </Text>
        </div>
        <div className={styles.headerInfo}>
          {title ? (
            <Text as="span" size="xs" className={styles.title}>
              {title}
            </Text>
          ) : null}
        </div>
        <div className={styles.actions}>
          <Button
            variant="tertiary"
            size="sm"
            className={styles.copyButton}
            onClick={handleCopy}
            disabled={!codeText}
            accessibleName={t("codeBlockWindow.copyAriaLabel")}
          >
            {copyLabel}
          </Button>
          {statusMessage ? (
            <Text
              as="span"
              size="xs"
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
        ref={bodyRef}
        className={cn(styles.body, isArticleContext && styles.bodyArticle)}
        role="group"
        tabIndex={isArticleContext ? 0 : undefined}
        aria-label={t("codeBlockWindow.regionLabel", { language: languageLabel })}
      >
        {enhancePreElement(children)}
      </div>
      {caption ? (
        <figcaption className={styles.caption}>
          <Text as="span" size="xs">
            {caption}
          </Text>
        </figcaption>
      ) : null}
    </figure>
  );
};

CodeBlockWindow.displayName = "CodeBlockWindow";

export default CodeBlockWindow;
