import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg", "xl", "full"] as const;
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
  "form",
] as const;
const CENTER_VALUES = ["true", "false"] as const;
const ARIA_ATTRIBUTES = [
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

export type DtContainerSize = (typeof SIZES)[number];
export type DtContainerTag = (typeof TAGS)[number];
export type DtContainerCenterValue = (typeof CENTER_VALUES)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    box-sizing: border-box;
    inline-size: 100%;
    padding-inline: var(--page-margin-mobile, 1rem);
  }
  .sm { max-inline-size: var(--container-sm, 40rem); }
  .md { max-inline-size: var(--container-md, 60rem); }
  .lg { max-inline-size: var(--container-lg, 75rem); }
  .xl { max-inline-size: var(--container-xl, 90rem); }
  .full { max-inline-size: 100%; }
  .centered { margin-inline: auto; }
  .fallback { display: contents; }
  @media (width >= 768px) {
    .root { padding-inline: var(--page-margin-tablet, 2rem); }
  }
  @media (width >= 1024px) {
    .root { padding-inline: var(--page-margin-desktop, 3rem); }
  }
  @media (width >= 1440px) {
    .root { padding-inline: var(--page-margin-wide, 4rem); }
  }
`;

function centerAttribute(element: Element): boolean {
  const value = element.getAttribute("center");
  if (value === null || value === "") return true;
  return value !== "false";
}

function reflectCenterAttribute(element: Element, value: boolean): void {
  reflectAttribute(element, "center", value ? "true" : "false");
}

export class DtContainerElement extends DigitaltableteurElement {
  static observedAttributes = [
    "size",
    "center",
    "as",
    "content",
    ...ARIA_ATTRIBUTES,
  ];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get size(): DtContainerSize {
    return enumAttribute(this, "size", SIZES, "lg");
  }

  set size(value: DtContainerSize) {
    reflectAttribute(this, "size", value);
  }

  get center(): boolean {
    return centerAttribute(this);
  }

  set center(value: boolean) {
    reflectCenterAttribute(this, value);
  }

  get as(): DtContainerTag {
    return enumAttribute(this, "as", TAGS, "div");
  }

  set as(value: DtContainerTag) {
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
    root.className = ["root", this.size, this.center ? "centered" : ""]
      .filter(Boolean)
      .join(" ");
    root.setAttribute("part", "root container");

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
