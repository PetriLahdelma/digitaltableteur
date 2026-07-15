import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  reflectAttribute,
  stringAttribute,
} from "./base";

const TAGS = [
  "div",
  "section",
  "article",
  "aside",
  "nav",
  "main",
  "header",
  "footer",
  "figure",
  "figcaption",
  "form",
  "fieldset",
  "address",
  "blockquote",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "p",
  "span",
] as const;

const ARIA_ATTRIBUTES = [
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

export type DtCenterTag = (typeof TAGS)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    box-sizing: border-box;
    display: flex;
    inline-size: 100%;
    block-size: inherit;
    min-block-size: inherit;
    align-items: center;
    justify-content: center;
  }
  .fallback { display: contents; }
`;

export class DtCenterElement extends DigitaltableteurElement {
  static observedAttributes = ["as", "content", ...ARIA_ATTRIBUTES];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get as(): DtCenterTag {
    return enumAttribute(this, "as", TAGS, "div");
  }

  set as(value: DtCenterTag) {
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
    root.setAttribute("part", "root center");

    for (const attribute of ARIA_ATTRIBUTES) {
      const value = this.getAttribute(attribute);
      if (value !== null) root.setAttribute(attribute, value);
    }

    if (hasDefaultSlotContent(this)) {
      const slot = this.ownerDocument.createElement("slot");
      slot.setAttribute("part", "content");
      root.append(slot);
    } else if (this.content) {
      const fallback = this.ownerDocument.createElement("span");
      fallback.className = "fallback";
      fallback.setAttribute("part", "content fallback");
      fallback.textContent = this.content;
      root.append(fallback);
    }

    this.replaceShadow(styles, root);
  }
}
