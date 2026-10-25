"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  File,
  FileC,
  FileCode,
  FileCpp,
  FileCSharp,
  FileCss,
  FileHtml,
  FileIni,
  FileJs,
  FileJsx,
  FileMd,
  FilePy,
  FileRs,
  FileSql,
  FileTs,
  FileTsx,
  FileTxt,
  FileVue,
  TerminalWindow,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { CodeCopyButton } from "../CodeCopyButton";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import { highlightLines } from "../../lib/code/highlight";
import {
  copyableText,
  parseDiff,
  parseLineSpec,
  type CodeLineSpec,
  type CodeLineState,
} from "../../lib/code/lines";
import { decorateShikiTree, summarizeShikiTree } from "../../lib/code/shikiTree";
import styles from "./CodeBlock.module.css";

export type CodeBlockTheme = "light" | "terminal";

export type { CodeLineSpec, CodeLineState };

export interface CodeBlockProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onCopy" | "children"> {
  /**
   * Source to show. Highlighted at runtime for the common languages; with
   * `language="diff"` the leading +/- of each line become added and removed
   * rows. Pass either `code` or a pre-highlighted Shiki tree as `children`.
   */
  code?: string;
  /**
   * A Shiki `<pre><code>` tree (rehype-pretty-code output). Callouts come
   * from the MDX meta string: a line range highlights, and a range with the
   * id "added" or "removed" marks a diff.
   */
  children?: React.ReactNode;
  /** Language of the code; shown in the header and drives highlighting. */
  language?: string;
  /** File name shown in the header. Giving one turns the header on. */
  filename?: string;
  /** Show the header bar. @default true when `filename` is set */
  header?: boolean;
  /** Number the lines. @default the Shiki tree's showLineNumbers, else false */
  lineNumbers?: boolean;
  /** Lines to highlight: `[2, 3]` or `"2-3,7"`. 1-based. */
  highlightLines?: CodeLineSpec;
  /** Lines to mark as added. */
  addedLines?: CodeLineSpec;
  /** Lines to mark as removed. Copy leaves them out. */
  removedLines?: CodeLineSpec;
  /** Caption under the card. */
  caption?: React.ReactNode;
  /**
   * `terminal` renders the block in the dark theme on any page. In the
   * high-contrast themes it follows the page so contrast stays at the
   * high-contrast level.
   * @default "light"
   */
  theme?: CodeBlockTheme;
  /** Wrap long lines instead of scrolling sideways. @default false */
  wrap?: boolean;
  /** Cap the body height (any CSS length, or pixels) and scroll inside it. */
  maxHeight?: string | number;
  /** Show the copy button. @default true */
  copyable?: boolean;
  /** Accessible name for the copy button. @default "Copy code" (translated) */
  copyLabel?: string;
  /** Called with the copied text. */
  onCopy?: (text: string) => void;
}

const SHELL_LANGUAGES = new Set(["bash", "sh", "shell", "zsh", "console", "powershell"]);

const FILE_ICONS: Record<string, PhosphorIcon> = {
  tsx: FileTsx,
  ts: FileTs,
  typescript: FileTs,
  jsx: FileJsx,
  js: FileJs,
  javascript: FileJs,
  mjs: FileJs,
  cjs: FileJs,
  css: FileCss,
  scss: FileCss,
  html: FileHtml,
  xml: FileHtml,
  markup: FileHtml,
  py: FilePy,
  python: FilePy,
  sql: FileSql,
  md: FileMd,
  mdx: FileMd,
  markdown: FileMd,
  rs: FileRs,
  rust: FileRs,
  c: FileC,
  cpp: FileCpp,
  cs: FileCSharp,
  csharp: FileCSharp,
  ini: FileIni,
  toml: FileIni,
  vue: FileVue,
  txt: FileTxt,
  text: FileTxt,
  plaintext: FileTxt,
};

/* The header glyph names the kind of file (Figma: file-tsx, terminal-window). */
function headerIconFor(language: string | undefined, theme: CodeBlockTheme) {
  const key = language?.toLowerCase();
  if (theme === "terminal" || (key && SHELL_LANGUAGES.has(key))) {
    return TerminalWindow;
  }
  if (!key) return File;
  return FILE_ICONS[key] ?? FileCode;
}

interface RenderedLine {
  text: string;
  state: CodeLineState;
}

function useScrollOverflow(ref: React.RefObject<HTMLDivElement | null>) {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () =>
      setOverflows(
        element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1,
      );
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [ref]);
  return overflows;
}

/**
 * Multi-line source with optional header, line numbers, callout rows and a
 * caption (Astryx CodeBlock, Geist Code Block). Replaces CodeBlockWindow.
 */
