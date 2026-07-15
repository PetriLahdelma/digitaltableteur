import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const TAGS = ["h1", "h2", "p", "span", "div"] as const;
const FORWARDED_ATTRIBUTES = [
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

export type DtDisplayTag = (typeof TAGS)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  :host([as="span"]) { display: inline; }
  .display {
    margin: 0;
    color: var(--color-foreground, var(--foreground, var(--color-title, currentcolor)));
    font-family: var(--font-heading, var(--font-title, system-ui, sans-serif));
    font-size: var(--text-dt-display, var(--font-size-display));
    font-weight: var(--font-weight-semibold, 600);
    line-height: var(--line-height-tight, 1.2);
  }
  @supports (font-optical-sizing: auto) {
    .display { font-optical-sizing: auto; }
  }
`;

export class DtDisplayElement extends DigitaltableteurElement {
  static observedAttributes = ["as", "content", ...FORWARDED_ATTRIBUTES];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get as(): DtDisplayTag {
    return enumAttribute(this, "as", TAGS, "h1");
  }

  set as(value: DtDisplayTag) {
    reflectAttribute(this, "as", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const element = this.ownerDocument.createElement(this.as);
    element.className = "display";
    element.setAttribute("part", "root display");

    for (const attribute of FORWARDED_ATTRIBUTES) {
      const value = this.getAttribute(attribute);
      if (value !== null) element.setAttribute(attribute, value);
    }

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    if (this.content) slot.textContent = this.content;
    element.append(slot);

    this.replaceShadow(styles, element);
  }
}
