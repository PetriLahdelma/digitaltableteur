import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;

export type DtKbdSize = (typeof SIZES)[number];

const styles = `
  :host {
    display: inline-block;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none;
  }
  .kbd {
    display: inline-flex;
    min-inline-size: 1.5em;
    align-items: center;
    justify-content: center;
    padding-block: var(--space-internal-2);
    padding-inline: var(--space-internal-6);
    border: 1px solid var(--color-border);
    border-block-end-width: 2px;
    border-radius: var(--radius-sm);
    background-color: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-mono);
    line-height: 1.2;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .sm {
    font-size: calc(var(--font-size-text-xxs) * 0.85);
  }
  .md {
    font-size: calc(var(--font-size-text-xxs) * 0.95);
  }
  .lg {
    font-size: var(--font-size-text-s);
  }
  @media (forced-colors: active) {
    .kbd {
      border-color: ButtonText;
      background-color: Canvas;
      color: ButtonText;
    }
  }
`;

export class DtKbdElement extends DigitaltableteurElement {
  static observedAttributes = ["size", "content"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get size(): DtKbdSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtKbdSize) {
    reflectAttribute(this, "size", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("kbd");
    root.className = ["kbd", this.size].join(" ");
    root.setAttribute("part", "root kbd");

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    if (this.content) slot.textContent = this.content;
    root.append(slot);

    this.replaceShadow(styles, root);
  }
}
