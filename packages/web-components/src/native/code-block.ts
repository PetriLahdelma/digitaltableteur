import { nativeCodeGlyphs, type NativeCodeGlyph } from "../generated/native-code-glyphs";
import { codeCopyButtonStyles, createCodeCopyControl } from "./code-copy-button";
import {
  darkSurfaceTokens,
  diffState,
  hasDiffMarker,
  highlightLines,
  observeDocumentTheme,
  optionalBoolean,
  parseLineSpec,
  type CodeLineState,
} from "./code-shared";
import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const THEMES = ["light", "terminal"] as const;

export type DtCodeBlockTheme = (typeof THEMES)[number];

/* Transcribed from CodeBlock.module.css. Shiki colours follow the page via
   :host-context like the other code twins; a terminal block on a light page
   gets data-dark plus the resolved dark tokens on its card. */
const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    display: grid;
    margin: 0;
    min-inline-size: 0;
    max-inline-size: 100%;
    gap: var(--space-internal-8);
  }
  .card {
    --code-number-size: 0px;
    --code-sign-size: 0px;
    --code-gutter: calc(var(--space-internal-12) + var(--space-internal-2));
    --code-line-end: var(--space-internal-16);
    position: relative;
    min-inline-size: 0;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    background-color: var(--main-body-background-color);
    overflow: clip;
  }
  .card[data-line-numbers] {
    --code-number-size: calc(var(--space-internal-24) + var(--space-internal-6));
    --code-sign-size: calc(var(--space-internal-16) + var(--space-internal-6));
    --code-gutter: calc(var(--code-number-size) + var(--code-sign-size));
  }
  .card[data-diff]:not([data-line-numbers]) {
    --code-sign-size: calc(var(--space-internal-16) + var(--space-internal-6));
    --code-gutter: var(--code-sign-size);
  }
  .card[data-copyable]:not([data-header]) {
    --code-line-end: calc(var(--space-internal-32) + var(--space-internal-12));
  }
  .header {
    display: flex;
    padding-block: var(--space-internal-6);
    padding-inline: var(--space-internal-16) var(--space-internal-6);
    min-inline-size: 0;
    align-items: center;
    gap: var(--space-internal-8);
    border-block-end: 1px solid var(--color-border-light);
    background-color: var(--color-light-bg);
  }
  .fileIcon {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--color-muted);
  }
  .filename {
    min-inline-size: 0;
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--font-size-code-s);
    line-height: var(--line-height-code-m);
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text);
    overflow: hidden;
  }
  .language {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: var(--font-size-code-xs);
    line-height: var(--line-height-code-m);
    color: var(--color-muted);
  }
  .floatingCopy {
    position: absolute;
    z-index: 1;
    inset-block-start: calc(var(--space-internal-6) + 1px);
    inset-inline-end: calc(var(--space-internal-6) + 1px);
    border-radius: var(--radius-md);
    background-color: var(--main-body-background-color);
  }
  .body {
    padding-block: var(--space-internal-12);
    min-inline-size: 0;
    overflow: auto hidden;
  }
  .capped {
    max-block-size: var(--code-block-max-height);
    overflow: auto;
    overscroll-behavior: contain;
  }
  .body:focus-visible {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--color-primary));
    outline-offset: calc(-1 * var(--focus-ring-width, 2px));
  }
  .card[data-wrap] .body { overflow: hidden; }
  .card[data-wrap] .capped { overflow: hidden auto; }
  .pre {
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    white-space: pre;
    overflow: visible;
  }
  .code {
    display: grid;
    margin: 0;
    padding: 0;
    min-inline-size: 100%;
    inline-size: max-content;
    border: 0;
    background: none;
    font-family: var(--font-mono);
    font-size: var(--font-size-code-m);
    line-height: var(--line-height-code-row);
    white-space: pre;
    color: var(--code-shiki-text);
    counter-reset: line;
    tab-size: 2;
  }
  .card[data-wrap] .pre,
  .card[data-wrap] .code {
    inline-size: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .code [data-line] {
    display: block;
    position: relative;
    padding-inline: var(--code-gutter) var(--code-line-end);
    min-block-size: var(--line-height-code-row);
    border-inline-start: 2px solid transparent;
    counter-increment: line;
  }
  [data-line-numbers] .code [data-line]::before {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: var(--code-number-size);
    font-size: var(--font-size-code-s);
    line-height: var(--line-height-code-row);
    text-align: end;
    color: var(--code-line-number);
    content: counter(line) / "";
    font-variant-numeric: tabular-nums;
    user-select: none;
  }
  .code [data-line][data-highlighted-line] {
    border-inline-start-color: var(--color-text);
    background-color: var(--code-line-highlight-bg);
  }
  .code [data-line][data-highlighted-line-id="added"] {
    border-inline-start-color: var(--code-line-added-fg);
    background-color: var(--code-line-added-bg);
  }
  .code [data-line][data-highlighted-line-id="removed"] {
    border-inline-start-color: var(--code-line-removed-fg);
    background-color: var(--code-line-removed-bg);
  }
  .code [data-line][data-highlighted-line-id="added"]::after,
  .code [data-line][data-highlighted-line-id="removed"]::after {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: var(--code-number-size);
    inline-size: var(--code-sign-size);
    font-weight: 500;
    line-height: var(--line-height-code-row);
    text-align: center;
    user-select: none;
  }
  .code [data-line][data-highlighted-line-id="added"]::after {
    color: var(--code-line-added-fg);
    content: "+" / attr(data-sign-label);
  }
  .code [data-line][data-highlighted-line-id="removed"]::after {
    color: var(--code-line-removed-fg);
    content: "\\2212" / attr(data-sign-label);
  }
  .code span[style] { color: var(--shiki-light, inherit); }
  :host-context(.themeDark) .code span[style],
  .card[data-dark] .code span[style] { color: var(--shiki-dark, inherit); }
  :host-context(.themeHCB) .code span[style] { color: var(--shiki-hcb, inherit); }
  :host-context(.themeHCW) .code span[style] { color: var(--shiki-hcw, inherit); }
  .code [data-syntax="comment"] { color: var(--code-shiki-comment); }
  .code [data-syntax="keyword"] { color: var(--code-shiki-keyword); }
  .code [data-syntax="entity"] { color: var(--code-shiki-entity); }
  .code [data-syntax="variable"] { color: var(--code-shiki-variable); }
  .code [data-syntax="constant"] { color: var(--code-shiki-constant); }
  .code [data-syntax="function"] { color: var(--code-shiki-function); }
  .code [data-syntax="tag"] { color: var(--code-shiki-tag); }
  .code [data-syntax="attr"] { color: var(--code-shiki-attr); }
  .code [data-syntax="string"] { color: var(--code-shiki-string); }
  .code [data-syntax="jsx-brace"] { color: var(--code-shiki-jsx-brace); }
  .caption {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--font-size-text-xxs);
    line-height: var(--line-height-normal);
    color: var(--color-muted);
  }
  @media (forced-colors: active) {
    .card, .header { border-color: CanvasText; }
    .code span,
    .code [data-line]::before,
    .code [data-line]::after { color: CanvasText; }
    .code [data-line][data-highlighted-line] { border-inline-start-color: Highlight; }
    .body:focus-visible { outline: 3px solid Highlight; }
  }
