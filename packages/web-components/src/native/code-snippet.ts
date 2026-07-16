import Prism from "../../../../nextjs-app/shared/components/CodeSnippet/prismSetup";
import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const LANGUAGES = [
  "javascript",
  "typescript",
  "html",
  "xml",
  "python",
  "go",
  "rust",
  "json",
  "bash",
  "markdown",
] as const;
const VARIANTS = ["inline", "single", "multi"] as const;

export type DtCodeSnippetLanguage = (typeof LANGUAGES)[number];
export type DtCodeSnippetVariant = (typeof VARIANTS)[number];
export type DtCodeSnippetCopyVariant = "raw" | "no-comments";

type CopyState = "idle" | "copied" | "copied-no-comments" | "error";

const prismLanguageMap: Record<DtCodeSnippetLanguage, string> = {
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

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  :host([variant="inline"]) { display: inline; }
  .inline {
    position: relative;
    display: inline-block;
    padding: 0.125rem 0.375rem;
    border-radius: var(--radius-md);
    background: var(--color-neutral-bg);
    font-family: var(--font-mono);
    font-size: 0.9em;
    color: var(--code-text);
    transition: background var(--duration-fast, 0.15s) var(--ease-out-cubic, ease);
  }
  .inline.copyable { cursor: pointer; }
  .inline.copyable:hover {
    background: var(--color-neutral-bg-hover, rgb(0 0 0 / 15%));
  }
  .inline.copyable:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: 2px;
  }
  .wrapper {
    position: relative;
    margin: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background-color: var(--main-body-background-color);
    overflow: hidden;
  }
  .single .pre {
    white-space: nowrap;
    overflow-x: auto;
  }
  .multi .pre {
    white-space: pre;
    overflow: auto;
  }
  .toolbar {
    display: flex;
    min-block-size: 44px;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-internal-12);
    padding-block: var(--space-layout-8);
    padding-inline: var(--space-layout-16);
    border-block-end: 1px solid var(--color-border);
    background-color: var(--color-light-bg);
    color: var(--color-text);
  }
  .language {
    margin: 0;
    font-family: var(--font-text);
    font-size: var(--font-size-text-xxs, 0.75rem);
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--code-toolbar-text, #2b3a45);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-layout-8, 0.5rem);
  }
  .buttonCluster {
    position: relative;
    display: inline-flex;
    align-items: stretch;
  }
  .button,
  .menuButton,
  .expandButton,
  .menuItem {
    border: 0;
    background: transparent;
    color: var(--color-primary);
    font: inherit;
    font-family: var(--primary-body-font);
    cursor: pointer;
  }
  .button,
  .menuButton,
  .expandButton {
    min-block-size: 2rem;
    padding: var(--space-internal-6, 0.375rem) var(--space-internal-12, 0.75rem);
    border-radius: var(--radius-md);
    transition: background-color var(--duration-fast, 0.15s) var(--ease-out-cubic, ease);
  }
  .button,
  .menuButton {
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }
  .buttonCluster .button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  .buttonCluster .menuButton {
    min-inline-size: 2.25rem;
    padding-inline: var(--space-internal-8, 0.5rem);
    border-inline-start: 1px solid color-mix(in srgb, var(--color-primary) 24%, transparent);
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  .menu {
    position: absolute;
    inset-block-start: calc(100% + var(--space-internal-6, 0.375rem));
    inset-inline-end: 0;
    z-index: 2;
    min-inline-size: 12rem;
    padding: var(--space-internal-4, 0.25rem);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--main-body-background-color);
    box-shadow: 0 12px 24px rgb(0 0 0 / 16%);
  }
  .menu[hidden] { display: none; }
  .menuItem {
    display: flex;
    inline-size: 100%;
    padding: var(--space-internal-8, 0.5rem) var(--space-internal-10, 0.625rem);
    border-radius: calc(var(--radius-md) - 2px);
    text-align: start;
  }
  .status {
    min-inline-size: 11ch;
    color: var(--code-toolbar-text, #2b3a45);
    font-family: var(--font-text);
    font-size: var(--font-size-text-xxs, 0.75rem);
  }
  .status:empty {
    min-inline-size: 0;
    inline-size: 0;
    overflow: hidden;
  }
  .pre {
    --code-bg: #fff;
    --code-text: #1f2937;
    --code-line-number: #4b5563;
    --code-token-comment: #006400;
    --code-token-string: #a31515;
    --code-token-number: #0b6b66;
    --code-token-keyword: #0033b3;
    --code-token-function: var(--code-text);
    --code-token-class-name: #1d6b87;
    --code-token-tag: #800000;
    --code-token-attr-name: #b30000;
    --code-token-attr-value: var(--code-token-keyword);
    --code-token-operator: var(--code-text);
    --code-token-deleted: #9a050f;
    --code-token-important: #8a4c00;
    margin: 0;
    padding: var(--space-layout-16);
    border: none;
    border-radius: 0;
    background: var(--code-bg);
    font-family: var(--font-mono);
    font-size: var(--font-size-text-s, 0.9375rem);
    line-height: 1.6;
    color: var(--code-text);
    overflow: auto;
  }
  .preWithExpand { border-radius: 0; }
  .code {
    display: block;
    min-inline-size: 100%;
  }
  .line {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: start;
    gap: var(--space-internal-12);
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
  .lineNumber {
    min-inline-size: 2ch;
    text-align: right;
    color: var(--code-line-number);
    font-variant-numeric: tabular-nums;
    user-select: none;
  }
  .codeText {
    color: var(--code-text);
  }
  .expandControl {
    padding: var(--space-internal-12);
    border-block-start: 1px solid var(--color-border);
    background-color: var(--color-light-bg);
    text-align: center;
  }
  .expandButton { inline-size: 100%; }
  .inlineStatus {
    position: absolute;
    inset-block-start: calc(100% + var(--space-internal-6, 0.375rem));
    inset-inline-start: 0;
    z-index: 2;
    padding: var(--space-internal-4, 0.25rem) var(--space-internal-8, 0.5rem);
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: var(--color-white);
    font-family: var(--font-text);
    font-size: var(--font-size-text-xxs, 0.75rem);
    white-space: nowrap;
    box-shadow: 0 8px 18px rgb(0 0 0 / 18%);
  }
  .inlineStatus[hidden] { display: none; }
  .visuallyHidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .code .token.keyword,
  .code .token.atrule,
  .code [data-token="keyword"] {
    color: var(--code-token-keyword);
  }
  .code .token.attr-value { color: var(--code-token-attr-value); }
  .code .token.string,
  .code [data-token="string"] {
    color: var(--code-token-string);
  }
  .code .token.number,
  .code .token.boolean,
  .code .token.constant,
  .code .token.symbol,
  .code .token.variable,
  .code .token.inserted,
  .code [data-token="number"] {
    color: var(--code-token-number);
  }
  .code .token.comment,
  .code .token.prolog,
  .code .token.doctype,
  .code .token.cdata,
  .code [data-token="comment"] {
    color: var(--code-token-comment);
    font-style: italic;
  }
  .code .token.punctuation,
  .code .token.operator {
    color: var(--code-token-operator);
  }
  .code .token.function { color: var(--code-token-function); }
  .code .token.class-name { color: var(--code-token-class-name); }
  .code .token.tag,
  .code .token.selector { color: var(--code-token-tag); }
  .code .token.attr-name,
  .code .token.property,
  .code .token.regex,
  .code .token.entity {
    color: var(--code-token-attr-name);
  }
  .code .token.deleted { color: var(--code-token-deleted); }
  .code .token.important {
    font-weight: bold;
    color: var(--code-token-important);
  }
  .code .token.bold { font-weight: bold; }
  .code .token.italic { font-style: italic; }
  .code .token.namespace { opacity: 0.7; }
  @media (hover: hover) and (pointer: fine) {
    .button:hover,
    .menuButton:hover,
    .expandButton:hover,
    .menuItem:hover {
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }
  }
  @media (width >= 768px) {
    .toolbar { padding-inline: var(--space-layout-24); }
    .pre { padding: var(--space-layout-24); }
  }
  @supports (color: color-mix(in srgb, black, white)) {
    .wrapper {
      box-shadow: 0 16px 40px color-mix(in srgb, var(--color-border) 60%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .inline,
    .button,
    .menuButton,
    .expandButton,
    .menuItem {
      transition: none;
    }
    .wrapper { box-shadow: none; }
  }
  @media (forced-colors: active) {
    .inline,
    .wrapper,
    .menu {
      border: 1px solid CanvasText;
      forced-color-adjust: none;
    }
    .inline {
      background: Canvas;
      color: CanvasText;
    }
    .button,
    .menuButton,
    .expandButton,
    .menuItem {
      background: ButtonFace;
      color: ButtonText;
      border: 1px solid ButtonText;
    }
    .menuButton {
      border-inline-start-width: 1px;
    }
    .status,
    .language,
    .lineNumber { color: CanvasText; }
    .pre {
      background: Canvas;
      color: CanvasText;
    }
    .code .token,
    .codeText { color: CanvasText !important; }
    .inlineStatus {
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }
  }
`;

function optionalBooleanAttribute(
  element: Element,
  name: string,
): boolean | null {
  const value = element.getAttribute(name);
  if (value === null) return null;
  return !/^(false|0|no)$/i.test(value.trim());
}

function booleanAttribute(
  element: Element,
  name: string,
  fallback: boolean,
): boolean {
  return optionalBooleanAttribute(element, name) ?? fallback;
}

export function normalizeCodeSnippetLanguage(
  value: string | null | undefined,
): DtCodeSnippetLanguage {
  return LANGUAGES.includes(value as DtCodeSnippetLanguage)
    ? (value as DtCodeSnippetLanguage)
    : "typescript";
}

function highlightCode(
  code: string,
  language: DtCodeSnippetLanguage,
): string {
  const prismLanguage = prismLanguageMap[language] ?? "markup";
  const grammar = Prism.languages[prismLanguage] ?? Prism.languages.markup;
  return Prism.highlight(code, grammar, prismLanguage);
}

export function stripCodeComments(value: string): string {
  return value
    .replace(/(^|\s)\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//gm, "")
    .trimEnd();
}

export async function copyTextToClipboard(
  document: Document,
  text: string,
): Promise<void> {
  const view = document.defaultView ?? globalThis.window;
  const clipboard = view?.navigator?.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  textarea.remove();
  if (!success) throw new Error("Copy failed");
}

export function buildHighlightedCodeBlock(options: {
  document: Document;
  code: string;
  language: DtCodeSnippetLanguage;
  showLineNumbers: boolean;
  codeId?: string;
  preClassName?: string;
  codeClassName?: string;
  lineClassName?: string;
  lineNumberClassName?: string;
  lineTextClassName?: string;
  regionLabel?: string;
}): { pre: HTMLPreElement; codeElement: HTMLElement; lineCount: number } {
  const {
    document,
    code,
    language,
    showLineNumbers,
    codeId,
    preClassName = "pre",
    codeClassName = "code",
    lineClassName = "line",
    lineNumberClassName = "lineNumber",
    lineTextClassName = "codeText",
    regionLabel,
  } = options;

  const pre = document.createElement("pre");
  pre.className = preClassName;
  pre.setAttribute("role", "region");
  if (regionLabel) pre.setAttribute("aria-label", regionLabel);

  const codeElement = document.createElement("code");
  codeElement.className = `${codeClassName} language-${language}`;
  if (codeId) codeElement.id = codeId;

  const renderedLines = highlightCode(code.trimEnd(), language).split("\n");
  if (renderedLines.length === 1 && renderedLines[0] === "") {
    renderedLines[0] = "&nbsp;";
  }

  renderedLines.forEach((lineHtml, index) => {
    const line = document.createElement("span");
    line.className = lineClassName;
    line.setAttribute("data-line", "");

    if (showLineNumbers) {
      const lineNumber = document.createElement("span");
      lineNumber.className = lineNumberClassName;
      lineNumber.setAttribute("aria-hidden", "true");
      lineNumber.textContent = String(index + 1);
      line.append(lineNumber);
    }

    const lineText = document.createElement("span");
    lineText.className = lineTextClassName;
    lineText.innerHTML = lineHtml.length > 0 ? lineHtml : "&nbsp;";
    line.append(lineText);
    codeElement.append(line);

    if (index < renderedLines.length - 1) {
      codeElement.append(document.createTextNode("\n"));
    }
  });

  pre.append(codeElement);
  return { pre, codeElement, lineCount: renderedLines.length };
}

export class DtCodeSnippetElement extends DigitaltableteurElement {
  static observedAttributes = [
    "code",
    "language",
    "show-line-numbers",
    "aria-label",
    "allow-copy",
    "variant",
    "max-lines",
  ];

  private copyState: CopyState = "idle";
  private expanded = false;
  private menuOpen = false;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private removeMenuListeners: (() => void) | null = null;
  private readonly instanceId = `dt-code-snippet-${++DtCodeSnippetElement.sequence}`;

  private static sequence = 0;

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this.clearResetTimer();
    this.teardownMenuDismiss();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "code" || name === "variant" || name === "max-lines") {
      this.expanded = false;
    }
    if ((name === "variant" || name === "allow-copy") && this.menuOpen) {
      this.menuOpen = false;
      this.teardownMenuDismiss();
    }
    if (this.isConnected) this.render();
  }

  get code(): string {
    return stringAttribute(this, "code");
  }

  set code(value: string) {
    reflectAttribute(this, "code", value);
  }

  get language(): DtCodeSnippetLanguage {
    return normalizeCodeSnippetLanguage(stringAttribute(this, "language"));
  }

  set language(value: DtCodeSnippetLanguage) {
    reflectAttribute(this, "language", value);
  }

  get showLineNumbers(): boolean {
    return booleanAttribute(this, "show-line-numbers", true);
  }

  set showLineNumbers(value: boolean) {
    reflectAttribute(this, "show-line-numbers", value ? "true" : "false");
  }

  get ariaLabel(): string {
    return stringAttribute(this, "aria-label");
  }

  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }

  get allowCopy(): boolean {
    return booleanAttribute(this, "allow-copy", true);
  }

  set allowCopy(value: boolean) {
    reflectAttribute(this, "allow-copy", value ? "true" : "false");
  }

  get variant(): DtCodeSnippetVariant {
    return enumAttribute(this, "variant", VARIANTS, "multi");
  }

  set variant(value: DtCodeSnippetVariant) {
    reflectAttribute(this, "variant", value);
  }

  get maxLines(): number {
    const value = Number(this.getAttribute("max-lines"));
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  set maxLines(value: number) {
    reflectAttribute(
      this,
      "max-lines",
      Number.isFinite(value) ? Math.max(0, value) : 0,
    );
  }

  private clearResetTimer(): void {
    if (this.resetTimer !== null) clearTimeout(this.resetTimer);
    this.resetTimer = null;
  }

  private setCopyState(state: CopyState): void {
    this.copyState = state;
    this.clearResetTimer();
    if (state !== "idle") {
      const duration = state === "error" ? 2200 : 1600;
      this.resetTimer = setTimeout(() => {
        this.copyState = "idle";
        this.render();
      }, duration);
    }
    this.render();
  }

  private copyMessage(): string {
    switch (this.copyState) {
      case "copied":
        return localizedText(this, {
          en: "Copied to clipboard",
          fi: "Kopioitu leikepoydalle",
          sv: "Kopierat till urklipp",
        });
      case "copied-no-comments":
        return localizedText(this, {
          en: "Copied without comments",
          fi: "Kopioitu ilman kommentteja",
          sv: "Kopierat utan kommentarer",
        });
      case "error":
        return localizedText(this, {
          en: "Failed to copy",
          fi: "Kopiointi epaonnistui",
          sv: "Kopieringen misslyckades",
        });
      default:
        return "";
    }
  }

  private async handleCopy(copyVariant: DtCodeSnippetCopyVariant): Promise<void> {
    if (!this.allowCopy) return;
    const textToCopy =
      copyVariant === "no-comments" ? stripCodeComments(this.code) : this.code;

    try {
      await copyTextToClipboard(this.ownerDocument, textToCopy);
      this.dispatchEvent(
        new CustomEvent("copy", {
          detail: { code: textToCopy, copyVariant, originalCode: this.code },
          bubbles: true,
          composed: true,
        }),
      );
      this.menuOpen = false;
      this.teardownMenuDismiss();
      this.setCopyState(
        copyVariant === "no-comments" ? "copied-no-comments" : "copied",
      );
    } catch {
      this.menuOpen = false;
      this.teardownMenuDismiss();
      this.setCopyState("error");
    }
  }

  private teardownMenuDismiss(): void {
    this.removeMenuListeners?.();
    this.removeMenuListeners = null;
  }

  private setupMenuDismiss(): void {
    this.teardownMenuDismiss();
    const onPointerDown = (event: Event) => {
      if (!this.contains(event.target as Node)) {
        this.menuOpen = false;
        this.teardownMenuDismiss();
        this.render();
      }
    };
    const onKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Escape") {
        this.menuOpen = false;
        this.teardownMenuDismiss();
        this.render();
      }
    };
    this.ownerDocument.addEventListener("pointerdown", onPointerDown);
    this.ownerDocument.addEventListener("keydown", onKeyDown);
    this.removeMenuListeners = () => {
      this.ownerDocument.removeEventListener("pointerdown", onPointerDown);
      this.ownerDocument.removeEventListener("keydown", onKeyDown);
    };
  }

  private toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) this.setupMenuDismiss();
    else this.teardownMenuDismiss();
    this.render();
  }

  private renderInline(message: string): HTMLElement {
    const root = this.ownerDocument.createElement("span");
    root.style.position = "relative";

    const code = this.ownerDocument.createElement("code");
    code.className = `inline language-${this.language}`;
    if (this.allowCopy) {
      code.classList.add("copyable");
      code.setAttribute("role", "button");
      code.tabIndex = 0;
      code.setAttribute(
        "aria-label",
        this.ariaLabel ||
          `${localizedText(this, {
            en: "Copy code",
            fi: "Kopioi koodi",
            sv: "Kopiera kod",
          })}: ${this.code}`,
      );
      code.addEventListener("click", () => {
        void this.handleCopy("raw");
      });
      code.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void this.handleCopy("raw");
        }
      });
    } else if (this.ariaLabel) {
      code.setAttribute("aria-label", this.ariaLabel);
    }
    code.innerHTML = highlightCode(this.code, this.language);

    const status = this.ownerDocument.createElement("span");
    status.className = "inlineStatus";
    status.textContent = message;
    status.hidden = !message;

    const live = this.ownerDocument.createElement("span");
    live.className = "visuallyHidden";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.textContent = message;

    root.append(code, status, live);
    return root;
  }

  private renderBlock(message: string): HTMLElement {
    const lines = this.code.trimEnd().split("\n");
    const hasOverflow =
      this.variant === "multi" &&
      this.maxLines > 0 &&
      lines.length > this.maxLines;
    const displayedCode =
      hasOverflow && !this.expanded
        ? lines.slice(0, this.maxLines).join("\n")
        : this.code;

    const figure = this.ownerDocument.createElement("figure");
    figure.className = `wrapper ${this.variant}`;
    figure.setAttribute("part", "root wrapper");
    figure.dataset.variant = this.variant;

    const toolbar = this.ownerDocument.createElement("div");
    toolbar.className = "toolbar";

    const language = this.ownerDocument.createElement("span");
    language.className = "language";
    language.textContent = this.language;

    const actions = this.ownerDocument.createElement("div");
    actions.className = "actions";

    if (this.allowCopy) {
      if (this.variant === "single") {
        const copyButton = this.ownerDocument.createElement("button");
        copyButton.type = "button";
        copyButton.className = "button";
        copyButton.textContent = localizedText(this, {
          en: "Copy",
          fi: "Kopioi",
          sv: "Kopiera",
        });
        copyButton.setAttribute(
          "aria-label",
          localizedText(this, {
            en: "Copy code to clipboard",
            fi: "Kopioi koodi leikepoydalle",
            sv: "Kopiera kod till urklipp",
          }),
        );
        copyButton.addEventListener("click", () => {
          void this.handleCopy("raw");
        });
        actions.append(copyButton);
      } else {
        const cluster = this.ownerDocument.createElement("div");
        cluster.className = "buttonCluster";

        const copyButton = this.ownerDocument.createElement("button");
        copyButton.type = "button";
        copyButton.className = "button";
        copyButton.textContent = localizedText(this, {
          en: "Copy",
          fi: "Kopioi",
          sv: "Kopiera",
        });
        copyButton.setAttribute(
          "aria-label",
          localizedText(this, {
            en: "Copy code to clipboard",
            fi: "Kopioi koodi leikepoydalle",
            sv: "Kopiera kod till urklipp",
          }),
        );
        copyButton.addEventListener("click", () => {
          void this.handleCopy("raw");
        });

        const menuButton = this.ownerDocument.createElement("button");
        menuButton.type = "button";
        menuButton.className = "menuButton";
        menuButton.textContent = "▾";
        menuButton.setAttribute(
          "aria-label",
          localizedText(this, {
            en: "More copy options",
            fi: "Lisaa kopiointivaihtoehtoja",
            sv: "Fler kopieringsalternativ",
          }),
        );
        menuButton.setAttribute("aria-expanded", String(this.menuOpen));
        menuButton.setAttribute("aria-haspopup", "menu");
        menuButton.addEventListener("click", () => this.toggleMenu());

        const menu = this.ownerDocument.createElement("div");
        menu.className = "menu";
        menu.setAttribute("role", "menu");
        menu.hidden = !this.menuOpen;

        const menuItem = this.ownerDocument.createElement("button");
        menuItem.type = "button";
        menuItem.className = "menuItem";
        menuItem.setAttribute("role", "menuitem");
        menuItem.textContent = localizedText(this, {
          en: "Copy w/o comments",
          fi: "Kopioi ilman kommentteja",
          sv: "Kopiera utan kommentarer",
        });
        menuItem.addEventListener("click", () => {
          void this.handleCopy("no-comments");
        });
        menu.append(menuItem);

        cluster.append(copyButton, menuButton, menu);
        actions.append(cluster);
      }
    }

    const status = this.ownerDocument.createElement("span");
    status.className = "status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.textContent = message;
    actions.append(status);

    toolbar.append(language, actions);
    figure.append(toolbar);

    const codeId = `${this.instanceId}-code`;
    const { pre } = buildHighlightedCodeBlock({
      document: this.ownerDocument,
      code: displayedCode,
      language: this.language,
      showLineNumbers: this.showLineNumbers && this.variant !== "inline",
      codeId,
      regionLabel:
        this.ariaLabel ||
        `${localizedText(this, {
          en: "Code snippet in",
          fi: "Koodiesimerkki kielella",
          sv: "Kodavsnitt pa",
        })} ${this.language}`,
    });
    if (hasOverflow) pre.classList.add("preWithExpand");
    figure.append(pre);

    if (hasOverflow) {
      const expandControl = this.ownerDocument.createElement("div");
      expandControl.className = "expandControl";
      const expandButton = this.ownerDocument.createElement("button");
      expandButton.type = "button";
      expandButton.className = "expandButton";
      expandButton.setAttribute("aria-controls", codeId);
      expandButton.setAttribute("aria-expanded", String(this.expanded));
      expandButton.textContent = localizedText(this, {
        en: this.expanded ? "Show less" : "Show more",
        fi: this.expanded ? "Nayta vahemman" : "Nayta lisaa",
        sv: this.expanded ? "Visa mindre" : "Visa mer",
      });
      expandButton.addEventListener("click", () => {
        this.expanded = !this.expanded;
        this.render();
      });
      expandControl.append(expandButton);
      figure.append(expandControl);
    }

    return figure;
  }

  private render(): void {
    const message = this.copyMessage();
    const content =
      this.variant === "inline"
        ? this.renderInline(message)
        : this.renderBlock(message);
    this.replaceShadow(styles, content);
  }
}