export const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(
  (
    {
      code,
      children,
      language: languageProp,
      filename,
      header,
      lineNumbers: lineNumbersProp,
      highlightLines: highlightSpec,
      addedLines: addedSpec,
      removedLines: removedSpec,
      caption,
      theme = "light",
      wrap = false,
      maxHeight,
      copyable = true,
      copyLabel,
      onCopy,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const t = useTranslate();
    const bodyRef = useRef<HTMLDivElement>(null);
    const scrollable = useScrollOverflow(bodyRef);

    const signLabels = {
      added: t("codeBlock.addedLine"),
      removed: t("codeBlock.removedLine"),
    };

    const shiki = useMemo(
      () => (children ? summarizeShikiTree(children) : null),
      [children],
    );

    const lines = useMemo<RenderedLine[] | null>(() => {
      if (shiki || code === undefined) return null;
      const source = code.replace(/\n$/, "");
      const base: RenderedLine[] =
        languageProp === "diff"
          ? parseDiff(source)
          : source.split("\n").map((text) => ({ text, state: "default" }));
      const highlighted = parseLineSpec(highlightSpec);
      const added = parseLineSpec(addedSpec);
      const removed = parseLineSpec(removedSpec);
      return base.map((line, index) => {
        const number = index + 1;
        const state: CodeLineState = removed.has(number)
          ? "removed"
          : added.has(number)
            ? "added"
            : highlighted.has(number)
              ? "highlighted"
              : line.state;
        return { text: line.text, state };
      });
    }, [shiki, code, languageProp, highlightSpec, addedSpec, removedSpec]);

    const segments = useMemo(
      () =>
        lines
          ? highlightLines(
              lines.map((line) => line.text).join("\n"),
              languageProp === "diff" ? undefined : languageProp,
            )
          : null,
      [lines, languageProp],
    );

    const language = languageProp ?? shiki?.language;
    const lineNumbers = lineNumbersProp ?? shiki?.lineNumbers ?? false;
    const hasDiff = shiki
      ? shiki.hasDiff
      : (lines ?? []).some(
          (line) => line.state === "added" || line.state === "removed",
        );
    const copyText = shiki ? shiki.text : copyableText(lines ?? []);
    const showHeader = header ?? Boolean(filename);
    const HeaderIcon = headerIconFor(language, theme);

    const body = shiki ? (
      decorateShikiTree(
        children,
        { pre: styles.pre, code: styles.code },
        signLabels,
      )
    ) : (
      <pre className={styles.pre} data-language={language}>
        <code className={styles.code} data-language={language}>
          {(lines ?? []).map((line, index) => (
            <span
              key={index}
              data-line=""
              {...(line.state !== "default"
                ? { "data-highlighted-line": "" }
                : {})}
              {...(line.state === "added" || line.state === "removed"
                ? {
                    "data-highlighted-line-id": line.state,
                    "data-sign-label": signLabels[line.state],
                  }
                : {})}
            >
              {(segments?.[index] ?? []).map((segment, segmentIndex) =>
                segment.role ? (
                  <span key={segmentIndex} data-syntax={segment.role}>
                    {segment.text}
                  </span>
                ) : (
                  <React.Fragment key={segmentIndex}>{segment.text}</React.Fragment>
                ),
              )}
            </span>
          ))}
        </code>
      </pre>
    );

    const copyButton = copyable ? (
      <CodeCopyButton value={copyText} label={copyLabel} onCopy={onCopy} />
    ) : null;

    const regionLabel =
      filename ||
      t("codeBlock.regionLabel", {
        language: language || t("codeBlock.languageFallback"),
      });

    const Root = caption ? "figure" : "div";
    // "" counts as unset, like every optional string prop here.
    const capped = maxHeight !== undefined && maxHeight !== "";
    const bodyStyle = capped
        ? ({
            "--code-block-max-height":
              typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
          } as React.CSSProperties)
        : undefined;

    return (
      <Root
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(styles.root, className)}
        data-theme={theme}
        style={style}
        {...rest}
      >
        {/* Only the card goes dark: the caption sits on the page. */}
        <div
          className={cn(
            styles.card,
            theme === "terminal" && ["themeDark", styles.terminal],
          )}
          data-header={showHeader ? "" : undefined}
          data-line-numbers={lineNumbers ? "" : undefined}
          data-diff={hasDiff ? "" : undefined}
          data-wrap={wrap ? "" : undefined}
          data-copyable={copyable ? "" : undefined}
        >
          {showHeader ? (
            <div className={styles.header}>
              <HeaderIcon className={styles.fileIcon} size={16} aria-hidden="true" />
              <span className={styles.filename} title={filename}>
                {filename}
              </span>
              {language ? (
                <span className={styles.language}>{language}</span>
              ) : null}
              {copyButton}
            </div>
          ) : copyButton ? (
            <div className={styles.floatingCopy}>{copyButton}</div>
          ) : null}
          <div
            ref={bodyRef}
            className={cn(styles.body, capped && styles.capped)}
            style={bodyStyle}
            {...(capped ? { "data-lenis-prevent-wheel": "" } : {})}
            {...(scrollable
              ? { tabIndex: 0, role: "region", "aria-label": regionLabel }
              : {})}
          >
            {body}
          </div>
        </div>
        {caption ? (
          <figcaption className={styles.caption}>{caption}</figcaption>
        ) : null}
      </Root>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

export default CodeBlock;
