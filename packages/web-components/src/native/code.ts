import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;

export type DtCodeSize = (typeof SIZES)[number];

/* Transcribed from Code.module.css. */
const styles = `
  :host { display: inline; }
  :host([hidden]) { display: none; }
  .code {
    display: inline;
    margin: 0;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    background-color: var(--color-light-bg);
    font-family: var(--font-mono);
    font-weight: 400;
    overflow-wrap: anywhere;
    color: var(--color-text);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
  .sm {
    padding-block: 1px;
    padding-inline: var(--space-internal-4);
    font-size: var(--font-size-code-s);
    line-height: var(--line-height-code-s);
  }
  .md {
    padding-block: 1px;
    padding-inline: calc(var(--space-internal-4) + 1px);
    font-size: var(--font-size-code-m);
    line-height: var(--line-height-code-m);
  }
  .lg {
    padding-block: var(--space-internal-2);
    padding-inline: var(--space-internal-6);
    font-size: var(--font-size-code-l);
    line-height: var(--line-height-code-m);
  }
  @media (forced-colors: active) {
    .code {
      border-color: CanvasText;
      color: CanvasText;
    }
  }
`;

/** Inline code for an identifier, path or flag inside prose. */
export class DtCodeElement extends DigitaltableteurElement {
  static observedAttributes = ["size", "content"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get size(): DtCodeSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtCodeSize) {
    reflectAttribute(this, "size", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("code");
    root.className = ["code", this.size].join(" ");
    root.setAttribute("part", "root code");
    const slot = this.ownerDocument.createElement("slot");
    if (this.content) slot.textContent = this.content;
    root.append(slot);
    this.replaceShadow(styles, root);
  }
}
