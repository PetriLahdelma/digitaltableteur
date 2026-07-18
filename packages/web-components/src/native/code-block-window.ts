import {
  buildHighlightedCodeBlock,
  copyTextToClipboard,
  normalizeCodeSnippetLanguage,
} from "./code-snippet";
import { DigitaltableteurElement, reflectAttribute, stringAttribute } from "./base";
import { localizedText, resolveElementLocale } from "./localization";

type CopyState = "idle" | "copied" | "error";
type DtCodeBlockWindowContext = "default" | "article";

type SnippetSourceElement = HTMLElement & {
  code?: string;
  language?: string;
  showLineNumbers?: boolean;
  ariaLabel?: string;
};

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .container {
    margin-block: var(--space-layout-24);
    margin-inline: 0;
    inline-size: 100%;
    min-inline-size: 0;
    max-inline-size: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background-color: var(--main-body-background-color);
    overflow: hidden;
  }
  .containerArticle {
    margin-block: var(--space-layout-48);
    margin-inline: auto;
    max-inline-size: 80%;
  }
  .bodyArticle {
    max-block-size: 35vb;
    overflow: hidden auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    overscroll-behavior-block: contain;
    touch-action: pan-y;
  }
  .bodyArticle:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: -2px;
  }
  .header {
    display: grid;
    min-block-size: 44px;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-layout-16);
    padding-block: var(--space-layout-8);
    padding-inline: var(--space-layout-16);
    border-block-end: 1px solid var(--color-border);
    background-color: var(--color-light-bg);
  }
  .controls {
    display: inline-flex;
    align-items: center;
    gap: var(--space-layout-8);
  }
  .dot {
    inline-size: 12px;
    block-size: 12px;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px var(--color-border);
  }
  .close { background-color: var(--color-error); }
  .minimize { background-color: var(--color-warning); }
  .maximize { background-color: var(--color-success); }
  .language {
    margin: 0;
    font-family: var(--font-text);
    font-size: var(--font-size-text-xxs, 0.75rem);
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--code-toolbar-text, #2b3a45);
  }
  .headerInfo {
    display: flex;
    min-inline-size: 0;
    justify-content: center;
    align-items: center;
  }
  .title {
    margin: 0;
    overflow: hidden;
    color: var(--color-text);
    font-family: var(--font-text);
    font-size: var(--font-size-text-xs, 0.8125rem);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .actions {
    display: inline-flex;
    align-items: center;
    gap: var(--space-layout-8);
  }
  .copyButton {
    min-block-size: 2rem;
    padding: var(--space-internal-6, 0.375rem) var(--space-internal-12, 0.75rem);
    border: 0;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    color: var(--color-primary);
    font: inherit;
    font-family: var(--primary-body-font);
    cursor: pointer;
    white-space: nowrap;
  }
  .copyButton:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .status {
    min-inline-size: 9ch;
    color: var(--code-toolbar-text, #2b3a45);
    font-family: var(--font-text);
    font-size: var(--font-size-text-xs, 0.8125rem);
  }
  .status:empty {
    min-inline-size: 0;
    inline-size: 0;
    overflow: hidden;
  }
  .body {
    padding: var(--space-layout-16);
    min-inline-size: 0;
    max-inline-size: 100%;
    background-color: var(--main-body-background-color);
    overflow-x: hidden;
    overflow-inline: hidden;
  }
  .body pre {
    margin: 0;
    padding: var(--space-layout-16);
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
    max-inline-size: 100%;
    border: none;
    border-radius: 0;
    background-color: transparent;
    white-space: pre-wrap;
    overflow: hidden visible;
    overflow-wrap: anywhere;
  }
  .body code {
    display: grid;
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
    max-inline-size: 100%;
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: var(--font-size-text-s);
    line-height: var(--line-height-relaxed);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .body [data-line] {
    display: block;
    padding-block: var(--space-layout-4);
    padding-inline: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .body span {
    white-space: inherit;
    color: var(--shiki-light, inherit);
  }
  :host-context(.themeDark) .body span {
    color: var(--shiki-dark, inherit) !important;
  }
  :host-context(.themeHCB) .body span {
    color: var(--shiki-hcb, inherit) !important;
  }
  :host-context(.themeHCW) .body span {
    color: var(--shiki-hcw, inherit) !important;
  }
  .container[data-line-numbers="true"] .body code {
    counter-reset: line;
  }
  .container[data-line-numbers="true"] .body [data-line] {
    padding-inline-start: calc(3ch + var(--space-layout-8));
  }
  .container[data-line-numbers="true"] .body [data-line]::before {
    display: inline-block;
    margin-inline: calc(-3ch - var(--space-layout-8)) var(--space-layout-8);
    inline-size: 3ch;
    text-align: end;
    color: var(--code-toolbar-text, #2b3a45);
    content: counter(line);
    counter-increment: line;
    font-variant-numeric: tabular-nums;
    user-select: none;
  }
  .container[data-line-numbers="true"] .body .lineNumber {
    display: none;
  }
  .body [data-highlighted-line] {
    background-color: transparent;
  }
  .caption {
    padding-block: var(--space-layout-8) var(--space-layout-16);
    padding-inline: var(--space-layout-16);
    color: var(--code-toolbar-text, #2b3a45);
    font-family: var(--font-text);
    font-size: var(--font-size-text-xs, 0.8125rem);
  }
  :host-context(.themeDark) .language,
  :host-context(.themeDark) .status,
  :host-context(.themeDark) .container[data-line-numbers="true"] .body [data-line]::before,
  :host-context(.themeDark) .caption {
    color: var(--code-toolbar-text-dark, #cbd5e0);
  }
  @media (hover: hover) and (pointer: fine) {
    .copyButton:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }
  }
  @media (width >= 768px) {
    .header { padding-inline: var(--space-layout-24); }
    .body { padding: var(--space-layout-24); }
    .caption { padding-inline: var(--space-layout-24); }
    .containerArticle { margin-block: var(--space-layout-64); }
  }
  @supports (color: color-mix(in srgb, black, white)) {
    .container {
      box-shadow: 0 16px 40px color-mix(in srgb, var(--color-border) 60%, transparent);
    }
    .dot {
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-border) 70%, transparent);
    }
    .body [data-highlighted-line] {
      background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .container { box-shadow: none; }
    .copyButton { transition: none; }
  }
  @media (forced-colors: active) {
    .container,
    .copyButton {
      border: 1px solid CanvasText;
      box-shadow: none;
      forced-color-adjust: none;
    }
    .container {
      background: Canvas;
    }
    .header,
    .body,
    .caption {
      background: Canvas;
      color: CanvasText;
    }
    .copyButton {
      background: ButtonFace;
      color: ButtonText;
    }
    .language,
    .status,
    .caption,
    .body [data-line]::before,
    .body span {
      color: CanvasText !important;
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

function extractCodeText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  if (element.tagName === "BR") return "\n";
  if (element.tagName === "DT-CODE-SNIPPET") {
    const snippetCode = (element as SnippetSourceElement).code;
    return (
      typeof snippetCode === "string" && snippetCode.length > 0
        ? snippetCode
        : stringAttribute(element, "code")
    );
  }

  const content = Array.from(element.childNodes).map(extractCodeText).join("");
  if (element.hasAttribute("data-line")) {
    const normalized = content === " " ? "" : content;
    return `${normalized}\n`;
  }
  return content;
}

function hasLineNumbers(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const element = node as HTMLElement;
  if (element.tagName === "DT-CODE-SNIPPET") {
    return optionalBooleanAttribute(element, "show-line-numbers") ?? true;
  }
  if (element.tagName === "CODE" && element.hasAttribute("data-line-numbers")) {
    return true;
  }
  return Array.from(element.childNodes).some(hasLineNumbers);
}

function codeBlockRegionLabel(
  element: Element,
  languageLabel: string,
): string {
  const locale = resolveElementLocale(element);
  switch (locale) {
    case "fi":
      return `Koodilohko: ${languageLabel}`;
    case "sv":
      return `Kodblock: ${languageLabel}`;
    default:
      return `Code block: ${languageLabel}`;
  }
}

export class DtCodeBlockWindowElement extends DigitaltableteurElement {
  static observedAttributes = [
    "window-title",
    "caption",
    "language",
    "show-line-numbers",
    "context",
  ];

  private copyState: CopyState = "idle";
  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private removeWheelBinding: (() => void) | null = null;

  connectedCallback(): void {
    this.observeLightDom(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.clearResetTimer();
    this.removeWheelBinding?.();
    this.removeWheelBinding = null;
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get windowTitle(): string {
    return stringAttribute(this, "window-title");
  }

  set windowTitle(value: string) {
    reflectAttribute(this, "window-title", value || null);
  }

  get caption(): string {
    return stringAttribute(this, "caption");
  }

  set caption(value: string) {
    reflectAttribute(this, "caption", value || null);
  }

  get language(): string {
    return stringAttribute(this, "language");
  }

  set language(value: string) {
    reflectAttribute(this, "language", value || null);
  }

  get showLineNumbers(): boolean | null {
    return optionalBooleanAttribute(this, "show-line-numbers");
  }

  set showLineNumbers(value: boolean | null) {
    reflectAttribute(
      this,
      "show-line-numbers",
      value === null ? null : value ? "true" : "false",
    );
  }

  get context(): DtCodeBlockWindowContext {
    return this.getAttribute("context") === "article" ? "article" : "default";
  }

  set context(value: DtCodeBlockWindowContext) {
    reflectAttribute(this, "context", value);
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
          en: "Copied",
          fi: "Kopioitu",
          sv: "Kopierad",
        });
      case "error":
        return localizedText(this, {
          en: "Copy failed",
          fi: "Kopiointi epaonnistui",
          sv: "Kopieringen misslyckades",
        });
      default:
        return "";
    }
  }

  private findSnippetSource(): SnippetSourceElement | null {
    return (
      Array.from(this.children).find(
        (child) => child.tagName === "DT-CODE-SNIPPET",
      ) ?? null
    ) as SnippetSourceElement | null;
  }

  private resolveRenderableBody(): {
    bodyContent: Node;
    codeText: string;
    lineNumbersEnabled: boolean;
    sourceLanguage: string | null;
  } {
    const snippet = this.findSnippetSource();
    if (snippet) {
      const code =
        typeof snippet.code === "string" && snippet.code
          ? snippet.code
          : stringAttribute(snippet, "code");
      const snippetLanguage =
        typeof snippet.language === "string" && snippet.language
          ? snippet.language
          : stringAttribute(snippet, "language");
      const lineNumbers =
        this.showLineNumbers ??
        (typeof snippet.showLineNumbers === "boolean"
          ? snippet.showLineNumbers
          : optionalBooleanAttribute(snippet, "show-line-numbers") ?? true);
      const language = normalizeCodeSnippetLanguage(snippetLanguage);
      const { pre } = buildHighlightedCodeBlock({
        document: this.ownerDocument,
        code,
        language,
        showLineNumbers: lineNumbers,
        regionLabel: codeBlockRegionLabel(this, language.toUpperCase()),
      });
      return {
        bodyContent: pre,
        codeText: code.trimEnd(),
        lineNumbersEnabled: lineNumbers,
        sourceLanguage: snippetLanguage || language,
      };
    }

    const fragment = this.ownerDocument.createDocumentFragment();
    Array.from(this.childNodes).forEach((node) => {
      fragment.append(node.cloneNode(true));
    });

    const codeText = Array.from(this.childNodes).map(extractCodeText).join("").trimEnd();
    const inferredLineNumbers = Array.from(this.childNodes).some(hasLineNumbers);
    const lineNumbersEnabled = this.showLineNumbers ?? inferredLineNumbers;

    if (
      !fragment.querySelector?.("pre") &&
      codeText.length > 0
    ) {
      const { pre } = buildHighlightedCodeBlock({
        document: this.ownerDocument,
        code: codeText,
        language: normalizeCodeSnippetLanguage(this.language || "typescript"),
        showLineNumbers: lineNumbersEnabled,
        regionLabel: codeBlockRegionLabel(
          this,
          (this.language || "CODE").toUpperCase(),
        ),
      });
      return {
        bodyContent: pre,
        codeText,
        lineNumbersEnabled,
        sourceLanguage: this.language || null,
      };
    }

    return {
      bodyContent: fragment,
      codeText,
      lineNumbersEnabled,
      sourceLanguage: this.language || null,
    };
  }

  private bindArticleWheel(container: HTMLElement, body: HTMLElement): void {
    this.removeWheelBinding?.();
    this.removeWheelBinding = null;
    if (this.context !== "article") return;

    const onWheel = (event: WheelEvent) => {
      if (body.scrollHeight <= body.clientHeight + 1) return;
      if (body.contains(event.target as Node)) return;

      const { scrollTop, scrollHeight, clientHeight } = body;
      const maxScrollTop = scrollHeight - clientHeight;
      const deltaY = event.deltaY;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop < maxScrollTop - 1;

      if ((deltaY < 0 && canScrollUp) || (deltaY > 0 && canScrollDown)) {
        event.preventDefault();
        body.scrollTop = Math.min(maxScrollTop, Math.max(0, scrollTop + deltaY));
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    this.removeWheelBinding = () => {
      container.removeEventListener("wheel", onWheel);
    };
  }

  private async handleCopy(text: string): Promise<void> {
    if (!text) return;
    try {
      await copyTextToClipboard(this.ownerDocument, text);
      this.dispatchEvent(
        new CustomEvent("copy", {
          detail: { code: text },
          bubbles: true,
          composed: true,
        }),
      );
      this.setCopyState("copied");
    } catch {
      this.setCopyState("error");
    }
  }

  private render(): void {
    const {
      bodyContent,
      codeText,
      lineNumbersEnabled,
      sourceLanguage,
    } = this.resolveRenderableBody();

    const languageLabel = (this.language || sourceLanguage || "")
      .trim()
      .toUpperCase() ||
      localizedText(this, {
        en: "CODE",
        fi: "KOODI",
        sv: "KOD",
      });

    const figure = this.ownerDocument.createElement("figure");
    figure.className = [
      "container",
      this.context === "article" ? "containerArticle" : "",
    ]
      .filter(Boolean)
      .join(" ");
    figure.dataset.lineNumbers = lineNumbersEnabled ? "true" : "false";
    if (this.context === "article") {
      figure.setAttribute("data-lenis-prevent-wheel", "");
    }

    const header = this.ownerDocument.createElement("div");
    header.className = "header";

    const controls = this.ownerDocument.createElement("div");
    controls.className = "controls";
    controls.setAttribute("aria-hidden", "true");
    ["close", "minimize", "maximize"].forEach((tone) => {
      const dot = this.ownerDocument.createElement("span");
      dot.className = `dot ${tone}`;
      controls.append(dot);
    });
    const language = this.ownerDocument.createElement("span");
    language.className = "language";
    language.textContent = languageLabel;
    controls.append(language);

    const headerInfo = this.ownerDocument.createElement("div");
    headerInfo.className = "headerInfo";
    if (this.windowTitle) {
      const title = this.ownerDocument.createElement("span");
      title.className = "title";
      title.textContent = this.windowTitle;
      headerInfo.append(title);
    }

    const actions = this.ownerDocument.createElement("div");
    actions.className = "actions";
    const copyButton = this.ownerDocument.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copyButton";
    copyButton.textContent = localizedText(this, {
      en: "Copy",
      fi: "Kopioi",
      sv: "Kopiera",
    });
    copyButton.disabled = !codeText;
    copyButton.setAttribute(
      "aria-label",
      localizedText(this, {
        en: "Copy code to clipboard",
        fi: "Kopioi koodi leikepoydalle",
        sv: "Kopiera kod till urklipp",
      }),
    );
    copyButton.addEventListener("click", () => {
      void this.handleCopy(codeText);
    });

    const status = this.ownerDocument.createElement("span");
    status.className = "status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.textContent = this.copyMessage();

    actions.append(copyButton, status);
    header.append(controls, headerInfo, actions);

    const body = this.ownerDocument.createElement("div");
    body.className = ["body", this.context === "article" ? "bodyArticle" : ""]
      .filter(Boolean)
      .join(" ");
    body.setAttribute("role", "group");
    body.setAttribute("aria-label", codeBlockRegionLabel(this, languageLabel));
    if (this.context === "article") {
      body.tabIndex = 0;
    }
    body.append(bodyContent);

    figure.append(header, body);

    if (this.caption) {
      const caption = this.ownerDocument.createElement("figcaption");
      caption.className = "caption";
      caption.textContent = this.caption;
      figure.append(caption);
    }

    this.replaceShadow(styles, figure);

    const container = this.shadowRoot?.querySelector<HTMLElement>(".container");
    const scrollBody = this.shadowRoot?.querySelector<HTMLElement>(".body");
    if (container && scrollBody) this.bindArticleWheel(container, scrollBody);
  }
}