`;

const SHELL_LANGUAGES = new Set(["bash", "sh", "shell", "zsh", "console", "powershell"]);

const FILE_GLYPHS: Record<string, NativeCodeGlyph> = {
  tsx: "FileTsx",
  ts: "FileTs",
  typescript: "FileTs",
  jsx: "FileJsx",
  js: "FileJs",
  javascript: "FileJs",
  mjs: "FileJs",
  cjs: "FileJs",
  css: "FileCss",
  scss: "FileCss",
  html: "FileHtml",
  xml: "FileHtml",
  markup: "FileHtml",
  py: "FilePy",
  python: "FilePy",
  sql: "FileSql",
  md: "FileMd",
  mdx: "FileMd",
  markdown: "FileMd",
  rs: "FileRs",
  rust: "FileRs",
  c: "FileC",
  cpp: "FileCpp",
  cs: "FileCSharp",
  csharp: "FileCSharp",
  ini: "FileIni",
  toml: "FileIni",
  vue: "FileVue",
  txt: "FileTxt",
  text: "FileTxt",
  plaintext: "FileTxt",
};

function headerGlyphFor(language: string, theme: DtCodeBlockTheme): NativeCodeGlyph {
  const key = language.toLowerCase();
  if (theme === "terminal" || SHELL_LANGUAGES.has(key)) return "TerminalWindow";
  if (!key) return "File";
  return FILE_GLYPHS[key] ?? "FileCode";
}

interface LineModel {
  text: string;
  state: CodeLineState;
}

/**
 * Multi-line source with optional filename header, line numbers, callout and
 * diff rows, copy and caption. Takes `code` (attribute or property) or a
 * host-highlighted Shiki <pre> as light-DOM content.
 */
export class DtCodeBlockElement extends DigitaltableteurElement {
  static observedAttributes = [
    "code",
    "language",
    "filename",
    "header",
    "line-numbers",
    "highlight-lines",
    "added-lines",
    "removed-lines",
    "caption",
    "theme",
    "wrap",
    "max-height",
    "copyable",
    "copy-label",
  ];

  private codeProperty: string | null = null;
  private stopThemeObserver: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  connectedCallback(): void {
    this.observeLightDom(() => this.render());
    this.stopThemeObserver = observeDocumentTheme(this.ownerDocument, () => {
      if (this.theme === "terminal") this.render();
    });
    this.render();
  }

  disconnectedCallback(): void {
    this.stopThemeObserver?.();
    this.stopThemeObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get code(): string {
    return this.codeProperty ?? stringAttribute(this, "code");
  }

  set code(value: string) {
    this.codeProperty = value;
    if (this.isConnected) this.render();
  }

  get language(): string {
    return stringAttribute(this, "language");
  }

  set language(value: string) {
    reflectAttribute(this, "language", value || null);
  }

  get filename(): string {
    return stringAttribute(this, "filename");
  }

  set filename(value: string) {
    reflectAttribute(this, "filename", value || null);
  }

  /** Header bar; defaults to on when a filename is set. */
  get header(): boolean {
    return optionalBoolean(this, "header") ?? Boolean(this.filename);
  }

  set header(value: boolean) {
    reflectAttribute(this, "header", value ? "true" : "false");
  }

  get lineNumbers(): boolean | null {
    return optionalBoolean(this, "line-numbers");
  }

  set lineNumbers(value: boolean | null) {
    reflectAttribute(this, "line-numbers", value === null ? null : String(value));
  }

  get highlightLines(): string {
    return stringAttribute(this, "highlight-lines");
  }

  set highlightLines(value: string) {
    reflectAttribute(this, "highlight-lines", value || null);
  }

  get addedLines(): string {
    return stringAttribute(this, "added-lines");
  }

  set addedLines(value: string) {
    reflectAttribute(this, "added-lines", value || null);
  }

  get removedLines(): string {
    return stringAttribute(this, "removed-lines");
  }

  set removedLines(value: string) {
    reflectAttribute(this, "removed-lines", value || null);
  }

  get caption(): string {
    return stringAttribute(this, "caption");
  }

  set caption(value: string) {
    reflectAttribute(this, "caption", value || null);
  }

  get theme(): DtCodeBlockTheme {
    return enumAttribute(this, "theme", THEMES, "light");
  }

  set theme(value: DtCodeBlockTheme) {
    reflectAttribute(this, "theme", value);
  }

  get wrap(): boolean {
    return this.hasAttribute("wrap");
  }

  set wrap(value: boolean) {
    reflectBooleanAttribute(this, "wrap", value);
  }

  get maxHeight(): string {
    return stringAttribute(this, "max-height");
  }

  set maxHeight(value: string) {
    reflectAttribute(this, "max-height", value || null);
  }

  get copyable(): boolean {
    return optionalBoolean(this, "copyable") ?? true;
  }

  set copyable(value: boolean) {
    reflectAttribute(this, "copyable", value ? null : "false");
  }

  get copyLabel(): string {
    return stringAttribute(this, "copy-label");
  }

  set copyLabel(value: string) {
    reflectAttribute(this, "copy-label", value || null);
  }

  private signLabel(state: "added" | "removed"): string {
    return state === "added"
      ? localizedText(this, { en: "Added line", fi: "Lisätty rivi", sv: "Tillagd rad" })
      : localizedText(this, {
          en: "Removed line",
          fi: "Poistettu rivi",
          sv: "Borttagen rad",
        });
  }

  private markLine(line: HTMLElement, state: CodeLineState): void {
    if (state === "default") return;
    line.setAttribute("data-highlighted-line", "");
    if (state === "added" || state === "removed") {
      line.setAttribute("data-highlighted-line-id", state);
      line.setAttribute("data-sign-label", this.signLabel(state));
    }
  }

  /** Clones a light-DOM Shiki <pre> and applies the block's line states. */
  private fromShikiTree(source: HTMLPreElement) {
    const pre = source.cloneNode(true) as HTMLPreElement;
    pre.removeAttribute("tabindex");
    pre.classList.add("pre");
    const code = pre.querySelector("code");
    code?.classList.add("code");
    const language = pre.getAttribute("data-language") ?? "";
    const isDiff = language === "diff";
    const texts: string[] = [];
    let hasDiff = false;

    pre.querySelectorAll<HTMLElement>("[data-line]").forEach((line) => {
      let text = line.textContent ?? "";
      if (text === " ") text = "";
      let state: CodeLineState = "default";
      if (line.hasAttribute("data-highlighted-line")) {
        const id = line.getAttribute("data-highlighted-line-id");
        state = id === "added" || id === "removed" ? id : "highlighted";
      } else if (isDiff) {
        state = diffState(text);
        if (hasDiffMarker(text)) {
          text = text.slice(1);
          const walker = this.ownerDocument.createTreeWalker(line, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node.textContent) {
              node.textContent = node.textContent.slice(1);
              break;
            }
          }
        }
      }
      this.markLine(line, state);
      if (state === "added" || state === "removed") hasDiff = true;
      if (state !== "removed") texts.push(text);
    });

    return {
      body: pre,
      language,
      text: texts.join("\n").trimEnd(),
      lineNumbers: Boolean(code?.hasAttribute("data-line-numbers")),
      hasDiff,
    };
  }

  /** Builds rows from the `code` string, highlighted with the shared roles. */
  private fromString(source: string) {
    const document = this.ownerDocument;
    const raw = source.replace(/\n$/, "");
    const language = this.language;
    const base: LineModel[] =
      language === "diff"
        ? raw.split("\n").map((line) => {
            const state = diffState(line);
            return { text: hasDiffMarker(line) ? line.slice(1) : line, state };
          })
        : raw.split("\n").map((text) => ({ text, state: "default" as CodeLineState }));
    const highlighted = parseLineSpec(this.highlightLines);
    const added = parseLineSpec(this.addedLines);
    const removed = parseLineSpec(this.removedLines);
    const lines = base.map((line, index) => {
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
    const segments = highlightLines(
      lines.map((line) => line.text).join("\n"),
      language === "diff" ? undefined : language,
    );

    const pre = document.createElement("pre");
    pre.className = "pre";
    if (language) pre.dataset.language = language;
    const code = document.createElement("code");
    code.className = "code";
    if (language) code.dataset.language = language;
    lines.forEach((line, index) => {
      const row = document.createElement("span");
      row.setAttribute("data-line", "");
      this.markLine(row, line.state);
      for (const segment of segments[index] ?? []) {
        if (segment.role) {
          const span = document.createElement("span");
          span.dataset.syntax = segment.role;
          span.textContent = segment.text;
          row.append(span);
        } else {
          row.append(document.createTextNode(segment.text));
        }
      }
      code.append(row);
    });
    pre.append(code);

    return {
      body: pre,
      language,
      text: lines
        .filter((line) => line.state !== "removed")
        .map((line) => line.text)
        .join("\n")
        .trimEnd(),
      lineNumbers: false,
      hasDiff: lines.some((line) => line.state === "added" || line.state === "removed"),
    };
  }

  private render(): void {
    const document = this.ownerDocument;
    const shikiSource = Array.from(this.children).find(
      (child): child is HTMLPreElement => child.tagName === "PRE",
    );
    const source =
      this.code || shikiSource ? null : (this.textContent ?? "").trim() || null;
    const model = shikiSource && !this.code
      ? this.fromShikiTree(shikiSource)
      : this.fromString(this.code || source || "");

    const language = this.language || model.language;
    const lineNumbers = this.lineNumbers ?? model.lineNumbers;
    const theme = this.theme;
    const showHeader = this.header;
    const copyable = this.copyable;

    const root = document.createElement(this.caption ? "figure" : "div");
    root.className = "root";
    root.setAttribute("part", "root");

    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("part", "card");
    if (showHeader) card.setAttribute("data-header", "");
    if (lineNumbers) card.setAttribute("data-line-numbers", "");
    if (model.hasDiff) card.setAttribute("data-diff", "");
    if (this.wrap) card.setAttribute("data-wrap", "");
    if (copyable) card.setAttribute("data-copyable", "");
    if (theme === "terminal") {
      const tokens = darkSurfaceTokens(document);
      if (tokens) {
        card.setAttribute("data-dark", "");
        for (const [name, value] of Object.entries(tokens)) {
          card.style.setProperty(name, value);
        }
      }
    }

    const copy = copyable
      ? createCodeCopyControl(this, {
          value: model.text,
          label: this.copyLabel,
          onCopied: (text) =>
            this.dispatchEvent(
              new CustomEvent("copy", {
                detail: { text },
                bubbles: true,
                composed: true,
              }),
            ),
        })
      : null;

    if (showHeader) {
      const header = document.createElement("div");
      header.className = "header";
      const icon = document.createElement("span");
      icon.className = "fileIcon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = nativeCodeGlyphs[headerGlyphFor(language, theme)];
      const filename = document.createElement("span");
      filename.className = "filename";
      filename.textContent = this.filename;
      if (this.filename) filename.title = this.filename;
      header.append(icon, filename);
      if (language) {
        const label = document.createElement("span");
        label.className = "language";
        label.textContent = language;
        header.append(label);
      }
      if (copy) header.append(copy.root);
      card.append(header);
    } else if (copy) {
      const floating = document.createElement("div");
      floating.className = "floatingCopy";
      floating.append(copy.root);
      card.append(floating);
    }

    const body = document.createElement("div");
    body.className = "body";
    body.setAttribute("part", "body");
    const maxHeight = this.maxHeight;
    if (maxHeight) {
      body.classList.add("capped");
      body.style.setProperty(
        "--code-block-max-height",
        /^\d+(\.\d+)?$/.test(maxHeight) ? `${maxHeight}px` : maxHeight,
      );
      body.setAttribute("data-lenis-prevent-wheel", "");
    }
    body.append(model.body);
    card.append(body);
    root.append(card);

    if (this.caption) {
      const caption = document.createElement("figcaption");
      caption.className = "caption";
      caption.textContent = this.caption;
      root.append(caption);
    }

    this.replaceShadow(styles + codeCopyButtonStyles, root);
    this.watchOverflow(body, language);
  }

  /** The body becomes a named, focusable region only while it scrolls. */
  private watchOverflow(body: HTMLElement, language: string): void {
    this.resizeObserver?.disconnect();
    const label =
      this.filename ||
      localizedText(this, {
        en: `Code, ${language || "plain text"}`,
        fi: `Koodi, ${language || "pelkkä teksti"}`,
        sv: `Kod, ${language || "oformaterad text"}`,
      });
    const update = () => {
      const scrolls =
        body.scrollWidth > body.clientWidth + 1 ||
        body.scrollHeight > body.clientHeight + 1;
      if (scrolls) {
        body.tabIndex = 0;
        body.setAttribute("role", "region");
        body.setAttribute("aria-label", label);
      } else {
        body.removeAttribute("tabindex");
        body.removeAttribute("role");
        body.removeAttribute("aria-label");
      }
    };
    update();
    const Observer = this.ownerDocument.defaultView?.ResizeObserver;
    if (!Observer) return;
    this.resizeObserver = new Observer(update);
    this.resizeObserver.observe(body);
    if (body.firstElementChild) this.resizeObserver.observe(body.firstElementChild);
  }
}
