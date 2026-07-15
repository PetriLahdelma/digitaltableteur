import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const TAGS = ["span", "div", "p", "h2"] as const;

export type DtVisuallyHiddenTag = (typeof TAGS)[number];

const styles = `
  :host {
    position: absolute;
    margin: -1px;
    padding: 0;
    inline-size: 1px;
    block-size: 1px;
    border: 0;
    white-space: nowrap;
    clip-path: inset(50%);
    overflow: hidden;
  }
  :host([hidden]) {
    display: none;
  }
  .root {
    position: absolute;
    margin: -1px;
    padding: 0;
    inline-size: 1px;
    block-size: 1px;
    border: 0;
    white-space: nowrap;
    clip-path: inset(50%);
    overflow: hidden;
  }
`;

export class DtVisuallyHiddenElement extends DigitaltableteurElement {
  static observedAttributes = ["as", "content"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get as(): DtVisuallyHiddenTag {
    return enumAttribute(this, "as", TAGS, "span");
  }

  set as(value: DtVisuallyHiddenTag) {
    reflectAttribute(this, "as", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement(this.as);
    root.className = "root";
    root.setAttribute("part", "root visually-hidden");

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    if (this.content) slot.textContent = this.content;
    root.append(slot);

    this.replaceShadow(styles, root);
  }
}
